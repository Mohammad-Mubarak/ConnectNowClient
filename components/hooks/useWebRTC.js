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
  const socket   = useRef(null);
  const pc       = useRef(null);
  const localRef = useRef(null);
  const dcRef    = useRef(null);   // DataChannel
  const roomId   = useRef(null);
  const iceBuf   = useRef([]);
  const rdReady  = useRef(false);  // remoteDescription set?

  const [localStream,  setLocal]     = useState(null);
  const [remoteStream, setRemote]    = useState(null);
  const [status,       setStatus]    = useState('idle');
  const [messages,     setMessages]  = useState([]);
  const [chatReady,    setChatReady] = useState(false);
  const [isMuted,      setMuted]     = useState(false);
  const [isCamOff,     setCamOff]    = useState(false);

  // ── Add message to list
  const addMsg = useCallback((msg) => {
    setMessages(p => [...p, msg]);
  }, []);

  // ── Get camera/mic
  const getMedia = useCallback(async () => {
    localRef.current?.getTracks().forEach(t => t.stop());
    const stream = await navigator.mediaDevices.getUserMedia(
      mode === 'audio' ? { audio: true, video: false } : { audio: true, video: true }
    );
    localRef.current = stream;
    setLocal(stream);
    return stream;
  }, [mode]);

  // ── Wire up a DataChannel
  const setupDC = useCallback((dc) => {
    dcRef.current = dc;
    dc.onopen    = () => { console.log('✅ DataChannel open'); setChatReady(true); };
    dc.onclose   = () => { console.log('❌ DataChannel closed'); setChatReady(false); };
    dc.onerror   = (e) => console.error('DC error', e);
    dc.onmessage = ({ data }) => {
      try { addMsg({ ...JSON.parse(data), fromMe: false }); }
      catch { addMsg({ text: data, fromMe: false, ts: Date.now() }); }
    };
  }, [addMsg]);

  // ── Flush buffered ICE candidates
  const flushIce = useCallback(async () => {
    if (!pc.current) return;
    for (const c of iceBuf.current) {
      try { await pc.current.addIceCandidate(new RTCIceCandidate(c)); }
      catch (e) { console.warn('ICE flush err', e); }
    }
    iceBuf.current = [];
  }, []);

  // ── Build RTCPeerConnection
  const buildPC = useCallback(async (isOfferer) => {
    // Teardown old
    dcRef.current?.close();
    pc.current?.close();
    pc.current  = null;
    dcRef.current = null;
    rdReady.current = false;
    iceBuf.current  = [];
    setChatReady(false);

    const stream = localRef.current || await getMedia();
    const remote = new MediaStream();
    setRemote(remote);

    const conn = new RTCPeerConnection(ICE);
    pc.current = conn;

    // Add local tracks
    stream.getTracks().forEach(t => conn.addTrack(t, stream));

    // DataChannel
    if (isOfferer) {
      setupDC(conn.createDataChannel('chat', { ordered: true }));
    } else {
      conn.ondatachannel = ({ channel }) => setupDC(channel);
    }

    // ICE
    conn.onicecandidate = ({ candidate }) => {
      if (!candidate || !roomId.current) return;
      socket.current?.emit('ice', { roomId: roomId.current, candidate });
    };

    conn.oniceconnectionstatechange = () =>
      console.log('[ICE state]', conn.iceConnectionState);

    // Remote tracks
    conn.ontrack = ({ streams }) => {
      streams[0]?.getTracks().forEach(t => remote.addTrack(t));
    };

    // Connection state
    conn.onconnectionstatechange = () => {
      console.log('[PC state]', conn.connectionState);
      if (conn.connectionState === 'connected') {
        setStatus('connected');
      }
      if (['disconnected','failed','closed'].includes(conn.connectionState)) {
        setStatus('idle');
        setRemote(null);
        setChatReady(false);
      }
    };

    return conn;
  }, [getMedia, setupDC]);

  // ── Socket setup — runs once
  useEffect(() => {
    const s = io(URL, {
      transports: ['websocket', 'polling'],
    });
    socket.current = s;

    s.on('connect', () =>
      console.log('✅ Socket connected:', s.id)
    );
    s.on('connect_error', (e) =>
      console.error('❌ Socket error:', e.message)
    );

    // Matched with a peer
    s.on('matched', async ({ roomId: rid, role }) => {
      console.log(`[Matched] room=${rid} role=${role}`);
      roomId.current = rid;
      setStatus('connecting');
      setMessages([]);

      const isOfferer = role === 'offerer';
      const conn = await buildPC(isOfferer);

      if (isOfferer) {
        const offer = await conn.createOffer();
        await conn.setLocalDescription(offer);
        s.emit('offer', { roomId: rid, offer });
        console.log('[Offer sent]');
      }
    });

    // Answerer gets offer
    s.on('offer', async ({ offer }) => {
      console.log('[Offer received]');
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      rdReady.current = true;
      await flushIce();
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      s.emit('answer', { roomId: roomId.current, answer });
      console.log('[Answer sent]');
    });

    // Offerer gets answer
    s.on('answer', async ({ answer }) => {
      console.log('[Answer received]');
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
      rdReady.current = true;
      await flushIce();
    });

    // ICE candidate
    s.on('ice', async ({ candidate }) => {
      if (!pc.current) return;
      if (!rdReady.current) {
        iceBuf.current.push(candidate);
        return;
      }
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('[ICE err]', e);
      }
    });

    // Chat fallback (when DataChannel not ready)
    s.on('chat', ({ text, ts }) => {
      addMsg({ text, ts, fromMe: false });
    });

    s.on('waiting',   () => setStatus('waiting'));
    s.on('cancelled', () => setStatus('idle'));

    s.on('peer:left', () => {
      console.log('[Peer left]');
      pc.current?.close();
      pc.current    = null;
      dcRef.current = null;
      roomId.current = null;
      rdReady.current = false;
      iceBuf.current  = [];
      setStatus('idle');
      setRemote(null);
      setChatReady(false);
    });

    return () => {
      s.disconnect();
      pc.current?.close();
      localRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [buildPC, flushIce, addMsg]);

  // ── Get media immediately on mount
  useEffect(() => {
    getMedia().catch(console.error);
  }, [getMedia]);

  // ── Send chat
  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;
    const msg = { text: text.trim(), ts: Date.now(), fromMe: true };

    const dc = dcRef.current;
    if (dc?.readyState === 'open') {
      // P2P — direct DataChannel
      dc.send(JSON.stringify({ text: msg.text, ts: msg.ts }));
    } else if (roomId.current) {
      // Fallback — relay via socket
      socket.current?.emit('chat', { roomId: roomId.current, text: msg.text });
    }

    addMsg(msg);
  }, [addMsg]);

  // ── Controls
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
    pc.current    = null;
    dcRef.current = null;
    roomId.current = null;
    rdReady.current = false;
    iceBuf.current  = [];
    setRemote(null);
    setMessages([]);
    setChatReady(false);
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
