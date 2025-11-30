"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, PresentationControls, Float, useGLTF, Center, Resize } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function Ring(props: Record<string, unknown>) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            // Slow rotation
            meshRef.current.rotation.y += 0.005;
        }
    });

    return (
        <group {...props} dispose={null}>
            {/* Simple Torus as a Ring */}
            <mesh ref={meshRef} castShadow receiveShadow>
                <torusGeometry args={[1, 0.1, 16, 100]} />
                <meshStandardMaterial
                    color="#FFD700"
                    metalness={1}
                    roughness={0.1}
                    envMapIntensity={1}
                />
            </mesh>
            {/* Gemstone */}
            <mesh position={[0, 1.1, 0]} castShadow>
                <dodecahedronGeometry args={[0.3]} />
                <meshPhysicalMaterial
                    color="white"
                    transmission={0.9}
                    opacity={1}
                    metalness={0}
                    roughness={0}
                    ior={2.4}
                    thickness={0.5}
                />
            </mesh>
        </group>
    );
}

function CustomModel({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    const ref = useRef<THREE.Group>(null);

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.005;
        }
    });

    return (
        <group ref={ref}>
            <primitive object={scene} />
        </group>
    );
}

export function ProductViewer({ modelUrl }: { modelUrl?: string | null }) {
    return (
        <div className="h-[400px] w-full rounded-xl bg-neutral-900/50">
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }}>
                <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.1, Math.PI / 4]}>
                    <Stage environment="city" intensity={0.6}>
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            {modelUrl ? (
                                <Suspense fallback={null}>
                                    <Resize scale={2}>
                                        <Center>
                                            <CustomModel url={modelUrl} />
                                        </Center>
                                    </Resize>
                                </Suspense>
                            ) : (
                                <Ring />
                            )}
                        </Float>
                    </Stage>
                </PresentationControls>
                <OrbitControls makeDefault enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
                Interactive 3D
            </div>
        </div>
    );
}
