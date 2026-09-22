import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function getStackedHeaderStrokes() {
  const targetPoints = [];

  const addStroke = (p1, p2, steps = 14) => {
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      targetPoints.push(new THREE.Vector3(
        p1[0] + (p2[0] - p1[0]) * t,
        p1[1] + (p2[1] - p1[1]) * t,
        0
      ));
    }
  };

  const addCurve = (pts, count = 20) => {
    const vectors = pts.map((p) => new THREE.Vector3(p[0], p[1], 0));
    const curve = new THREE.CatmullRomCurve3(vectors);
    const sampled = curve.getPoints(count);
    sampled.forEach((pt) => targetPoints.push(pt));
  };

  // TIER 1: "ELDER" (Top, small, y: 1.25 to 1.75)
  const yT1_Top = 1.75;
  const yT1_Mid = 1.5;
  const yT1_Bot = 1.25;

  // E
  addStroke([-1.5, yT1_Top], [-1.5, yT1_Bot], 12);
  addStroke([-1.5, yT1_Top], [-1.05, yT1_Top], 8);
  addStroke([-1.5, yT1_Mid], [-1.15, yT1_Mid], 6);
  addStroke([-1.5, yT1_Bot], [-1.05, yT1_Bot], 8);

  // L
  addStroke([-0.9, yT1_Top], [-0.9, yT1_Bot], 12);
  addStroke([-0.9, yT1_Bot], [-0.45, yT1_Bot], 8);

  // D
  addStroke([-0.35, yT1_Top], [-0.35, yT1_Bot], 12);
  addCurve([[-0.35, yT1_Top], [-0.05, yT1_Top], [0.15, yT1_Mid], [-0.05, yT1_Bot], [-0.35, yT1_Bot]], 18);

  // E
  addStroke([0.25, yT1_Top], [0.25, yT1_Bot], 12);
  addStroke([0.25, yT1_Top], [0.7, yT1_Top], 8);
  addStroke([0.25, yT1_Mid], [0.6, yT1_Mid], 6);
  addStroke([0.25, yT1_Bot], [0.7, yT1_Bot], 8);

  // R
  addStroke([0.8, yT1_Top], [0.8, yT1_Bot], 12);
  addCurve([[0.8, yT1_Top], [1.15, yT1_Top], [1.3, 1.62], [1.15, yT1_Mid], [0.8, yT1_Mid]], 16);
  addStroke([1.05, yT1_Mid], [1.3, yT1_Bot], 8);

  // TIER 2: "CARE" (Middle, stylish cursive, y: 0.25 to 0.85)
  const yT2_Top = 0.85;
  const yT2_Mid = 0.55;
  const yT2_Bot = 0.25;

  // C
  addCurve([[-0.7, 0.78], [-1.0, yT2_Top], [-1.3, yT2_Mid], [-1.0, yT2_Bot], [-0.7, 0.32]], 20);

  // A
  addStroke([-0.55, yT2_Bot], [-0.3, yT2_Top], 12);
  addStroke([-0.3, yT2_Top], [-0.05, yT2_Bot], 12);
  addStroke([-0.48, yT2_Mid], [-0.12, yT2_Mid], 6);

  // R
  addStroke([0.1, yT2_Top], [0.1, yT2_Bot], 12);
  addCurve([[0.1, yT2_Top], [0.45, yT2_Top], [0.65, 0.7], [0.45, yT2_Mid], [0.1, yT2_Mid]], 16);
  addStroke([0.4, yT2_Mid], [0.65, yT2_Bot], 8);

  // E
  addStroke([0.8, yT2_Top], [0.8, yT2_Bot], 12);
  addStroke([0.8, yT2_Top], [1.3, yT2_Top], 8);
  addStroke([0.8, yT2_Mid], [1.2, yT2_Mid], 6);
  addStroke([0.8, yT2_Bot], [1.3, yT2_Bot], 8);

  // TIER 3: "AI" (Bottom, BIG ICONIC EMBLEM, y: -1.65 to -0.45)
  const yT3_Top = -0.45;
  const yT3_Mid = -1.05;
  const yT3_Bot = -1.65;

  // Bold "A"
  addStroke([-1.0, yT3_Bot], [-0.5, yT3_Top], 24);
  addStroke([-0.5, yT3_Top], [0.0, yT3_Bot], 24);
  addStroke([-0.82, yT3_Mid], [-0.18, yT3_Mid], 14);

  // Bold "I"
  addStroke([0.7, yT3_Top], [0.7, yT3_Bot], 24);
  addStroke([0.35, yT3_Top], [1.05, yT3_Top], 14);
  addStroke([0.35, yT3_Bot], [1.05, yT3_Bot], 14);

  // Decorative Halo framing AI
  const radius = 1.45;
  const haloPoints = [];
  for (let a = 0; a <= 32; a++) {
    const angle = (a / 32) * Math.PI * 2;
    haloPoints.push([
      Math.cos(angle) * (radius * 1.05),
      yT3_Mid + Math.sin(angle) * (radius * 0.7),
      0
    ]);
  }
  addCurve(haloPoints, 40);

  return targetPoints;
}

const PARTICLE_COUNT = 900;

function RosePetalHeaderMesh() {
  const pointsRef = useRef();
  const letterTargetPoints = useMemo(() => getStackedHeaderStrokes(), []);

  const { positions, basePositions, colors, jitter } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const basePos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const jitt = [];

    const palette = [
      new THREE.Color("#e11d48"),
      new THREE.Color("#be123c"),
      new THREE.Color("#f43f5e"),
      new THREE.Color("#9f1239"),
      new THREE.Color("#fb7185"),
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const target = letterTargetPoints[i % letterTargetPoints.length];
      const tx = target.x + (Math.random() - 0.5) * 0.035;
      const ty = target.y + (Math.random() - 0.5) * 0.035;
      const tz = target.z + (Math.random() - 0.5) * 0.035;

      pos[i * 3] = tx;
      pos[i * 3 + 1] = ty;
      pos[i * 3 + 2] = tz;

      basePos[i * 3] = tx;
      basePos[i * 3 + 1] = ty;
      basePos[i * 3 + 2] = tz;

      const c = palette[i % palette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      jitt.push({
        freq: 1.5 + Math.random() * 2,
        amp: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
      });
    }

    return {
      positions: pos,
      basePositions: basePos,
      colors: col,
      jitter: jitt,
    };
  }, [letterTargetPoints]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const j = jitter[i];
      positions[i * 3] = basePositions[i * 3] + Math.sin(t * j.freq + j.phase) * j.amp;
      positions[i * 3 + 1] = basePositions[i * 3 + 1] + Math.cos(t * j.freq + j.phase) * j.amp;
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      const pulse = 1 + Math.sin(t * 1.8) * 0.012;
      pointsRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
      />
    </points>
  );
}

export default function RosePetalHeader() {
  return (
    <div className="relative h-36 sm:h-44 w-full select-none pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <RosePetalHeaderMesh />
      </Canvas>
    </div>
  );
}
