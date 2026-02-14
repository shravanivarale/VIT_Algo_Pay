import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Warp Speed Component
function WarpStars({ speed = 20 }: { speed?: number }) {
    const ref = useRef<any>(null!);

    // Increased count and spread for universe effect
    const count = 4000;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const distance = 100;
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * distance;     // x
            pos[i * 3 + 1] = (Math.random() - 0.5) * distance; // y
            pos[i * 3 + 2] = (Math.random() - 0.5) * distance; // z
        }
        return pos;
    }, []);

    useFrame((_state, delta) => {
        if (ref.current) {
            // Move drops towards camera for warp effect
            const positions = ref.current.geometry.attributes.position.array;

            for (let i = 2; i < count * 3; i += 3) {
                positions[i] += delta * speed; // Speed z-axis

                // Reset if passes camera (z > 20)
                if (positions[i] > 20) {
                    positions[i] = -100; // Reset to far back
                    positions[i - 1] = (Math.random() - 0.5) * 100; // Randomize XY on reset
                    positions[i - 2] = (Math.random() - 0.5) * 100;
                }
            }
            ref.current.geometry.attributes.position.needsUpdate = true;
            ref.current.rotation.z += delta * 0.1; // Spin effect
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#00f0ff"
                size={0.15}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

interface IntroProps {
    onComplete: () => void;
}

const IntroAnimation: React.FC<IntroProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Sequence timing
        // Step 0: "Campus Finance Reimagined" (0s - 2.5s)
        // Step 1: Particles Explode (Current Step 2 logic, but without text) (2.5s - 4.5s)
        const t1 = setTimeout(() => setStep(1), 2000);
        const t2 = setTimeout(() => {
            onComplete();
        }, 2500); // 2.5s + 1s for particle phase

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.0, ease: "easeInOut" } }}
        >
            {/* Warp Background - Speeds up in Step 1 */}
            <div className={`absolute inset-0 transition-opacity duration-1000 opacity-100`}>
                <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                    <WarpStars speed={step === 1 ? 150 : 20} />
                </Canvas>
            </div>

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div
                        key="step0"
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 5, filter: "blur(20px)" }} // Explode out
                        transition={{ duration: 1.0, ease: "easeOut" }}
                        className="flex flex-col items-center relative z-10 p-8"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyber-neon to-cyber-purple drop-shadow-lg text-center leading-tight">
                            CAMPUS FINANCE<br />
                            <span className="text-white">REIMAGINED</span>
                        </h1>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="step1"
                        className="relative z-10 flex flex-col items-center"
                    >
                        {/* No Text - Just Particle Explosion/Warp Visualization */}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cinematic Vignette */}
            <div className="absolute inset-0 z-[90] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-60" />
        </motion.div>
    );
};

export default IntroAnimation;
