import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://connectnow-ctcz.onrender.com';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:free.expressturn.com:3478' },
  {
    urls: 'turn:free.expressturn.com:3478?transport=tcp',
    username: '000000002088091354',
    credential: 'gUixIGLNMG5XEn07oaVVF0vHNKk=',
  },
  {
    urls: ['turn:freestun.net:3478', 'turn:freestun.net:3479'],
    username: 'free',
    credential: 'free',
  },
  {
    urls: 'turns:freestun.net:5349',
    username: 'free',
    credential: 'free',
  },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turns:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

function buildICEConfig(forceRelay = false) {
  return {
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceTransportPolicy: forceRelay ? 'relay' : 'all',
  };
}

function patchSDP(sdp) {
  const lines = sdp.split('\r\n');
  let opusPT = null;
  let inAudio = false;

  for (const line of lines) {
    if (line.startsWith('m=audio')) inAudio = true;
    if (line.startsWith('m=video') || line.startsWith('m=application')) inAudio = false;
    if (inAudio) {
      const m = line.match(/^a=rtpmap:(\d+) opus\/48000/i);
      if (m) { opusPT = m[1]; break; }
    }
  }

  inAudio = false;
  const out = [];
  for (const line of lines) {
    if (line.startsWith('m=audio')) {
      inAudio = true;
      out.push(line);
      out.push('b=AS:128');
      continue;
    }
    if (line.startsWith('m=video') || line.startsWith('m=application')) inAudio = false;
    if (opusPT && line.startsWith(`a=fmtp:${opusPT}`)) {
      out.push(
        `a=fmtp:${opusPT} minptime=10;useinbandfec=1;usedtx=1;` +
        `maxaveragebitrate=128000;maxplaybackrate=48000;` +
        `sprop-maxcapturerate=48000;stereo=0;sprop-stereo=0;cbr=0`
      );
      continue;
    }
    out.push(line);
  }
  return out.join('\r\n');
}

export function useWebRTC(mode = 'video') {
  const socket       = useRef(null);
  const pc           = useRef(null);
  const localRef     = useRef(null);
  const dcRef        = useRef(null);
  const roomIdRef    = useRef(null);
  const iceBuf       = useRef([]);
  const rdReady      = useRef(false);
  const audioElRef   = useRef(null);
  const isOffererRef = useRef(false);
  const iceRetryDone = useRef(false);
  const iceRestartTimer = useRef(null); // ✅ FIX #2: debounce ICE restart

  // ── Stable ref for mode so socket listeners don't re-register ──────────────
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  const [localStream,  setLocal]     = useState(null);
  const [remoteStream, setRemote]    = useState(null);
  const [status,       setStatus]    = useState('idle');
  const [messages,     setMessages]  = useState([]);
  const [chatReady,    setChatReady] = useState(false);
  const [isMuted,      setMuted]     = useState(false);
  const [isCamOff,     setCamOff]    = useState(false);
  const [roomId,       setRoomId]    = useState(null);

  // ── Persistent hidden audio element (audio mode) ───────────────────────────
  useEffect(() => {
    document.getElementById('__rtc_audio')?.remove();
    const el = document.createElement('audio');
    el.id = '__rtc_audio';
    el.autoplay = false;
    el.muted = false;
    el.volume = 0.9;
    el.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;opacity:0.001';
    document.body.appendChild(el);
    audioElRef.current = el;
    return () => { el.srcObject = null; el.remove(); };
  }, []);

  const addMsg = useCallback((msg) => setMessages(p => [...p, msg]), []);

  // ✅ FIX #5: pause before nulling srcObject to avoid AbortError
  const stopAudio = useCallback(() => {
    const el = audioElRef.current;
    if (!el) return;
    try { el.pause(); } catch (_) {}
    el.srcObject = null;
  }, []);

  const playRemoteAudio = useCallback((stream) => {
    const el = audioElRef.current;
    if (!el || modeRef.current !== 'audio') return;
    el.srcObject = stream;
    el.muted = false;
    el.volume = 0.9;
    el.play().catch(e => console.warn('Audio play:', e));
  }, []);

  const getMedia = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('getUserMedia not supported — need HTTPS');
      return null;
    }
    localRef.current?.getTracks().forEach(t => t.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: modeRef.current === 'video' ? {
          width: { ideal: 1280 }, height: { ideal: 720 },
          frameRate: { ideal: 30 }, facingMode: 'user',
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl:  true,
          channelCount:     1,
          sampleRate:       48000,
          sampleSize:       16,
        },
      });
      localRef.current = stream;
      setLocal(stream);
      return stream;
    } catch (err) {
      console.warn('Retrying basic constraints:', err.message);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: modeRef.current === 'video',
        });
        localRef.current = stream;
        setLocal(stream);
        return stream;
      } catch (e) { console.error('Media failed:', e); return null; }
    }
  }, []); // ✅ FIX #6: no `mode` dep — use modeRef instead

  const setupDC = useCallback((dc) => {
    dcRef.current = dc;
    dc.onopen    = () => { console.log('✅ DC OPEN'); setChatReady(true); };
    dc.onclose   = () => { console.log('❌ DC CLOSED'); setChatReady(false); };
    dc.onerror   = e => console.error('DC ERROR:', e.error?.message || e);
    dc.onmessage = ({ data }) => {
      try { addMsg({ ...JSON.parse(data), fromMe: false }); }
      catch { addMsg({ text: data, fromMe: false, ts: Date.now() }); }
    };
  }, [addMsg]);

  // ✅ FIX #3: unified ICE drain helper
  const drainICE = useCallback(async () => {
    if (!pc.current || iceBuf.current.length === 0) return;
    const buf = [...iceBuf.current];
    iceBuf.current = [];
    for (const c of buf) {
      try { await pc.current.addIceCandidate(new RTCIceCandidate(c)); }
      catch (e) { console.warn('ICE drain err:', e); }
    }
  }, []);

  // ── buildPC — uses a ref to avoid circular useCallback deps ───────────────
  const buildPCRef = useRef(null);

  buildPCRef.current = async (isOfferer, forceRelay = false) => {
    clearTimeout(iceRestartTimer.current);
    dcRef.current?.close();
    pc.current?.close();
    pc.current = null; dcRef.current = null;
    rdReady.current = false; iceBuf.current = [];
    setChatReady(false);

    const stream = localRef.current || await getMedia();
    if (!stream) return null;

    const remote = new MediaStream();
    setRemote(remote);

    const conn = new RTCPeerConnection(buildICEConfig(forceRelay));
    pc.current = conn;
    if (forceRelay) console.warn('🔄 [ICE] Retrying with relay-only (forced TURN)');

    stream.getTracks().forEach(t => conn.addTrack(t, stream));

    if (isOfferer) setupDC(conn.createDataChannel('chat', { ordered: true }));
    else conn.ondatachannel = ({ channel }) => setupDC(channel);

    conn.onicecandidate = ({ candidate }) => {
      if (!candidate || !roomIdRef.current) return;
      socket.current?.emit('ice', { roomId: roomIdRef.current, candidate });
    };

    conn.onicecandidateerror = (e) =>
      console.warn('[ICE ERR]', e.errorCode, e.errorText, e.url);

    const localIds = new Set(stream.getTracks().map(t => t.id));
    conn.ontrack = ({ track }) => {
      if (localIds.has(track.id)) return;
      remote.addTrack(track);
      if (track.kind === 'audio' && modeRef.current === 'audio') playRemoteAudio(remote);
    };

    conn.onconnectionstatechange = () => {
      const s = conn.connectionState;
      console.log('[PC STATE]', s);
      if (s === 'connected') {
        setStatus('connected');
        iceRetryDone.current = false;
        conn.getStats().then(stats => {
          stats.forEach(r => {
            if (r.type === 'candidate-pair' && r.state === 'succeeded') {
              console.log('✅ Active pair:', r.localCandidateId, '→', r.remoteCandidateId);
            }
          });
        });
        if (modeRef.current === 'audio') playRemoteAudio(remote);
      }
      if (['disconnected', 'failed', 'closed'].includes(s)) {
        setStatus('idle'); setRemote(null); setChatReady(false);
        stopAudio(); // ✅ FIX #5
      }
    };

    // ✅ FIX #2: wait 3s on 'disconnected' before ICE restart (not immediately)
    conn.oniceconnectionstatechange = async () => {
      const state = conn.iceConnectionState;
      console.log('[ICE STATE]', state);

      if (state === 'disconnected' && isOffererRef.current && conn === pc.current) {
        clearTimeout(iceRestartTimer.current);
        iceRestartTimer.current = setTimeout(async () => {
          if (!pc.current || pc.current.iceConnectionState !== 'disconnected') return;
          console.warn('[ICE] ⚠️ Disconnected 3s — attempting ICE restart...');
          try {
            const offer = await conn.createOffer({ iceRestart: true });
            await conn.setLocalDescription(offer);
            socket.current?.emit('offer', {
              roomId: roomIdRef.current,
              offer: { type: offer.type, sdp: patchSDP(offer.sdp) },
            });
          } catch (e) { console.warn('[ICE] Restart failed:', e); }
        }, 3000); // [web:17] best practice: don't wait for 'failed' (30s timeout)
      }

      if (state === 'connected' || state === 'completed') {
        clearTimeout(iceRestartTimer.current); // cancel pending restart if recovered
      }

      if (state === 'failed' && !iceRetryDone.current && roomIdRef.current) {
        iceRetryDone.current = true;
        clearTimeout(iceRestartTimer.current);
        console.warn('[ICE] ❌ ICE failed — rebuilding with forced TURN relay...');
        const newConn = await buildPCRef.current(isOffererRef.current, true); // ✅ FIX #4: use ref, not self
        if (!newConn || !isOffererRef.current) return;
        try {
          const offer = await newConn.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: modeRef.current === 'video',
            voiceActivityDetection: true,
          });
          const sdp = patchSDP(offer.sdp);
          await newConn.setLocalDescription({ type: offer.type, sdp });
          socket.current?.emit('offer', {
            roomId: roomIdRef.current,
            offer: { type: offer.type, sdp },
          });
        } catch (e) { console.error('[ICE] Relay retry offer failed:', e); }
      }
    };

    return conn;
  };

  // ── Stable wrapper so socket listeners never need to re-register ───────────
  const buildPC = useCallback(
    (isOfferer, forceRelay = false) => buildPCRef.current(isOfferer, forceRelay),
    []
  ); // ✅ FIX #7: empty deps — stable reference

  useEffect(() => {
    getMedia(); // ✅ FIX #6: only called once, on mount
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    socket.current = s;

    s.on('connect',       () => console.log('✅ Socket:', s.id));
    s.on('disconnect',    r  => console.warn('⚠️ Socket disconnected:', r));
    s.on('connect_error', e  => console.error('❌ Socket error:', e.message));

    s.on('matched', async ({ roomId: rid, role }) => {
      roomIdRef.current    = rid;
      isOffererRef.current = role === 'offerer';
      iceRetryDone.current = false;
      setRoomId(rid);
      setStatus('connecting');
      setMessages([]);

      const conn = await buildPC(role === 'offerer');
      if (!conn) return;

      if (role === 'offerer') {
        const offer = await conn.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: modeRef.current === 'video',
          voiceActivityDetection: true,
        });
        const sdp = patchSDP(offer.sdp);
        await conn.setLocalDescription({ type: offer.type, sdp });
        s.emit('offer', { roomId: rid, offer: { type: offer.type, sdp } });
      }
    });

    s.on('offer', async ({ offer }) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({ type: offer.type, sdp: patchSDP(offer.sdp) })
      );
      rdReady.current = true;
      await drainICE(); // ✅ FIX #3
      const answer = await pc.current.createAnswer({ voiceActivityDetection: true });
      const sdp = patchSDP(answer.sdp);
      await pc.current.setLocalDescription({ type: answer.type, sdp });
      s.emit('answer', { roomId: roomIdRef.current, answer: { type: answer.type, sdp } });
    });

    s.on('answer', async ({ answer }) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({ type: answer.type, sdp: patchSDP(answer.sdp) })
      );
      rdReady.current = true;
      await drainICE(); // ✅ FIX #3
    });

    s.on('ice', async ({ candidate }) => {
      if (!pc.current) return;
      if (!rdReady.current) {
        iceBuf.current.push(candidate); // buffer until SRD is done
        return;
      }
      try { await pc.current.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.warn('[ICE add err]', e); }
    });

    s.on('chat',      ({ text, ts }) => addMsg({ text, ts, fromMe: false }));
    s.on('waiting',   () => setStatus('waiting'));
    s.on('cancelled', () => setStatus('idle'));
    s.on('peer:left', () => {
      clearTimeout(iceRestartTimer.current);
      pc.current?.close();
      pc.current = null; dcRef.current = null;
      roomIdRef.current = null; rdReady.current = false;
      iceRetryDone.current = false; iceBuf.current = [];
      setRoomId(null); setStatus('idle'); setRemote(null); setChatReady(false);
      stopAudio(); // ✅ FIX #5
    });

    return () => {
      clearTimeout(iceRestartTimer.current);
      s.disconnect();
      pc.current?.close();
      localRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [buildPC, drainICE, addMsg, stopAudio]); // ✅ FIX #7: all stable — won't re-run

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;
    const msg = { text: text.trim(), ts: Date.now(), fromMe: true };
    const dc = dcRef.current;
    if (dc?.readyState === 'open') {
      dc.send(JSON.stringify({ text: msg.text, ts: msg.ts }));
    } else if (roomIdRef.current) {
      socket.current?.emit('chat', { roomId: roomIdRef.current, text: msg.text });
    }
    addMsg(msg);
  }, [addMsg]);

  const findStranger = useCallback(() => {
    setStatus('waiting'); setMessages([]);
    socket.current?.emit('find', { mode: modeRef.current });
  }, []);

  const cancelSearch = useCallback(() => {
    socket.current?.emit('cancel'); setStatus('idle');
  }, []);

  const skipStranger = useCallback(() => {
    clearTimeout(iceRestartTimer.current);
    pc.current?.close();
    pc.current = null; dcRef.current = null;
    roomIdRef.current = null; rdReady.current = false;
    iceRetryDone.current = false; iceBuf.current = [];
    setRemote(null); setMessages([]); setChatReady(false);
    stopAudio(); // ✅ FIX #5
    socket.current?.emit('skip', { mode: modeRef.current });
    setStatus('waiting');
  }, [stopAudio]);

  const toggleMute = useCallback(() => {
    localRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMuted(p => !p);
  }, []);

  const toggleCamera = useCallback(() => {
    localRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOff(p => !p);
  }, []);

  return {
    localStream, remoteStream, status,
    isMuted, isCamOff, messages, chatReady, roomId,
    sendMessage, findStranger, cancelSearch,
    skipStranger, toggleMute, toggleCamera,
  };
}
