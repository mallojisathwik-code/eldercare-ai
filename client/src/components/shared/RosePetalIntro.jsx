import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TOTAL_PARTICLES = 1300;
const STREAMLINE_COUNT = 24;
const INTRO_DURATION = 7.2; // seconds

// Precise mathematical vector stroke generator for "ELDERCARE-AI"
function getLetterStrokes() {
  const letters = [
    // E (x: -4.4 to -3.8)
    [
      [[-4.4, 0.7, 0], [-4.4, -0.7, 0]],
      [[-4.4, 0.7, 0], [-3.8, 0.7, 0]],
      [[-4.4, 0.0, 0], [-3.9, 0.0, 0]],
      [[-4.4, -0.7, 0], [-3.8, -0.7, 0]],
    ],
    // L (x: -3.6 to -3.0)
    [
      [[-3.6, 0.7, 0], [-3.6, -0.7, 0]],
      [[-3.6, -0.7, 0], [-3.0, -0.7, 0]],
    ],
    // D (x: -2.8 to -2.2)
    [
      [[-2.8, 0.7, 0], [-2.8, -0.7, 0]],
      [[-2.8, 0.7, 0], [-2.4, 0.7, 0], [-2.1, 0.35, 0], [-2.1, -0.35, 0], [-2.4, -0.7, 0], [-2.8, -0.7, 0]],
    ],
    // E (x: -2.0 to -1.4)
    [
      [[-2.0, 0.7, 0], [-2.0, -0.7, 0]],
      [[-2.0, 0.7, 0], [-1.4, 0.7, 0]],
      [[-2.0, 0.0, 0], [-1.5, 0.0, 0]],
      [[-2.0, -0.7, 0], [-1.4, -0.7, 0]],
    ],
    // R (x: -1.2 to -0.6)
    [
      [[-1.2, 0.7, 0], [-1.2, -0.7, 0]],
      [[-1.2, 0.7, 0], [-0.8, 0.7, 0], [-0.6, 0.4, 0], [-0.8, 0.05, 0], [-1.2, 0.05, 0]],
      [[-0.9, 0.05, 0], [-0.6, -0.7, 0]],
    ],
    // C (x: -0.4 to 0.2)
    [
      [[0.2, 0.6, 0], [-0.2, 0.7, 0], [-0.4, 0.0, 0], [-0.2, -0.7, 0], [0.2, -0.6, 0]],
    ],
    // A (x: 0.4 to 1.0)
    [
      [[0.4, -0.7, 0], [0.7, 0.7, 0], [1.0, -0.7, 0]],
      [[0.5, -0.2, 0], [0.9, -0.2, 0]],
    ],
    // R (x: 1.2 to 1.8)
    [
      [[1.2, 0.7, 0], [1.2, -0.7, 0]],
      [[1.2, 0.7, 0], [1.6, 0.7, 0], [1.8, 0.4, 0], [1.6, 0.05, 0], [1.2, 0.05, 0]],
      [[1.5, 0.05, 0], [1.8, -0.7, 0]],
    ],
    // E (x: 2.0 to 2.6)
    [
      [[2.0, 0.7, 0], [2.0, -0.7, 0]],
      [[2.0, 0.7, 0], [2.6, 0.7, 0]],
      [[2.0, 0.0, 0], [2.5, 0.0, 0]],
      [[2.0, -0.7, 0], [2.6, -0.7, 0]],
    ],
    // - (x: 2.8 to 3.2)
    [
      [[2.8, 0.0, 0], [3.2, 0.0, 0]],
    ],
    // A (x: 3.4 to 4.0)
    [
      [[3.4, -0.7, 0], [3.7, 0.7, 0], [4.0, -0.7, 0]],
      [[3.5, -0.2, 0], [3.9, -0.2, 0]],
    ],
    // I (x: 4.2 to 4.6)
    [
      [[4.4, 0.7, 0], [4.4, -0.7, 0]],
      [[4.2, 0.7, 0], [4.6, 0.7, 0]],
      [[4.2, -0.7, 0], [4.6, -0.7, 0]],
    ],
  ];

  const targetPoints = [];
  letters.forEach((strokes) => {
    strokes.forEach((stroke) => {
      if (stroke.length === 2) {
        const [p1, p2] = stroke;
        const steps = 30;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          targetPoints.push(new THREE.Vector3(
            p1[0] + (p2[0] - p1[0]) * t,
            p1[1] + (p2[1] - p1[1]) * t,
            p1[2] + (p2[2] - p1[2]) * t
          ));
        }
      } else {
        const vectors = stroke.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
        const curve = new THREE.CatmullRomCurve3(vectors);
        const pts = curve.getPoints(36);
        pts.forEach((pt) => targetPoints.push(pt));
      }
    });
  });

  return targetPoints;
}

// 3D Curved Silk Streamlines & Red Rose Petals Formation
function CurvedRoseFormation({ onStageChange }) {
  const pointsRef = useRef();
  const curvesRef = useRef();
  const stageRef = useRef({ isFormed: false, isExiting: false, isDone: false });

  const letterTargetPoints = useMemo(() => getLetterStrokes(), []);

  const { initialPositions, targetPositions, colors, flutterParams } = useMemo(() => {
    const initPos = new Float32Array(TOTAL_PARTICLES * 3);
    const targPos = new Float32Array(TOTAL_PARTICLES * 3);
    const col = new Float32Array(TOTAL_PARTICLES * 3);
    const flutter = [];

    const palette = [
      new THREE.Color("#e11d48"), // Rose Crimson
      new THREE.Color("#be123c"), // Deep Ruby
      new THREE.Color("#f43f5e"), // Bright Rose
      new THREE.Color("#9f1239"), // Wine Red
      new THREE.Color("#fb7185"), // Blush Rose
    ];

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      initPos[i * 3] = (Math.random() - 0.5) * 14;
      initPos[i * 3 + 1] = 5 + Math.random() * 8;
      initPos[i * 3 + 2] = (Math.random() - 0.5) * 4;

      const target = letterTargetPoints[i % letterTargetPoints.length];
      targPos[i * 3] = target.x + (Math.random() - 0.5) * 0.03;
      targPos[i * 3 + 1] = target.y + (Math.random() - 0.5) * 0.03;
      targPos[i * 3 + 2] = target.z + (Math.random() - 0.5) * 0.03;

      const c = palette[i % palette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      flutter.push({
        speed: 1.4 + Math.random() * 1.6,
        freq: 1.8 + Math.random() * 2.2,
        amp: 0.5 + Math.random() * 0.7,
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
      const startX = (Math.random() - 0.5) * 12;
      const startY = 7 + Math.random() * 3;
      const midX = startX + (Math.random() - 0.5) * 4;
      const midY = (Math.random() - 0.5) * 2;
      const endX = (Math.random() - 0.5) * 10;
      const endY = -6 - Math.random() * 2;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(startX, startY, (Math.random() - 0.5) * 2),
        new THREE.Vector3(midX, midY, (Math.random() - 0.5) * 2),
        new THREE.Vector3(endX, endY, (Math.random() - 0.5) * 2),
      ]);
      lines.push(curve);
    }
    return lines;
  }, []);

  const currentPositions = useMemo(() => new Float32Array(TOTAL_PARTICLES * 3), []);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const p = Math.min(1, elapsed / INTRO_DURATION);

    // Notify stage changes cleanly without re-rendering React at 60fps
    if (elapsed > 4.2 && !stageRef.current.isFormed) {
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

    // Assembly easing from 35% to 80% of timeline
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
      const naturalY = initialPositions[i * 3 + 1] - ((elapsed * fl.speed) % 15) + 3;
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
        const pulse = 1 + Math.sin(elapsed * 2.2) * 0.012;
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
          const pts = curve.getPoints(50);
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

      {/* Red Rose Petal Particles Forming ELDERCARE-AI */}
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
      {/* 3D Curved Lines & Rose Petal Formation Canvas */}
      <div className="absolute inset-0 h-full w-full">
        <Canvas
          camera={{ position: [0, 0, 7.2], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={1.2} />
          <pointLight position={[0, 3, 5]} intensity={1.8} color="#fda4af" />
          <CurvedRoseFormation onStageChange={handleStageChange} />
        </Canvas>
      </div>

      {/* Subtitle / Tagline */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 mt-36 sm:mt-44 pointer-events-none">
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
