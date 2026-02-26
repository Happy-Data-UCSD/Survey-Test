import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'

function BobbingMascot({ isCorrect }: { isCorrect: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!meshRef.current) return
        // Simple reaction logic
        if (isCorrect) {
            meshRef.current.rotation.y += 0.1
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.5
        } else {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2
            meshRef.current.position.y = 0
        }
    })

    return (
        <Float floatIntensity={1} rotationIntensity={isCorrect ? 3 : 0.5} speed={isCorrect ? 4 : 2}>
            {/* A simple smiley-face shaped geometry could be built, for MVP just a sphere */}
            <mesh ref={meshRef} castShadow>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color={isCorrect ? '#7AC70C' : '#FCAC18'} roughness={0.3} metalness={0.1} />

                {/* Simple Eyes */}
                <mesh position={[-0.3, 0.2, 0.85]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshBasicMaterial color="white" />
                </mesh>
                <mesh position={[0.3, 0.2, 0.85]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshBasicMaterial color="white" />
                </mesh>
                {/* Pupils */}
                <mesh position={[-0.3, 0.2, 0.98]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0.3, 0.2, 0.98]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshBasicMaterial color="black" />
                </mesh>
            </mesh>
        </Float>
    )
}

export function Companion3D({ reaction }: { reaction: 'idle' | 'happy' }) {
    return (
        <div style={{ width: '200px', height: '200px' }}>
            <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
                <BobbingMascot isCorrect={reaction === 'happy'} />
                <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2} far={2} />
                <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    )
}
