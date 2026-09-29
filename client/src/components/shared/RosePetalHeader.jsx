import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Generate organic rose petal alpha sprite texture
function createPetalTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 64, 64);

  ctx.beginPath();
  ctx.ellipse(32, 32, 26, 18, Math.PI / 4, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 28);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.7, "rgba(255, 255, 255, 0.85)");
  grad.addColorStop(0.92, "rgba(255, 255, 255, 0.4)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = grad;
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Single line horizontal vector stroke points for "ELDERCARE-AI"
function getSingleLineHeaderStrokes() {
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
        const steps = 24;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          targetPoints.push(new THREE.Vector3(
            p1[0] + (p2[0] - p1[0]) * t,
            p1[1] + (p2[1] - p1[1]) * t,
            0
          ));
        }
      } else {
        const vectors = stroke.map((p) => new THREE.Vector3(p[0], p[1], 0));
        const curve = new THREE.CatmullRomCurve3(vectors);
        const pts = curve.getPoints(30);
        pts.forEach((pt) => targetPoints.push(pt));
      }
    });
  });

  return targetPoints;
}

const PARTICLE_COUNT = 900;

function SingleLineRosePetalHeaderMesh() {
  const pointsRef = useRef();
  const petalTexture = useMemo(() => createPetalTexture(), []);
  const letterTargetPoints = useMemo(() => getSingleLineHeaderStrokes(), []);

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
      const tz = target.z;

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
        size={0.22}
        map={petalTexture}
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
}

export default function RosePetalHeader() {
  return (
    <div className="relative h-20 sm:h-24 w-full select-none pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6.4], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <SingleLineRosePetalHeaderMesh />
      </Canvas>
    </div>
  );
}
