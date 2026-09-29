import React, { useRef, useEffect, useState } from "react";

const TOTAL_PETALS = 1100;
const INTRO_DURATION = 7.2; // seconds

// Generate high-resolution letter coordinate targets for ELDER / CARE / AI
function generateLetterTargets(width, height) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 700;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Tier 1: "ELDER" (Top, small, spaced)
  ctx.font = "bold 44px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText("ELDER", canvas.width / 2, 140);

  // Tier 2: "CARE" (Middle, stylish italic)
  ctx.font = "italic 500 52px 'Fraunces', Georgia, serif";
  ctx.fillText("Care", canvas.width / 2, 230);

  // Tier 3: "AI" (Bottom, Large Bold Emblem)
  ctx.font = "900 110px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText("AI", canvas.width / 2, 380);

  // Decorative Oval Halo around AI
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 375, 145, 95, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Sample white pixels
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const validPoints = [];

  for (let y = 0; y < canvas.height; y += 4) {
    for (let x = 0; x < canvas.width; x += 4) {
      const idx = (y * canvas.width + x) * 4;
      if (imgData[idx] > 180) {
        validPoints.push({
          relX: (x - canvas.width / 2) / canvas.width,
          relY: (y - canvas.height / 2) / canvas.height,
        });
      }
    }
  }

  return validPoints;
}

export default function RosePetalIntro({ onComplete }) {
  const canvasRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const [isFormed, setIsFormed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const rawTargets = generateLetterTargets(width, height);

    // Rose Petal Palette
    const colors = [
      "#e11d48", // Rose 600
      "#be123c", // Ruby 700
      "#f43f5e", // Bright Rose 500
      "#9f1239", // Deep Crimson 800
      "#fb7185", // Blush Rose 400
    ];

    // Initialize 1,100 Petals
    const petals = [];
    for (let i = 0; i < TOTAL_PETALS; i++) {
      const target = rawTargets[i % rawTargets.length] || { relX: 0, relY: 0 };
      petals.push({
        x: Math.random() * width,
        y: Math.random() * -height * 1.2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 2.0 + Math.random() * 3.0,
        size: 5.5 + Math.random() * 7.5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        swayFreq: 1.5 + Math.random() * 2.5,
        swayAmp: 1.2 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        color: colors[i % colors.length],
        targetRelX: target.relX,
        targetRelY: target.relY,
      });
    }

    const startTime = performance.now();
    let hasNotifiedFormed = false;
    let hasNotifiedExiting = false;
    let hasCompleted = false;

    const render = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(1, elapsed / INTRO_DURATION);

      if (elapsed > 4.0 && !hasNotifiedFormed) {
        hasNotifiedFormed = true;
        setIsFormed(true);
      }
      if (elapsed > 6.4 && !hasNotifiedExiting) {
        hasNotifiedExiting = true;
        setIsExiting(true);
      }
      if (elapsed >= INTRO_DURATION && !hasCompleted) {
        hasCompleted = true;
        if (onCompleteRef.current) onCompleteRef.current();
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Scale text formation to fit screen
      const isMobile = width < 640;
      const scaleX = isMobile ? width * 0.95 : Math.min(520, width * 0.45);
      const scaleY = isMobile ? width * 0.95 * (700 / 800) : Math.min(480, height * 0.65);
      const centerX = width / 2;
      const centerY = height / 2 - (isMobile ? 30 : 20);

      // Convergence easing (from 32% to 75% of timeline)
      let convergeP = 0;
      if (progress > 0.3) {
        convergeP = Math.min(1, (progress - 0.3) / 0.45);
      }
      const ease =
        convergeP < 0.5
          ? 4 * convergeP * convergeP * convergeP
          : 1 - Math.pow(-2 * convergeP + 2, 3) / 2;

      for (let i = 0; i < TOTAL_PETALS; i++) {
        const p = petals[i];

        // Falling kinematics
        p.y += p.vy;
        p.x += Math.sin(elapsed * p.swayFreq + p.phase) * p.swayAmp;
        p.rotation += p.vRot;

        if (p.y > height + 50 && ease === 0) {
          p.y = -50;
          p.x = Math.random() * width;
        }

        const targetAbsX = centerX + p.targetRelX * scaleX;
        const targetAbsY = centerY + p.targetRelY * scaleY;

        // Interpolate between falling petal and locked text point
        const curX = p.x * (1 - ease) + targetAbsX * ease;
        const curY = p.y * (1 - ease) + targetAbsY * ease;

        // Draw individual 3D organic curved rose petal
        ctx.save();
        ctx.translate(curX, curY);
        ctx.rotate(p.rotation * (1 - ease) + Math.sin(elapsed * 2 + i) * 0.1 * ease);

        const petalWidth = p.size;
        const petalHeight = p.size * 1.35;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, petalWidth, petalHeight, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Subtle soft petal highlight sheen
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.beginPath();
        ctx.ellipse(-petalWidth * 0.25, -petalHeight * 0.25, petalWidth * 0.45, petalHeight * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSkip = () => {
    if (onCompleteRef.current) onCompleteRef.current();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between select-none py-6 px-4 transition-opacity duration-700 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at center, #ffffff 40%, #fff1f2 85%, #ffe4e6 100%)",
      }}
    >
      {/* Top Bar with Skip Button */}
      <div className="w-full max-w-5xl flex justify-end z-30">
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-full border border-rose-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-50 hover:border-rose-300 transition backdrop-blur-md shadow-sm cursor-pointer"
        >
          Skip ➔
        </button>
      </div>

      {/* High-Performance Canvas for Falling Rose Petals & Text Assembly */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />

      {/* Subtitle at Bottom */}
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
