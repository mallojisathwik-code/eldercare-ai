import React, { useRef, useEffect, useState } from "react";

const TOTAL_PETALS = 900;
const INTRO_DURATION = 7.2; // seconds

export default function RosePetalIntro({ onComplete }) {
  const canvasRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const [stageProgress, setStageProgress] = useState(0); // 0 to 1
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

    // Rose Petal Colors
    const colors = [
      "#e11d48", // Rose 600
      "#be123c", // Ruby 700
      "#f43f5e", // Bright Rose 500
      "#9f1239", // Deep Crimson 800
      "#fb7185", // Blush Rose 400
    ];

    // Pre-calculate target points along the letters ELDER, CARE, AI
    const computeTargets = () => {
      const isMobile = width < 640;
      const cX = width / 2;
      const cY = height / 2 - (isMobile ? 35 : 20);

      const targets = [];
      const addLine = (x1, y1, x2, y2, count = 14) => {
        for (let i = 0; i <= count; i++) {
          const t = i / count;
          targets.push({
            x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * 4,
            y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * 4,
          });
        }
      };

      const addArc = (x, y, rx, ry, start = 0, end = Math.PI * 2, count = 28) => {
        for (let i = 0; i <= count; i++) {
          const a = start + ((end - start) * i) / count;
          targets.push({
            x: x + Math.cos(a) * rx + (Math.random() - 0.5) * 4,
            y: y + Math.sin(a) * ry + (Math.random() - 0.5) * 4,
          });
        }
      };

      // Scale multiplier
      const S = isMobile ? 0.8 : 1.15;

      // Tier 1: "ELDER" (Top, small, y ~ cY - 110 * S)
      const t1Y = cY - 110 * S;
      const t1H = 24 * S;
      const t1W = 16 * S;

      // E (-85)
      addLine(cX - 85 * S, t1Y - t1H / 2, cX - 85 * S, t1Y + t1H / 2, 8);
      addLine(cX - 85 * S, t1Y - t1H / 2, cX - 68 * S, t1Y - t1H / 2, 6);
      addLine(cX - 85 * S, t1Y, cX - 70 * S, t1Y, 5);
      addLine(cX - 85 * S, t1Y + t1H / 2, cX - 68 * S, t1Y + t1H / 2, 6);

      // L (-55)
      addLine(cX - 55 * S, t1Y - t1H / 2, cX - 55 * S, t1Y + t1H / 2, 8);
      addLine(cX - 55 * S, t1Y + t1H / 2, cX - 38 * S, t1Y + t1H / 2, 6);

      // D (-25)
      addLine(cX - 25 * S, t1Y - t1H / 2, cX - 25 * S, t1Y + t1H / 2, 8);
      addArc(cX - 25 * S, t1Y, 14 * S, t1H / 2, -Math.PI / 2, Math.PI / 2, 12);

      // E (10)
      addLine(cX + 10 * S, t1Y - t1H / 2, cX + 10 * S, t1Y + t1H / 2, 8);
      addLine(cX + 10 * S, t1Y - t1H / 2, cX + 27 * S, t1Y - t1H / 2, 6);
      addLine(cX + 10 * S, t1Y, cX + 25 * S, t1Y, 5);
      addLine(cX + 10 * S, t1Y + t1H / 2, cX + 27 * S, t1Y + t1H / 2, 6);

      // R (45)
      addLine(cX + 45 * S, t1Y - t1H / 2, cX + 45 * S, t1Y + t1H / 2, 8);
      addArc(cX + 45 * S, t1Y - t1H / 4, 14 * S, t1H / 4, -Math.PI / 2, Math.PI / 2, 10);
      addLine(cX + 52 * S, t1Y, cX + 65 * S, t1Y + t1H / 2, 6);

      // Tier 2: "CARE" (Middle, stylish cursive, y ~ cY - 40 * S)
      const t2Y = cY - 40 * S;
      const t2H = 34 * S;

      // C (-75)
      addArc(cX - 60 * S, t2Y, 16 * S, t2H / 2, Math.PI * 0.35, Math.PI * 1.65, 14);

      // A (-25)
      addLine(cX - 35 * S, t2Y + t2H / 2, cX - 25 * S, t2Y - t2H / 2, 10);
      addLine(cX - 25 * S, t2Y - t2H / 2, cX - 15 * S, t2Y + t2H / 2, 10);
      addLine(cX - 32 * S, t2Y + 4 * S, cX - 18 * S, t2Y + 4 * S, 6);

      // R (15)
      addLine(cX + 10 * S, t2Y - t2H / 2, cX + 10 * S, t2Y + t2H / 2, 10);
      addArc(cX + 10 * S, t2Y - t2H / 4, 15 * S, t2H / 4, -Math.PI / 2, Math.PI / 2, 12);
      addLine(cX + 18 * S, t2Y, cX + 30 * S, t2Y + t2H / 2, 8);

      // E (55)
      addLine(cX + 45 * S, t2Y - t2H / 2, cX + 45 * S, t2Y + t2H / 2, 10);
      addLine(cX + 45 * S, t2Y - t2H / 2, cX + 68 * S, t2Y - t2H / 2, 8);
      addLine(cX + 45 * S, t2Y, cX + 64 * S, t2Y, 6);
      addLine(cX + 45 * S, t2Y + t2H / 2, cX + 68 * S, t2Y + t2H / 2, 8);

      // Tier 3: "AI" (Bottom, BIG BOLD EMBLEM, y ~ cY + 55 * S)
      const t3Y = cY + 55 * S;
      const t3H = 72 * S;

      // Big "A" (-55 to -5)
      addLine(cX - 60 * S, t3Y + t3H / 2, cX - 35 * S, t3Y - t3H / 2, 18);
      addLine(cX - 35 * S, t3Y - t3H / 2, cX - 10 * S, t3Y + t3H / 2, 18);
      addLine(cX - 50 * S, t3Y + 8 * S, cX - 20 * S, t3Y + 8 * S, 12);

      // Big "I" (15 to 55)
      addLine(cX + 35 * S, t3Y - t3H / 2, cX + 35 * S, t3Y + t3H / 2, 18);
      addLine(cX + 15 * S, t3Y - t3H / 2, cX + 55 * S, t3Y - t3H / 2, 10);
      addLine(cX + 15 * S, t3Y + t3H / 2, cX + 55 * S, t3Y + t3H / 2, 10);

      // Decorative Highlight Halo Oval around AI
      addArc(cX, t3Y, 115 * S, 62 * S, 0, Math.PI * 2, 54);

      return targets;
    };

    const targetList = computeTargets();

    // Initialize Petals
    const petals = [];
    for (let i = 0; i < TOTAL_PETALS; i++) {
      const target = targetList[i % targetList.length] || { x: width / 2, y: height / 2 };
      petals.push({
        startX: Math.random() * width,
        startY: Math.random() * -height * 1.2,
        fallSpeed: 2.2 + Math.random() * 2.8,
        swayFreq: 1.5 + Math.random() * 2.2,
        swayAmp: 1.2 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        size: 5.5 + Math.random() * 6.5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        color: colors[i % colors.length],
        targetIndex: i % targetList.length,
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

      // Recompute targets dynamically on each frame if window changes
      const currentTargets = computeTargets();

      // Convergence easing from 30% to 75%
      let convergeP = 0;
      if (progress > 0.28) {
        convergeP = Math.min(1, (progress - 0.28) / 0.45);
      }
      const ease =
        convergeP < 0.5
          ? 4 * convergeP * convergeP * convergeP
          : 1 - Math.pow(-2 * convergeP + 2, 3) / 2;

      setStageProgress(ease);

      // Draw all petals
      for (let i = 0; i < TOTAL_PETALS; i++) {
        const p = petals[i];
        const target = currentTargets[p.targetIndex % currentTargets.length];

        // Kinematic falling position
        const fallDistance = elapsed * p.fallSpeed * 60;
        let naturalY = p.startY + fallDistance;
        let naturalX = p.startX + Math.sin(elapsed * p.swayFreq + p.phase) * (p.swayAmp * 25);

        // Wrap around when falling free
        if (naturalY > height + 60 && ease === 0) {
          p.startY -= height * 1.5;
        }

        // Interpolate smoothly between falling path and letter coordinate
        const curX = naturalX * (1 - ease) + target.x * ease;
        const curY = naturalY * (1 - ease) + target.y * ease;

        ctx.save();
        ctx.translate(curX, curY);
        ctx.rotate(p.rotation + elapsed * p.vRot * (1 - ease) + Math.sin(elapsed * 2 + i) * 0.1 * ease);

        const pw = p.size;
        const ph = p.size * 1.35;

        // Draw Petal
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, pw, ph, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Delicate Petal Sheen
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.ellipse(-pw * 0.2, -ph * 0.2, pw * 0.45, ph * 0.45, 0, 0, Math.PI * 2);
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
      {/* Top Header Row with Skip Button */}
      <div className="w-full max-w-5xl flex justify-end z-30">
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-full border border-rose-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-50 hover:border-rose-300 transition backdrop-blur-md shadow-sm cursor-pointer"
        >
          Skip ➔
        </button>
      </div>

      {/* High-Performance Canvas for Falling Rose Petals */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />

      {/* Layered Typography Reveal synced with Petals */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center transition-all duration-700"
        style={{
          opacity: stageProgress > 0.6 ? Math.min(1, (stageProgress - 0.6) / 0.35) : 0,
          transform: `scale(${0.96 + stageProgress * 0.04})`,
        }}
      >
        <div className="flex flex-col items-center -mt-6 sm:-mt-4">
          {/* ELDER (Small, Spaced) */}
          <span className="font-sans text-xs sm:text-sm font-black tracking-[0.45em] uppercase text-rose-800/90 mb-1">
            ELDER
          </span>

          {/* CARE (Stylish Script) */}
          <span className="font-serif italic text-2xl sm:text-3xl font-medium text-rose-900 tracking-wider mb-2">
            Care
          </span>

          {/* AI (Highlighted Emblem) */}
          <div className="relative mt-1">
            <span className="font-sans text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 drop-shadow-sm">
              AI
            </span>
          </div>
        </div>
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
