import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const HELIX_HEIGHT = 14;
const HELIX_RADIUS = 1.65;
const STRAND_SEGMENTS = 140;
const BASE_PAIR_COUNT = 36;
const TURNS = 3.5;

function DnaStrands({ mousePos }) {
  const groupRef = useRef();

  const { strandA, strandB, rungs, rungSpheres } = useMemo(() => {
    const ptsA = [];
    const ptsB = [];
    const rungLines = [];
    const spherePositions = [];

    for (let i = 0; i <= STRAND_SEGMENTS; i++) {
      const progress = i / STRAND_SEGMENTS;
      const y = (progress - 0.5) * HELIX_HEIGHT;
      const angle = progress * Math.PI * 2 * TURNS;

      const xA = Math.cos(angle) * HELIX_RADIUS;
      const zA = Math.sin(angle) * HELIX_RADIUS;
      ptsA.push(new THREE.Vector3(xA, y, zA));

      const xB = Math.cos(angle + Math.PI) * HELIX_RADIUS;
      const zB = Math.sin(angle + Math.PI) * HELIX_RADIUS;
      ptsB.push(new THREE.Vector3(xB, y, zB));
    }

    for (let i = 0; i < BASE_PAIR_COUNT; i++) {
      const progress = (i + 0.5) / BASE_PAIR_COUNT;
      const y = (progress - 0.5) * (HELIX_HEIGHT * 0.95);
      const angle = progress * Math.PI * 2 * TURNS;

      const xA = Math.cos(angle) * HELIX_RADIUS;
      const zA = Math.sin(angle) * HELIX_RADIUS;
      const xB = Math.cos(angle + Math.PI) * HELIX_RADIUS;
      const zB = Math.sin(angle + Math.PI) * HELIX_RADIUS;

      rungLines.push(xA, y, zA, xB, y, zB);
      spherePositions.push(
        { pos: [xA, y, zA], type: i % 2 === 0 ? "A" : "G" },
        { pos: [xB, y, zB], type: i % 2 === 0 ? "T" : "C" },
        { pos: [xA * 0.5 + xB * 0.5, y, zA * 0.5 + zB * 0.5], type: "bond" }
      );
    }

    const curveA = new THREE.CatmullRomCurve3(ptsA);
    const curveB = new THREE.CatmullRomCurve3(ptsB);

    return {
      strandA: new THREE.TubeGeometry(curveA, 120, 0.05, 8, false),
      strandB: new THREE.TubeGeometry(curveB, 120, 0.05, 8, false),
      rungs: new Float32Array(rungLines),
      rungSpheres: spherePositions,
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.45 + mousePos.x * 0.3;
      groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.06 + mousePos.y * 0.15;
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Primary Backbone Strand A */}
      <mesh geometry={strandA}>
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.65}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Secondary Backbone Strand B */}
      <mesh geometry={strandB}>
        <meshStandardMaterial
          color="#818cf8"
          emissive="#4f46e5"
          emissiveIntensity={0.55}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Base Pair Connecting Lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={rungs.length / 3}
            array={rungs}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0.45} />
      </lineSegments>

      {/* Base Pair Nodes */}
      {rungSpheres.map((node, idx) => (
        <mesh key={idx} position={node.pos}>
          <sphereGeometry args={[node.type === "bond" ? 0.055 : 0.095, 12, 12]} />
          <meshStandardMaterial
            color={
              node.type === "A"
                ? "#38bdf8"
                : node.type === "T"
                ? "#2dd4bf"
                : node.type === "G"
                ? "#a78bfa"
                : node.type === "C"
                ? "#60a5fa"
                : "#f1f5f9"
            }
            emissive={
              node.type === "A"
                ? "#0284c7"
                : node.type === "T"
                ? "#0d9488"
                : node.type === "G"
                ? "#7c3aed"
                : "#3b82f6"
            }
            emissiveIntensity={0.45}
            roughness={0.25}
            metalness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function DnaHelix3D({ mousePos = { x: 0, y: 0 } }) {
  return (
    <div className="h-full w-full pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[6, 8, 6]} intensity={1.6} color="#ffffff" />
        <pointLight position={[-4, 2, 3]} intensity={2.2} color="#38bdf8" distance={12} />
        <pointLight position={[4, -2, -3]} intensity={2.0} color="#818cf8" distance={12} />

        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
          <DnaStrands mousePos={mousePos} />
        </Float>

        <Sparkles count={100} scale={10} size={1.8} speed={0.4} color="#38bdf8" opacity={0.6} />
        <Sparkles count={70} scale={12} size={2.2} speed={0.2} color="#818cf8" opacity={0.4} />
      </Canvas>
    </div>
  );
}
