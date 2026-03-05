'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei'
import * as THREE from 'three'

// ── Floating glowing orb ──────────────────────────
function GlowOrb({ position, color, speed = 1, distort = 0.4, scale = 1 }) {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime * 0.2 * speed
      meshRef.current.rotation.y = clock.elapsedTime * 0.3 * speed
    }
  })
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0}
          metalness={0.1}
          transparent
          opacity={0.18}
        />
      </Sphere>
    </Float>
  )
}

// ── Particle field ────────────────────────────────
function ParticleField() {
  const count = 600
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 20
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return arr
  }, [])

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const c1 = new THREE.Color('#14b8a6') // teal
    const c2 = new THREE.Color('#8b5cf6') // violet
    for (let i = 0; i < count; i++) {
      const c = Math.random() > 0.5 ? c1 : c2
      arr[i * 3]     = c.r
      arr[i * 3 + 1] = c.g
      arr[i * 3 + 2] = c.b
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.03
      ref.current.rotation.x = clock.elapsedTime * 0.01
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors,    3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

// ── Spinning torus ring ───────────────────────────
function Ring({ position, color, rotSpeed = 0.4 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.elapsedTime * rotSpeed
      ref.current.rotation.z = clock.elapsedTime * rotSpeed * 0.6
    }
  })
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[1.4, 0.015, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} />
    </mesh>
  )
}

// ── Icosahedron wireframe ─────────────────────────
function FloatingIco({ position }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.elapsedTime * 0.25
      ref.current.rotation.y = clock.elapsedTime * 0.35
    }
  })
  return (
    <Float speed={1.5} floatIntensity={1.5}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.3} />
      </mesh>
    </Float>
  )
}

// ── Main exported canvas ──────────────────────────
export default function LoginScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#14b8a6" />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#8b5cf6" />

        {/* Stars */}
        <Stars radius={60} depth={30} count={800} factor={2} fade speed={0.6} />

        {/* Particles */}
        <ParticleField />

        {/* Orbs */}
        <GlowOrb position={[-3.5, 2, -2]}  color="#14b8a6" speed={0.8} distort={0.5} scale={2.2} />
        <GlowOrb position={[3.5, -1.5, -3]} color="#8b5cf6" speed={1.2} distort={0.6} scale={2.0} />
        <GlowOrb position={[0, -3, -4]}    color="#ec4899" speed={0.6} distort={0.3} scale={1.4} />

        {/* Rings */}
        <Ring position={[-2.5, 1, -1]} color="#14b8a6" rotSpeed={0.3} />
        <Ring position={[2.5, -1, -2]} color="#8b5cf6" rotSpeed={0.5} />

        {/* Wireframe ico */}
        <FloatingIco position={[2.8, 2.2, -1]} />
        <FloatingIco position={[-2.5, -2, -1]} />
      </Canvas>
    </div>
  )
}
