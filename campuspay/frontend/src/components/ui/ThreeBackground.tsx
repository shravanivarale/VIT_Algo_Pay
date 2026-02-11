// @ts-nocheck
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
function Stars(props: any) {
    const ref = useRef<any>(null!);

    // Custom sphere generation to avoid maath NaN issues
    const sphere = useMemo(() => {
        const positions = new Float32Array(5000 * 3);
        const radius = 1.5;
        for (let i = 0; i < 5000; i++) {
            const r = radius * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        return positions;
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#00f0ff"
                    size={0.015}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
}

const ThreeBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] bg-cyber-dark" style={{ backgroundColor: '#050510' }}>
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Stars />
                <ambientLight intensity={0.5} />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-transparent opacity-80 pointer-events-none" />
        </div>
    );
};

export default ThreeBackground;
