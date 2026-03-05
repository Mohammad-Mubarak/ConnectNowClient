import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// const URL = 'https://localhost:3001';
const URL = 'https://connectnow-ctcz.onrender.com'

const ICE = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

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

  const getMedia = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('getUserMedia not supported');
      return null;
    }
    try {
      localRef.current?.getTracks().forEach(t => t.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        video: mode === 'video' ? {
          width:       { ideal: 1280 },
          height:      { ideal: 720 },
          frameRate:   { ideal: 30 },
          facingMode:  'user',
        } : false,
        audio: {
          // ✅ HIGH QUALITY + ECHO CANCELLATION built into browser
          echoCancellation:         true,
          noiseSuppression:         true,
          autoGainControl:          true,
          sampleRate:               48000,
          sampleSize:               16,
          channelCount:             1,      // mono is better for voice calls
          latency:                  0,
          suppressLocalAudioPlayback: true, // ✅ key: prevents echo on supported browsers
        },
      });

      localRef.current = stream;
      setLocal(stream);
      return stream;
    } catch (err) {
      console.error('Media error:', err.name, err.message);
      return null;
    }
  }, [mode]);

  const setupDC = useCallback((dc) => {
    dcRef.current = dc;
    dc.onopen    = () => { setChatReady(true); };
    dc.onclose   = () => { setChatReady(false); };
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

    const conn = new RTCPeerConnection(ICE);
    pc.current = conn;

    // ✅ Set high quality audio codec preferences
    conn.addEventListener('negotiationneeded', async () => {
      try {
        const offer = await conn.createOffer();
        // Boost audio bitrate in SDP
        const sdp = offer.sdp.replace(
          /a=mid:audio\r\n/g,
          'a=mid:audio\r\nb=AS:128\r\n'
        );
        await conn.setLocalDescription({ ...offer, sdp });
      } catch(e) { /* handled in matched flow */ }
    });

    stream.getTracks().forEach(t => conn.addTrack(t, stream));

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

    // ✅ KEY FIX: Only add tracks from the remote stream, never local
    const localTrackIds = new Set(stream.getTracks().map(t => t.id));
    conn.ontrack = ({ track, streams }) => {
      if (localTrackIds.has(track.id)) return; // block own tracks
      remote.addTrack(track);
    };

    conn.onconnectionstatechange = () => {
      console.log('[PC]', conn.connectionState);
      if (conn.connectionState === 'connected')   setStatus('connected');
      if (['disconnected','failed','closed'].includes(conn.connectionState)) {
        setStatus('idle');
        setRemote(null);
        setChatReady(false);
      }
    };

    return conn;
  }, [getMedia, setupDC]);

  useEffect(() => {
    const s = io(URL, { transports: ['websocket', 'polling'] });
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
        // ✅ Boost audio bitrate in SDP offer
        const boostedSdp = boostAudioBitrate(offer.sdp, 128);
        await conn.setLocalDescription({ type: offer.type, sdp: boostedSdp });
        s.emit('offer', { roomId: rid, offer: { type: offer.type, sdp: boostedSdp } });
      }
    });

    s.on('offer', async ({ offer }) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      rdReady.current = true;
      await flushIce();
      const answer = await pc.current.createAnswer();
      const boostedSdp = boostAudioBitrate(answer.sdp, 128);
      await pc.current.setLocalDescription({ type: answer.type, sdp: boostedSdp });
      s.emit('answer', { roomId: roomId.current, answer: { type: answer.type, sdp: boostedSdp } });
    });

    s.on('answer', async ({ answer }) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
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

  const findStranger  = useCallback(() => {
    setStatus('waiting'); setMessages([]);
    socket.current?.emit('find', { mode });
  }, [mode]);

  const cancelSearch  = useCallback(() => {
    socket.current?.emit('cancel'); setStatus('idle');
  }, []);

  const skipStranger  = useCallback(() => {
    pc.current?.close();
    pc.current = null; dcRef.current = null;
    roomId.current = null; rdReady.current = false; iceBuf.current = [];
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
    sendMessage,
    findStranger, cancelSearch, skipStranger,
    toggleMute, toggleCamera,
  };
}

function boostAudioBitrate(sdp, kbps) {
  return sdp
    .split('\r\n')
    .map(line => {
      if (line.startsWith('m=audio')) {
        return line + `\r\nb=AS:${kbps}`;
      }
      return line;
    })
    .join('\r\n');
}
