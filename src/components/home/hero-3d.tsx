"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, ContactShadows, MeshTransmissionMaterial, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles as SparklesIcon } from "lucide-react";

function Diamond(props: Record<string, unknown>) {
    return (
        <mesh {...props}>
            <octahedronGeometry args={[0.8, 0]} />
            <MeshTransmissionMaterial
                backside
                backsideThickness={5}
                thickness={2}
                chromaticAberration={1}
                anisotropy={1}
                distortion={0.5}
                distortionScale={0.5}
                temporalDistortion={0.1}
                iridescence={1}
                iridescenceIOR={1}
                iridescenceThicknessRange={[0, 1400]}
                clearcoat={1}
                roughness={0}
                ior={2.4}
                color="white"
            />
        </mesh>
    );
}

function Ring(props: Record<string, unknown>) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        // Elegant slow rotation
        groupRef.current.rotation.y = t * 0.2;
        groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;
    });

    return (
        <group ref={groupRef} {...props}>
            {/* The Band */}
            <mesh>
                <torusGeometry args={[2.2, 0.15, 16, 100]} />
                <meshStandardMaterial
                    color="#FFD700"
                    metalness={1}
                    roughness={0.15}
                    envMapIntensity={2}
                />
            </mesh>

            {/* The Setting (Prongs) */}
            <group position={[0, 2.35, 0]}>
                {/* Diamond Base */}
                <mesh position={[0, -0.2, 0]}>
                    <cylinderGeometry args={[0.4, 0.1, 0.5, 8]} />
                    <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
                </mesh>

                {/* Prongs */}
                {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle, i) => (
                    <mesh key={i} position={[Math.sin(angle) * 0.4, 0.2, Math.cos(angle) * 0.4]} rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
                        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
                    </mesh>
                ))}

                {/* The Diamond */}
                <Diamond position={[0, 0.3, 0]} />
            </group>
        </group>
    );
}

function Scene() {
    const { viewport } = useThree();
    const isMobile = viewport.width < 10;

    return (
        <>
            <ambientLight intensity={0.8} />
            <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={1} color="#fff0d0" />
            <spotLight position={[-10, 0, -5]} angle={0.5} penumbra={1} intensity={1} color="#d0e0ff" />
            <pointLight position={[0, -2, 2]} intensity={0.5} color="#ec4899" />

            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} color="#ec4899" />

            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <Ring
                    position={isMobile ? [0, 1, 0] : [3, -1, 0]}
                    rotation={[0.5, -0.4, 0.2]}
                    scale={isMobile ? 0.65 : 1}
                />
            </Float>

            <ContactShadows position={[isMobile ? 0 : 2.5, -4, 0]} opacity={0.4} scale={20} blur={2} far={4} color="#ec4899" />
            <Environment preset="city" />
        </>
    );
}

export function Hero3D() {
    const textRef = useRef<HTMLDivElement>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            badge: "Welcome to",
            title: "DAZZLE",
            highlight: "JEWELS",
            description: "Discover our exclusive range of handcrafted jewelry, designed to make you shine on every occasion.",
        },
        {
            badge: "Premium Quality",
            title: "LUXURY",
            highlight: "REDEFINED",
            description: "Experience the perfect blend of traditional craftsmanship and modern design in every piece.",
        },
        {
            badge: "Limited Edition",
            title: "EXCLUSIVE",
            highlight: "COLLECTION",
            description: "Own a piece of art with our limited edition jewelry, crafted by master artisans.",
        },
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            tl.from(".hero-text", {
                y: 30,
                opacity: 0,
                duration: 1.2,
                stagger: 0.15,
                ease: "power3.out",
            })
                .from(".hero-btn", {
                    y: 20,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                }, "-=0.5")
                .from(".hero-feature", {
                    y: 20,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out",
                }, "-=0.4");
        }, textRef);

        return () => ctx.revert();
    }, []);

    // Auto-rotate slides
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const currentContent = slides[currentSlide];

    return (
        <div className="relative h-screen w-full overflow-hidden bg-background">
            {/* 3D Scene Background */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 12], fov: 45 }} gl={{ preserveDrawingBuffer: true, antialias: true }}>
                    <color attach="background" args={["#ffffff"]} />
                    <Scene />
                </Canvas>
            </div>

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 animate-gradient-shift pointer-events-none" />

            {/* Overlay Content */}
            <div className="container mx-auto px-4 h-full pointer-events-none">
                <div
                    ref={textRef}
                    className="relative z-10 flex h-full flex-col justify-end pb-32 md:justify-center md:pb-0 max-w-3xl pointer-events-auto mx-auto md:mx-0 text-center md:text-left"
                >
                    {/* Badge with animation */}
                    <div className="hero-text mb-6 flex items-center justify-center md:justify-start gap-2">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
                        <span className="text-sm font-medium tracking-[0.3em] text-primary uppercase flex items-center gap-2">
                            <SparklesIcon className="h-4 w-4 animate-pulse" />
                            {currentContent.badge}
                        </span>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
                    </div>

                    {/* Main heading with enhanced styling */}
                    <h1 className="hero-text mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-7xl lg:text-8xl leading-tight">
                        {currentContent.title}<br />
                        <span className="relative inline-block">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-pink-400 to-primary animate-shimmer bg-[length:200%_auto]">
                                {currentContent.highlight}
                            </span>
                            {/* Underline decoration */}
                            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="hero-text mb-10 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0 leading-relaxed">
                        {currentContent.description}
                    </p>

                    {/* CTA Buttons */}
                    <div className="hero-btn flex flex-col gap-4 sm:flex-row justify-center md:justify-start">
                        <Link href="/products">
                            <Button
                                size="lg"
                                className="group bg-gradient-to-r from-primary to-pink-600 text-white hover:from-primary/90 hover:to-pink-600/90 px-10 py-7 text-lg rounded-full shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50 font-semibold"
                            >
                                Shop Now
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/collections">
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-2 border-primary/30 bg-background/50 backdrop-blur-md text-foreground hover:bg-primary/5 hover:border-primary/50 px-10 py-7 text-lg rounded-full transition-all hover:scale-105 font-semibold"
                            >
                                View Collections
                            </Button>
                        </Link>
                    </div>


                </div>
            </div>

            {/* Enhanced vignette overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)] pointer-events-none" />

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
    );
}
