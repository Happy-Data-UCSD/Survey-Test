import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, Icosahedron, Torus } from '@react-three/drei'
import * as THREE from 'three'

// Three.js cannot parse CSS variables; theme colors from index.css
const COLORS = {
    primary: '#58CC02',
    primaryLight: '#7dde30',
    accent: '#FF9600',
    accentDark: '#E28900',
    info: '#1CB0F6',
}

function AbstractShape({ position, color, type, isActive }: { position: [number, number, number], color: string, type: 'sphere' | 'icosahedron' | 'torus', isActive: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null)

    const speeds = useMemo(() => ({
        x: (Math.random() - 0.5) * 0.35,
        y: (Math.random() - 0.5) * 0.35,
        z: (Math.random() - 0.5) * 0.35,
    }), [])

    useFrame((_, delta) => {
        if (!meshRef.current) return

        // Base rotation
        meshRef.current.rotation.x += speeds.x * delta
        meshRef.current.rotation.y += speeds.y * delta
        meshRef.current.rotation.z += speeds.z * delta

        // If the user just answered (isActive is true), spin the shapes faster for engagement!
        if (isActive) {
            meshRef.current.rotation.y += delta * 3
            meshRef.current.rotation.x += delta * 1.5
        }
    })

    const materialArgs = {
        color,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.52
    }

    return (
        <Float
            speed={isActive ? 6 : 2}
            rotationIntensity={isActive ? 1.8 : 0.8}
            floatIntensity={isActive ? 2.2 : 1.2}
            floatingRange={[-0.45, 0.45]}
        >
            {type === 'sphere' && (
                <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
                    <meshStandardMaterial {...materialArgs} />
                </Sphere>
            )}
            {type === 'icosahedron' && (
                <Icosahedron ref={meshRef} args={[1.2, 0]} position={position}>
                    <meshStandardMaterial {...materialArgs} />
                </Icosahedron>
            )}
            {type === 'torus' && (
                <Torus ref={meshRef} args={[0.8, 0.3, 16, 32]} position={position}>
                    <meshStandardMaterial {...materialArgs} />
                </Torus>
            )}
        </Float>
    )
}

export function AnimatedBackground({ isActive }: { isActive: boolean }) {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none', // Critical: don't block swipe events
            background: 'linear-gradient(135deg, var(--color-surface) 0%, #f0f8e8 100%)'
        }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
                {/* Lighting setup */}
                <ambientLight intensity={0.78} />
                <directionalLight position={[10, 10, 5]} intensity={1.3} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.7} color={COLORS.primary} />
                <pointLight position={[10, -10, 0]} intensity={0.7} color={COLORS.accent} />

                {/* Left side shapes */}
                <AbstractShape position={[-3, 4, -5]} color={COLORS.primaryLight} type="icosahedron" isActive={isActive} />
                <AbstractShape position={[-4, -2, -8]} color={COLORS.accent} type="sphere" isActive={isActive} />
                <AbstractShape position={[-2, -5, -4]} color={COLORS.primary} type="torus" isActive={isActive} />

                {/* Right side shapes */}
                <AbstractShape position={[3, 5, -6]} color={COLORS.accentDark} type="sphere" isActive={isActive} />
                <AbstractShape position={[4, 1, -4]} color={COLORS.primary} type="icosahedron" isActive={isActive} />
                <AbstractShape position={[2.5, -4, -5]} color={COLORS.accent} type="torus" isActive={isActive} />

                {/* Deep background shapes for depth */}
                <AbstractShape position={[0, 0, -12]} color={COLORS.primary} type="icosahedron" isActive={isActive} />
                <AbstractShape position={[-6, 2, -15]} color={COLORS.accentDark} type="torus" isActive={isActive} />
                <AbstractShape position={[5, -3, -10]} color={COLORS.info} type="sphere" isActive={isActive} />
            </Canvas>
        </div>
    )
}
