import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 180;
const MAX_DISTANCE = 3.5;

function AmbientNeuralNetwork({ mousePos }) {
  const pointsRef = useRef();
  const linesRef = useRef();

  const { positions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(NODE_COUNT * 3);
    const vel = new Float32Array(NODE_COUNT * 3);
    const col = new Float32Array(NODE_COUNT * 3);

    const c1 = new THREE.Color("#38bdf8");
    const c2 = new THREE.Color("#818cf8");

    for (let i = 0; i < NODE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;

      vel[i * 3] = (Math.random() - 0.5) * 0.006;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.006;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.006;

      const c = Math.random() > 0.5 ? c1 : c2;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, velocities: vel, colors: col };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < NODE_COUNT * 3; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      // Boundary rebound
      if (Math.abs(positions[i]) > 12) velocities[i] *= -1;
      if (Math.abs(positions[i + 1]) > 9) velocities[i + 1] *= -1;
      if (Math.abs(positions[i + 2]) > 7) velocities[i + 2] *= -1;
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = t * 0.04 + mousePos.x * 0.1;
      pointsRef.current.rotation.x = Math.sin(t * 0.03) * 0.02 + mousePos.y * 0.08;
    }

    if (linesRef.current) {
      const linePos = [];
      let count = 0;
      for (let i = 0; i < NODE_COUNT && count < 180; i++) {
        const x1 = positions[i * 3];
        const y1 = positions[i * 3 + 1];
        const z1 = positions[i * 3 + 2];

        for (let j = i + 1; j < Math.min(i + 16, NODE_COUNT); j++) {
          const x2 = positions[j * 3];
          const y2 = positions[j * 3 + 1];
          const z2 = positions[j * 3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < MAX_DISTANCE) {
            linePos.push(x1, y1, z1, x2, y2, z2);
            count++;
          }
        }
      }

      linesRef.current.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePos, 3)
      );
      linesRef.current.rotation.y = t * 0.04 + mousePos.x * 0.1;
      linesRef.current.rotation.x = Math.sin(t * 0.03) * 0.02 + mousePos.y * 0.08;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={NODE_COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={NODE_COUNT}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export default function NeuralAmbientBackground({ mousePos = { x: 0, y: 0 } }) {
  return (
    <div className="absolute inset-0 h-full w-full pointer-events-none select-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <AmbientNeuralNetwork mousePos={mousePos} />
      </Canvas>
    </div>
  );
}
