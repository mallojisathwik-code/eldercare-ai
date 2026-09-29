import React, { useEffect, useRef, useState } from "react";

export default function NetflixStyleHealthIntro({ onComplete }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState(1); // 1: Ribbons shooting/forming, 2: Text illuminated & lens flare, 3: Transition out
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Optional Web Audio API Netflix-style cinematic harmonic chord
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        if (ctx.state === "suspended") {
          const resumeOnInteract = () => {
            ctx.resume();
            window.removeEventListener("click", resumeOnInteract);
            window.removeEventListener("touchstart", resumeOnInteract);
          };
          window.addEventListener("click", resumeOnInteract);
          window.addEventListener("touchstart", resumeOnInteract);
        }

        const now = ctx.currentTime;
        // Deep warm sub-bass hit + harmonic cello-like drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(55, now); // A1
        osc1.frequency.exponentialRampToValueAtTime(110, now + 1.2);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(110, now); // A2
        osc2.frequency.exponentialRampToValueAtTime(220, now + 1.4);

        // Low pass filter for warmth
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(280, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + 1.5);

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.25, now + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 3.8);
        osc2.stop(now + 3.8);
      }
    } catch {
      // Audio context might be restricted, continue gracefully
    }
  }, []);

  // Timeline phases
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 2200); // Reveal fully illuminated typography & lens flare
    const t2 = setTimeout(() => setPhase(3), 5200); // Start smooth fade out
    const t3 = setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
    }, 5900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Canvas Animation: Netflix-Style Dynamic Red Beams / Ribbon Curves converging and outlining text
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Generate 32 distinct red light ribbon curves in 3D perspective
    const ribbons = [];
    const ribbonCount = 28;
    const colors = [
      "rgba(225, 29, 72, ", // #e11d48 Crimson Rose
      "rgba(244, 63, 94, ",  // #f43f5e Bright Rose
      "rgba(190, 18, 60, ",  // #be123c Deep Rose
      "rgba(255, 77, 109, ", // #ff4d6d Neon Rose
      "rgba(159, 18, 57, ",  // #9f1239 Dark Crimson
    ];

    for (let i = 0; i < ribbonCount; i++) {
      const angle = (i / ribbonCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const startDist = Math.max(width, height) * (0.8 + Math.random() * 0.6);
      ribbons.push({
        startX: width / 2 + Math.cos(angle) * startDist,
        startY: height / 2 + Math.sin(angle) * startDist,
        cp1X: width / 2 + (Math.random() - 0.5) * width * 1.2,
        cp1Y: height / 2 + (Math.random() - 0.5) * height * 1.2,
        cp2X: width / 2 + (Math.random() - 0.5) * width * 0.5,
        cp2Y: height / 2 + (Math.random() - 0.5) * height * 0.5,
        targetX: width / 2 + (Math.random() - 0.5) * 140,
        targetY: height / 2 + (Math.random() - 0.5) * 120,
        width: 2.5 + Math.random() * 5,
        speed: 0.012 + Math.random() * 0.015,
        progress: 0,
        color: colors[i % colors.length],
        delay: Math.random() * 0.6,
        alpha: 0.7 + Math.random() * 0.3,
      });
    }

    let startTime = performance.now();

    const render = (now) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Light glow in center
      const centerGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.6
      );
      centerGrad.addColorStop(0, "rgba(225, 29, 72, 0.12)");
      centerGrad.addColorStop(0.5, "rgba(225, 29, 72, 0.03)");
      centerGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw sweeping red light curves (Netflix ribbon style)
      ribbons.forEach((r) => {
        if (elapsed < r.delay) return;
        r.progress = Math.min(1, r.progress + r.speed);

        // Bezier curve interpolation
        const t = r.progress;
        const currentX =
          Math.pow(1 - t, 3) * r.startX +
          3 * Math.pow(1 - t, 2) * t * r.cp1X +
          3 * (1 - t) * Math.pow(t, 2) * r.cp2X +
          Math.pow(t, 3) * r.targetX;

        const currentY =
          Math.pow(1 - t, 3) * r.startY +
          3 * Math.pow(1 - t, 2) * t * r.cp1Y +
          3 * (1 - t) * Math.pow(t, 2) * r.cp2Y +
          Math.pow(t, 3) * r.targetY;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(r.startX, r.startY);
        ctx.bezierCurveTo(r.cp1X, r.cp1Y, r.cp2X, r.cp2Y, currentX, currentY);

        ctx.strokeStyle = `${r.color}${r.alpha * (1 - t * 0.3)})`;
        ctx.lineWidth = r.width * (1 + (1 - t) * 1.5);
        ctx.lineCap = "round";
        ctx.shadowColor = "#e11d48";
        ctx.shadowBlur = 18;
        ctx.stroke();

        // Glowing particle head at the tip of the ribbon
        if (t < 0.99) {
          ctx.beginPath();
          ctx.arc(currentX, currentY, r.width * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#ff1e56";
          ctx.shadowBlur = 24;
          ctx.fill();
        }
        ctx.restore();
      });

      // Shimmering converging light beams when phase >= 2
      if (elapsed > 1.8) {
        const pulse = Math.sin(elapsed * 4) * 0.15 + 0.85;
        const flareGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          5,
          width / 2,
          height / 2,
          180
        );
        flareGrad.addColorStop(0, `rgba(255, 255, 255, ${0.8 * pulse})`);
        flareGrad.addColorStop(0.3, `rgba(225, 29, 72, ${0.5 * pulse})`);
        flareGrad.addColorStop(1, "rgba(225, 29, 72, 0)");

        ctx.save();
        ctx.fillStyle = flareGrad;
        ctx.fillRect(width / 2 - 200, height / 2 - 200, 400, 400);

        // Horizontal lens flare streak
        ctx.beginPath();
        ctx.ellipse(width / 2, height / 2, Math.min(width * 0.45, 320), 3.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 45, 85, ${0.7 * pulse})`;
        ctx.shadowColor = "#ff1e56";
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSkip = () => {
    if (onCompleteRef.current) onCompleteRef.current();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between select-none py-6 px-4 sm:px-8 transition-opacity duration-700 ${
        phase === 3 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(ellipse at center, #ffffff 0%, #fafafa 55%, #f2f2f7 100%)",
      }}
    >
      {/* Dynamic Red Curves Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full z-10"
      />

      {/* Top Header Bar with Skip Button */}
      <div className="w-full max-w-6xl flex justify-between items-center z-30">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
          <span className="text-[11px] font-bold tracking-widest text-rose-700 uppercase">
            ElderCare Studio
          </span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="rounded-full border border-rose-200 bg-white/90 px-4 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 hover:bg-rose-50 hover:border-rose-300 transition-all backdrop-blur-md shadow-sm cursor-pointer active:scale-95"
        >
          Skip ➔
        </button>
      </div>

      {/* Center Cinematic Formed Typography (Multi-tier: ELDER / CARE / AI) */}
      <div className="relative z-20 flex flex-col items-center justify-center flex-1 text-center -mt-4 w-full max-w-xl">
        
        {/* Glowing Aura behind the typography */}
        <div
          className={`absolute -inset-10 bg-gradient-to-tr from-rose-500/20 via-rose-600/10 to-transparent rounded-full blur-3xl transition-all duration-1000 ${
            phase >= 2 ? "opacity-100 scale-110" : "opacity-0 scale-75"
          }`}
        />

        {/* Tier 1: ELDER (Crisp, sleek uppercase with wide tracking) */}
        <div className="overflow-hidden leading-tight">
          <span
            className={`block font-sans font-black tracking-[0.22em] text-2xl sm:text-4xl text-slate-800 transition-all duration-1000 ease-out ${
              phase >= 2
                ? "opacity-100 translate-y-0 filter-none"
                : "opacity-0 translate-y-8 blur-sm"
            }`}
            style={{
              textShadow: phase >= 2 ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
            }}
          >
            ELDER
          </span>
        </div>

        {/* Tier 2: CARE (Distinct, stylish, crimson gradient accent) */}
        <div className="overflow-hidden leading-tight mt-0.5 sm:mt-1">
          <span
            className={`block font-sans font-extrabold tracking-[0.16em] text-3xl sm:text-5xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 bg-clip-text text-transparent transition-all duration-1000 ease-out delay-150 ${
              phase >= 2
                ? "opacity-100 translate-y-0 filter-none"
                : "opacity-0 translate-y-8 blur-sm"
            }`}
            style={{
              filter: phase >= 2 ? "drop-shadow(0 2px 12px rgba(225,29,72,0.25))" : "none",
            }}
          >
            CARE
          </span>
        </div>

        {/* Tier 3: AI (BIG, Bold Iconic Beacon with intense red glow & badge) */}
        <div className="relative mt-2 sm:mt-3 flex items-center justify-center">
          <div
            className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 px-6 sm:px-10 py-2 sm:py-3 shadow-2xl shadow-rose-600/40 border border-rose-400/30 transition-all duration-1000 ease-out delay-300 ${
              phase >= 2
                ? "opacity-100 scale-100"
                : "opacity-0 scale-50"
            }`}
          >
            <span className="font-sans font-black tracking-wider text-4xl sm:text-6xl text-white drop-shadow-md">
              AI
            </span>
          </div>

          {/* Dynamic sweeping shimmer highlight across AI */}
          {phase >= 2 && (
            <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-pulse" />
            </div>
          )}
        </div>

        {/* Authoritative Netflix-Style Tagline Reveal */}
        <div className="overflow-hidden mt-6 max-w-sm sm:max-w-md px-4">
          <p
            className={`text-xs sm:text-sm font-semibold tracking-wide text-slate-600 transition-all duration-1000 ease-out delay-500 ${
              phase >= 2
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Autonomous Cognitive & Health Companion for Seniors
          </p>
        </div>

        {/* Progress Line */}
        <div className="mt-6 h-1 w-28 sm:w-36 rounded-full bg-slate-200/80 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-rose-600 to-red-600 transition-all duration-1000 ease-out ${
              phase >= 2 ? "w-full" : "w-1/4"
            }`}
          />
        </div>
      </div>

      {/* Bottom Health & Technology Guarantee */}
      <div className="relative z-20 flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-slate-400 text-center">
        <span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
          Clinical Precision AI
        </span>
        <span>·</span>
        <span>Voice-First Telemetry</span>
        <span>·</span>
        <span>HIPAA Compliant</span>
      </div>
    </div>
  );
}
