import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://connectnow-ctcz.onrender.com';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // ── Your ExpressTurn (primary TURN) ──
  { urls: 'stun:free.expressturn.com:3478' },
  {
    urls: 'turn:free.expressturn.com:3478?transport=tcp',
    username: '000000002088091354',
    credential: 'gUixIGLNMG5XEn07oaVVF0vHNKk=',
  },
  // ── freestun (confirmed working, no expiry) ──
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
  // ── openrelay.metered.ca (confirmed working, multiple transports) ──
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
    // 'relay' forces all traffic through TURN — use only as fallback
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
  const socket    = useRef(null);
  const pc        = useRef(null);
  const localRef  = useRef(null);
  const dcRef     = useRef(null);
  const roomIdRef = useRef(null);
  const iceBuf    = useRef([]);
  const rdReady   = useRef(false);
  const audioElRef = useRef(null);

  // ── NEW: track role + ICE retry state ──
  const isOffererRef  = useRef(false);
  const iceRetryDone  = useRef(false);   // only retry once per session

  const [localStream,  setLocal]     = useState(null);
  const [remoteStream, setRemote]    = useState(null);
  const [status,       setStatus]    = useState('idle');
  const [messages,     setMessages]  = useState([]);
  const [chatReady,    setChatReady] = useState(false);
  const [isMuted,      setMuted]     = useState(false);
  const [isCamOff,     setCamOff]    = useState(false);
  const [roomId,       setRoomId]    = useState(null);

  // Persistent hidden audio element (audio mode)
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

  const playRemoteAudio = useCallback((stream) => {
    const el = audioElRef.current;
    if (!el || mode !== 'audio') return;
    el.srcObject = stream;
    el.muted = false;
    el.volume = 0.9;
    el.play().catch(e => console.warn('Audio play:', e));
  }, [mode]);

  const getMedia = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('getUserMedia not supported — need HTTPS');
      return null;
    }
    localRef.current?.getTracks().forEach(t => t.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: mode === 'video' ? {
          width: { ideal: 1280 }, height: { ideal: 720 },
          frameRate: { ideal: 30 }, facingMode: 'user',
        } : false,
        audio: {
          echoCancellation: true, noiseSuppression: true,
          autoGainControl: true, channelCount: 1,
          sampleRate: 48000, sampleSize: 16,
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
          video: mode === 'video',
        });
        localRef.current = stream;
        setLocal(stream);
        return stream;
      } catch (e) { console.error('Media failed:', e); return null; }
    }
  }, [mode]);

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

  const flushIce = useCallback(async () => {
    if (!pc.current) return;
    for (const c of iceBuf.current) {
      try { await pc.current.addIceCandidate(new RTCIceCandidate(c)); }
      catch (e) { console.warn('ICE flush err:', e); }
    }
    iceBuf.current = [];
  }, []);

  // ─── buildPC: accepts forceRelay for TURN-only fallback ──────────────────
  const buildPC = useCallback(async (isOfferer, forceRelay = false) => {
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
      if (track.kind === 'audio' && mode === 'audio') playRemoteAudio(remote);
    };

    conn.onconnectionstatechange = () => {
      const s = conn.connectionState;
      console.log('[PC STATE]', s);
      if (s === 'connected') {
        setStatus('connected');
        iceRetryDone.current = false; // reset for next session
        // Log which relay was actually used
        conn.getStats().then(stats => {
          stats.forEach(r => {
            if (r.type === 'candidate-pair' && r.state === 'succeeded') {
              console.log('✅ Active pair:', r.localCandidateId, '→', r.remoteCandidateId);
            }
          });
        });
        if (mode === 'audio') playRemoteAudio(remote);
      }
      if (['disconnected', 'failed', 'closed'].includes(s)) {
        setStatus('idle'); setRemote(null); setChatReady(false);
        if (audioElRef.current) audioElRef.current.srcObject = null;
      }
    };

    // ─── KEY FIX: ICE state machine with retry + restart ─────────────────
    conn.oniceconnectionstatechange = async () => {
      const state = conn.iceConnectionState;
      console.log('[ICE STATE]', state);

      // 1️⃣ Transient drop → try ICE restart first (cheap, no renegotiation)
      if (state === 'disconnected' && isOffererRef.current && conn === pc.current) {
        console.warn('[ICE] ⚠️ Disconnected — attempting ICE restart...');
        try {
          const offer = await conn.createOffer({ iceRestart: true });
          await conn.setLocalDescription(offer);
          socket.current?.emit('offer', {
            roomId: roomIdRef.current,
            offer: { type: offer.type, sdp: patchSDP(offer.sdp) },
          });
        } catch (e) { console.warn('[ICE] Restart failed:', e); }
      }

      // 2️⃣ Hard failure → rebuild PC with relay-only (force TURN)
      if (state === 'failed' && !iceRetryDone.current && roomIdRef.current) {
        iceRetryDone.current = true;
        console.warn('[ICE] ❌ ICE failed — rebuilding with forced TURN relay...');
        const newConn = await buildPC(isOffererRef.current, true);
        if (!newConn || !isOffererRef.current) return;
        try {
          const offer = await newConn.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: mode === 'video',
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
  }, [getMedia, setupDC, mode, playRemoteAudio]);

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
      roomIdRef.current  = rid;
      isOffererRef.current = role === 'offerer'; // ✅ track role for retry
      iceRetryDone.current = false;
      setRoomId(rid);
      setStatus('connecting');
      setMessages([]);

      const conn = await buildPC(role === 'offerer');
      if (!conn) return;

      if (role === 'offerer') {
        const offer = await conn.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: mode === 'video',
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
      await flushIce();
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
      await flushIce();
    });

    s.on('ice', async ({ candidate }) => {
      if (!pc.current) return;
      if (!rdReady.current) { iceBuf.current.push(candidate); return; }
      try { await pc.current.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.warn('[ICE add err]', e); }
    });

    s.on('chat',      ({ text, ts }) => addMsg({ text, ts, fromMe: false }));
    s.on('waiting',   () => setStatus('waiting'));
    s.on('cancelled', () => setStatus('idle'));
    s.on('peer:left', () => {
      pc.current?.close();
      pc.current = null; dcRef.current = null;
      roomIdRef.current = null; rdReady.current = false;
      iceRetryDone.current = false; iceBuf.current = [];
      setRoomId(null); setStatus('idle'); setRemote(null); setChatReady(false);
      if (audioElRef.current) audioElRef.current.srcObject = null;
    });

    return () => {
      s.disconnect();
      pc.current?.close();
      localRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [buildPC, flushIce, addMsg, mode]);

  useEffect(() => { getMedia(); }, [getMedia]);

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
    socket.current?.emit('find', { mode });
  }, [mode]);

  const cancelSearch = useCallback(() => {
    socket.current?.emit('cancel'); setStatus('idle');
  }, []);

  const skipStranger = useCallback(() => {
    pc.current?.close();
    pc.current = null; dcRef.current = null;
    roomIdRef.current = null; rdReady.current = false;
    iceRetryDone.current = false; iceBuf.current = [];
    setRemote(null); setMessages([]); setChatReady(false);
    if (audioElRef.current) audioElRef.current.srcObject = null;
    socket.current?.emit('skip', { mode }); setStatus('waiting');
  }, [mode]);

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
