'use client'
import { useRef, useEffect } from 'react'

export default function GlobeScene({ size = 320 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return
    let animId

    import('three').then((THREE) => {
      const canvas   = canvasRef.current
      if (!canvas) return

      const W = size, H = size
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H)
      renderer.setClearColor(0x000000, 0)

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
      camera.position.set(0, 0, 3.2)

      // ── Lighting ──────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.6))
      const sun = new THREE.DirectionalLight(0xffffff, 1.2)
      sun.position.set(5, 3, 5)
      scene.add(sun)
      const rimLight = new THREE.PointLight(0x14b8a6, 1.0, 20)
      rimLight.position.set(-4, 2, -2)
      scene.add(rimLight)

      // ── Globe base (ocean) ────────────────────────
      const globeGeo = new THREE.SphereGeometry(1, 64, 64)
      const globeMat = new THREE.MeshPhongMaterial({
        color: 0x0a2a6e,
        emissive: 0x061535,
        shininess: 80,
        specular: new THREE.Color(0x1a6fb5),
      })
      const globe = new THREE.Mesh(globeGeo, globeMat)
      scene.add(globe)

      // ── Atmosphere glow ───────────────────────────
      const atmosGeo = new THREE.SphereGeometry(1.06, 64, 64)
      const atmosMat = new THREE.MeshPhongMaterial({
        color: 0x14b8a6,
        transparent: true,
        opacity: 0.08,
        side: THREE.FrontSide,
      })
      scene.add(new THREE.Mesh(atmosGeo, atmosMat))

      // Outer glow shell
      const outerGeo = new THREE.SphereGeometry(1.12, 32, 32)
      const outerMat = new THREE.MeshBasicMaterial({
        color: 0x14b8a6,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
      })
      scene.add(new THREE.Mesh(outerGeo, outerMat))

      // ── Latitude / longitude grid ─────────────────
      const gridMat = new THREE.LineBasicMaterial({ color: 0x1e4080, transparent: true, opacity: 0.35 })

      // Latitude rings
      for (let lat = -75; lat <= 75; lat += 15) {
        const phi    = (90 - lat) * (Math.PI / 180)
        const radius = Math.sin(phi)
        const y      = Math.cos(phi)
        const pts    = []
        for (let i = 0; i <= 64; i++) {
          const theta = (i / 64) * Math.PI * 2
          pts.push(new THREE.Vector3(radius * Math.cos(theta), y, radius * Math.sin(theta)))
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
        scene.add(new THREE.Line(lineGeo, gridMat))
      }

      // Longitude lines
      for (let lon = 0; lon < 360; lon += 20) {
        const theta = lon * (Math.PI / 180)
        const pts   = []
        for (let i = 0; i <= 48; i++) {
          const phi = (i / 48) * Math.PI
          pts.push(new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta)
          ))
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
        scene.add(new THREE.Line(lineGeo, gridMat))
      }

      // ── Continents (simplified shapes) ───────────
      // Each continent = array of [lat,lon] outline points drawn as filled polygon on globe
      const LAND_COLOR    = 0x1a5c38
      const LAND_EMISSIVE = 0x0a2a1a

      function latLonToVec3(lat, lon, r = 1.002) {
        const phi   = (90  - lat) * (Math.PI / 180)
        const theta = (lon + 180) * (Math.PI / 180)
        return new THREE.Vector3(
          -r * Math.sin(phi) * Math.cos(theta),
           r * Math.cos(phi),
           r * Math.sin(phi) * Math.sin(theta)
        )
      }

      // Draw land mass as point cloud for performance
      function addLandmass(latCenter, lonCenter, latSpread, lonSpread, density = 300) {
        const pts = []
        for (let i = 0; i < density; i++) {
          const lat = latCenter + (Math.random() - 0.5) * latSpread
          const lon = lonCenter + (Math.random() - 0.5) * lonSpread
          pts.push(latLonToVec3(lat, lon, 1.003))
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts)
        const mat = new THREE.PointsMaterial({
          color: LAND_COLOR, size: 0.018,
          transparent: true, opacity: 0.95, sizeAttenuation: true,
        })
        scene.add(new THREE.Points(geo, mat))
      }

      // North America
      addLandmass(50,  -100, 40, 60, 500)
      addLandmass(25,   -90, 20, 30, 200)
      addLandmass(20,   -85, 15, 20, 150)
      // South America
      addLandmass(-15,  -58, 50, 30, 450)
      // Europe
      addLandmass(52,    15, 25, 40, 350)
      addLandmass(40,    20, 15, 25, 150)
      // Africa
      addLandmass(10,    20, 65, 50, 600)
      // Asia
      addLandmass(50,    90, 40, 80, 800)
      addLandmass(25,    80, 20, 30, 300)
      addLandmass(20,   105, 25, 30, 250)
      addLandmass(10,    30, 20, 20, 200) // Middle East
      // Australia
      addLandmass(-25,  135, 25, 30, 250)
      // Antarctica
      addLandmass(-85,    0, 15, 360, 200)

      // ── Colored country patches (flag-like) ───────
      const COUNTRY_COLORS = [
        0xe63946, // red
        0xf4a261, // orange
        0x2a9d8f, // teal
        0xe9c46a, // yellow
        0x457b9d, // blue
        0xa8dadc, // light blue
        0x8338ec, // purple
        0x06d6a0, // green
        0xfb5607, // orange-red
        0xffbe0b, // gold
        0x3a86ff, // bright blue
        0xff006e, // pink
      ]

      const COUNTRY_POSITIONS = [
        // [lat, lon, size]
        [38, -97, 8],   // USA
        [56, -106, 7],  // Canada
        [-14, -51, 7],  // Brazil
        [51, 9, 5],     // Germany
        [46, 2, 4],     // France
        [55, 37, 5],    // Russia west
        [60, 100, 6],   // Russia east
        [35, 105, 6],   // China
        [20, 77, 5],    // India
        [36, 138, 4],   // Japan
        [2, 38, 4],     // Kenya
        [30, 31, 3],    // Egypt
        [-26, 25, 4],   // South Africa
        [6, 12, 4],     // Nigeria
        [-25, 133, 5],  // Australia
        [4, 114, 3],    // Malaysia
        [-4, 122, 3],   // Indonesia
        [23, 45, 3],    // Saudi
        [55, -3, 3],    // UK
        [40, -4, 3],    // Spain
        [42, 12, 3],    // Italy
        [59, 18, 3],    // Sweden
        [52, 20, 3],    // Poland
        [47, 8, 2],     // Switzerland
        [-34, -64, 4],  // Argentina
        [-10, -76, 3],  // Peru
        [4, -72, 3],    // Colombia
        [19, -99, 3],   // Mexico
      ]

      COUNTRY_POSITIONS.forEach(([lat, lon, spread], idx) => {
        const color   = COUNTRY_COLORS[idx % COUNTRY_COLORS.length]
        const density = spread * 30
        const pts     = []
        for (let i = 0; i < density; i++) {
          const la = lat + (Math.random() - 0.5) * spread
          const lo = lon + (Math.random() - 0.5) * spread
          pts.push(latLonToVec3(la, lo, 1.004))
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts)
        const mat = new THREE.PointsMaterial({
          color, size: 0.025, transparent: true, opacity: 0.8, sizeAttenuation: true,
        })
        scene.add(new THREE.Points(geo, mat))
      })

      // ── City dots + pulsing rings ─────────────────
      const CITIES = [
        { lat: 40.7,  lon: -74,   label: 'New York',    color: 0x14b8a6 },
        { lat: 51.5,  lon: -0.1,  label: 'London',      color: 0x8b5cf6 },
        { lat: 48.8,  lon: 2.3,   label: 'Paris',       color: 0xf472b6 },
        { lat: 55.7,  lon: 37.6,  label: 'Moscow',      color: 0x14b8a6 },
        { lat: 35.6,  lon: 139.7, label: 'Tokyo',       color: 0xfbbf24 },
        { lat: 19.0,  lon: 72.8,  label: 'Mumbai',      color: 0xf472b6 },
        { lat: -33.8, lon: 151.2, label: 'Sydney',      color: 0x8b5cf6 },
        { lat: -23.5, lon: -46.6, label: 'São Paulo',   color: 0x14b8a6 },
        { lat: 30.0,  lon: 31.2,  label: 'Cairo',       color: 0xfbbf24 },
        { lat: 1.3,   lon: 103.8, label: 'Singapore',   color: 0xf472b6 },
        { lat: 39.9,  lon: 116.4, label: 'Beijing',     color: 0x14b8a6 },
        { lat: 28.6,  lon: 77.2,  label: 'Delhi',       color: 0x8b5cf6 },
        { lat: -26.2, lon: 28.0,  label: 'Johannesburg',color: 0xfbbf24 },
        { lat: 6.5,   lon: 3.3,   label: 'Lagos',       color: 0xf472b6 },
        { lat: 19.4,  lon: -99.1, label: 'Mexico City', color: 0x14b8a6 },
        { lat: 37.5,  lon: 127.0, label: 'Seoul',       color: 0x8b5cf6 },
      ]

      const cityObjects = CITIES.map(({ lat, lon, color }) => {
        const pos = latLonToVec3(lat, lon, 1.008)

        // Dot
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.018, 8, 8),
          new THREE.MeshBasicMaterial({ color })
        )
        dot.position.copy(pos)
        scene.add(dot)

        // Pulse ring (torus)
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.03, 0.004, 6, 24),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 })
        )
        ring.position.copy(pos)
        // Orient ring tangent to globe surface
        ring.lookAt(new THREE.Vector3(0, 0, 0))
        ring.rotateX(Math.PI / 2)
        scene.add(ring)

        return { pos, ring, color, phase: Math.random() * Math.PI * 2 }
      })

      // ── Connection arcs between cities ───────────
      const CONNECTIONS = [
        [0, 1],  // NY ↔ London
        [1, 2],  // London ↔ Paris
        [1, 4],  // London ↔ Tokyo
        [0, 11], // NY ↔ Delhi
        [4, 9],  // Tokyo ↔ Singapore
        [9, 6],  // Singapore ↔ Sydney
        [5, 11], // Mumbai ↔ Delhi
        [3, 10], // Moscow ↔ Beijing
        [2, 8],  // Paris ↔ Cairo
        [13, 12],// Lagos ↔ Johannesburg
        [7, 0],  // São Paulo ↔ NY
        [14, 0], // Mexico ↔ NY
        [15, 4], // Seoul ↔ Tokyo
        [8, 5],  // Cairo ↔ Mumbai
        [10, 15],// Beijing ↔ Seoul
        [6, 9],  // Sydney ↔ Singapore
      ]

      // Build arcs as tube curves
      function buildArc(p1, p2, color, arcHeight = 0.35) {
        const mid    = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
        const midLen = mid.length()
        mid.normalize().multiplyScalar(midLen + arcHeight)

        const curve  = new THREE.QuadraticBezierCurve3(p1, mid, p2)
        const pts    = curve.getPoints(60)
        const geo    = new THREE.BufferGeometry().setFromPoints(pts)
        const mat    = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.0 })
        const line   = new THREE.Line(geo, mat)
        scene.add(line)
        return { line, mat, pts, progress: Math.random(), speed: 0.003 + Math.random() * 0.003 }
      }

      const arcs = CONNECTIONS.map(([i, j], idx) => {
        const colors = [0x14b8a6, 0x8b5cf6, 0xf472b6, 0xfbbf24]
        return buildArc(
          cityObjects[i].pos.clone(),
          cityObjects[j].pos.clone(),
          colors[idx % colors.length]
        )
      })

      // Animated travelling dot on arc
      const travelDots = arcs.map(({ pts, line }) => {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.013, 6, 6),
          new THREE.MeshBasicMaterial({ color: (line.material).color })
        )
        scene.add(dot)
        return { dot, pts, t: Math.random() }
      })

      // ── Stars ─────────────────────────────────────
      const starPos = new Float32Array(1500 * 3)
      for (let i = 0; i < 1500; i++) {
        starPos[i*3]   = (Math.random()-0.5)*80
        starPos[i*3+1] = (Math.random()-0.5)*80
        starPos[i*3+2] = (Math.random()-0.5)*80
      }
      const starGeo = new THREE.BufferGeometry()
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
      scene.add(new THREE.Points(starGeo,
        new THREE.PointsMaterial({ color:0xffffff, size:0.06, transparent:true, opacity:0.5, sizeAttenuation:true })))

      // ── Animation loop ────────────────────────────
      const clock = new THREE.Clock()
      const animate = () => {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        // Slow auto-rotate
        globe.rotation.y         = t * 0.18
        atmosMat.needsUpdate     = false

        // Sync all surface objects to globe rotation
        scene.children.forEach(obj => {
          if (obj.userData.syncGlobe) obj.rotation.y = t * 0.18
        })

        // City pulse rings
        cityObjects.forEach(({ ring, phase }, i) => {
          const pulse = Math.abs(Math.sin(t * 1.5 + phase))
          ring.scale.setScalar(0.8 + pulse * 0.8)
          ring.material.opacity = (1 - pulse) * 0.7
        })

        // Arcs fade in/out
        arcs.forEach((arc, i) => {
          arc.progress += arc.speed
          if (arc.progress > 1) arc.progress = 0
          // Fade: visible when progress 0.1–0.9
          const p = arc.progress
          arc.mat.opacity = p < 0.15 ? p/0.15*0.55
            : p > 0.85 ? (1-p)/0.15*0.55
            : 0.55
        })

        // Travel dots
        travelDots.forEach((td, i) => {
          td.t = arcs[i].progress
          const idx  = Math.floor(td.t * (td.pts.length-1))
          const pos  = td.pts[Math.min(idx, td.pts.length-1)]
          td.dot.position.copy(pos)
          td.dot.material.opacity = arcs[i].mat.opacity * 1.5
        })

        renderer.render(scene, camera)
      }
      animate()

      // cleanup
      canvas._cleanup = () => { cancelAnimationFrame(animId); renderer.dispose() }
    })

    return () => {
      if (canvasRef.current?._cleanup) canvasRef.current._cleanup()
    }
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size, display: 'block' }}
    />
  )
}
