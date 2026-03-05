import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// const SOCKET_URL = 'https://localhost:3001';
const SOCKET_URL = 'https://connectnow-ctcz.onrender.com'

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy:  'max-bundle',
  rtcpMuxPolicy: 'require',
};

// ✅ Patch SDP — force Opus MONO (required for Chrome AEC to work)
function patchSDP(sdp) {
  const lines  = sdp.split('\r\n');
  let   opusPT = null;
  let   inAudio = false;

  for (const line of lines) {
    if (line.startsWith('m=audio'))                            inAudio = true;
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
      out.push('b=AS:128');      // 128kbps — sweet spot for voice quality
      continue;
    }
    if (line.startsWith('m=video') || line.startsWith('m=application')) {
      inAudio = false;
    }

    // ✅ MONO Opus — critical for Chrome AEC to work
    // stereo=0 is REQUIRED — Chrome AEC breaks with stereo
    if (opusPT && line.startsWith(`a=fmtp:${opusPT}`)) {
      out.push(
        `a=fmtp:${opusPT} ` +
        `minptime=10;` +
        `useinbandfec=1;` +         // forward error correction
        `usedtx=1;` +               // save bandwidth in silence
        `maxaveragebitrate=128000;` +
        `maxplaybackrate=48000;` +
        `sprop-maxcapturerate=48000;` +
        `stereo=0;` +               // ✅ MONO — AEC requires mono in Chrome
        `sprop-stereo=0;` +
        `cbr=0`
      );
      continue;
    }

    out.push(line);
  }

  return out.join('\r\n');
}

export function useWebRTC(mode = 'video') {
  const socket        = useRef(null);
  const pc            = useRef(null);
  const localRef      = useRef(null);
  const dcRef         = useRef(null);
  const roomIdRef     = useRef(null);
  const iceBuf        = useRef([]);
  const rdReady       = useRef(false);
  const remoteAudioEl = useRef(null);  // single persistent <audio> element

  const [localStream,  setLocal]     = useState(null);
  const [remoteStream, setRemote]    = useState(null);
  const [status,       setStatus]    = useState('idle');
  const [messages,     setMessages]  = useState([]);
  const [chatReady,    setChatReady] = useState(false);
  const [isMuted,      setMuted]     = useState(false);
  const [isCamOff,     setCamOff]    = useState(false);
  const [roomId,       setRoomId]    = useState(null);

  // ✅ Create ONE persistent <audio> element at mount — never recreate it
  // This is critical — browser AEC tracks which audio element plays remote
  // audio and uses it as the echo reference signal for your mic
  useEffect(() => {
    const el         = document.createElement('audio');
    el.autoplay      = true;
    el.muted         = false;
    el.volume        = 1.0;
    el.style.display = 'none';
    el.id            = 'webrtc-remote-audio';
    document.body.appendChild(el);
    remoteAudioEl.current = el;

    return () => {
      if (el.srcObject) {
        el.srcObject.getTracks().forEach(t => t.stop());
        el.srcObject = null;
      }
      el.remove();
    };
  }, []);

  const addMsg = useCallback((msg) => {
    setMessages(p => [...p, msg]);
  }, []);

  // ✅ KEY RULES for echo-free audio:
  // 1. Use MONO (channelCount: 1) — Chrome AEC only works in mono
  // 2. echoCancellation MUST be true
  // 3. NEVER process mic through AudioContext before sending
  // 4. Let browser handle everything natively
  const getMedia = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('getUserMedia not supported — need HTTPS');
      return null;
    }

    localRef.current?.getTracks().forEach(t => t.stop());

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: mode === 'video' ? {
          width:      { ideal: 1280 },
          height:     { ideal: 720 },
          frameRate:  { ideal: 30 },
          facingMode: 'user',
        } : false,

        audio: {
          // ✅ These 3 are the most important
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl:  true,

          // ✅ MONO — absolutely required for Chrome AEC
          channelCount: 1,

          // ✅ High quality settings
          sampleRate: 48000,
          sampleSize: 16,
          latency:    0,

          // ✅ Chrome-specific — belt and suspenders
          googEchoCancellation:              true,
          googEchoCancellation2:             true,
          googExperimentalEchoCancellation:  true,
          googAutoGainControl:               true,
          googAutoGainControl2:              true,
          googNoiseSuppression:              true,
          googExperimentalNoiseSuppression:  true,
          googHighpassFilter:                true,
          googAudioMirroring:                false,
        },
      });

      localRef.current = stream;
      setLocal(stream);
      return stream;

    } catch (err) {
      console.warn('Full constraints failed, trying basic:', err.message);
      try {
        // Fallback — minimal but echo-safe
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl:  true,
            channelCount:     1,     // ✅ still mono
            sampleRate:       48000,
          },
          video: mode === 'video',
        });
        localRef.current = stream;
        setLocal(stream);
        return stream;
      } catch (e2) {
        console.error('Media failed completely:', e2);
        return null;
      }
    }
  }, [mode]);

  const setupDC = useCallback((dc) => {
    dcRef.current = dc;
    dc.onopen    = () => setChatReady(true);
    dc.onclose   = () => setChatReady(false);
    dc.onerror   = e => console.error('DC error', e);
    dc.onmessage = ({ data }) => {
      try { addMsg({ ...JSON.parse(data), fromMe: false }); }
      catch { addMsg({ text: data, fromMe: false, ts: Date.now() }); }
    };
  }, [addMsg]);

  const flushIce = useCallback(async () => {
    if (!pc.current) return;
    for (const c of iceBuf.current) {
      try { await pc.current.addIceCandidate(new RTCIceCandidate(c)); }
      catch (e) { console.warn('ICE err', e); }
    }
    iceBuf.current = [];
  }, []);

  const buildPC = useCallback(async (isOfferer) => {
    dcRef.current?.close();
    pc.current?.close();
    pc.current      = null;
    dcRef.current   = null;
    rdReady.current = false;
    iceBuf.current  = [];
    setChatReady(false);

    const stream = localRef.current || await getMedia();
    if (!stream) return null;

    const remote = new MediaStream();
    setRemote(remote);

    // ✅ Attach to persistent audio element BEFORE tracks arrive
    if (remoteAudioEl.current) {
      remoteAudioEl.current.srcObject = remote;
    }

    const conn = new RTCPeerConnection(ICE_CONFIG);
    pc.current = conn;

    stream.getTracks().forEach(t => conn.addTrack(t, stream));

    if (isOfferer) {
      setupDC(conn.createDataChannel('chat', { ordered: true }));
    } else {
      conn.ondatachannel = ({ channel }) => setupDC(channel);
    }

    conn.onicecandidate = ({ candidate }) => {
      if (!candidate || !roomIdRef.current) return;
      socket.current?.emit('ice', { roomId: roomIdRef.current, candidate });
    };

    // ✅ Strict filter — never add own tracks to remote stream
    const localTrackIds = new Set(stream.getTracks().map(t => t.id));
    conn.ontrack = ({ track }) => {
      if (localTrackIds.has(track.id)) {
        console.warn('Blocked own track from remote stream');
        return;
      }
      remote.addTrack(track);
      // Refresh srcObject so browser updates AEC reference
      if (remoteAudioEl.current) {
        remoteAudioEl.current.srcObject = remote;
        remoteAudioEl.current.play().catch(() => {});
      }
    };

    conn.onconnectionstatechange = () => {
      const s = conn.connectionState;
      console.log('[PC state]', s);
      if (s === 'connected') {
        setStatus('connected');
        remoteAudioEl.current?.play().catch(() => {});
      }
      if (['disconnected', 'failed', 'closed'].includes(s)) {
        setStatus('idle');
        setRemote(null);
        setChatReady(false);
        if (remoteAudioEl.current) {
          remoteAudioEl.current.srcObject = null;
        }
      }
    };

    conn.oniceconnectionstatechange = () =>
      console.log('[ICE]', conn.iceConnectionState);

    return conn;
  }, [getMedia, setupDC]);

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.current = s;

    s.on('connect',       () => console.log('✅ Socket:', s.id));
    s.on('connect_error', (e) => console.error('❌ Socket:', e.message));

    s.on('matched', async ({ roomId: rid, role }) => {
      roomIdRef.current = rid;
      setRoomId(rid);
      setStatus('connecting');
      setMessages([]);

      const isOfferer = role === 'offerer';
      const conn = await buildPC(isOfferer);
      if (!conn) return;

      if (isOfferer) {
        const offer = await conn.createOffer({
          offerToReceiveAudio:    true,
          offerToReceiveVideo:    mode === 'video',
          voiceActivityDetection: true,
        });
        const sdp = patchSDP(offer.sdp);
        await conn.setLocalDescription({ type: offer.type, sdp });
        s.emit('offer', { roomId: rid, offer: { type: offer.type, sdp } });
      }
    });

    s.on('offer', async ({ offer }) => {
      if (!pc.current) return;
      const sdp = patchSDP(offer.sdp);
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({ type: offer.type, sdp })
      );
      rdReady.current = true;
      await flushIce();
      const answer = await pc.current.createAnswer({
        voiceActivityDetection: true,
      });
      const aSdp = patchSDP(answer.sdp);
      await pc.current.setLocalDescription({ type: answer.type, sdp: aSdp });
      s.emit('answer', {
        roomId: roomIdRef.current,
        answer: { type: answer.type, sdp: aSdp },
      });
    });

    s.on('answer', async ({ answer }) => {
      if (!pc.current) return;
      const sdp = patchSDP(answer.sdp);
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({ type: answer.type, sdp })
      );
      rdReady.current = true;
      await flushIce();
    });

    s.on('ice', async ({ candidate }) => {
      if (!pc.current) return;
      if (!rdReady.current) { iceBuf.current.push(candidate); return; }
      try { await pc.current.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.warn('[ICE]', e); }
    });

    s.on('chat',      ({ text, ts }) => addMsg({ text, ts, fromMe: false }));
    s.on('waiting',   () => setStatus('waiting'));
    s.on('cancelled', () => setStatus('idle'));

    s.on('peer:left', () => {
      pc.current?.close();
      pc.current      = null;
      dcRef.current   = null;
      roomIdRef.current = null;
      rdReady.current = false;
      iceBuf.current  = [];
      setRoomId(null);
      setStatus('idle');
      setRemote(null);
      setChatReady(false);
      if (remoteAudioEl.current) remoteAudioEl.current.srcObject = null;
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
    const dc  = dcRef.current;
    if (dc?.readyState === 'open') {
      dc.send(JSON.stringify({ text: msg.text, ts: msg.ts }));
    } else if (roomIdRef.current) {
      socket.current?.emit('chat', {
        roomId: roomIdRef.current, text: msg.text,
      });
    }
    addMsg(msg);
  }, [addMsg]);

  const findStranger = useCallback(() => {
    setStatus('waiting'); setMessages([]);
    socket.current?.emit('find', { mode });
  }, [mode]);

  const cancelSearch = useCallback(() => {
    socket.current?.emit('cancel');
    setStatus('idle');
  }, []);

  const skipStranger = useCallback(() => {
    pc.current?.close();
    pc.current      = null;
    dcRef.current   = null;
    roomIdRef.current = null;
    rdReady.current = false;
    iceBuf.current  = [];
    setRemote(null); setMessages([]); setChatReady(false);
    if (remoteAudioEl.current) remoteAudioEl.current.srcObject = null;
    socket.current?.emit('skip', { mode });
    setStatus('waiting');
  }, [mode]);

  const toggleMute = useCallback(() => {
    localRef.current?.getAudioTracks()
      .forEach(t => { t.enabled = !t.enabled; });
    setMuted(p => !p);
  }, []);

  const toggleCamera = useCallback(() => {
    localRef.current?.getVideoTracks()
      .forEach(t => { t.enabled = !t.enabled; });
    setCamOff(p => !p);
  }, []);

  return {
    localStream, remoteStream,
    status, isMuted, isCamOff,
    messages, chatReady, roomId,
    sendMessage,
    findStranger, cancelSearch, skipStranger,
    toggleMute, toggleCamera,
  };
}
