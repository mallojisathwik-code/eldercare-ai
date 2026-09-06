import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

const PARTICLE_COUNT = 2000;

function sampleBrainPoint() {
  const t = Math.random() * Math.PI * 2;
  const p = (Math.random() - 0.5) * Math.PI;
  const region = Math.random();
  let x = 0, y = 0, z = 0;

  if (region < 0.82) {
    const frontalWidth = 1.9 + Math.random() * 0.4;
    const height = 1.7;
    const depth = 1.5 + Math.random() * 0.3;
    x = Math.cos(p) * Math.cos(t) * frontalWidth;
    y = Math.sin(p) * height + 0.35;
    z = Math.cos(p) * Math.sin(t) * depth;
    const fold = Math.sin(x * 5.0) * Math.cos(z * 5.0) * 0.25;
    x += fold;
    y += fold * 0.7;
    z += fold;
    if (x > 0) x += 0.1;
    else x -= 0.1;
    if (z < -0.4) {
      const occipitalTaper = Math.abs(z + 0.4) * 0.4;
      x *= 1 - occipitalTaper * 0.6;
    }
    if (y < 0 && Math.abs(x) > 0.5) {
      const temporalExt = (Math.abs(x) - 0.5) * 0.3;
      y -= temporalExt;
    }
  } else if (region < 0.95) {
    const r = 0.85 + Math.random() * 0.2;
    const hemi = Math.random() > 0.5 ? 1 : -1;
    x = Math.cos(p) * Math.cos(t) * r * 0.7 + hemi * 0.35;
    y = Math.sin(p) * 0.5 - 1.1;
    z = Math.cos(p) * Math.sin(t) * r * 0.75 - 0.65;
    const folia = Math.sin(y * 15 + x * 10) * 0.03;
    x += folia;
    z += folia;
  } else {
    const section = Math.random();
    if (section < 0.33) {
      x = (Math.random() - 0.5) * 0.35;
      y = -1.25 - Math.random() * 0.35;
      z = (Math.random() - 0.5) * 0.3 - 0.1;
    } else if (section < 0.66) {
      const ponsR = 0.22 + Math.random() * 0.08;
      x = Math.cos(p) * ponsR;
      y = -0.9 - Math.random() * 0.25;
      z = Math.sin(p) * ponsR * 0.5 - 0.05;
    } else {
      x = (Math.random() - 0.5) * 0.2;
      y = -0.55 - Math.random() * 0.3;
      z = (Math.random() - 0.5) * 0.2;
    }
  }
  return [x, y, z];
}

function pickNeuronColor() {
  const r = Math.random();
  if (r > 0.75) return new THREE.Color("#e0f2fe");
  if (r > 0.5) return new THREE.Color("#7dd3fc");
  if (r > 0.25) return new THREE.Color("#5eead4");
  return new THREE.Color("#fde68a");
}

function NeuralBrainStars({ mousePos }) {
  const groupRef = useRef();
  const pointsRef = useRef();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const [x, y, z] = sampleBrainPoint();
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      const color = pickNeuronColor();
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.08 + mousePos.x * 0.15;
      groupRef.current.rotation.x = Math.sin(time * 0.04) * 0.04 + mousePos.y * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -0.5]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={PARTICLE_COUNT} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.028} vertexColors transparent opacity={1.0} blending={THREE.AdditiveBlending} sizeAttenuation={true} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={PARTICLE_COUNT} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.065} vertexColors transparent opacity={0.35} blending={THREE.AdditiveBlending} sizeAttenuation={true} />
      </points>
      <Sparkles count={150} scale={9} size={1.8} speed={0.3} color="#38bdf8" />
    </group>
  );
}

function BrainScene({ mousePos }) {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 0, 4]} intensity={3} color="#38bdf8" />
      <NeuralBrainStars mousePos={mousePos} />
    </>
  );
}

export default function NeuralBrainBackground({ mousePos }) {
  return (
    <div className="pointer-events-none h-full w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <BrainScene mousePos={mousePos} />
      </Canvas>
    </div>
  );
}
