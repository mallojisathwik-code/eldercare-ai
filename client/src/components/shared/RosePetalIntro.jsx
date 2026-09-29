import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const TOTAL_PETALS = 950;
const INTRO_DURATION = 7.2; // seconds

// Stacked Tiered Vector Strokes: ELDER (small) -> CARE (stylish) -> AI (big iconic emblem)
function getStackedLetterStrokes() {
  const targetPoints = [];

  const addStroke = (p1, p2, steps = 16) => {
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      targetPoints.push(new THREE.Vector3(
        p1[0] + (p2[0] - p1[0]) * t,
        p1[1] + (p2[1] - p1[1]) * t,
        0
      ));
    }
  };

  const addCurve = (pts, count = 22) => {
    const vectors = pts.map((p) => new THREE.Vector3(p[0], p[1], 0));
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

  // ==========================================
  // TIER 2: "CARE" (Middle, stylish cursive, y: 0.25 to 0.85)
  // ==========================================
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

  // ==========================================
  // TIER 3: "AI" (Bottom, BIG ICONIC EMBLEM, y: -1.65 to -0.45)
  // ==========================================
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
  for (let a = 0; a <= 36; a++) {
    const angle = (a / 36) * Math.PI * 2;
    haloPoints.push([
      Math.cos(angle) * (radius * 1.05),
      yT3_Mid + Math.sin(angle) * (radius * 0.7),
      0
    ]);
  }
  addCurve(haloPoints, 44);

  return targetPoints;
}

// Responsive Camera Controller for Mobile & Desktop
function ResponsiveCameraRig() {
  const { camera, size } = useThree();
  useFrame(() => {
    const isMobile = size.width < 640;
    const targetZ = isMobile ? 6.4 : 5.4;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
  });
  return null;
}

// Real 3D Instanced Rose Petal Meshes
function Real3DRosePetals({ onStageChange }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const stageRef = useRef({ isFormed: false, isExiting: false, isDone: false });

  const letterTargetPoints = useMemo(() => getStackedLetterStrokes(), []);

  // Initial Petal Particle Positions & Dynamics
  const { initialPositions, targetPositions, rotations, flutterParams } = useMemo(() => {
    const initPos = [];
    const targPos = [];
    const rots = [];
    const flutter = [];

    for (let i = 0; i < TOTAL_PETALS; i++) {
      // Dispersed in sky above
      initPos.push({
        x: (Math.random() - 0.5) * 8.5,
        y: 4.5 + Math.random() * 6.5,
        z: (Math.random() - 0.5) * 3,
      });

      const target = letterTargetPoints[i % letterTargetPoints.length];
      targPos.push({
        x: target.x + (Math.random() - 0.5) * 0.04,
        y: target.y + (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.04,
      });

      rots.push({
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 2.5,
        speedY: (Math.random() - 0.5) * 2.5,
        speedZ: (Math.random() - 0.5) * 2.5,
      });

      flutter.push({
        speed: 1.2 + Math.random() * 1.5,
        freq: 1.8 + Math.random() * 2.2,
        amp: 0.4 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        scale: 0.85 + Math.random() * 0.4,
      });
    }

    return {
      initialPositions: initPos,
      targetPositions: targPos,
      rotations: rots,
      flutterParams: flutter,
    };
  }, [letterTargetPoints]);

  // Set individual petal colors onto the instanced mesh on mount
  useEffect(() => {
    if (!meshRef.current) return;
    const palette = [
      new THREE.Color("#e11d48"), // Rose 600
      new THREE.Color("#be123c"), // Deep Ruby
      new THREE.Color("#f43f5e"), // Bright Rose
      new THREE.Color("#9f1239"), // Crimson
      new THREE.Color("#fb7185"), // Blush Rose
    ];

    for (let i = 0; i < TOTAL_PETALS; i++) {
      const color = palette[i % palette.length];
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    const p = Math.min(1, elapsed / INTRO_DURATION);

    if (elapsed > 3.8 && !stageRef.current.isFormed) {
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

    // Convergence easing from 30% to 75%
    let convergeP = 0;
    if (p > 0.28) {
      convergeP = Math.min(1, (p - 0.28) / 0.45);
    }
    const ease =
      convergeP < 0.5
        ? 4 * convergeP * convergeP * convergeP
        : 1 - Math.pow(-2 * convergeP + 2, 3) / 2;

    for (let i = 0; i < TOTAL_PETALS; i++) {
      const init = initialPositions[i];
      const target = targetPositions[i];
      const fl = flutterParams[i];
      const rot = rotations[i];

      // Natural falling petal turbulence
      const naturalX = init.x + Math.sin(elapsed * fl.freq + fl.phase) * fl.amp;
      const naturalY = init.y - ((elapsed * fl.speed) % 13) + 2.5;
      const naturalZ = init.z + Math.cos(elapsed * fl.freq * 0.7 + fl.phase) * (fl.amp * 0.5);

      const curX = THREE.MathUtils.lerp(naturalX, target.x, ease);
      const curY = THREE.MathUtils.lerp(naturalY, target.y, ease);
      const curZ = THREE.MathUtils.lerp(naturalZ, target.z, ease);

      dummy.position.set(curX, curY, curZ);

      // Rotate while falling, align flat when locked
      const curRotX = THREE.MathUtils.lerp(rot.rx + elapsed * rot.speedX, 0, ease);
      const curRotY = THREE.MathUtils.lerp(rot.ry + elapsed * rot.speedY, 0, ease);
      const curRotZ = THREE.MathUtils.lerp(rot.rz + elapsed * rot.speedZ, Math.sin(elapsed * 2 + i) * 0.1, ease);
      dummy.rotation.set(curRotX, curRotY, curRotZ);

      // Scale
      const baseScale = fl.scale * (ease > 0.8 ? 0.95 + Math.sin(elapsed * 2 + i) * 0.05 : 1.0);
      dummy.scale.set(baseScale * 0.095, baseScale * 0.13, baseScale * 0.095);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, TOTAL_PETALS]}>
      {/* 3D Organic Curved Petal Geometry */}
      <circleGeometry args={[1, 7]} />
      <meshStandardMaterial
        roughness={0.25}
        metalness={0.15}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-white text-slate-900 select-none py-6 px-4 transition-opacity duration-700 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at center, #ffffff 40%, #fff1f2 85%, #ffe4e6 100%)",
      }}
    >
      {/* Top Header Row with Skip Button */}
      <div className="w-full max-w-5xl flex justify-end z-30">
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-full border border-rose-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-50 hover:border-rose-300 transition backdrop-blur-md shadow-sm"
        >
          Skip ➔
        </button>
      </div>

      {/* 3D Canvas Layer with 100% Real 3D Instanced Rose Petals */}
      <div className="absolute inset-0 h-full w-full">
        <Canvas
          camera={{ position: [0, 0, 5.8], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <ResponsiveCameraRig />
          <ambientLight intensity={1.4} />
          <directionalLight position={[4, 6, 5]} intensity={1.6} color="#ffffff" />
          <pointLight position={[0, 2, 4]} intensity={2.0} color="#fda4af" />
          <Real3DRosePetals onStageChange={handleStageChange} />
        </Canvas>
      </div>

      {/* Bottom Subtitle / Tagline */}
      <div className="relative z-20 flex flex-col items-center text-center pb-6 sm:pb-8 pointer-events-none">
        <p
          className={`font-serif italic text-sm sm:text-base tracking-widest text-rose-800/80 transition-all duration-1000 ${
            isFormed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          Voice-first companion for seniors
        </p>
      </div>
    </div>
  );
}
