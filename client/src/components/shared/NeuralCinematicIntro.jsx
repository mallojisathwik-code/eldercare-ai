import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 400;
const CONNECTION_DISTANCE = 3.2;

// 3D Neural Nodes smoothly converging from deep space into an aligned network
function ConvergingNeuralNodes({ progress }) {
  const pointsRef = useRef();
  const linesRef = useRef();

  const { initialPositions, targetPositions, colors } = useMemo(() => {
    const initPos = new Float32Array(NODE_COUNT * 3);
    const targPos = new Float32Array(NODE_COUNT * 3);
    const col = new Float32Array(NODE_COUNT * 3);

    const c1 = new THREE.Color("#38bdf8"); // Sky
    const c2 = new THREE.Color("#e0f2fe"); // Soft white
    const c3 = new THREE.Color("#818cf8"); // Indigo

    for (let i = 0; i < NODE_COUNT; i++) {
      const u = (Math.random() - 0.5) * 38;
      const v = (Math.random() - 0.5) * 38;
      const w = (Math.random() - 0.5) * 38 - 15;
      initPos[i * 3] = u;
      initPos[i * 3 + 1] = v;
      initPos[i * 3 + 2] = w;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 2.4 + Math.random() * 1.6;

      targPos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      targPos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta) * 0.85;
      targPos[i * 3 + 2] = rad * Math.cos(phi);

      const color = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3;
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return { initialPositions: initPos, targetPositions: targPos, colors: col };
  }, []);

  const currentPositions = useMemo(() => new Float32Array(NODE_COUNT * 3), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const p = Math.min(1, Math.max(0, progress));
    const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

    for (let i = 0; i < NODE_COUNT * 3; i += 3) {
      const ix = initialPositions[i];
      const iy = initialPositions[i + 1];
      const iz = initialPositions[i + 2];

      const tx = targetPositions[i];
      const ty = targetPositions[i + 1];
      const tz = targetPositions[i + 2];

      currentPositions[i] = THREE.MathUtils.lerp(ix, tx, ease);
      currentPositions[i + 1] = THREE.MathUtils.lerp(iy, ty, ease);
      currentPositions[i + 2] = THREE.MathUtils.lerp(iz, tz, ease);
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = t * 0.22;
      pointsRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
    }

    if (linesRef.current) {
      const linePositions = [];
      let count = 0;
      for (let i = 0; i < NODE_COUNT && count < 300; i += 2) {
        const x1 = currentPositions[i * 3];
        const y1 = currentPositions[i * 3 + 1];
        const z1 = currentPositions[i * 3 + 2];

        for (let j = i + 1; j < Math.min(i + 20, NODE_COUNT); j++) {
          const x2 = currentPositions[j * 3];
          const y2 = currentPositions[j * 3 + 1];
          const z2 = currentPositions[j * 3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < CONNECTION_DISTANCE) {
            linePositions.push(x1, y1, z1, x2, y2, z2);
            count++;
          }
        }
      }

      linesRef.current.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3)
      );
      linesRef.current.rotation.y = t * 0.22;
      linesRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={NODE_COUNT}
            array={currentPositions}
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
          size={0.1}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial
          color="#38bdf8"
          transparent
          opacity={Math.min(0.5, progress * 0.6)}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export default function NeuralCinematicIntro({ onComplete }) {
  const [progress, setProgress] = useState(0); // 0 to 1 over 4.5 seconds
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const startTime = performance.now();
    const DURATION = 4500; // Exact 4.5 seconds

    const frame = (now) => {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / DURATION);
      setProgress(p);

      if (elapsed < 2000) {
        setStage(1); // Aligning
      } else if (elapsed < 3900) {
        setStage(2); // Title Reveal
      } else {
        setStage(3); // Smooth Exit
      }

      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        if (onComplete) onComplete();
      }
    };

    const animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050814] text-white select-none transition-opacity duration-600 ${
        stage === 3 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 3D Deep Space Neural Convergence Canvas */}
      <div className="absolute inset-0 h-full w-full">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 0, 5]} intensity={2.5} color="#38bdf8" />
          <ConvergingNeuralNodes progress={progress} />
        </Canvas>
      </div>

      {/* Steady Clean Ambient Vignette (No Flashing) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(5,8,20,0.85)_100%)]" />

      {/* Netflix-Style Cinematic Title Reveal */}
      <div className="relative z-20 flex flex-col items-center text-center px-4">
        
        {/* Animated Subtitle */}
        <div
          className={`mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-slate-900/60 px-4 py-1 text-xs font-mono tracking-widest text-sky-300 uppercase backdrop-blur-md transition-all duration-700 ${
            progress > 0.15 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>Neural Network Aligning</span>
        </div>

        {/* Clean, Luminous "ELDERCARE-AI" Blockbuster Title without flashing overlay */}
        <div className="py-3">
          <h1
            className={`font-black uppercase text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.18em] sm:tracking-[0.22em] transition-all duration-700 ${
              stage >= 2
                ? "opacity-100 scale-100 blur-0"
                : "opacity-0 scale-105 blur-sm"
            }`}
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 30px rgba(56,189,248,0.4), 0 0 60px rgba(56,189,248,0.2)",
            }}
          >
            ELDERCARE-AI
          </h1>
        </div>

        {/* Tagline */}
        <p
          className={`mt-2 font-mono text-xs sm:text-sm tracking-[0.25em] uppercase text-slate-400 transition-all duration-700 ${
            stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          Autonomous Cognitive Architecture
        </p>

        {/* Steady Smooth Progress Loading Bar */}
        <div className="mt-8 h-1 w-48 sm:w-64 rounded-full bg-slate-800/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Skip Button */}
      <button
        type="button"
        onClick={onComplete}
        className="absolute top-6 right-6 z-30 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3.5 py-1.5 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-500 transition backdrop-blur-md shadow-sm"
      >
        Skip Intro ➔
      </button>
    </div>
  );
}
