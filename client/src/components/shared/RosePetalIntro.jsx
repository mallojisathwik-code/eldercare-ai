import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TOTAL_PARTICLES = 1350;
const STREAMLINE_COUNT = 24;
const INTRO_DURATION = 7.2; // seconds

// Stacked Tiered Vector Strokes: ELDER (small) -> CARE (stylish) -> AI (big iconic emblem)
function getStackedLetterStrokes() {
  const targetPoints = [];

  const addStroke = (p1, p2, steps = 18) => {
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      targetPoints.push(new THREE.Vector3(
        p1[0] + (p2[0] - p1[0]) * t,
        p1[1] + (p2[1] - p1[1]) * t,
        (p1[2] || 0) + ((p2[2] || 0) - (p1[2] || 0)) * t
      ));
    }
  };

  const addCurve = (pts, count = 24) => {
    const vectors = pts.map((p) => new THREE.Vector3(p[0], p[1], p[2] || 0));
    const curve = new THREE.CatmullRomCurve3(vectors);
    const sampled = curve.getPoints(count);
    sampled.forEach((pt) => targetPoints.push(pt));
  };

  // ==========================================
  // TIER 1: "ELDER" (Top, small, y: 1.25 to 1.75)
  // ==========================================
  const yT1_Top = 1.75;
  const yT1_Mid = 1.5;
  const yT1_Bot = 1.25;

  // E (-1.5 to -1.0)
  addStroke([-1.5, yT1_Top], [-1.5, yT1_Bot], 14);
  addStroke([-1.5, yT1_Top], [-1.05, yT1_Top], 10);
  addStroke([-1.5, yT1_Mid], [-1.15, yT1_Mid], 8);
  addStroke([-1.5, yT1_Bot], [-1.05, yT1_Bot], 10);

  // L (-0.9 to -0.45)
  addStroke([-0.9, yT1_Top], [-0.9, yT1_Bot], 14);
  addStroke([-0.9, yT1_Bot], [-0.45, yT1_Bot], 10);

  // D (-0.35 to 0.15)
  addStroke([-0.35, yT1_Top], [-0.35, yT1_Bot], 14);
  addCurve([[-0.35, yT1_Top], [-0.05, yT1_Top], [0.15, yT1_Mid], [-0.05, yT1_Bot], [-0.35, yT1_Bot]], 22);

  // E (0.25 to 0.7)
  addStroke([0.25, yT1_Top], [0.25, yT1_Bot], 14);
  addStroke([0.25, yT1_Top], [0.7, yT1_Top], 10);
  addStroke([0.25, yT1_Mid], [0.6, yT1_Mid], 8);
  addStroke([0.25, yT1_Bot], [0.7, yT1_Bot], 10);

  // R (0.8 to 1.3)
  addStroke([0.8, yT1_Top], [0.8, yT1_Bot], 14);
  addCurve([[0.8, yT1_Top], [1.15, yT1_Top], [1.3, 1.62], [1.15, yT1_Mid], [0.8, yT1_Mid]], 18);
  addStroke([1.05, yT1_Mid], [1.3, yT1_Bot], 10);

  // ==========================================
  // TIER 2: "CARE" (Middle, stylish cursive/script, y: 0.25 to 0.85)
  // ==========================================
  const yT2_Top = 0.85;
  const yT2_Mid = 0.55;
  const yT2_Bot = 0.25;

  // C (-1.3 to -0.7)
  addCurve([[-0.7, 0.78], [-1.0, yT2_Top], [-1.3, yT2_Mid], [-1.0, yT2_Bot], [-0.7, 0.32]], 24);

  // A (-0.55 to -0.05)
  addStroke([-0.55, yT2_Bot], [-0.3, yT2_Top], 14);
  addStroke([-0.3, yT2_Top], [-0.05, yT2_Bot], 14);
  addStroke([-0.48, yT2_Mid], [-0.12, yT2_Mid], 8);

  // R (0.1 to 0.65)
  addStroke([0.1, yT2_Top], [0.1, yT2_Bot], 14);
  addCurve([[0.1, yT2_Top], [0.45, yT2_Top], [0.65, 0.7], [0.45, yT2_Mid], [0.1, yT2_Mid]], 18);
  addStroke([0.4, yT2_Mid], [0.65, yT2_Bot], 10);

  // E (0.8 to 1.3)
  addStroke([0.8, yT2_Top], [0.8, yT2_Bot], 14);
  addStroke([0.8, yT2_Top], [1.3, yT2_Top], 10);
  addStroke([0.8, yT2_Mid], [1.2, yT2_Mid], 8);
  addStroke([0.8, yT2_Bot], [1.3, yT2_Bot], 10);

  // ==========================================
  // TIER 3: "AI" (Bottom, BIG ICONIC EMBLEM, y: -1.8 to -0.4)
  // ==========================================
  const yT3_Top = -0.45;
  const yT3_Mid = -1.05;
  const yT3_Bot = -1.65;

  // Big Bold "A" (-1.0 to 0.0)
  addStroke([-1.0, yT3_Bot], [-0.5, yT3_Top], 28);
  addStroke([-0.5, yT3_Top], [0.0, yT3_Bot], 28);
  addStroke([-0.82, yT3_Mid], [-0.18, yT3_Mid], 16);

  // Big Bold "I" (0.3 to 1.1)
  addStroke([0.7, yT3_Top], [0.7, yT3_Bot], 28);
  addStroke([0.35, yT3_Top], [1.05, yT3_Top], 16);
  addStroke([0.35, yT3_Bot], [1.05, yT3_Bot], 16);

  // Decorative Iconic Orbital Diamond/Halo framing AI
  const haloPoints = [];
  const radius = 1.45;
  for (let a = 0; a <= 36; a++) {
    const angle = (a / 36) * Math.PI * 2;
    haloPoints.push([
      Math.cos(angle) * (radius * 1.05),
      yT3_Mid + Math.sin(angle) * (radius * 0.7),
      0
    ]);
  }
  addCurve(haloPoints, 48);

  return targetPoints;
}

// 3D Curved Flowing Streamlines & Rose Petal Formation
function TieredRoseFormation({ onStageChange }) {
  const pointsRef = useRef();
  const curvesRef = useRef();
  const stageRef = useRef({ isFormed: false, isExiting: false, isDone: false });

  const letterTargetPoints = useMemo(() => getStackedLetterStrokes(), []);

  const { initialPositions, targetPositions, colors, flutterParams } = useMemo(() => {
    const initPos = new Float32Array(TOTAL_PARTICLES * 3);
    const targPos = new Float32Array(TOTAL_PARTICLES * 3);
    const col = new Float32Array(TOTAL_PARTICLES * 3);
    const flutter = [];

    const palette = [
      new THREE.Color("#e11d48"), // Rose 600
      new THREE.Color("#be123c"), // Deep Ruby
      new THREE.Color("#f43f5e"), // Bright Rose
      new THREE.Color("#9f1239"), // Wine Red
      new THREE.Color("#fb7185"), // Soft Blush
    ];

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      initPos[i * 3] = (Math.random() - 0.5) * 8;
      initPos[i * 3 + 1] = 4.5 + Math.random() * 6;
      initPos[i * 3 + 2] = (Math.random() - 0.5) * 3;

      const target = letterTargetPoints[i % letterTargetPoints.length];
      targPos[i * 3] = target.x + (Math.random() - 0.5) * 0.025;
      targPos[i * 3 + 1] = target.y + (Math.random() - 0.5) * 0.025;
      targPos[i * 3 + 2] = target.z + (Math.random() - 0.5) * 0.025;

      const c = palette[i % palette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      flutter.push({
        speed: 1.3 + Math.random() * 1.5,
        freq: 1.8 + Math.random() * 2.2,
        amp: 0.4 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    return {
      initialPositions: initPos,
      targetPositions: targPos,
      colors: col,
      flutterParams: flutter,
    };
  }, [letterTargetPoints]);

  const streamlineCurves = useMemo(() => {
    const lines = [];
    for (let i = 0; i < STREAMLINE_COUNT; i++) {
      const startX = (Math.random() - 0.5) * 6;
      const startY = 5 + Math.random() * 2;
      const midX = startX + (Math.random() - 0.5) * 2;
      const midY = (Math.random() - 0.5) * 2;
      const endX = (Math.random() - 0.5) * 5;
      const endY = -4 - Math.random() * 2;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(startX, startY, (Math.random() - 0.5) * 1.5),
        new THREE.Vector3(midX, midY, (Math.random() - 0.5) * 1.5),
        new THREE.Vector3(endX, endY, (Math.random() - 0.5) * 1.5),
      ]);
      lines.push(curve);
    }
    return lines;
  }, []);

  const currentPositions = useMemo(() => new Float32Array(TOTAL_PARTICLES * 3), []);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const p = Math.min(1, elapsed / INTRO_DURATION);

    if (elapsed > 4.0 && !stageRef.current.isFormed) {
      stageRef.current.isFormed = true;
      if (onStageChange) onStageChange("formed");
    }
    if (elapsed > 6.4 && !stageRef.current.isExiting) {
      stageRef.current.isExiting = true;
      if (onStageChange) onStageChange("exiting");
    }
    if (elapsed >= INTRO_DURATION && !stageRef.current.isDone) {
      stageRef.current.isDone = true;
      if (onStageChange) onStageChange("done");
    }

    let convergeProgress = 0;
    if (p > 0.32) {
      convergeProgress = Math.min(1, (p - 0.32) / 0.45);
    }
    const ease =
      convergeProgress < 0.5
        ? 4 * convergeProgress * convergeProgress * convergeProgress
        : 1 - Math.pow(-2 * convergeProgress + 2, 3) / 2;

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const fl = flutterParams[i];

      const naturalX = initialPositions[i * 3] + Math.sin(elapsed * fl.freq + fl.phase) * fl.amp;
      const naturalY = initialPositions[i * 3 + 1] - ((elapsed * fl.speed) % 12) + 2.5;
      const naturalZ = initialPositions[i * 3 + 2] + Math.cos(elapsed * fl.freq * 0.7 + fl.phase) * (fl.amp * 0.5);

      const targetX = targetPositions[i * 3];
      const targetY = targetPositions[i * 3 + 1];
      const targetZ = targetPositions[i * 3 + 2];

      currentPositions[i * 3] = THREE.MathUtils.lerp(naturalX, targetX, ease);
      currentPositions[i * 3 + 1] = THREE.MathUtils.lerp(naturalY, targetY, ease);
      currentPositions[i * 3 + 2] = THREE.MathUtils.lerp(naturalZ, targetZ, ease);
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      if (p > 0.78) {
        const pulse = 1 + Math.sin(elapsed * 2.2) * 0.015;
        pointsRef.current.scale.set(pulse, pulse, pulse);
      }
    }

    if (curvesRef.current) {
      const opacity = Math.max(0, (0.75 - p) * 0.6);
      curvesRef.current.children.forEach((child) => {
        if (child.material) child.material.opacity = opacity;
      });
    }
  });

  return (
    <group>
      {/* Curved Streamlines */}
      <group ref={curvesRef}>
        {streamlineCurves.map((curve, idx) => {
          const pts = curve.getPoints(40);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
          return (
            <line key={idx} geometry={lineGeo}>
              <lineBasicMaterial
                color={idx % 2 === 0 ? "#fda4af" : "#f43f5e"}
                transparent
                opacity={0.6}
              />
            </line>
          );
        })}
      </group>

      {/* Rose Petal Particles Forming Tiered ELDER / CARE / AI */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={TOTAL_PARTICLES}
            array={currentPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={TOTAL_PARTICLES}
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
    </group>
  );
}

export default function RosePetalIntro({ onComplete }) {
  const [isFormed, setIsFormed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const handleStageChange = (stage) => {
    if (stage === "formed") setIsFormed(true);
    if (stage === "exiting") setIsExiting(true);
    if (stage === "done") {
      if (onCompleteRef.current) onCompleteRef.current();
    }
  };

  const handleSkip = () => {
    if (onCompleteRef.current) onCompleteRef.current();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-900 select-none transition-opacity duration-700 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at center, #ffffff 40%, #fff1f2 85%, #ffe4e6 100%)",
      }}
    >
      {/* Responsive 3D Canvas */}
      <div className="absolute inset-0 h-full w-full">
        <Canvas
          camera={{
            position: [0, 0, typeof window !== "undefined" && window.innerWidth < 640 ? 6.5 : 5.6],
            fov: typeof window !== "undefined" && window.innerWidth < 640 ? 46 : 42,
          }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={1.2} />
          <pointLight position={[0, 2, 4]} intensity={1.8} color="#fda4af" />
          <TieredRoseFormation onStageChange={handleStageChange} />
        </Canvas>
      </div>

      {/* Subtitle / Tagline */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 mt-72 sm:mt-80 pointer-events-none">
        <p
          className={`font-serif italic text-sm sm:text-base tracking-widest text-rose-800/80 transition-all duration-1000 ${
            isFormed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Voice-first companion for seniors
        </p>
      </div>

      {/* Skip Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-30 rounded-full border border-rose-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-rose-800 hover:bg-rose-50 hover:border-rose-300 transition backdrop-blur-md shadow-sm"
      >
        Skip ➔
      </button>
    </div>
  );
}
