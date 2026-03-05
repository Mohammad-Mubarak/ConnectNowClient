import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// const SOCKET_URL = 'https://localhost:3001';
const SOCKET_URL = 'https://connectnow-ctcz.onrender.com'

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy:  'max-bundle',
  rtcpMuxPolicy: 'require',
};

// ✅ Patch SDP — force Opus MONO (Chrome AEC only works in mono) [web:26]
function patchSDP(sdp) {
  const lines = sdp.split('\r\n');
  let opusPT  = null;
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
    if (line.startsWith('m=video') || line.startsWith('m=application')) {
      inAudio = false;
    }

    if (opusPT && line.startsWith(`a=fmtp:${opusPT}`)) {
      out.push(
        `a=fmtp:${opusPT} ` +
        `minptime=10;useinbandfec=1;usedtx=1;` +
        `maxaveragebitrate=128000;maxplaybackrate=48000;` +
        `sprop-maxcapturerate=48000;` +
        `stereo=0;sprop-stereo=0;cbr=0`  // MONO — required for Chrome AEC
      );
      continue;
    }
    out.push(line);
  }

  return out.join('\r\n');
}

// ✅ THE REAL FIX — WebRTC loopback for AEC
// Chrome won't apply AEC to remote audio unless it goes through
// a local WebRTC loopback connection. This is the official fix. [web:33][web:40]
async function createLoopbackStream(inputStream) {
  return new Promise((resolve, reject) => {
    try {
      const AudioCtx  = window.AudioContext || window.webkitAudioContext;
      const audioCtx  = new AudioCtx({ sampleRate: 48000 });

      // Source from the remote stream
      const source    = audioCtx.createMediaStreamSource(inputStream);

      // Apply gentle processing
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -30;
      compressor.knee.value      = 20;
      compressor.ratio.value     = 8;
      compressor.attack.value    = 0.005;
      compressor.release.value   = 0.15;

      const gainNode  = audioCtx.createGain();
      gainNode.gain.value = 1.0;

      // ✅ Use MediaStreamDestination — NOT audioCtx.destination
      // This is the key: output goes to a MediaStream, not speakers directly
      const dest      = audioCtx.createMediaStreamDestination();
      source.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(dest);

      // ✅ Loopback: processed stream → local RTCPeerConnection → <audio>
      // This makes Chrome apply AEC to the output
      const loopbackPC1 = new RTCPeerConnection();
      const loopbackPC2 = new RTCPeerConnection();

      loopbackPC1.onicecandidate = e => {
        if (e.candidate) loopbackPC2.addIceCandidate(e.candidate).catch(() => {});
      };
      loopbackPC2.onicecandidate = e => {
        if (e.candidate) loopbackPC1.addIceCandidate(e.candidate).catch(() => {});
      };

      // Add processed audio track to loopback
      dest.stream.getAudioTracks().forEach(t => loopbackPC1.addTrack(t, dest.stream));

      loopbackPC2.ontrack = ({ streams }) => {
        // This stream now has Chrome AEC applied ✅
        resolve({
          stream:     streams[0],
          cleanup: () => {
            loopbackPC1.close();
            loopbackPC2.close();
            source.disconnect();
            audioCtx.close();
          }
        });
      };

      // Negotiate the loopback
      loopbackPC1.createOffer()
        .then(offer  => loopbackPC1.setLocalDescription(offer))
        .then(()     => loopbackPC2.setRemoteDescription(loopbackPC1.localDescription))
        .then(()     => loopbackPC2.createAnswer())
        .then(answer => loopbackPC2.setLocalDescription(answer))
        .then(()     => loopbackPC1.setRemoteDescription(loopbackPC2.localDescription))
        .catch(reject);

    } catch (e) {
      reject(e);
    }
  });
}

export function useWebRTC(mode = 'video') {
  const socket        = useRef(null);
  const pc            = useRef(null);
  const localRef      = useRef(null);
  const dcRef         = useRef(null);
  const roomIdRef     = useRef(null);
  const iceBuf        = useRef([]);
  const rdReady       = useRef(false);
  const remoteAudioEl = useRef(null);
  const loopbackClean = useRef(null);  // cleanup for loopback connection

  const [localStream,  setLocal]     = useState(null);
  const [remoteStream, setRemote]    = useState(null);
  const [status,       setStatus]    = useState('idle');
  const [messages,     setMessages]  = useState([]);
  const [chatReady,    setChatReady] = useState(false);
  const [isMuted,      setMuted]     = useState(false);
  const [isCamOff,     setCamOff]    = useState(false);
  const [roomId,       setRoomId]    = useState(null);

  // ✅ Single persistent <audio> element — never recreate
  useEffect(() => {
    const el          = document.createElement('audio');
    el.autoplay       = true;
    el.muted          = false;
    el.volume         = 1.0;
    el.style.display  = 'none';
    el.setAttribute('playsinline', '');
    document.body.appendChild(el);
    remoteAudioEl.current = el;

    return () => {
      el.srcObject = null;
      el.remove();
    };
  }, []);

  const addMsg = useCallback((msg) => {
    setMessages(p => [...p, msg]);
  }, []);

  // ✅ Raw mic — NEVER process through AudioContext before sending
  // Let browser AEC handle mic natively
  const getMedia = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('getUserMedia not supported');
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
          echoCancellation:  true,   // ✅ must be true
          noiseSuppression:  true,
          autoGainControl:   true,
          channelCount:      1,      // ✅ MONO — AEC requires mono
          sampleRate:        48000,
          sampleSize:        16,
          latency:           0,
          // Chrome-specific
          googEchoCancellation:             true,
          googEchoCancellation2:            true,
          googExperimentalEchoCancellation: true,
          googAutoGainControl:              true,
          googAutoGainControl2:             true,
          googNoiseSuppression:             true,
          googExperimentalNoiseSuppression: true,
          googHighpassFilter:               true,
          googAudioMirroring:               false,
        },
      });

      localRef.current = stream;
      setLocal(stream);
      return stream;

    } catch (err) {
      console.warn('Full constraints failed, trying basic:', err.message);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl:  true,
            channelCount:     1,
            sampleRate:       48000,
          },
          video: mode === 'video',
        });
        localRef.current = stream;
        setLocal(stream);
        return stream;
      } catch (e2) {
        console.error('All media failed:', e2);
        return null;
      }
    }
  }, [mode]);

  // ✅ Play remote stream through loopback for proper AEC
  const playRemoteWithAEC = useCallback(async (remoteStream) => {
    // Cleanup previous loopback
    if (loopbackClean.current) {
      loopbackClean.current();
      loopbackClean.current = null;
    }

    if (!remoteAudioEl.current) return;

    try {
      // ✅ Try loopback AEC fix first
      const { stream: loopbackStream, cleanup } = await createLoopbackStream(remoteStream);
      loopbackClean.current = cleanup;
      remoteAudioEl.current.srcObject = loopbackStream;
      await remoteAudioEl.current.play().catch(() => {});
      console.log('✅ Remote audio playing with loopback AEC');
    } catch (e) {
      // ✅ Fallback — direct play (still better than AudioContext)
      console.warn('Loopback failed, using direct audio:', e.message);
      remoteAudioEl.current.srcObject = remoteStream;
      await remoteAudioEl.current.play().catch(() => {});
    }
  }, []);

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
    if (loopbackClean.current) { loopbackClean.current(); loopbackClean.current = null; }
    pc.current      = null;
    dcRef.current   = null;
    rdReady.current = false;
    iceBuf.current  = [];
    setChatReady(false);

    const stream = localRef.current || await getMedia();
    if (!stream) return null;

    const remote = new MediaStream();
    setRemote(remote);

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

    const localTrackIds = new Set(stream.getTracks().map(t => t.id));
    let audioTracksReceived = 0;

    conn.ontrack = ({ track }) => {
      if (localTrackIds.has(track.id)) return;
      remote.addTrack(track);

      // ✅ Once we get audio track, start loopback AEC
      if (track.kind === 'audio') {
        audioTracksReceived++;
        // Small delay to let stream stabilize
        setTimeout(() => playRemoteWithAEC(remote), 300);
      }
    };

    conn.onconnectionstatechange = () => {
      const s = conn.connectionState;
      console.log('[PC]', s);
      if (s === 'connected') {
        setStatus('connected');
        // Ensure audio is playing
        if (remoteAudioEl.current?.paused) {
          remoteAudioEl.current.play().catch(() => {});
        }
      }
      if (['disconnected', 'failed', 'closed'].includes(s)) {
        setStatus('idle');
        setRemote(null);
        setChatReady(false);
        if (loopbackClean.current) { loopbackClean.current(); loopbackClean.current = null; }
        if (remoteAudioEl.current) remoteAudioEl.current.srcObject = null;
      }
    };

    return conn;
  }, [getMedia, setupDC, playRemoteWithAEC]);

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
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({ type: offer.type, sdp: patchSDP(offer.sdp) })
      );
      rdReady.current = true;
      await flushIce();
      const answer = await pc.current.createAnswer({ voiceActivityDetection: true });
      const sdp    = patchSDP(answer.sdp);
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
      catch (e) { console.warn('[ICE]', e); }
    });

    s.on('chat',      ({ text, ts }) => addMsg({ text, ts, fromMe: false }));
    s.on('waiting',   () => setStatus('waiting'));
    s.on('cancelled', () => setStatus('idle'));

    s.on('peer:left', () => {
      pc.current?.close();
      if (loopbackClean.current) { loopbackClean.current(); loopbackClean.current = null; }
      pc.current = null; dcRef.current = null;
      roomIdRef.current = null; rdReady.current = false;
      iceBuf.current = [];
      setRoomId(null); setStatus('idle');
      setRemote(null); setChatReady(false);
      if (remoteAudioEl.current) remoteAudioEl.current.srcObject = null;
    });

    return () => {
      s.disconnect();
      pc.current?.close();
      if (loopbackClean.current) loopbackClean.current();
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
    if (loopbackClean.current) { loopbackClean.current(); loopbackClean.current = null; }
    pc.current = null; dcRef.current = null;
    roomIdRef.current = null; rdReady.current = false;
    iceBuf.current = [];
    setRemote(null); setMessages([]); setChatReady(false);
    if (remoteAudioEl.current) remoteAudioEl.current.srcObject = null;
    socket.current?.emit('skip', { mode });
    setStatus('waiting');
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
    localStream, remoteStream,
    status, isMuted, isCamOff,
    messages, chatReady, roomId,
    sendMessage,
    findStranger, cancelSearch, skipStranger,
    toggleMute, toggleCamera,
  };
}
