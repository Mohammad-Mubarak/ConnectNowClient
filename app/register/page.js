'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Zap, Globe, Wifi, Loader2, ArrowRight, Sparkles, Star } from 'lucide-react'

// ─────────────────────────────────────────
// THREE.JS SCENE (inline, zero deps)
// ─────────────────────────────────────────
function useThreeScene(canvasRef) {
  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return
    let animId

    import('three').then((THREE) => {
      const canvas   = canvasRef.current
      if (!canvas) return

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 200)
      camera.position.set(0, 0, 7)

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.3))
      const l1 = new THREE.PointLight(0x14b8a6, 1.5); l1.position.set(5, 5, 5);    scene.add(l1)
      const l2 = new THREE.PointLight(0x8b5cf6, 1.0); l2.position.set(-5, -3, -5); scene.add(l2)
      const l3 = new THREE.PointLight(0xf472b6, 0.6); l3.position.set(0, 4, 2);    scene.add(l3)

      // ── Stars ──────────────────────────
      const starPos = new Float32Array(2000 * 3)
      for (let i = 0; i < 2000; i++) {
        starPos[i*3]   = (Math.random()-0.5)*120
        starPos[i*3+1] = (Math.random()-0.5)*120
        starPos[i*3+2] = (Math.random()-0.5)*120
      }
      const starGeo = new THREE.BufferGeometry()
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
      const stars = new THREE.Points(starGeo,
        new THREE.PointsMaterial({ color:0xffffff, size:0.08, transparent:true, opacity:0.45, sizeAttenuation:true }))
      scene.add(stars)

      // ── Particle field ──────────────────
      const pCount = 800
      const pPos   = new Float32Array(pCount*3)
      const pCol   = new Float32Array(pCount*3)
      const pc1    = new THREE.Color('#14b8a6')
      const pc2    = new THREE.Color('#8b5cf6')
      for (let i = 0; i < pCount; i++) {
        pPos[i*3]   = (Math.random()-0.5)*18
        pPos[i*3+1] = (Math.random()-0.5)*18
        pPos[i*3+2] = (Math.random()-0.5)*18
        const c = Math.random()>0.5 ? pc1 : pc2
        pCol[i*3]=c.r; pCol[i*3+1]=c.g; pCol[i*3+2]=c.b
      }
      const pfGeo = new THREE.BufferGeometry()
      pfGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
      pfGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3))
      const particleField = new THREE.Points(pfGeo,
        new THREE.PointsMaterial({ size:0.04, vertexColors:true, transparent:true, opacity:0.75, sizeAttenuation:true }))
      scene.add(particleField)

      // ── Talking figure ──────────────────
      const figPos = [], figCol = []
      const fc1=new THREE.Color('#14b8a6'), fc2=new THREE.Color('#8b5cf6'), fc3=new THREE.Color('#f472b6')
      const push = (x,y,z,c) => { figPos.push(x,y,z); figCol.push(c.r,c.g,c.b) }

      // Head
      for (let i=0;i<200;i++) {
        const t=Math.random()*Math.PI*2, p=Math.random()*Math.PI, r=0.42
        push(r*Math.sin(p)*Math.cos(t), r*Math.cos(p)+2.2, r*Math.sin(p)*Math.sin(t)*0.5, Math.random()>0.5?fc1:fc2)
      }
      // Neck
      for (let i=0;i<40;i++) push((Math.random()-0.5)*0.18, 1.55+(i/40)*0.35, (Math.random()-0.5)*0.1, fc2)
      // Torso
      for (let i=0;i<400;i++) {
        const t=Math.random()
        push((Math.random()-0.5)*(0.7+t*0.1)*1.8, 1.5-t*1.7, (Math.random()-0.5)*0.2, Math.random()>0.5?fc1:fc2)
      }
      // Right arm
      for (let i=0;i<150;i++) {
        const t=i/150
        push(0.7+t*0.65, 1.2-t*1.0, (Math.random()-0.5)*0.12, Math.random()>0.5?fc1:fc2)
      }
      // Legs
      for (let s=-1;s<=1;s+=2)
        for (let i=0;i<200;i++) {
          const t=i/200
          push(s*(0.28+t*0.04), -0.15-t*2.0, (Math.random()-0.5)*0.14, Math.random()>0.5?fc1:fc2)
        }

      const figGeo = new THREE.BufferGeometry()
      figGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(figPos), 3))
      figGeo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(figCol), 3))
      const figMesh = new THREE.Points(figGeo,
        new THREE.PointsMaterial({ size:0.032, vertexColors:true, transparent:true, opacity:0.9, sizeAttenuation:true }))

      // Left arm (animated separately)
      const armPos = new Float32Array(150*3), armCol = new Float32Array(150*3)
      for (let i=0;i<150;i++) {
        const t=i/150
        armPos[i*3]=-0.7-t*0.65; armPos[i*3+1]=1.2-t*0.2; armPos[i*3+2]=(Math.random()-0.5)*0.12
        armCol[i*3]=fc3.r; armCol[i*3+1]=fc3.g; armCol[i*3+2]=fc3.b
      }
      const armGeo = new THREE.BufferGeometry()
      armGeo.setAttribute('position', new THREE.BufferAttribute(armPos, 3))
      armGeo.setAttribute('color',    new THREE.BufferAttribute(armCol, 3))
      const armMesh = new THREE.Points(armGeo,
        new THREE.PointsMaterial({ size:0.032, vertexColors:true, transparent:true, opacity:0.9, sizeAttenuation:true }))

      const figGroup = new THREE.Group()
      figGroup.add(figMesh)
      figGroup.add(armMesh)
      figGroup.position.set(2.4, -0.5, -0.5)
      scene.add(figGroup)

      // ── Sound waves ─────────────────────
      const waves = Array.from({ length: 4 }, (_, i) => {
        const m = new THREE.Mesh(
          new THREE.TorusGeometry(0.5, 0.01, 8, 60),
          new THREE.MeshBasicMaterial({ color:0x14b8a6, transparent:true, opacity:0.4 })
        )
        m.position.set(1.1, 2.15, -0.5)
        m.rotation.x = Math.PI / 2
        m.userData.delay = i * 0.9
        scene.add(m)
        return m
      })

      // ── DNA helix ───────────────────────
      const dnaGroup = new THREE.Group()
      const dnaCount = 100
      const d1 = new Float32Array(dnaCount*3), d2 = new Float32Array(dnaCount*3)
      for (let i=0;i<dnaCount;i++) {
        const t=(i/dnaCount)*Math.PI*7, y=(i/dnaCount)*5.5-2.75
        d1[i*3]=Math.cos(t)*0.35; d1[i*3+1]=y; d1[i*3+2]=Math.sin(t)*0.35
        d2[i*3]=Math.cos(t+Math.PI)*0.35; d2[i*3+1]=y; d2[i*3+2]=Math.sin(t+Math.PI)*0.35
      }
      const dg1 = new THREE.BufferGeometry(); dg1.setAttribute('position', new THREE.BufferAttribute(d1, 3))
      const dg2 = new THREE.BufferGeometry(); dg2.setAttribute('position', new THREE.BufferAttribute(d2, 3))
      dnaGroup.add(new THREE.Points(dg1, new THREE.PointsMaterial({ color:0x14b8a6, size:0.055, transparent:true, opacity:0.65 })))
      dnaGroup.add(new THREE.Points(dg2, new THREE.PointsMaterial({ color:0x8b5cf6, size:0.055, transparent:true, opacity:0.65 })))
      dnaGroup.position.set(-3.8, 0, -1.5)
      scene.add(dnaGroup)

      // ── Glowing morph spheres ───────────
      const spheres = [
        { pos:[-3.2, 2,-3],  color:0x14b8a6, speed:0.7, scale:2.2 },
        { pos:[ 3.5,-2,-4],  color:0x8b5cf6, speed:1.0, scale:2.0 },
        { pos:[ 0,-3.5,-3],  color:0xec4899, speed:0.6, scale:1.4 },
      ].map(({ pos, color, speed, scale }) => {
        const geo  = new THREE.SphereGeometry(1, 24, 24)
        const mesh = new THREE.Mesh(geo,
          new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.13 }))
        mesh.position.set(...pos)
        mesh.scale.setScalar(scale)
        mesh.userData = { speed, geo }
        scene.add(mesh)
        return mesh
      })

      // ── Spin rings ──────────────────────
      const rings = [
        { pos:[-2.5, 1.5,-1], color:0x14b8a6, speed:0.35 },
        { pos:[ 2.8,-1.0,-2], color:0x8b5cf6, speed:0.55 },
      ].map(({ pos, color, speed }) => {
        const m = new THREE.Mesh(
          new THREE.TorusGeometry(1.5, 0.013, 12, 100),
          new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.28 })
        )
        m.position.set(...pos)
        m.userData.speed = speed
        scene.add(m)
        return m
      })

      // ── Wireframe cubes ─────────────────
      const cubes = [
        { pos:[-1.5, 2.5, 0], color:0x14b8a6, speed:0.70 },
        { pos:[ 0.5, 3.2, 0], color:0x8b5cf6, speed:1.10 },
        { pos:[-2.5,-1.5, 0], color:0xf472b6, speed:0.60 },
        { pos:[ 3.2, 1.2, 0], color:0x14b8a6, speed:0.85 },
      ].map(({ pos, color, speed }) => {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.2, 0.2),
          new THREE.MeshBasicMaterial({ color, wireframe:true, transparent:true, opacity:0.5 })
        )
        m.position.set(...pos)
        m.userData = { speed, baseY: pos[1] }
        scene.add(m)
        return m
      })

      // ── Orbit particle ring ─────────────
      const oCount = 400
      const oPos   = new Float32Array(oCount*3), oCol = new Float32Array(oCount*3)
      const oc1=new THREE.Color('#14b8a6'), oc2=new THREE.Color('#8b5cf6')
      for (let i=0;i<oCount;i++) {
        const theta=(i/oCount)*Math.PI*2, r=5.5+(Math.random()-0.5)*0.6
        oPos[i*3]=Math.cos(theta)*r; oPos[i*3+1]=(Math.random()-0.5)*0.5; oPos[i*3+2]=Math.sin(theta)*r
        const c=Math.random()>0.5?oc1:oc2; oCol[i*3]=c.r; oCol[i*3+1]=c.g; oCol[i*3+2]=c.b
      }
      const orbitGeo = new THREE.BufferGeometry()
      orbitGeo.setAttribute('position', new THREE.BufferAttribute(oPos, 3))
      orbitGeo.setAttribute('color',    new THREE.BufferAttribute(oCol, 3))
      const orbitRing = new THREE.Points(orbitGeo,
        new THREE.PointsMaterial({ size:0.045, vertexColors:true, transparent:true, opacity:0.55, sizeAttenuation:true }))
      scene.add(orbitRing)

      // ── Resize handler ───────────────────
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', onResize)

      // ── Animation loop ───────────────────
      const clock = new THREE.Clock()
      const animate = () => {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        // Camera gentle drift
        camera.position.x = Math.sin(t*0.15)*0.8
        camera.position.y = Math.cos(t*0.10)*0.3
        camera.lookAt(0, 0, 0)

        stars.rotation.y          = t * 0.010
        particleField.rotation.y  = t * 0.025
        particleField.rotation.x  = t * 0.010
        orbitRing.rotation.y      = t * 0.070
        dnaGroup.rotation.y       = t * 0.450

        // Figure animations
        figGroup.rotation.y  = Math.sin(t*0.35)*0.15
        figGroup.position.y  = Math.sin(t*0.55)*0.07 - 0.5
        armMesh.rotation.z   = Math.sin(t*2.80)*0.25 - 0.3

        // Sound waves
        waves.forEach(w => {
          const wt = (t + w.userData.delay) % 3.5
          w.scale.setScalar(0.2 + wt*0.55)
          w.material.opacity = Math.max(0, 0.5 - wt*0.14)
        })

        // Morph spheres
        spheres.forEach(s => {
          const st  = t * s.userData.speed
          const pos = s.userData.geo.attributes.position
          for (let i=0;i<pos.count;i++) {
            const ox=pos.getX(i), oy=pos.getY(i), oz=pos.getZ(i)
            const l = Math.sqrt(ox*ox+oy*oy+oz*oz)||1
            const n = Math.sin(ox*3+st)*Math.cos(oy*3+st)*0.17
            pos.setXYZ(i,(ox/l)*(1+n),(oy/l)*(1+n),(oz/l)*(1+n))
          }
          pos.needsUpdate = true
          s.rotation.y    = st * 0.18
        })

        // Rings
        rings.forEach(r => {
          r.rotation.x += 0.005 * r.userData.speed * 8
          r.rotation.z += 0.003 * r.userData.speed * 8
        })

        // Cubes
        cubes.forEach(c => {
          c.rotation.x = t * c.userData.speed
          c.rotation.y = t * c.userData.speed * 0.7
          c.position.y = c.userData.baseY + Math.sin(t*c.userData.speed*0.8)*0.3
        })

        renderer.render(scene, camera)
      }
      animate()

      // Cleanup
      canvasRef.current._cleanup = () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('resize', onResize)
        renderer.dispose()
      }
    })

    return () => {
      if (canvasRef.current?._cleanup) canvasRef.current._cleanup()
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])
}

// ─────────────────────────────────────────
// GEO WITH FALLBACK CHAIN
// ─────────────────────────────────────────
function getFlagEmoji(code) {
  if (!code) return '🌍'
  return [...code.toUpperCase()].map(c =>
    String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
  ).join('')
}

async function fetchGeo() {
  // Primary: ipapi.co
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

  // Fallback: ip-api.com
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

// ─────────────────────────────────────────
// LIVE COUNTER
// ─────────────────────────────────────────
function LiveCounter({ target }) {
  const [val, setVal] = useState(target - 80)
  useEffect(() => {
    const id = setInterval(() => {
      setVal(v => v >= target
        ? target + Math.floor(Math.random()*3-1)
        : v + Math.ceil((target-v)/10)
      )
    }, 60)
    return () => clearInterval(id)
  }, [target])
  return <>{val.toLocaleString()}</>
}

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────
const PERKS = [
  { icon: '🎯', text: 'Smart interest matching'   },
  { icon: '⚡', text: 'Find strangers in under 3s' },
  { icon: '🎥', text: 'Video & voice modes'        },
  { icon: '🌍', text: '190+ countries connected'   },
]
const AVATARS = ['😎', '🥷', '👾', '🦋', '🐉', '🌸']

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────
export default function RegisterPage() {
  const canvasRef    = useRef(null)
  const [loading,    setLoading]    = useState(false)
  const [geoProfile, setGeoProfile] = useState(null)
  const [geoLoading, setGeoLoading] = useState(true)
  const [btnHover,   setBtnHover]   = useState(false)
  const [mounted,    setMounted]    = useState(false)

  useThreeScene(canvasRef)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    fetchGeo()
      .then(setGeoProfile)
      .catch(() => setGeoProfile(null))
      .finally(() => setGeoLoading(false))
  }, [])

  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      // TODO: replace with your Google OAuth logic
      console.log('Google signup triggered')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#060A14] flex items-center justify-center relative overflow-hidden px-4 py-10">

      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        style={{ position:'fixed', inset:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none' }}
      />

      {/* Vignette */}
      <div className="fixed inset-0 z-[1] pointer-events-none"
        style={{ background:'radial-gradient(ellipse at 60% 50%, transparent 20%, rgba(6,10,20,0.82) 80%)' }} />

      {/* Grid */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:'linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)',
          backgroundSize:'44px 44px',
        }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-center">

          {/* ── LEFT (desktop only) ── */}
          <div
            className="hidden lg:flex flex-col gap-7 transition-all duration-700"
            style={{ opacity:mounted?1:0, transform:mounted?'translateX(0)':'translateX(-30px)' }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)', boxShadow:'0 0 20px rgba(20,184,166,0.35)' }}>
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tight"
                style={{ background:'linear-gradient(135deg,#14b8a6,#a78bfa,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                ConnectNow
              </span>
            </div>

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full self-start"
              style={{ background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.28)', backdropFilter:'blur(12px)' }}>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <Sparkles size={12} className="text-violet-400" />
              <span className="text-violet-300 text-xs font-semibold">
                <LiveCounter target={2401847} /> online right now
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-5xl font-black text-white leading-[1.08] tracking-tight">
                Meet the world<br />
                <span style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  one stranger
                </span>
                <br />at a time.
              </h1>
              <p className="text-gray-400 text-sm mt-4 leading-relaxed max-w-xs">
                Random video & voice chats with real people worldwide. No algorithms. No feed. Just genuine connections.
              </p>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-2 gap-2.5">
              {PERKS.map(({ icon, text }) => (
                <div key={text}
                  className="flex items-center gap-2.5 p-3.5 rounded-2xl transition-all duration-200 hover:bg-white/5 cursor-default"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <span className="text-gray-300 text-xs font-medium leading-snug">{text}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {AVATARS.map((emoji, i) => (
                  <div key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-[#060A14]"
                    style={{ background:'rgba(255,255,255,0.07)', zIndex:AVATARS.length-i }}>
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_,i)=>(
                    <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-white text-xs font-bold ml-1">4.9</span>
                </div>
                <p className="text-gray-500 text-[10px] mt-0.5">Loved by 2.4M+ users worldwide</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { val:'2.4M', label:'Online Now', color:'#14b8a6' },
                { val:'190+', label:'Countries',  color:'#8b5cf6' },
                { val:'<3s',  label:'Match Time', color:'#f472b6' },
              ].map(({ val, label, color }) => (
                <div key={label} className="flex flex-col items-center py-3 rounded-2xl"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <p className="font-black text-lg" style={{ color }}>{val}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT (signup card) ── */}
          <div
            className="w-full transition-all duration-700"
            style={{ opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(30px)' }}
          >
            {/* Mobile logo */}
            <div className="flex flex-col items-center mb-6 lg:hidden">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center mb-3"
                style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)', boxShadow:'0 0 30px rgba(20,184,166,0.4)' }}>
                <Zap size={26} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight"
                style={{ background:'linear-gradient(135deg,#14b8a6,#a78bfa,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                ConnectNow
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs font-semibold">
                  <LiveCounter target={2401847} /> online
                </span>
              </div>
            </div>

            {/* Card */}
            <div className="rounded-3xl p-6 sm:p-7 flex flex-col gap-5 relative overflow-hidden"
              style={{
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.09)',
                backdropFilter:'blur(40px)',
                boxShadow:'0 25px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              {/* Top shimmer line */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background:'linear-gradient(90deg,transparent,rgba(20,184,166,0.8),rgba(139,92,246,0.8),rgba(244,114,182,0.5),transparent)' }} />

              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-bold">Free forever</span>
                </div>
                <h2 className="text-white font-black text-2xl tracking-tight">Create account</h2>
                <p className="text-gray-500 text-sm mt-0.5">Join in seconds. No credit card needed.</p>
              </div>

              {/* Geo */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ background:'rgba(59,130,246,0.07)', border:'1px solid rgba(59,130,246,0.18)' }}>
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

              {/* Google button */}
              <button
                onClick={handleGoogleSignup}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                onTouchStart={() => setBtnHover(true)}
                onTouchEnd={() => setBtnHover(false)}
                disabled={loading}
                className="relative w-full flex items-center gap-3 py-4 px-5 rounded-2xl font-bold text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden active:scale-[0.98]"
                style={{
                  background: btnHover?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.055)',
                  border:`1px solid ${btnHover?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.1)'}`,
                  boxShadow: btnHover?'0 8px 30px rgba(20,184,166,0.15)':'none',
                  transform: btnHover?'translateY(-1px)':'translateY(0)',
                }}>
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                  style={{ opacity:btnHover?1:0, background:'linear-gradient(135deg,rgba(20,184,166,0.07) 0%,rgba(139,92,246,0.07) 100%)' }} />
                {loading ? (
                  <Loader2 size={20} className="animate-spin text-gray-400 flex-shrink-0" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span className="flex-1 text-left text-sm font-bold">
                  {loading?'Creating your account...':'Continue with Google'}
                </span>
                {!loading && (
                  <ArrowRight size={16} className="flex-shrink-0 transition-all duration-200"
                    style={{ color:btnHover?'#fff':'#6b7280', transform:btnHover?'translateX(2px)':'translateX(0)' }} />
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.06)' }} />
                <span className="text-gray-600 text-[10px] uppercase tracking-widest font-medium">what you get</span>
                <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label:'🔒 Encrypted',    color:'teal'   },
                  { label:'🕵️ Anonymous',   color:'violet' },
                  { label:'⚡ Instant match', color:'teal'  },
                  { label:'🚫 Zero ads',      color:'violet' },
                  { label:'🌍 Global reach',  color:'teal'   },
                  { label:'💸 Always free',   color:'violet' },
                ].map(({ label, color }) => (
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

              {/* Terms */}
              <p className="text-center text-gray-600 text-[10px] leading-relaxed">
                By signing up you agree to our{' '}
                <span className="text-teal-400 cursor-pointer hover:underline">Terms</span>
                {' '}and{' '}
                <span className="text-teal-400 cursor-pointer hover:underline">Privacy Policy</span>
              </p>
            </div>

            {/* Sign in link */}
            <div className="flex items-center justify-center gap-2 mt-5">
              <span className="text-gray-600 text-xs">Already have an account?</span>
              <Link href="/login"
                className="flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs font-bold transition-all group">
                Sign in
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
