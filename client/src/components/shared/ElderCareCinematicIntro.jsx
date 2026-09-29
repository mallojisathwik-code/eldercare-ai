import React, { useEffect, useRef, useState } from "react";

export default function ElderCareCinematicIntro({ onComplete }) {
  const canvasRef = useRef(null);
  const [fadingOut, setFadingOut] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Subtle, warm cinematic cello/harmonic chime (Web Audio API)
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playAudio = () => {
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        const now = ctx.currentTime;

        // Warm harmonic sub-tone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(65.41, now); // C2 warm cello note
        osc1.frequency.exponentialRampToValueAtTime(130.81, now + 3.0); // C3

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(196.0, now); // G3 harmonic fifth
        osc2.frequency.exponentialRampToValueAtTime(261.63, now + 3.5); // C4

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, now);
        filter.frequency.exponentialRampToValueAtTime(900, now + 4.0);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 1.2); // Gentle, subtle
        gain.gain.setValueAtTime(0.18, now + 4.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 6.8);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 6.9);
        osc2.stop(now + 6.9);
      };

      // Try autoplay or trigger on initial interaction
      playAudio();
      const resumeHandler = () => {
        if (ctx.state === "suspended") ctx.resume();
      };
      window.addEventListener("pointerdown", resumeHandler, { once: true });

      return () => {
        window.removeEventListener("pointerdown", resumeHandler);
        try {
          ctx.close();
        } catch {
          // ignore
        }
      };
    } catch {
      // Audio fallback
    }
  }, []);

  // Strict 7-Second Timeline
  useEffect(() => {
    // At 6.4s start smooth fade out
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 6400);

    // At exactly 7.0s trigger onComplete
    const completeTimer = setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
    }, 7000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  const handleSkip = () => {
    if (onCompleteRef.current) onCompleteRef.current();
  };

  // Canvas Cinematic Animation Loop (0 - 7 seconds)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const startTime = performance.now();

    // 45 soft rose-red floating micro-particles
    const particles = Array.from({ length: 42 }, () => ({
      x: width * (0.2 + Math.random() * 0.6),
      y: height * (0.3 + Math.random() * 0.4),
      baseX: width * (0.2 + Math.random() * 0.6),
      baseY: height * (0.3 + Math.random() * 0.4),
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: 1.2 + Math.random() * 2.2,
      alpha: 0.2 + Math.random() * 0.45,
      pulseSpeed: 1 + Math.random() * 2,
    }));

    // Cinematic energy trail paths in 0-2s
    const energyTrails = [
      {
        start: { x: width * 0.1, y: height * 0.65 },
        cp1: { x: width * 0.35, y: height * 0.3 },
        cp2: { x: width * 0.65, y: height * 0.7 },
        end: { x: width * 0.5, y: height * 0.5 },
        speed: 0.6,
      },
      {
        start: { x: width * 0.9, y: height * 0.35 },
        cp1: { x: width * 0.7, y: height * 0.65 },
        cp2: { x: width * 0.4, y: height * 0.3 },
        end: { x: width * 0.5, y: height * 0.5 },
        speed: 0.55,
      },
    ];

    const render = (time) => {
      const elapsed = (time - startTime) / 1000; // time in seconds (0.0 to 7.0)

      // 1. Pure White Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Subtle soft vignette of ultra-light rose reflection
      const bgGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.55
      );
      bgGlow.addColorStop(0, "rgba(225, 29, 72, 0.025)");
      bgGlow.addColorStop(0.7, "rgba(255, 255, 255, 0)");
      bgGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Determine responsive font size for canvas rendering
      // Must fit ELDERCARE AI on a single line across all mobile and desktop widths
      const textToRender = "ELDERCARE AI";
      // Calculate font size such that "ELDERCARE AI" takes ~82% of screen width on mobile, and up to 64px on desktop
      const maxLetterSpacing = width > 768 ? 14 : 6;
      let fontSize = Math.min(width * 0.078, 62);
      if (width < 400) fontSize = Math.min(width * 0.074, 28);
      else if (width < 640) fontSize = Math.min(width * 0.076, 36);

      const fontSetting = `900 ${fontSize}px "Plus Jakarta Sans", "Inter", -apple-system, sans-serif`;
      ctx.font = fontSetting;

      const centerY = height * 0.48;

      // -------------------------------------------------------------
      // PHASE 1: 0–2s (Subtle rose-red light & smooth energy lines in distance)
      // -------------------------------------------------------------
      if (elapsed < 2.2) {
        const p1Progress = Math.min(elapsed / 2.0, 1.0); // 0.0 -> 1.0

        // Distant soft light pulse
        const distantGlow = ctx.createRadialGradient(
          width / 2,
          centerY,
          2,
          width / 2,
          centerY,
          width * (0.05 + p1Progress * 0.25)
        );
        distantGlow.addColorStop(0, `rgba(225, 29, 72, ${0.35 * Math.sin(p1Progress * Math.PI)})`);
        distantGlow.addColorStop(0.5, `rgba(190, 18, 60, ${0.12 * Math.sin(p1Progress * Math.PI)})`);
        distantGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = distantGlow;
        ctx.fillRect(0, 0, width, height);

        // Thin elegant rose-red energy lines sweeping through space
        energyTrails.forEach((trail, idx) => {
          const t = Math.min(Math.max((elapsed - idx * 0.3) / 1.5, 0), 1);
          if (t <= 0) return;

          // Bezier point
          const curX =
            Math.pow(1 - t, 3) * trail.start.x +
            3 * Math.pow(1 - t, 2) * t * trail.cp1.x +
            3 * (1 - t) * Math.pow(t, 2) * trail.cp2.x +
            Math.pow(t, 3) * trail.end.x;
          const curY =
            Math.pow(1 - t, 3) * trail.start.y +
            3 * Math.pow(1 - t, 2) * t * trail.cp1.y +
            3 * (1 - t) * Math.pow(t, 2) * trail.cp2.y +
            Math.pow(t, 3) * trail.end.y;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(trail.start.x, trail.start.y);
          ctx.bezierCurveTo(trail.cp1.x, trail.cp1.y, trail.cp2.x, trail.cp2.y, curX, curY);
          ctx.strokeStyle = "rgba(225, 29, 72, 0.45)";
          ctx.lineWidth = 1.8;
          ctx.shadowColor = "#e11d48";
          ctx.shadowBlur = 12;
          ctx.stroke();

          // Particle beacon at leading tip
          if (t < 0.99) {
            ctx.beginPath();
            ctx.arc(curX, curY, 3, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#e11d48";
            ctx.shadowBlur = 16;
            ctx.fill();
          }
          ctx.restore();
        });
      }

      // -------------------------------------------------------------
      // PHASE 2 & 3: 2–4s (Formation from rose energy) & 4–5.5s (Complete depth & pulse)
      // -------------------------------------------------------------
      if (elapsed >= 1.8) {
        // Measure text position
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textWidth = ctx.measureText(textToRender).width;
        const startX = width / 2;

        // Construction progress (2.0s to 3.8s)
        const formProgress = Math.min(Math.max((elapsed - 2.0) / 1.8, 0), 1);

        // 2–4s: Formed by energy line & glowing stroke
        if (elapsed < 4.0) {
          // Dynamic energy stroke drawing
          ctx.save();
          ctx.font = fontSetting;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Stroke drawing from rose-red energy
          ctx.lineWidth = Math.max(2, fontSize * 0.05);
          ctx.strokeStyle = `rgba(190, 18, 60, ${0.85 * formProgress})`;
          ctx.shadowColor = "#e11d48";
          ctx.shadowBlur = 14 * formProgress;

          // Dash offset to simulate laser/energy draw
          ctx.setLineDash([textWidth * formProgress, textWidth]);
          ctx.strokeText(textToRender, startX, centerY);

          // Partial fill fading in gracefully
          if (formProgress > 0.4) {
            const fillAlpha = (formProgress - 0.4) / 0.6;
            const grad = ctx.createLinearGradient(
              startX - textWidth / 2,
              centerY,
              startX + textWidth / 2,
              centerY
            );
            grad.addColorStop(0, `rgba(159, 18, 57, ${fillAlpha})`);
            grad.addColorStop(0.5, `rgba(190, 18, 60, ${fillAlpha})`);
            grad.addColorStop(1, `rgba(225, 29, 72, ${fillAlpha})`);

            ctx.fillStyle = grad;
            ctx.fillText(textToRender, startX, centerY);
          }
          ctx.restore();

          // Particle burst during letter formation
          const emitterX = startX - textWidth / 2 + textWidth * formProgress;
          ctx.save();
          ctx.beginPath();
          ctx.arc(emitterX, centerY, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#e11d48";
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.restore();
        }

        // -------------------------------------------------------------
        // 4–5.5s & 5.5–7s: Full Sophisticated Rose-Red Logo Reveal
        // -------------------------------------------------------------
        if (elapsed >= 4.0) {
          ctx.save();
          ctx.font = fontSetting;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Subtle metallic / 3D depth shadow (soft, non-heavy)
          ctx.shadowColor = "rgba(159, 18, 57, 0.12)";
          ctx.shadowBlur = 18;
          ctx.shadowOffsetY = 4;

          // Deep, elegant, rich rose-red gradient (not neon pink)
          const logoGrad = ctx.createLinearGradient(
            startX - textWidth / 2,
            centerY - fontSize / 2,
            startX + textWidth / 2,
            centerY + fontSize / 2
          );
          logoGrad.addColorStop(0, "#9f1239"); // Rich Crimson Maroon
          logoGrad.addColorStop(0.35, "#be123c"); // Deep Sophisticated Rose-Red
          logoGrad.addColorStop(0.7, "#e11d48"); // Rich Rose-Red
          logoGrad.addColorStop(1, "#be123c");

          ctx.fillStyle = logoGrad;
          ctx.fillText(textToRender, startX, centerY);

          // Subtle Top Bevel Highlight
          ctx.shadowColor = "transparent";
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
          ctx.strokeText(textToRender, startX, centerY - 0.7);

          // 4.0 - 5.5s: Single soft rose-red light pulse sweep across the letters
          if (elapsed >= 4.2 && elapsed <= 5.6) {
            const sweepProgress = (elapsed - 4.2) / 1.4; // 0.0 -> 1.0
            const sweepX = startX - textWidth / 2 + textWidth * sweepProgress;

            const sweepGrad = ctx.createLinearGradient(
              sweepX - 60,
              centerY,
              sweepX + 60,
              centerY
            );
            sweepGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
            sweepGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.75)");
            sweepGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

            ctx.globalCompositeOperation = "source-atop";
            ctx.fillStyle = sweepGrad;
            ctx.fillRect(startX - textWidth / 2 - 10, centerY - fontSize, textWidth + 20, fontSize * 2);
            ctx.globalCompositeOperation = "source-over";
          }

          // Tagline Reveal (4.8s to 7.0s)
          if (elapsed >= 4.8) {
            const tagAlpha = Math.min((elapsed - 4.8) / 0.8, 1.0);
            const subFontSize = Math.max(10, Math.min(fontSize * 0.3, 14));
            ctx.font = `600 ${subFontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
            ctx.letterSpacing = "0.2em";
            ctx.fillStyle = `rgba(100, 116, 139, ${tagAlpha * 0.85})`;
            ctx.fillText("AUTONOMOUS HEALTH & COGNITIVE COMPANION", startX, centerY + fontSize * 0.95);
          }

          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // Ambient Soft Rose Particles (Graceful floating and settling)
      // -------------------------------------------------------------
      if (elapsed >= 2.0) {
        const settleFactor = elapsed >= 5.5 ? Math.max(0, 1 - (elapsed - 5.5) / 1.4) : 1;

        particles.forEach((p, idx) => {
          // Particle motion slows down and settles gracefully in 5.5–7s
          p.x += p.vx * settleFactor;
          p.y += p.vy * settleFactor;

          const pAlpha = p.alpha * (elapsed >= 6.2 ? Math.max(0, (7.0 - elapsed) / 0.8) : 1);
          const pPulse = 0.8 + 0.2 * Math.sin(elapsed * p.pulseSpeed + idx);

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * pPulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(190, 18, 60, ${pAlpha * 0.6})`;
          ctx.shadowColor = "#e11d48";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        });
      }

      if (elapsed < 7.2) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between select-none bg-white transition-opacity duration-600 ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#ffffff",
      }}
    >
      {/* 60 FPS HTML5 Canvas Animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none"
      />

      {/* Top Bar with Minimal Skip Button */}
      <div className="relative z-30 flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-700 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider text-rose-900/60 uppercase">
            ElderCare AI
          </span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="rounded-full border border-rose-200/80 bg-white/95 px-4 py-1.5 text-xs font-semibold text-rose-800 hover:text-rose-950 hover:bg-rose-50/80 hover:border-rose-300 transition-all backdrop-blur-md shadow-sm cursor-pointer active:scale-95"
        >
          Skip ➔
        </button>
      </div>

      {/* Invisible Spacer for perfect vertical center balance */}
      <div className="flex-1" />

      {/* Bottom Subtle Trust Badges */}
      <div className="relative z-30 pb-6 text-center">
        <div className="inline-flex items-center gap-3 text-[11px] font-medium text-slate-400/80">
          <span>Clinical Precision</span>
          <span>·</span>
          <span>Voice-First AI</span>
          <span>·</span>
          <span>HIPAA Compliant</span>
        </div>
      </div>
    </div>
  );
}
