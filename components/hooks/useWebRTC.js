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
};

// ✅ Force Opus codec + max bitrate in SDP — WhatsApp level audio
function processAudioSDP(sdp) {
  const lines = sdp.split('\r\n');
  const result = [];
  let inAudio = false;
  let opusPayload = null;

  // First pass: find Opus payload type
  for (const line of lines) {
    if (line.startsWith('m=audio')) inAudio = true;
    if (line.startsWith('m=video')) inAudio = false;
    if (inAudio && line.toLowerCase().includes('opus')) {
      const match = line.match(/(\d+) opus/i);
      if (match) opusPayload = match[1];
    }
  }

  inAudio = false;
  let addedBitrate = false;

  for (const line of lines) {
    if (line.startsWith('m=audio')) {
      inAudio = true;
      // ✅ Reorder to put Opus first
      if (opusPayload) {
        const parts = line.split(' ');
        const others = parts.slice(3).filter(p => p !== opusPayload);
        result.push([...parts.slice(0, 3), opusPayload, ...others].join(' '));
        continue;
      }
    }

    if (line.startsWith('m=video')) inAudio = false;

    // ✅ Set max audio bitrate 128kbps
    if (inAudio && line.startsWith('a=mid:') && !addedBitrate) {
      result.push(line);
      result.push('b=AS:128');
      result.push('b=TIAS:128000');
      addedBitrate = true;
      continue;
    }

    // ✅ Force Opus parameters: stereo=0 (mono better for voice),
    //    maxaveragebitrate=128000, usedtx=1, useinbandfec=1 (error correction)
    if (opusPayload && line.startsWith(`a=fmtp:${opusPayload}`)) {
      result.push(
        `a=fmtp:${opusPayload} minptime=10;useinbandfec=1;usedtx=1;` +
        `maxaveragebitrate=128000;stereo=0;sprop-stereo=0;cbr=0`
      );
      continue;
    }

    result.push(line);
  }

  return result.join('\r\n');
}

export function useWebRTC(mode = 'video') {
  const socket    = useRef(null);
  const pc        = useRef(null);
  const localRef  = useRef(null);
  const dcRef     = useRef(null);
  const roomId    = useRef(null);
  const iceBuf    = useRef([]);
  const rdReady   = useRef(false);

  const [localStream,  setLocal]     = useState(null);
  const [remoteStream, setRemote]    = useState(null);
  const [status,       setStatus]    = useState('idle');
  const [messages,     setMessages]  = useState([]);
  const [chatReady,    setChatReady] = useState(false);
  const [isMuted,      setMuted]     = useState(false);
  const [isCamOff,     setCamOff]    = useState(false);

  const addMsg = useCallback((msg) => {
    setMessages(p => [...p, msg]);
  }, []);

  // ✅ WhatsApp-level audio constraints
  const getMedia = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('getUserMedia not supported');
      return null;
    }
    try {
      localRef.current?.getTracks().forEach(t => t.stop());

      const constraints = {
        video: mode === 'video' ? {
          width:      { ideal: 1280 },
          height:     { ideal: 720 },
          frameRate:  { ideal: 30 },
          facingMode: 'user',
        } : false,

        audio: {
          // ✅ Core echo/noise fixes
          echoCancellation:           { ideal: true },
          noiseSuppression:           { ideal: true },
          autoGainControl:            { ideal: true },
          suppressLocalAudioPlayback: { ideal: true },

          // ✅ High quality settings
          sampleRate:    { ideal: 48000 },
          sampleSize:    { ideal: 16 },
          channelCount:  { ideal: 1 },   // mono = better voice quality
          latency:       { ideal: 0.02 },

          // ✅ Advanced — disable hardware processing that can cause issues
          googEchoCancellation:         true,
          googAutoGainControl:          true,
          googNoiseSuppression:         true,
          googHighpassFilter:           true,
          googAudioMirroring:           false,
          googNoiseReduction:           true,
          googEchoCancellation2:        true,
          googAutoGainControl2:         true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // ✅ Apply Web Audio API processing chain for extra noise reduction
      const processedStream = await applyAudioProcessing(stream, mode);
      localRef.current = processedStream;
      setLocal(processedStream);
      return processedStream;

    } catch (err) {
      console.error('Media error:', err.name, err.message);
      // Fallback to basic constraints if advanced fail
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: mode === 'video',
        });
        localRef.current = stream;
        setLocal(stream);
        return stream;
      } catch (e) {
        console.error('Fallback media failed:', e);
        return null;
      }
    }
  }, [mode]);

  const setupDC = useCallback((dc) => {
    dcRef.current = dc;
    dc.onopen    = () => setChatReady(true);
    dc.onclose   = () => setChatReady(false);
    dc.onerror   = (e) => console.error('DC error', e);
    dc.onmessage = ({ data }) => {
      try { addMsg({ ...JSON.parse(data), fromMe: false }); }
      catch { addMsg({ text: data, fromMe: false, ts: Date.now() }); }
    };
  }, [addMsg]);

  const flushIce = useCallback(async () => {
    if (!pc.current) return;
    for (const c of iceBuf.current) {
      try { await pc.current.addIceCandidate(new RTCIceCandidate(c)); }
      catch (e) { console.warn('ICE flush err', e); }
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

    const conn = new RTCPeerConnection(ICE_CONFIG);
    pc.current = conn;

    // ✅ Add tracks
    stream.getTracks().forEach(t => conn.addTrack(t, stream));

    // DataChannel
    if (isOfferer) {
      setupDC(conn.createDataChannel('chat', { ordered: true }));
    } else {
      conn.ondatachannel = ({ channel }) => setupDC(channel);
    }

    conn.onicecandidate = ({ candidate }) => {
      if (!candidate || !roomId.current) return;
      socket.current?.emit('ice', { roomId: roomId.current, candidate });
    };

    conn.oniceconnectionstatechange = () =>
      console.log('[ICE]', conn.iceConnectionState);

    // ✅ Block own tracks from coming back as remote
    const localTrackIds = new Set(stream.getTracks().map(t => t.id));
    conn.ontrack = ({ track }) => {
      if (localTrackIds.has(track.id)) return;
      remote.addTrack(track);
    };

    conn.onconnectionstatechange = () => {
      const state = conn.connectionState;
      console.log('[PC]', state);
      if (state === 'connected')                               setStatus('connected');
      if (['disconnected','failed','closed'].includes(state)) {
        setStatus('idle');
        setRemote(null);
        setChatReady(false);
      }
    };

    return conn;
  }, [getMedia, setupDC]);

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.current = s;

    s.on('connect',       () => console.log('✅ Socket:', s.id));
    s.on('connect_error', (e) => console.error('❌ Socket:', e.message));

    s.on('matched', async ({ roomId: rid, role }) => {
      roomId.current = rid;
      setStatus('connecting');
      setMessages([]);
      const isOfferer = role === 'offerer';
      const conn = await buildPC(isOfferer);
      if (!conn) return;

      if (isOfferer) {
        const offer = await conn.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: mode === 'video',
        });
        // ✅ Process SDP to force Opus + bitrate
        const sdp = processAudioSDP(offer.sdp);
        await conn.setLocalDescription({ type: offer.type, sdp });
        s.emit('offer', { roomId: rid, offer: { type: offer.type, sdp } });
      }
    });

    s.on('offer', async ({ offer }) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({
          type: offer.type,
          sdp:  processAudioSDP(offer.sdp),
        })
      );
      rdReady.current = true;
      await flushIce();
      const answer = await pc.current.createAnswer();
      const sdp    = processAudioSDP(answer.sdp);
      await pc.current.setLocalDescription({ type: answer.type, sdp });
      s.emit('answer', { roomId: roomId.current, answer: { type: answer.type, sdp } });
    });

    s.on('answer', async ({ answer }) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({
          type: answer.type,
          sdp:  processAudioSDP(answer.sdp),
        })
      );
      rdReady.current = true;
      await flushIce();
    });

    s.on('ice', async ({ candidate }) => {
      if (!pc.current) return;
      if (!rdReady.current) { iceBuf.current.push(candidate); return; }
      try { await pc.current.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.warn('[ICE err]', e); }
    });

    s.on('chat',      ({ text, ts }) => addMsg({ text, ts, fromMe: false }));
    s.on('waiting',   () => setStatus('waiting'));
    s.on('cancelled', () => setStatus('idle'));

    s.on('peer:left', () => {
      pc.current?.close();
      pc.current = null; dcRef.current = null;
      roomId.current = null; rdReady.current = false;
      iceBuf.current = [];
      setStatus('idle'); setRemote(null); setChatReady(false);
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
    } else if (roomId.current) {
      socket.current?.emit('chat', { roomId: roomId.current, text: msg.text });
    }
    addMsg(msg);
  }, [addMsg]);

  const findStranger = useCallback(() => {
    setStatus('waiting');
    setMessages([]);
    socket.current?.emit('find', { mode });
  }, [mode]);

  const cancelSearch = useCallback(() => {
    socket.current?.emit('cancel');
    setStatus('idle');
  }, []);

  const skipStranger = useCallback(() => {
    pc.current?.close();
    pc.current = null; dcRef.current = null;
    roomId.current = null; rdReady.current = false;
    iceBuf.current = [];
    setRemote(null); setMessages([]); setChatReady(false);
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
    messages, chatReady,
    roomId: roomId.current,
    sendMessage,
    findStranger, cancelSearch, skipStranger,
    toggleMute, toggleCamera,
  };
}

// ✅ Web Audio processing chain — extra noise gate + dynamics compression
// Mimics what WhatsApp does internally
async function applyAudioProcessing(stream, mode) {
  if (mode !== 'audio' && mode !== 'video') return stream;

  try {
    const audioCtx    = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
    const source      = audioCtx.createMediaStreamSource(stream);

    // 1. Dynamics compressor — evens out volume like WhatsApp
    const compressor  = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value      = 30;
    compressor.ratio.value     = 12;
    compressor.attack.value    = 0.003;
    compressor.release.value   = 0.25;

    // 2. High-pass filter — removes low rumble/hum below 80Hz
    const highPass    = audioCtx.createBiquadFilter();
    highPass.type     = 'highpass';
    highPass.frequency.value = 80;

    // 3. Low-pass filter — removes high frequency hiss above 8kHz
    const lowPass     = audioCtx.createBiquadFilter();
    lowPass.type      = 'lowpass';
    lowPass.frequency.value = 8000;

    // 4. Gain — normalize output
    const gainNode    = audioCtx.createGain();
    gainNode.gain.value = 1.2;

    // Chain: source → highpass → lowpass → compressor → gain → destination
    const dest        = audioCtx.createMediaStreamDestination();
    source
      .connect(highPass)
      .connect(lowPass)
      .connect(compressor)
      .connect(gainNode)
      .connect(dest);

    // Combine processed audio with original video track if video mode
    const processedStream = new MediaStream();
    dest.stream.getAudioTracks().forEach(t => processedStream.addTrack(t));
    if (mode === 'video') {
      stream.getVideoTracks().forEach(t => processedStream.addTrack(t));
    }

    return processedStream;
  } catch (e) {
    console.warn('Audio processing failed, using raw stream:', e);
    return stream; // fallback to original
  }
}
