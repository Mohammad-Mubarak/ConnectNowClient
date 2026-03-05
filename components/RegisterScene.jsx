'use client'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'

function useThreeScene(canvasRef) {
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas  = canvasRef.current
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 200)
    camera.position.set(0, 0, 7)

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.3))
    const l1 = new THREE.PointLight(0x14b8a6, 1.5); l1.position.set(5,5,5);   scene.add(l1)
    const l2 = new THREE.PointLight(0x8b5cf6, 1.0); l2.position.set(-5,-3,-5); scene.add(l2)
    const l3 = new THREE.PointLight(0xf472b6, 0.6); l3.position.set(0,4,2);   scene.add(l3)

    // ── Stars ──
    const starPos = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000; i++) {
      starPos[i*3]   = (Math.random()-0.5)*120
      starPos[i*3+1] = (Math.random()-0.5)*120
      starPos[i*3+2] = (Math.random()-0.5)*120
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0xffffff, size:0.08, transparent:true, opacity:0.5, sizeAttenuation:true }))
    scene.add(stars)

    // ── Particle field ──
    const count = 800
    const pPos  = new Float32Array(count*3)
    const pCol  = new Float32Array(count*3)
    const c1 = new THREE.Color('#14b8a6'), c2 = new THREE.Color('#8b5cf6')
    for (let i = 0; i < count; i++) {
      pPos[i*3]   = (Math.random()-0.5)*18
      pPos[i*3+1] = (Math.random()-0.5)*18
      pPos[i*3+2] = (Math.random()-0.5)*18
      const c = Math.random()>0.5?c1:c2
      pCol[i*3]=c.r; pCol[i*3+1]=c.g; pCol[i*3+2]=c.b
    }
    const pfGeo = new THREE.BufferGeometry()
    pfGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    pfGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3))
    const particles = new THREE.Points(pfGeo, new THREE.PointsMaterial({ size:0.04, vertexColors:true, transparent:true, opacity:0.75, sizeAttenuation:true }))
    scene.add(particles)

    // ── Talking Figure ──
    const figPos = []; const figCol = []
    const push = (x,y,z,c) => { figPos.push(x,y,z); figCol.push(c.r,c.g,c.b) }
    const fc1=new THREE.Color('#14b8a6'), fc2=new THREE.Color('#8b5cf6'), fc3=new THREE.Color('#f472b6')
    // Head
    for(let i=0;i<200;i++){const t=Math.random()*Math.PI*2,p=Math.random()*Math.PI,r=0.42;push(r*Math.sin(p)*Math.cos(t),r*Math.cos(p)+2.2,r*Math.sin(p)*Math.sin(t)*0.5,Math.random()>0.5?fc1:fc2)}
    // Neck
    for(let i=0;i<40;i++) push((Math.random()-0.5)*0.18,1.55+(i/40)*0.35,(Math.random()-0.5)*0.1,fc2)
    // Torso
    for(let i=0;i<400;i++){const t=Math.random();push((Math.random()-0.5)*(0.7+t*0.1)*1.8,1.5-t*1.7,(Math.random()-0.5)*0.2,Math.random()>0.5?fc1:fc2)}
    // Right arm
    for(let i=0;i<150;i++){const t=i/150;push(0.7+t*0.65,1.2-t*1.0,(Math.random()-0.5)*0.12,Math.random()>0.5?fc1:fc2)}
    // Legs
    for(let s=-1;s<=1;s+=2) for(let i=0;i<200;i++){const t=i/200;push(s*(0.28+t*0.04),-0.15-t*2.0,(Math.random()-0.5)*0.14,Math.random()>0.5?fc1:fc2)}

    const figGeo = new THREE.BufferGeometry()
    figGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(figPos),3))
    figGeo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(figCol),3))
    const figMesh = new THREE.Points(figGeo, new THREE.PointsMaterial({size:0.032,vertexColors:true,transparent:true,opacity:0.9,sizeAttenuation:true}))

    // Left arm (separate for animation)
    const armPos = new Float32Array(150*3), armCol = new Float32Array(150*3)
    for(let i=0;i<150;i++){const t=i/150;armPos[i*3]=-0.7-t*0.65;armPos[i*3+1]=1.2-t*0.2;armPos[i*3+2]=(Math.random()-0.5)*0.12;armCol[i*3]=fc3.r;armCol[i*3+1]=fc3.g;armCol[i*3+2]=fc3.b}
    const armGeo = new THREE.BufferGeometry()
    armGeo.setAttribute('position', new THREE.BufferAttribute(armPos,3))
    armGeo.setAttribute('color',    new THREE.BufferAttribute(armCol,3))
    const armMesh = new THREE.Points(armGeo, new THREE.PointsMaterial({size:0.032,vertexColors:true,transparent:true,opacity:0.9,sizeAttenuation:true}))

    const figGroup = new THREE.Group()
    figGroup.add(figMesh)
    figGroup.add(armMesh)
    figGroup.position.set(2.4,-0.5,-0.5)
    scene.add(figGroup)

    // ── Sound waves ──
    const waves = []
    for(let i=0;i<4;i++){
      const wGeo = new THREE.TorusGeometry(0.5,0.01,8,60)
      const wMat = new THREE.MeshBasicMaterial({color:0x14b8a6,transparent:true,opacity:0.4})
      const wave = new THREE.Mesh(wGeo,wMat)
      wave.position.set(1.1,2.15,-0.5)
      wave.rotation.x = Math.PI/2
      wave.userData.delay = i*0.9
      scene.add(wave)
      waves.push(wave)
    }

    // ── DNA helix ──
    const dnaGroup = new THREE.Group()
    const dnaCount = 100
    const d1=new Float32Array(dnaCount*3), d2=new Float32Array(dnaCount*3)
    for(let i=0;i<dnaCount;i++){const t=(i/dnaCount)*Math.PI*7,y=(i/dnaCount)*5.5-2.75;d1[i*3]=Math.cos(t)*0.35;d1[i*3+1]=y;d1[i*3+2]=Math.sin(t)*0.35;d2[i*3]=Math.cos(t+Math.PI)*0.35;d2[i*3+1]=y;d2[i*3+2]=Math.sin(t+Math.PI)*0.35}
    const dg1=new THREE.BufferGeometry(); dg1.setAttribute('position',new THREE.BufferAttribute(d1,3))
    const dg2=new THREE.BufferGeometry(); dg2.setAttribute('position',new THREE.BufferAttribute(d2,3))
    dnaGroup.add(new THREE.Points(dg1, new THREE.PointsMaterial({color:0x14b8a6,size:0.055,transparent:true,opacity:0.65})))
    dnaGroup.add(new THREE.Points(dg2, new THREE.PointsMaterial({color:0x8b5cf6,size:0.055,transparent:true,opacity:0.65})))
    dnaGroup.position.set(-3.8,0,-1.5)
    scene.add(dnaGroup)

    // ── Glowing spheres ──
    const spheres = [
      { pos:[-3.2,2,-3],  color:0x14b8a6, speed:0.7, scale:2.2 },
      { pos:[3.5,-2,-4],  color:0x8b5cf6, speed:1.0, scale:2.0 },
      { pos:[0,-3.5,-3],  color:0xec4899, speed:0.6, scale:1.4 },
    ].map(({ pos, color, speed, scale }) => {
      const geo  = new THREE.SphereGeometry(1, 24, 24)
      const mat  = new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.13, wireframe:false })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...pos)
      mesh.scale.setScalar(scale)
      mesh.userData = { speed, origGeo: geo }
      scene.add(mesh)
      return mesh
    })

    // ── Spin rings ──
    const rings = [
      { pos:[-2.5,1.5,-1], color:0x14b8a6, speed:0.35 },
      { pos:[2.8,-1,-2],   color:0x8b5cf6, speed:0.55 },
    ].map(({ pos, color, speed }) => {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(1.5,0.013,12,100), new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.28}))
      mesh.position.set(...pos)
      mesh.userData.speed = speed
      scene.add(mesh)
      return mesh
    })

    // ── Wireframe cubes ──
    const cubes = [
      { pos:[-1.5,2.5,0], color:0x14b8a6, speed:0.7  },
      { pos:[0.5, 3.2,0], color:0x8b5cf6, speed:1.1  },
      { pos:[-2.5,-1.5,0],color:0xf472b6, speed:0.6  },
      { pos:[3.2, 1.2,0], color:0x14b8a6, speed:0.85 },
    ].map(({ pos, color, speed }) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), new THREE.MeshBasicMaterial({color,wireframe:true,transparent:true,opacity:0.5}))
      mesh.position.set(...pos)
      mesh.userData = { speed, baseY: pos[1] }
      scene.add(mesh)
      return mesh
    })

    // ── Orbit ring ──
    const orbitCount = 400
    const oPos=new Float32Array(orbitCount*3), oCol=new Float32Array(orbitCount*3)
    const oc1=new THREE.Color('#14b8a6'), oc2=new THREE.Color('#8b5cf6')
    for(let i=0;i<orbitCount;i++){const theta=(i/orbitCount)*Math.PI*2,r=5.5+(Math.random()-0.5)*0.6;oPos[i*3]=Math.cos(theta)*r;oPos[i*3+1]=(Math.random()-0.5)*0.5;oPos[i*3+2]=Math.sin(theta)*r;const c=Math.random()>0.5?oc1:oc2;oCol[i*3]=c.r;oCol[i*3+1]=c.g;oCol[i*3+2]=c.b}
    const orbitGeo=new THREE.BufferGeometry()
    orbitGeo.setAttribute('position',new THREE.BufferAttribute(oPos,3))
    orbitGeo.setAttribute('color',   new THREE.BufferAttribute(oCol,3))
    const orbitRing=new THREE.Points(orbitGeo,new THREE.PointsMaterial({size:0.045,vertexColors:true,transparent:true,opacity:0.55,sizeAttenuation:true}))
    scene.add(orbitRing)

    // ── Resize ──
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ──
    let animId
    const clock = new THREE.Clock()
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Camera drift
      camera.position.x = Math.sin(t*0.15)*0.8
      camera.position.y = Math.cos(t*0.10)*0.3
      camera.lookAt(0,0,0)

      stars.rotation.y    = t*0.01
      particles.rotation.y = t*0.025
      particles.rotation.x = t*0.01
      orbitRing.rotation.y = t*0.07
      dnaGroup.rotation.y  = t*0.45

      // Figure sway
      figGroup.rotation.y  = Math.sin(t*0.35)*0.15
      figGroup.position.y  = Math.sin(t*0.55)*0.07 - 0.5
      armMesh.rotation.z   = Math.sin(t*2.8)*0.25 - 0.3

      // Sound waves
      waves.forEach(w => {
        const wt = (t + w.userData.delay) % 3.5
        w.scale.setScalar(0.2 + wt*0.55)
        w.material.opacity = Math.max(0, 0.5 - wt*0.14)
      })

      // Spheres morph
      spheres.forEach(s => {
        const st = t * s.userData.speed
        const pos = s.userData.origGeo.attributes.position
        for(let i=0;i<pos.count;i++){
          const ox=pos.getX(i),oy=pos.getY(i),oz=pos.getZ(i)
          const l=Math.sqrt(ox*ox+oy*oy+oz*oz)||1
          const n=Math.sin(ox*3+st)*Math.cos(oy*3+st)*0.17
          pos.setXYZ(i,(ox/l)*(1+n),(oy/l)*(1+n),(oz/l)*(1+n))
        }
        pos.needsUpdate=true
        s.rotation.y=st*0.18
      })

      // Rings spin
      rings.forEach(r => {
        r.rotation.x += 0.005 * r.userData.speed * 8
        r.rotation.z += 0.003 * r.userData.speed * 8
      })

      // Cubes spin + float
      cubes.forEach(c => {
        c.rotation.x = t * c.userData.speed
        c.rotation.y = t * c.userData.speed * 0.7
        c.position.y = c.userData.baseY + Math.sin(t*c.userData.speed*0.8)*0.3
      })

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [])
}

export default function RegisterScene() {
  const canvasRef = useRef(null)
  useThreeScene(canvasRef)

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
