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
}

function patchSDP(sdp) {
  const lines = sdp.split('\r\n')
  let opusPT  = null
  let inAudio = false

  for (const line of lines) {
    if (line.startsWith('m=audio')) inAudio = true
    if (line.startsWith('m=video') || line.startsWith('m=application')) inAudio = false
    if (inAudio) {
      const m = line.match(/^a=rtpmap:(\d+) opus\/48000/i)
      if (m) { opusPT = m[1]; break }
    }
  }

  inAudio = false
  const out = []

  for (const line of lines) {
    if (line.startsWith('m=audio')) {
      inAudio = true
      out.push(line)
      out.push('b=AS:128')
      continue
    }
    if (line.startsWith('m=video') || line.startsWith('m=application')) {
      inAudio = false
    }
    if (opusPT && line.startsWith(`a=fmtp:${opusPT}`)) {
      out.push(
        `a=fmtp:${opusPT} ` +
        `minptime=10;useinbandfec=1;usedtx=1;` +
        `maxaveragebitrate=128000;maxplaybackrate=48000;` +
        `sprop-maxcapturerate=48000;stereo=0;sprop-stereo=0;cbr=0`
      )
      continue
    }
    out.push(line)
  }

  return out.join('\r\n')
}

export function useWebRTC(mode = 'video') {
  const socket       = useRef(null)
  const pc           = useRef(null)
  const localRef     = useRef(null)
  const dcRef        = useRef(null)
  const roomIdRef    = useRef(null)
  const iceBuf       = useRef([])
  const rdReady      = useRef(false)
  // ✅ ONE persistent audio element for audio mode only
  const audioElRef   = useRef(null)

  const [localStream,  setLocal]     = useState(null)
  const [remoteStream, setRemote]    = useState(null)
  const [status,       setStatus]    = useState('idle')
  const [messages,     setMessages]  = useState([])
  const [chatReady,    setChatReady] = useState(false)
  const [isMuted,      setMuted]     = useState(false)
  const [isCamOff,     setCamOff]    = useState(false)
  const [roomId,       setRoomId]    = useState(null)

  // ✅ Create ONE hidden <audio> element for audio mode
  // Video mode does NOT use this — <video muted={false}> handles it
  useEffect(() => {
    document.getElementById('__rtc_audio')?.remove()
    const el          = document.createElement('audio')
    el.id             = '__rtc_audio'
    el.autoplay       = true
    el.muted          = false
    el.volume         = 1.0
    el.style.cssText  = 'position:fixed;width:1px;height:1px;opacity:0.01;pointer-events:none;left:-9999px'
    document.body.appendChild(el)
    audioElRef.current = el
    return () => { el.srcObject = null; el.remove() }
  }, [])

  const addMsg = useCallback((msg) => {
    setMessages(p => [...p, msg])
  }, [])

  const getMedia = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('getUserMedia not supported — need HTTPS')
      return null
    }
    localRef.current?.getTracks().forEach(t => t.stop())

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: mode === 'video' ? {
          width:      { ideal: 1280 },
          height:     { ideal: 720 },
          frameRate:  { ideal: 30 },
          facingMode: 'user',
        } : false,
        audio: {
          // ✅ These are the only constraints needed
          // Do NOT add goog* — they conflict with browser's own AEC
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl:  true,
          channelCount:     1,      // MONO — Chrome AEC only works mono
          sampleRate:       48000,
          sampleSize:       16,
          latency:          0,
        },
      })
      localRef.current = stream
      setLocal(stream)
      return stream
    } catch (err) {
      console.warn('Retrying basic constraints:', err.message)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: mode === 'video',
        })
        localRef.current = stream
        setLocal(stream)
        return stream
      } catch (e) {
        console.error('Media failed:', e)
        return null
      }
    }
  }, [mode])

  const setupDC = useCallback((dc) => {
    dcRef.current = dc
    dc.onopen    = () => setChatReady(true)
    dc.onclose   = () => setChatReady(false)
    dc.onerror   = e => console.error('DC error', e)
    dc.onmessage = ({ data }) => {
      try { addMsg({ ...JSON.parse(data), fromMe: false }) }
      catch { addMsg({ text: data, fromMe: false, ts: Date.now() }) }
    }
  }, [addMsg])

  const flushIce = useCallback(async () => {
    if (!pc.current) return
    for (const c of iceBuf.current) {
      try { await pc.current.addIceCandidate(new RTCIceCandidate(c)) }
      catch (e) { console.warn('ICE', e) }
    }
    iceBuf.current = []
  }, [])

  const buildPC = useCallback(async (isOfferer) => {
    dcRef.current?.close()
    pc.current?.close()
    pc.current      = null
    dcRef.current   = null
    rdReady.current = false
    iceBuf.current  = []
    setChatReady(false)

    const stream = localRef.current || await getMedia()
    if (!stream) return null

    const remote = new MediaStream()
    setRemote(remote)

    const conn = new RTCPeerConnection(ICE_CONFIG)
    pc.current = conn

    stream.getTracks().forEach(t => conn.addTrack(t, stream))

    if (isOfferer) {
      setupDC(conn.createDataChannel('chat', { ordered: true }))
    } else {
      conn.ondatachannel = ({ channel }) => setupDC(channel)
    }

    conn.onicecandidate = ({ candidate }) => {
      if (!candidate || !roomIdRef.current) return
      socket.current?.emit('ice', { roomId: roomIdRef.current, candidate })
    }

    // ✅ Strictly block own tracks
    const localIds = new Set(stream.getTracks().map(t => t.id))
    conn.ontrack = ({ track }) => {
      if (localIds.has(track.id)) return
      remote.addTrack(track)

      // ✅ Audio mode only: play through persistent audio element
      // Video mode: <video muted={false}> handles playback — do nothing here
      if (track.kind === 'audio' && mode === 'audio' && audioElRef.current) {
        audioElRef.current.srcObject = remote
        audioElRef.current.play().catch(e => console.warn('Audio play:', e))
      }
    }

    conn.onconnectionstatechange = () => {
      const s = conn.connectionState
      console.log('[PC]', s)
      if (s === 'connected') {
        setStatus('connected')
        // Ensure audio plays after connect
        if (mode === 'audio' && audioElRef.current?.paused) {
          audioElRef.current.play().catch(() => {})
        }
      }
      if (['disconnected', 'failed', 'closed'].includes(s)) {
        setStatus('idle')
        setRemote(null)
        setChatReady(false)
        if (audioElRef.current) audioElRef.current.srcObject = null
      }
    }

    conn.oniceconnectionstatechange = () =>
      console.log('[ICE]', conn.iceConnectionState)

    return conn
  }, [getMedia, setupDC, mode])

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socket.current = s

    s.on('connect',       () => console.log('✅ Socket:', s.id))
    s.on('connect_error', (e) => console.error('❌ Socket:', e.message))

    s.on('matched', async ({ roomId: rid, role }) => {
      roomIdRef.current = rid
      setRoomId(rid)
      setStatus('connecting')
      setMessages([])
      const isOfferer = role === 'offerer'
      const conn = await buildPC(isOfferer)
      if (!conn) return
      if (isOfferer) {
        const offer = await conn.createOffer({
          offerToReceiveAudio:    true,
          offerToReceiveVideo:    mode === 'video',
          voiceActivityDetection: true,
        })
        const sdp = patchSDP(offer.sdp)
        await conn.setLocalDescription({ type: offer.type, sdp })
        s.emit('offer', { roomId: rid, offer: { type: offer.type, sdp } })
      }
    })

    s.on('offer', async ({ offer }) => {
      if (!pc.current) return
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({ type: offer.type, sdp: patchSDP(offer.sdp) })
      )
      rdReady.current = true
      await flushIce()
      const answer = await pc.current.createAnswer({ voiceActivityDetection: true })
      const sdp    = patchSDP(answer.sdp)
      await pc.current.setLocalDescription({ type: answer.type, sdp })
      s.emit('answer', { roomId: roomIdRef.current, answer: { type: answer.type, sdp } })
    })

    s.on('answer', async ({ answer }) => {
      if (!pc.current) return
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({ type: answer.type, sdp: patchSDP(answer.sdp) })
      )
      rdReady.current = true
      await flushIce()
    })

    s.on('ice', async ({ candidate }) => {
      if (!pc.current) return
      if (!rdReady.current) { iceBuf.current.push(candidate); return }
      try { await pc.current.addIceCandidate(new RTCIceCandidate(candidate)) }
      catch (e) { console.warn('[ICE]', e) }
    })

    s.on('chat',      ({ text, ts }) => addMsg({ text, ts, fromMe: false }))
    s.on('waiting',   () => setStatus('waiting'))
    s.on('cancelled', () => setStatus('idle'))

    s.on('peer:left', () => {
      pc.current?.close()
      pc.current = null; dcRef.current = null
      roomIdRef.current = null; rdReady.current = false
      iceBuf.current = []
      setRoomId(null); setStatus('idle')
      setRemote(null); setChatReady(false)
      if (audioElRef.current) audioElRef.current.srcObject = null
    })

    return () => {
      s.disconnect()
      pc.current?.close()
      localRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [buildPC, flushIce, addMsg, mode])

  useEffect(() => { getMedia() }, [getMedia])

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return
    const msg = { text: text.trim(), ts: Date.now(), fromMe: true }
    const dc  = dcRef.current
    if (dc?.readyState === 'open') {
      dc.send(JSON.stringify({ text: msg.text, ts: msg.ts }))
    } else if (roomIdRef.current) {
      socket.current?.emit('chat', { roomId: roomIdRef.current, text: msg.text })
    }
    addMsg(msg)
  }, [addMsg])

  const findStranger = useCallback(() => {
    setStatus('waiting'); setMessages([])
    socket.current?.emit('find', { mode })
  }, [mode])

  const cancelSearch = useCallback(() => {
    socket.current?.emit('cancel'); setStatus('idle')
  }, [])

  const skipStranger = useCallback(() => {
    pc.current?.close()
    pc.current = null; dcRef.current = null
    roomIdRef.current = null; rdReady.current = false
    iceBuf.current = []
    setRemote(null); setMessages([]); setChatReady(false)
    if (audioElRef.current) audioElRef.current.srcObject = null
    socket.current?.emit('skip', { mode })
    setStatus('waiting')
  }, [mode])

  const toggleMute = useCallback(() => {
    localRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setMuted(p => !p)
  }, [])

  const toggleCamera = useCallback(() => {
    localRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setCamOff(p => !p)
  }, [])

  return {
    localStream, remoteStream,
    status, isMuted, isCamOff,
    messages, chatReady, roomId,
    sendMessage,
    findStranger, cancelSearch, skipStranger,
    toggleMute, toggleCamera,
  }
}
