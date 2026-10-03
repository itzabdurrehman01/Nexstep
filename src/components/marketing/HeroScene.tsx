import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(1100 * 3);
    for (let index = 0; index < 1100; index += 1) {
      const radius = 3 + Math.random() * 11;
      const angle = Math.random() * Math.PI * 2;
      values[index * 3] = Math.cos(angle) * radius;
      values[index * 3 + 1] = (Math.random() - 0.5) * 9;
      values[index * 3 + 2] = Math.sin(angle) * radius - 4;
    }
    return values;
  }, []);

  useFrame((state, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * 0.035;
    points.current.rotation.x = state.pointer.y * 0.08;
    points.current.rotation.y += state.pointer.x * 0.012;
  });

  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color="#7c3aed" size={0.025} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function CoreObject() {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.x += delta * 0.16;
    group.current.rotation.y += delta * 0.26;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.18;
    group.current.position.x = state.pointer.x * 0.32;
  });

  return (
    <group ref={group}>
      <mesh><icosahedronGeometry args={[1.45, 3]} /><meshStandardMaterial color="#10b981" emissive="#064e3b" emissiveIntensity={0.8} metalness={0.86} roughness={0.16} /></mesh>
      <mesh rotation={[Math.PI / 2.8, 0, 0]}><torusGeometry args={[2.1, 0.035, 16, 96]} /><meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.3} /></mesh>
      <mesh rotation={[0.5, 0.8, 0]}><torusGeometry args={[2.55, 0.018, 16, 96]} /><meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={1.4} /></mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 7.8], fov: 46 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 3, 5]} intensity={42} color="#10b981" distance={10} />
      <pointLight position={[-4, -2, 3]} intensity={24} color="#7c3aed" distance={10} />
      <ParticleField />
      <CoreObject />
    </Canvas>
  );
}
