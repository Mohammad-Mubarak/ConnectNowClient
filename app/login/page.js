'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Globe, Wifi, Loader2, ArrowRight, Sparkles } from 'lucide-react'

// ─────────────────────────────────────────────────
// CHAT / TALK SCENE — raw Three.js
// ─────────────────────────────────────────────────
function useChatScene(canvasRef) {
  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return
    let animId

    import('three').then((THREE) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const W = window.innerWidth, H = window.innerHeight
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setSize(W, H)
      renderer.setClearColor(0x000000, 0)

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200)
      camera.position.set(0, 0, 10)

      // ── Lights ──────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.4))
      const l1 = new THREE.PointLight(0x14b8a6, 2.0, 30); l1.position.set( 6,  6, 4); scene.add(l1)
      const l2 = new THREE.PointLight(0x8b5cf6, 1.5, 30); l2.position.set(-6, -4, 4); scene.add(l2)
      const l3 = new THREE.PointLight(0xf472b6, 1.0, 20); l3.position.set( 0,  5, 2); scene.add(l3)

      // ── Stars ───────────────────────────────────
      const sp = new Float32Array(1200 * 3)
      for (let i = 0; i < 1200; i++) {
        sp[i*3]   = (Math.random()-.5)*90
        sp[i*3+1] = (Math.random()-.5)*90
        sp[i*3+2] = (Math.random()-.5)*90
      }
      const sg = new THREE.BufferGeometry()
      sg.setAttribute('position', new THREE.BufferAttribute(sp, 3))
      const stars = new THREE.Points(sg,
        new THREE.PointsMaterial({ color:0xffffff, size:0.06, transparent:true, opacity:0.35, sizeAttenuation:true }))
      scene.add(stars)

      // ── Helper: rounded rect shape for chat bubbles ──
      function makeBubbleGeo(w, h, r) {
        const shape = new THREE.Shape()
        shape.moveTo(-w/2 + r, -h/2)
        shape.lineTo( w/2 - r, -h/2)
        shape.quadraticCurveTo( w/2, -h/2,  w/2, -h/2 + r)
        shape.lineTo( w/2,  h/2 - r)
        shape.quadraticCurveTo( w/2,  h/2,  w/2 - r,  h/2)
        shape.lineTo(-w/2 + r,  h/2)
        shape.quadraticCurveTo(-w/2,  h/2, -w/2,  h/2 - r)
        shape.lineTo(-w/2, -h/2 + r)
        shape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2)
        return new THREE.ShapeGeometry(shape)
      }

      // ── Chat bubbles ─────────────────────────────
      const BUBBLE_DEFS = [
        { x:-4.5, y: 2.8, z:-1, w:2.4, h:0.7, color:0x14b8a6, side:'left',  delay:0.0, speed:0.55, amp:0.25 },
        { x: 3.8, y: 2.0, z:-2, w:2.8, h:0.7, color:0x8b5cf6, side:'right', delay:1.2, speed:0.48, amp:0.30 },
        { x:-5.0, y: 0.2, z:-1, w:2.1, h:0.7, color:0x14b8a6, side:'left',  delay:2.1, speed:0.62, amp:0.20 },
        { x: 4.2, y:-0.8, z:-2, w:3.0, h:0.7, color:0x8b5cf6, side:'right', delay:0.7, speed:0.50, amp:0.28 },
        { x:-4.2, y:-2.2, z:-1, w:2.6, h:0.7, color:0x14b8a6, side:'left',  delay:3.0, speed:0.57, amp:0.22 },
        { x: 3.5, y:-3.0, z:-2, w:2.2, h:0.7, color:0xf472b6, side:'right', delay:1.8, speed:0.45, amp:0.32 },
        { x:-3.8, y: 1.4, z:-3, w:1.8, h:0.6, color:0x8b5cf6, side:'left',  delay:4.0, speed:0.52, amp:0.18 },
        { x: 5.0, y: 1.0, z:-3, w:2.0, h:0.6, color:0x14b8a6, side:'right', delay:2.5, speed:0.60, amp:0.24 },
      ]

      const bubbles = BUBBLE_DEFS.map(def => {
        const geo = makeBubbleGeo(def.w, def.h, 0.18)
        const mat = new THREE.MeshPhongMaterial({
          color: def.color, transparent: true, opacity: 0.0,
          shininess: 60, emissive: new THREE.Color(def.color).multiplyScalar(0.3),
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(def.x, def.y, def.z)
        scene.add(mesh)

        // Tail triangle
        const tailShape = new THREE.Shape()
        if (def.side === 'left') {
          tailShape.moveTo(0,0); tailShape.lineTo(0.3, 0.15); tailShape.lineTo(0.3,-0.15)
        } else {
          tailShape.moveTo(0,0); tailShape.lineTo(-0.3, 0.15); tailShape.lineTo(-0.3,-0.15)
        }
        const tailGeo = new THREE.ShapeGeometry(tailShape)
        const tail    = new THREE.Mesh(tailGeo, mat.clone())
        const tx = def.side === 'left' ? -def.w/2 : def.w/2
        tail.position.set(def.x + tx, def.y - 0.1, def.z)
        scene.add(tail)

        // Dots inside bubble (simulated text lines)
        const dotCount = Math.floor(def.w * 2.5)
        const dotPts   = []
        for (let i = 0; i < dotCount; i++) {
          dotPts.push(new THREE.Vector3(
            -def.w/2 + 0.3 + (i/(dotCount-1)) * (def.w - 0.6),
            def.y + (Math.random()-.5)*0.15,
            def.z + 0.01
          ))
        }
        const dotGeo = new THREE.BufferGeometry().setFromPoints(dotPts)
        const dots   = new THREE.Points(dotGeo,
          new THREE.PointsMaterial({ color:0xffffff, size:0.06, transparent:true, opacity:0.0, sizeAttenuation:true }))
        dots.position.x = def.x
        scene.add(dots)

        return { mesh, tail, dots, mat, def, baseY: def.y, visible: false, fadeIn: 0 }
      })

      // ── Typing indicator bubbles ─────────────────
      function makeTypingBubble(x, y, z, color) {
        const geo  = makeBubbleGeo(1.1, 0.55, 0.18)
        const mat  = new THREE.MeshPhongMaterial({
          color, transparent:true, opacity:0.0,
          emissive: new THREE.Color(color).multiplyScalar(0.25),
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(x, y, z)
        scene.add(mesh)

        // 3 dots
        const dotPts = [-0.25, 0, 0.25].map(dx => new THREE.Vector3(dx, 0, 0.01))
        const dg = new THREE.BufferGeometry().setFromPoints(dotPts)
        const dm = new THREE.PointsMaterial({ color:0xffffff, size:0.1, transparent:true, opacity:0.0, sizeAttenuation:true })
        const dp = new THREE.Points(dg, dm)
        dp.position.set(x, y, z)
        scene.add(dp)

        return { mesh, mat, dp, dm, baseY: y }
      }

      const typingBubbles = [
        makeTypingBubble(-4.5, -0.5, 0, 0x14b8a6),
        makeTypingBubble( 4.0,  0.8, -1, 0x8b5cf6),
      ]

      // ── Avatar nodes (people) ────────────────────
      const AVATAR_DEFS = [
        { x:-5.5, y: 3.5, color:0x14b8a6 },
        { x: 5.5, y: 2.5, color:0x8b5cf6 },
        { x:-5.5, y:-0.5, color:0x14b8a6 },
        { x: 5.5, y:-1.5, color:0xf472b6 },
        { x:-5.0, y:-3.0, color:0x14b8a6 },
        { x: 5.0, y:-3.5, color:0x8b5cf6 },
      ]

      const avatars = AVATAR_DEFS.map(({ x, y, color }) => {
        // Outer ring
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.38, 0.04, 12, 48),
          new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.7 })
        )
        ring.position.set(x, y, 0)
        scene.add(ring)

        // Inner filled circle
        const circle = new THREE.Mesh(
          new THREE.CircleGeometry(0.28, 32),
          new THREE.MeshPhongMaterial({
            color, transparent:true, opacity:0.35,
            emissive: new THREE.Color(color).multiplyScalar(0.4),
          })
        )
        circle.position.set(x, y, 0.01)
        scene.add(circle)

        // Person icon (2 circles: head + body arc)
        const head = new THREE.Mesh(
          new THREE.CircleGeometry(0.09, 16),
          new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.9 })
        )
        head.position.set(x, y + 0.06, 0.02)
        scene.add(head)

        // Pulse ring
        const pulse = new THREE.Mesh(
          new THREE.TorusGeometry(0.38, 0.02, 8, 48),
          new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.0 })
        )
        pulse.position.set(x, y, -0.01)
        scene.add(pulse)

        return { ring, circle, head, pulse, x, y, color, phase: Math.random()*Math.PI*2 }
      })

      // ── Connection lines between avatar pairs ────
      const PAIRS = [[0,1],[2,3],[4,5],[0,3],[1,2]]

      const connLines = PAIRS.map(([i, j], idx) => {
        const a = avatars[i], b = avatars[j]
        const pts = []
        const steps = 40
        for (let s = 0; s <= steps; s++) {
          const t = s / steps
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2 + (idx % 2 === 0 ? 0.8 : -0.8)
          const x  = (1-t)*(1-t)*a.x + 2*(1-t)*t*mx + t*t*b.x
          const y  = (1-t)*(1-t)*a.y + 2*(1-t)*t*my + t*t*b.y
          pts.push(new THREE.Vector3(x, y, -0.5))
        }
        const colors = [0x14b8a6, 0x8b5cf6, 0xf472b6, 0xfbbf24, 0x14b8a6]
        const mat = new THREE.LineBasicMaterial({
          color: colors[idx % colors.length], transparent:true, opacity:0.25
        })
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat)
        scene.add(line)

        // Travelling signal dot
        const tdot = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          new THREE.MeshBasicMaterial({ color: colors[idx % colors.length], transparent:true, opacity:0.9 })
        )
        scene.add(tdot)

        return { line, mat, tdot, pts, t: Math.random(), speed: 0.004 + Math.random()*0.003 }
      })

      // ── Central mini globe ───────────────────────
      const globeGroup = new THREE.Group()

      // Ocean
      const globeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 48, 48),
        new THREE.MeshPhongMaterial({
          color:0x0a2a6e, emissive:0x061535,
          shininess:80, specular: new THREE.Color(0x1a6fb5)
        })
      )
      globeGroup.add(globeMesh)

      // Atmosphere
      globeGroup.add(new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 32, 32),
        new THREE.MeshBasicMaterial({ color:0x14b8a6, transparent:true, opacity:0.06 })
      ))

      // Grid lines on globe
      const gGridMat = new THREE.LineBasicMaterial({ color:0x1e5580, transparent:true, opacity:0.4 })
      for (let lat=-60; lat<=60; lat+=30) {
        const phi=( 90-lat)*(Math.PI/180), r=Math.sin(phi)*0.8, y=Math.cos(phi)*0.8
        const pts=[]; for(let i=0;i<=48;i++){const t=(i/48)*Math.PI*2; pts.push(new THREE.Vector3(r*Math.cos(t),y,r*Math.sin(t)))}
        globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gGridMat))
      }
      for (let lon=0; lon<360; lon+=45) {
        const theta=lon*(Math.PI/180), pts=[]
        for(let i=0;i<=32;i++){const p=(i/32)*Math.PI; pts.push(new THREE.Vector3(Math.sin(p)*Math.cos(theta)*0.8,Math.cos(p)*0.8,Math.sin(p)*Math.sin(theta)*0.8))}
        globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gGridMat))
      }

      // Land masses on globe
      function ll2v(lat, lon, r=0.802) {
        const phi=(90-lat)*(Math.PI/180), theta=(lon+180)*(Math.PI/180)
        return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta))
      }
      const landDefs=[
        [50,-100,35,55,180],[20,-85,25,35,100],[-15,-58,40,28,160],
        [52,15,22,38,130],[10,20,55,45,220],[50,90,38,75,280],
        [20,77,18,28,100],[-25,133,22,28,90],[36,138,12,16,60]
      ]
      landDefs.forEach(([la,lo,ls,lw,n])=>{
        const pts=[]; for(let i=0;i<n;i++) pts.push(ll2v(la+(Math.random()-.5)*ls, lo+(Math.random()-.5)*lw))
        const g=new THREE.BufferGeometry().setFromPoints(pts)
        globeGroup.add(new THREE.Points(g, new THREE.PointsMaterial({color:0x1a5c38,size:0.018,transparent:true,opacity:0.9,sizeAttenuation:true})))
      })

      // City dots on globe
      const GLOB_CITIES=[[40.7,-74,0x14b8a6],[51.5,-0.1,0x8b5cf6],[35.6,139.7,0xfbbf24],[19.0,72.8,0xf472b6],[1.3,103.8,0x14b8a6],[-23.5,-46.6,0x8b5cf6],[30,31.2,0xfbbf24],[-26.2,28,0xf472b6]]
      GLOB_CITIES.forEach(([lat,lon,col])=>{
        const pos=ll2v(lat,lon,0.805)
        const dot=new THREE.Mesh(new THREE.SphereGeometry(0.013,6,6),new THREE.MeshBasicMaterial({color:col}))
        dot.position.copy(pos); globeGroup.add(dot)
      })

      globeGroup.position.set(0, 0, -2)
      scene.add(globeGroup)

      // ── Floating emoji particles ─────────────────
      // Simulate with glowing colored spheres at random positions
      const EMOJI_COLORS = [0x14b8a6, 0x8b5cf6, 0xf472b6, 0xfbbf24, 0x3b82f6]
      const floaters = Array.from({ length: 18 }, (_, i) => {
        const color = EMOJI_COLORS[i % EMOJI_COLORS.length]
        const mesh  = new THREE.Mesh(
          new THREE.SphereGeometry(0.06 + Math.random()*0.04, 8, 8),
          new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.5 + Math.random()*0.3 })
        )
        const angle = (i / 18) * Math.PI * 2
        const rad   = 3.5 + Math.random() * 2.5
        mesh.position.set(
          Math.cos(angle) * rad,
          (Math.random()-.5) * 6,
          -1 + Math.random() * -2
        )
        mesh.userData = { angle, rad, speed: 0.003 + Math.random()*0.004, phase: Math.random()*Math.PI*2, baseY: mesh.position.y }
        scene.add(mesh)
        return mesh
      })

      // ── Resize ───────────────────────────────────
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', onResize)

      // ── Animation loop ───────────────────────────
      const clock = new THREE.Clock()
      const animate = () => {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        // Camera subtle drift
        camera.position.x = Math.sin(t*0.10)*0.4
        camera.position.y = Math.cos(t*0.07)*0.2
        camera.lookAt(0, 0, 0)

        stars.rotation.y = t * 0.007

        // Globe spin
        globeGroup.rotation.y = t * 0.22

        // Chat bubbles — staggered fade in + float
        bubbles.forEach(b => {
          const elapsed = t - b.def.delay
          if (elapsed < 0) return

          // Fade in
          b.fadeIn = Math.min(1, elapsed * 1.2)
          b.mat.opacity = b.fadeIn * 0.88

          // Floating
          const floatY = b.baseY + Math.sin(t * b.def.speed + b.def.delay) * b.def.amp
          b.mesh.position.y = floatY
          b.tail.position.y = floatY - 0.1
          b.dots.position.y = 0 // dots positioned relative to mesh

          // Dots fade
          b.dots.material.opacity = b.fadeIn * 0.6

          // Slight scale breathe
          const sc = 1 + Math.sin(t*b.def.speed*1.3 + b.def.delay)*0.015
          b.mesh.scale.set(sc, sc, 1)
        })

        // Typing indicators
        typingBubbles.forEach((tb, i) => {
          const cycle = (t * 0.6 + i * 1.5) % 4
          const show  = cycle < 2.5
          tb.mat.opacity = show ? Math.min(1, cycle * 2) * 0.8 : Math.max(0, (4 - cycle) * 2) * 0.8
          tb.dm.opacity  = tb.mat.opacity * 0.9
          tb.mesh.position.y = tb.baseY + Math.sin(t*0.7 + i)*0.12

          // Bounce dots
          tb.dp.position.y = tb.mesh.position.y
        })

        // Avatars pulse
        avatars.forEach(av => {
          const p = Math.abs(Math.sin(t * 1.2 + av.phase))
          av.pulse.scale.setScalar(1 + p * 0.6)
          av.pulse.material.opacity = (1 - p) * 0.5
          av.ring.rotation.z = t * 0.3 * (av.phase > Math.PI ? 1 : -1)
        })

        // Connection lines + signal dots
        connLines.forEach(cl => {
          cl.t += cl.speed
          if (cl.t > 1) cl.t = 0
          const idx = Math.min(Math.floor(cl.t * (cl.pts.length-1)), cl.pts.length-1)
          cl.tdot.position.copy(cl.pts[idx])
          // Pulse opacity on signal dot
          cl.tdot.material.opacity = 0.5 + Math.sin(t*3 + cl.t*10)*0.4
        })

        // Floaters orbit + bob
        floaters.forEach(f => {
          f.userData.angle += f.userData.speed
          const a = f.userData.angle
          f.position.x = Math.cos(a) * f.userData.rad
          f.position.y = f.userData.baseY + Math.sin(t * 0.5 + f.userData.phase) * 0.4
        })

        renderer.render(scene, camera)
      }
      animate()

      canvas._cleanup = () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); renderer.dispose() }
    })

    return () => { if (canvasRef.current?._cleanup) canvasRef.current._cleanup() }
  }, [])
}

// ─────────────────────────────────────────────────
// GEO HELPERS
// ─────────────────────────────────────────────────
function getFlagEmoji(code) {
  if (!code) return '🌍'
  return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))).join('')
}

async function fetchGeo() {
  try {
    const r = await fetch('https://ipapi.co/json/', { cache:'no-store' })
    if (r.ok) {
      const d = await r.json()
      if (d?.country_code && !d.error) return {
        city: d.city||'Unknown', region: d.region||'',
        country: d.country_name||'Unknown',
        isp: d.org||'Unknown ISP', flag: getFlagEmoji(d.country_code),
      }
    }
  } catch(_) {}
  try {
    const r = await fetch('http://ip-api.com/json/?fields=status,city,regionName,country,isp,countryCode', { cache:'no-store' })
    if (r.ok) {
      const d = await r.json()
      if (d.status==='success') return {
        city: d.city||'Unknown', region: d.regionName||'',
        country: d.country||'Unknown',
        isp: d.isp||'Unknown ISP', flag: getFlagEmoji(d.countryCode),
      }
    }
  } catch(_) {}
  throw new Error('geo failed')
}

// ─────────────────────────────────────────────────
// LIVE COUNTER
// ─────────────────────────────────────────────────
function LiveCounter({ target }) {
  const [val, setVal] = useState(target - 50)
  useEffect(() => {
    const id = setInterval(() =>
      setVal(v => v >= target
        ? target + Math.floor(Math.random()*3-1)
        : v + Math.ceil((target-v)/12)
      ), 80)
    return () => clearInterval(id)
  }, [target])
  return <>{val.toLocaleString()}</>
}

// ─────────────────────────────────────────────────
// CSS TYPING DOTS ANIMATION (pure CSS fallback)
// ─────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 h-3">
      {[0,1,2].map(i => (
        <span
          key={i}
          className="w-1 h-1 bg-teal-400 rounded-full animate-bounce"
          style={{ animationDelay:`${i*0.15}s`, animationDuration:'0.8s' }}
        />
      ))}
    </span>
  )
}

// ─────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────
export default function LoginPage() {
  const bgCanvasRef              = useRef(null)
  const [loading,    setLoading] = useState(false)
  const [geoProfile, setGeo]     = useState(null)
  const [geoLoading, setGeoLoad] = useState(true)
  const [btnHover,   setHover]   = useState(false)
  const [mounted,    setMounted] = useState(false)
  const [chatIdx,    setChatIdx] = useState(0)

  useChatScene(bgCanvasRef)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 120); return () => clearTimeout(t) }, [])
  useEffect(() => { fetchGeo().then(setGeo).catch(()=>setGeo(null)).finally(()=>setGeoLoad(false)) }, [])

  // Rotating chat preview messages
  const CHAT_PREVIEWS = [
    { from:'😎 Alex, NY',  msg:'Hey! Where are you from?',     side:'left'  },
    { from:'🦋 Mia, Paris',msg:"I'm from France! Tu parles français?", side:'right' },
    { from:'🥷 Kai, Tokyo',msg:'Anyone up for a voice chat? 🎧', side:'left' },
    { from:'🌸 Priya, IN', msg:'Just made 3 new friends today 😊', side:'right' },
  ]
  useEffect(() => {
    const id = setInterval(() => setChatIdx(i => (i + 1) % CHAT_PREVIEWS.length), 2800)
    return () => clearInterval(id)
  }, [])

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      console.log('Google login triggered') // TODO: replace with OAuth
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-[#060A14] flex items-center justify-center relative overflow-hidden px-4 py-8">

      {/* BG canvas */}
      <canvas ref={bgCanvasRef}
        style={{ position:'fixed', inset:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none' }} />

      {/* Vignette */}
      <div className="fixed inset-0 z-[1] pointer-events-none"
        style={{ background:'radial-gradient(ellipse at center, transparent 20%, rgba(6,10,20,0.9) 85%)' }} />

      {/* Grid */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.02]"
        style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)', backgroundSize:'44px 44px' }} />

      {/* ── Content ── */}
      <div
        className="relative z-10 w-full max-w-[380px] flex flex-col items-center gap-4 transition-all duration-700"
        style={{ opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(24px)' }}
      >
        {/* Live pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
          style={{ background:'rgba(20,184,166,0.12)', border:'1px solid rgba(20,184,166,0.3)', backdropFilter:'blur(12px)' }}>
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
          <span className="text-teal-300"><LiveCounter target={2401847} /> online right now</span>
        </div>

        {/* ── Live chat preview card ── */}
        <div className="w-full rounded-2xl p-3.5 relative overflow-hidden"
          style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(20px)' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Globe size={11} className="text-teal-400" />
              <span className="text-teal-400 text-[10px] font-bold uppercase tracking-widest">Live chats happening now</span>
            </div>
            <TypingDots />
          </div>
          {/* Messages */}
          <div className="flex flex-col gap-2 min-h-[72px] justify-end">
            {CHAT_PREVIEWS.slice(Math.max(0, chatIdx-1), chatIdx+1).map((c, i, arr) => (
              <div
                key={c.from}
                className={`flex ${c.side==='right'?'justify-end':'justify-start'} transition-all duration-500`}
                style={{ opacity: i===arr.length-1?1:0.45, transform:`scale(${i===arr.length-1?1:0.97})` }}
              >
                <div className="max-w-[85%]">
                  <p className={`text-[9px] font-semibold mb-0.5 ${c.side==='right'?'text-right text-violet-400':'text-teal-400'}`}>
                    {c.from}
                  </p>
                  <div
                    className="px-2.5 py-1.5 rounded-2xl text-white text-xs leading-relaxed"
                    style={{
                      background: c.side==='right'
                        ? 'rgba(139,92,246,0.2)'
                        : 'rgba(20,184,166,0.2)',
                      border: `1px solid ${c.side==='right'?'rgba(139,92,246,0.25)':'rgba(20,184,166,0.25)'}`,
                      borderBottomRightRadius: c.side==='right' ? 4 : undefined,
                      borderBottomLeftRadius:  c.side==='left'  ? 4 : undefined,
                    }}
                  >
                    {c.msg}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logo + title */}
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="relative group">
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -m-1"
              style={{ background:'rgba(20,184,166,0.2)', filter:'blur(8px)' }} />
            <div className="relative w-14 h-14 rounded-3xl flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)', boxShadow:'0 0 30px rgba(20,184,166,0.4),0 0 60px rgba(139,92,246,0.2)' }}>
              <Zap size={26} className="text-white" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#060A14]"
              style={{ background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
              <Sparkles size={9} className="text-white" />
            </div>
          </Link>
          <span className="text-2xl font-black tracking-tight"
            style={{ background:'linear-gradient(135deg,#14b8a6,#a78bfa,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            ConnectNow
          </span>
          <div className="text-center">
            <h1 className="text-white text-3xl font-black tracking-tight leading-tight">Welcome back 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Your next stranger is one tap away</p>
          </div>
        </div>

        {/* Geo card */}
        <div className="w-full flex items-center gap-3 p-3.5 rounded-2xl"
          style={{ background:'rgba(59,130,246,0.07)', border:'1px solid rgba(59,130,246,0.18)', backdropFilter:'blur(16px)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:'rgba(59,130,246,0.12)' }}>
            <Globe size={14} className="text-blue-400" />
          </div>
          {geoLoading ? (
            <div className="flex items-center gap-2 flex-1">
              <Loader2 size={12} className="text-gray-500 animate-spin flex-shrink-0" />
              <span className="text-gray-500 text-xs">Detecting your region...</span>
            </div>
          ) : geoProfile ? (
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl flex-shrink-0">{geoProfile.flag}</span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">
                    {geoProfile.city}{geoProfile.region?`, ${geoProfile.region}`:''} · {geoProfile.country}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Wifi size={9} className="text-gray-500 flex-shrink-0" />
                    <p className="text-gray-500 text-[10px] truncate">{geoProfile.isp}</p>
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                style={{ background:'rgba(20,184,166,0.12)', border:'1px solid rgba(20,184,166,0.25)', color:'#14b8a6' }}>
                Live
              </span>
            </div>
          ) : (
            <span className="text-gray-600 text-xs">Location unavailable</span>
          )}
        </div>

        {/* Auth card */}
        <div className="w-full rounded-3xl p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.09)', backdropFilter:'blur(40px)', boxShadow:'0 25px 80px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          {/* Shimmer */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background:'linear-gradient(90deg,transparent,rgba(20,184,166,0.7),rgba(139,92,246,0.7),transparent)' }} />

          <div>
            <h2 className="text-white font-black text-xl tracking-tight">Sign in</h2>
            <p className="text-gray-500 text-xs mt-0.5">No password needed — just Google</p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            onTouchStart={() => setHover(true)} onTouchEnd={() => setHover(false)}
            disabled={loading}
            className="relative w-full flex items-center gap-3 py-4 px-5 rounded-2xl font-bold text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden active:scale-[0.98]"
            style={{
              background: btnHover?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.055)',
              border:`1px solid ${btnHover?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.1)'}`,
              boxShadow: btnHover?'0 8px 30px rgba(20,184,166,0.15)':'none',
              transform: btnHover?'translateY(-1px)':'translateY(0)',
            }}>
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-500"
              style={{ opacity:btnHover?1:0, background:'linear-gradient(135deg,rgba(20,184,166,0.07),rgba(139,92,246,0.07))' }} />
            {loading
              ? <Loader2 size={20} className="animate-spin text-gray-400 flex-shrink-0" />
              : <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            }
            <span className="flex-1 text-left text-sm font-bold">
              {loading?'Signing you in...':'Continue with Google'}
            </span>
            {!loading && <ArrowRight size={16} className="flex-shrink-0 transition-all duration-200"
              style={{ color:btnHover?'#fff':'#6b7280', transform:btnHover?'translateX(2px)':'translateX(0)' }} />}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.06)' }} />
            <span className="text-gray-600 text-[10px] uppercase tracking-widest font-medium">you're safe here</span>
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {[
              {label:'🔒 Encrypted',color:'teal'},
              {label:'🕵️ Anonymous',color:'violet'},
              {label:'⚡ Instant match',color:'teal'},
              {label:'💸 Always free',color:'violet'},
            ].map(({label,color}) => (
              <span key={label} className="px-3 py-1.5 rounded-xl text-[11px] font-semibold"
                style={{
                  background: color==='teal'?'rgba(20,184,166,0.08)':'rgba(139,92,246,0.08)',
                  border:`1px solid ${color==='teal'?'rgba(20,184,166,0.2)':'rgba(139,92,246,0.2)'}`,
                  color: color==='teal'?'#5eead4':'#c4b5fd',
                }}>
                {label}
              </span>
            ))}
          </div>

          <p className="text-center text-gray-600 text-[10px] leading-relaxed">
            By continuing you agree to our{' '}
            <span className="text-teal-400 cursor-pointer hover:underline">Terms</span>{' '}and{' '}
            <span className="text-teal-400 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>

        {/* Sign up link */}
        <div className="flex items-center gap-2 pb-2">
          <span className="text-gray-600 text-xs">New to ConnectNow?</span>
          <Link href="/register"
            className="flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs font-bold transition-all group">
            Create account
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </main>
  )
}
