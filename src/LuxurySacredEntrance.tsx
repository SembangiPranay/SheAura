import { useState, useRef, useEffect, useCallback } from "react";

interface LuxurySacredEntranceProps {
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number;
  vy: number;
}

interface RosePetal {
  x: number;
  y: number;
  z: number; // 0 = foreground macro blur, 0.5 = midground crisp, 1 = background
  size: number;
  angleX: number;
  angleY: number;
  angleZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  vx: number;
  vy: number;
  oscAmp: number;
  oscSpeed: number;
  oscPhase: number;
  colorTone: string;
  shadowTone: string;
}

export default function LuxurySacredEntrance({ onComplete }: LuxurySacredEntranceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animFrameRef = useRef<number | null>(null);
  const exitProgressRef = useRef(0);

  // Play an ethereal ambient chime using Web Audio API (zero audio files needed)
  const playLuxuryChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Ethereal chord frequencies (F# minor 9 celestial luxury chord: F#4, C#5, F5, G#5, C#6)
      const freqs = [369.99, 554.37, 698.46, 830.61, 1108.73];
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2400, now);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.045, now + idx * 0.08 + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 3.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 3.3);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  const handleEnter = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    if (soundEnabled) {
      playLuxuryChime();
    }
    setTimeout(() => {
      onComplete();
    }, 850);
  }, [isExiting, onComplete, playLuxuryChime, soundEnabled]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playLuxuryChime();
    }
  };

  // Listen for interaction events (mouse, scroll, touch, keys)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        handleEnter();
      }
    };
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 25) {
        handleEnter();
      }
    };
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      if (touchStartY - touchEndY > 35) {
        handleEnter();
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleEnter]);

  // Main 60 FPS Procedural Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2));
    let height = (canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2);
      height = canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2);
    };
    window.addEventListener("resize", handleResize);

    // Initialize 120 twinkling stardust particles
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 120;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random(),
        radius: Math.random() * 1.8 + 0.6,
        baseAlpha: Math.random() * 0.6 + 0.25,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.45 - 0.15,
      });
    }

    // Initialize 32 3D botanical rose petals in 3 depth tiers
    const petals: RosePetal[] = [];
    const PETAL_COUNT = 32;
    const petalTones = [
      { color: "rgba(224, 150, 155, 0.92)", shadow: "rgba(138, 48, 55, 0.85)" }, // Romantic Rose
      { color: "rgba(235, 172, 170, 0.88)", shadow: "rgba(152, 60, 68, 0.8)" },  // Peach Blossom
      { color: "rgba(215, 130, 138, 0.94)", shadow: "rgba(118, 36, 42, 0.88)" }, // Velvet Scarlet
      { color: "rgba(244, 192, 188, 0.85)", shadow: "rgba(165, 78, 82, 0.75)" }, // Soft Silk Petal
    ];

    for (let i = 0; i < PETAL_COUNT; i++) {
      const depth = Math.random();
      const tone = petalTones[Math.floor(Math.random() * petalTones.length)];
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: depth, // 0 = foreground (large, slightly blurred), 1 = background (tiny, faint)
        size: depth < 0.2 ? 38 + Math.random() * 18 : depth < 0.65 ? 22 + Math.random() * 14 : 12 + Math.random() * 8,
        angleX: Math.random() * Math.PI * 2,
        angleY: Math.random() * Math.PI * 2,
        angleZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.024,
        vRotY: (Math.random() - 0.5) * 0.032,
        vRotZ: (Math.random() - 0.5) * 0.018,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.8 + (1 - depth) * 1.1,
        oscAmp: 18 + Math.random() * 24,
        oscSpeed: 0.015 + Math.random() * 0.02,
        oscPhase: Math.random() * Math.PI * 2,
        colorTone: tone.color,
        shadowTone: tone.shadow,
      });
    }

    let time = 0;

    // Helper: Draw single 3D botanical petal
    const drawPetal = (p: RosePetal, scaleFactor: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);

      // 3D rotation projection using pitch, yaw, and roll
      const cosY = Math.cos(p.angleY);
      const sinX = Math.sin(p.angleX);
      const scaleX = cosY;
      const scaleY = Math.cos(p.angleX);

      ctx.rotate(p.angleZ);
      ctx.scale(scaleX * scaleFactor, scaleY * scaleFactor);

      // Render organic curved petal geometry
      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(0, -s * 0.95);
      // Left contour curve
      ctx.bezierCurveTo(-s * 0.75, -s * 0.6, -s * 0.85, s * 0.45, 0, s * 0.95);
      // Right contour curve
      ctx.bezierCurveTo(s * 0.85, s * 0.45, s * 0.75, -s * 0.6, 0, -s * 0.95);
      ctx.closePath();

      // Petal shading gradient based on angle to light
      const grad = ctx.createLinearGradient(-s * 0.4, -s * 0.8, s * 0.4, s * 0.8);
      const lightFactor = Math.abs(cosY * sinX);
      grad.addColorStop(0, lightFactor > 0.4 ? "rgba(255, 235, 235, 0.95)" : p.colorTone);
      grad.addColorStop(0.45, p.colorTone);
      grad.addColorStop(1, p.shadowTone);

      ctx.fillStyle = grad;
      ctx.fill();

      // Soft center vein
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.85);
      ctx.quadraticCurveTo(s * 0.08, 0, 0, s * 0.85);
      ctx.strokeStyle = "rgba(255, 240, 240, 0.22)";
      ctx.lineWidth = Math.max(1, s * 0.035);
      ctx.stroke();

      ctx.restore();
    };

    // Helper: Render procedural undulating silk ribbon wave
    const drawSilkRibbon = (
      startY: number,
      endY: number,
      side: "left" | "right",
      waveFreq: number,
      waveAmp: number,
      speed: number,
      ribbonWidth: number,
      exitOffset: number
    ) => {
      ctx.save();
      const points = 36;
      const topPts: { x: number; y: number }[] = [];
      const btmPts: { x: number; y: number }[] = [];

      const xMin = side === "left" ? -ribbonWidth * 0.5 : width * 0.45;
      const xMax = side === "left" ? width * 0.55 : width + ribbonWidth * 0.5;
      const xSpan = xMax - xMin;

      const sideSign = side === "left" ? -1 : 1;
      const currentExitX = sideSign * exitOffset * width * 1.35;

      for (let i = 0; i <= points; i++) {
        const u = i / points;
        const x = xMin + u * xSpan + currentExitX;

        // Multi-frequency harmonic wave superposition for fluid cloth undulation
        const wave1 = Math.sin(u * waveFreq * Math.PI * 2 + time * speed) * waveAmp;
        const wave2 = Math.cos(u * waveFreq * 1.6 * Math.PI + time * speed * 1.4) * (waveAmp * 0.45);
        const wave3 = Math.sin(u * 8 + time * speed * 2.2) * (waveAmp * 0.18);
        const yCenter = startY + (endY - startY) * u + wave1 + wave2 + wave3;

        // Dynamic ribbon thickness breathing
        const thickness = ribbonWidth * (0.65 + Math.sin(u * Math.PI * 2 + time * 0.8) * 0.35);

        topPts.push({ x, y: yCenter - thickness * 0.5 });
        btmPts.push({ x, y: yCenter + thickness * 0.5 });
      }

      ctx.beginPath();
      ctx.moveTo(topPts[0].x, topPts[0].y);
      for (let i = 1; i < topPts.length; i++) {
        ctx.lineTo(topPts[i].x, topPts[i].y);
      }
      for (let i = btmPts.length - 1; i >= 0; i--) {
        ctx.lineTo(btmPts[i].x, btmPts[i].y);
      }
      ctx.closePath();

      // Couture satin sheen gradient (anisotropic highlight band)
      const grad = ctx.createLinearGradient(
        side === "left" ? 0 : width,
        startY,
        side === "left" ? width * 0.5 : width * 0.5,
        endY
      );
      grad.addColorStop(0, "rgba(36, 10, 6, 0.94)");       // Deep velvet shadow
      grad.addColorStop(0.28, "rgba(115, 38, 32, 0.92)");   // Rosewood midtone
      grad.addColorStop(0.52, "rgba(218, 155, 148, 0.96)"); // Blush silk body
      grad.addColorStop(0.68, "rgba(252, 238, 235, 0.98)"); // Specular satin sheen
      grad.addColorStop(0.85, "rgba(188, 118, 114, 0.92)"); // Warm fold
      grad.addColorStop(1, "rgba(42, 12, 8, 0.88)");        // Edge falloff

      ctx.fillStyle = grad;
      ctx.fill();

      // Specular sheen highlight stroke along top rim
      ctx.beginPath();
      ctx.moveTo(topPts[0].x, topPts[0].y);
      for (let i = 1; i < topPts.length; i++) {
        ctx.lineTo(topPts[i].x, topPts[i].y);
      }
      ctx.strokeStyle = "rgba(255, 245, 242, 0.48)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      time += 0.016;

      // Smooth mouse parallax interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
      const mx = mouseRef.current.x * 24;
      const my = mouseRef.current.y * 18;

      // Exit progress transition calculation
      if (isExiting) {
        exitProgressRef.current = Math.min(1, exitProgressRef.current + 0.024);
      }
      const exitProgress = exitProgressRef.current;
      // Luxury cubic-bezier easing: cubic-bezier(0.16, 1, 0.3, 1)
      const easedExit = exitProgress * (2 - exitProgress);

      // LAYER 1: Deep obsidian luxury velvet void
      ctx.fillStyle = "#070302";
      ctx.fillRect(0, 0, width, height);

      // Ambient radial warm caustic lighting
      const centerX = width * 0.5 + mx * 0.5;
      const centerY = height * 0.5 + my * 0.5;
      const radialGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        Math.max(width, height) * 0.75
      );
      radialGrad.addColorStop(0, "rgba(78, 24, 18, 0.58)");
      radialGrad.addColorStop(0.35, "rgba(34, 10, 8, 0.42)");
      radialGrad.addColorStop(0.72, "rgba(14, 5, 4, 0.9)");
      radialGrad.addColorStop(1, "#070302");
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);

      // LAYER 2: Background Bokeh Petals (z > 0.65)
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        if (p.z > 0.65) {
          p.y += p.vy * 0.65;
          p.x += Math.sin(time * p.oscSpeed + p.oscPhase) * 0.7;
          p.angleX += p.vRotX;
          p.angleY += p.vRotY;
          p.angleZ += p.vRotZ;
          if (p.y > height + 50) p.y = -40;
          drawPetal(p, 1 - easedExit * 0.4);
        }
      }

      // LAYER 3: Twinkling Golden Stardust Particles
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        pt.y += pt.vy;
        pt.x += pt.vx;
        if (pt.y < -20) pt.y = height + 20;
        if (pt.x < -20) pt.x = width + 20;
        if (pt.x > width + 20) pt.x = -20;

        // Twinkle luminance calculation
        const twinkle = Math.sin(time * pt.twinkleSpeed * 60 + pt.twinklePhase);
        const alpha = Math.max(0.08, pt.baseAlpha + twinkle * 0.35);

        // Parallax displacement
        const px = pt.x + mx * (pt.z * 1.5 + 0.5);
        const py = pt.y + my * (pt.z * 1.5 + 0.5);

        ctx.beginPath();
        ctx.arc(px, py, pt.radius * (1 + easedExit * 1.2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 222, 178, ${alpha})`;
        ctx.fill();

        // Extra glowing corona on larger stardust specks
        if (pt.radius > 1.4) {
          ctx.beginPath();
          ctx.arc(px, py, pt.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(223, 184, 149, ${alpha * 0.28})`;
          ctx.fill();
        }
      }

      // LAYER 4: Molten Gold Sacred Aura Rings (Concentric Halos & Radial Rays)
      const baseRadius = Math.min(width, height) * 0.22;
      const portalScale = 1 + easedExit * 2.6; // Expands outward during transition
      const auraAlpha = Math.max(0, 1 - easedExit * 0.95);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(portalScale, portalScale);

      // Central Ray Flare (16-point caustics)
      const rays = 16;
      for (let r = 0; r < rays; r++) {
        const rayAngle = (r / rays) * Math.PI * 2 + time * 0.08;
        const rayLen = baseRadius * (1.1 + Math.sin(r * 3 + time * 1.2) * 0.22);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(rayAngle) * rayLen, Math.sin(rayAngle) * rayLen);
        ctx.strokeStyle = `rgba(245, 218, 174, ${0.08 * auraAlpha})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      // Concentric Sacred Geometry Halos
      const haloCounts = [0.85, 1.0, 1.18];
      haloCounts.forEach((mult, idx) => {
        const haloR = baseRadius * mult + Math.sin(time * 1.4 + idx) * 4;
        ctx.beginPath();
        ctx.arc(0, 0, haloR, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 1 ? `rgba(235, 198, 148, ${0.68 * auraAlpha})` : `rgba(223, 184, 149, ${0.28 * auraAlpha})`;
        ctx.lineWidth = idx === 1 ? 1.8 : 1.0;
        ctx.stroke();
      });

      // Luminous center spark glow
      const sparkGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 0.55);
      sparkGrad.addColorStop(0, `rgba(255, 246, 225, ${0.55 * auraAlpha})`);
      sparkGrad.addColorStop(0.3, `rgba(238, 196, 140, ${0.25 * auraAlpha})`);
      sparkGrad.addColorStop(1, "rgba(223, 184, 149, 0)");
      ctx.fillStyle = sparkGrad;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // LAYER 5: Flowing Blush Silk/Satin Ribbons (Top & Bottom Flanks)
      // Left Flank Ribbons
      drawSilkRibbon(height * 0.08, height * 0.55, "left", 1.8, height * 0.055, 0.9, width * 0.18, easedExit);
      drawSilkRibbon(height * 0.42, height * 0.92, "left", 2.2, height * 0.048, 1.1, width * 0.15, easedExit);

      // Right Flank Ribbons
      drawSilkRibbon(height * 0.06, height * 0.52, "right", 1.9, height * 0.052, 0.95, width * 0.18, easedExit);
      drawSilkRibbon(height * 0.45, height * 0.95, "right", 2.1, height * 0.046, 1.05, width * 0.16, easedExit);

      // LAYER 6: Midground Botanical Hero Petals (0.2 <= z <= 0.65)
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        if (p.z >= 0.2 && p.z <= 0.65) {
          p.y += p.vy;
          p.x += Math.sin(time * p.oscSpeed + p.oscPhase) * 1.1 + mx * 0.12;
          p.angleX += p.vRotX;
          p.angleY += p.vRotY;
          p.angleZ += p.vRotZ;
          if (p.y > height + 60) p.y = -50;
          if (p.x < -60) p.x = width + 50;
          if (p.x > width + 60) p.x = -50;

          // Outward petal scatter during exit transition
          if (easedExit > 0) {
            const dx = p.x - centerX;
            p.x += (dx > 0 ? 1 : -1) * easedExit * 18;
          }

          drawPetal(p, 1);
        }
      }

      // LAYER 7: Foreground Macro Petals (z < 0.2, high depth blur)
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        if (p.z < 0.2) {
          p.y += p.vy * 1.35;
          p.x += Math.sin(time * p.oscSpeed + p.oscPhase) * 1.8 + mx * 0.35;
          p.angleX += p.vRotX * 1.2;
          p.angleY += p.vRotY * 1.2;
          p.angleZ += p.vRotZ * 1.1;
          if (p.y > height + 80) p.y = -60;

          ctx.save();
          // Simulate foreground camera lens depth of field blur
          ctx.filter = "blur(7px)";
          drawPetal(p, 1.25);
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isExiting]);

  return (
    <div
      className={`luxury-sacred-overlay ${isExiting ? "is-exiting" : ""}`}
      onClick={handleEnter}
      role="dialog"
      aria-modal="true"
      aria-label="She’Aura 3D Luxury Entrance"
    >
      <canvas ref={canvasRef} className="luxury-sacred-canvas" />

      {/* Ambient Top Bar Controls */}
      <div className="luxury-sacred-top-bar" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="luxury-sacred-pill"
          onClick={toggleSound}
          aria-label={soundEnabled ? "Mute ambient audio" : "Turn ambient chime on"}
        >
          <span className="pill-dot" style={{ background: soundEnabled ? "#dfb895" : "rgba(223, 184, 149, 0.4)" }} />
          <span>{soundEnabled ? "Chime Active" : "Sound On"}</span>
        </button>

        <button
          type="button"
          className="luxury-sacred-pill"
          onClick={handleEnter}
          aria-label="Skip to collection"
        >
          <span>Skip to Collection</span>
          <span className="pill-arrow">→</span>
        </button>
      </div>

      {/* Centered Sacred Typography & Couture Reveal */}
      <div className={`luxury-sacred-center ${isExiting ? "center-exiting" : ""}`}>
        <p className="luxury-sacred-kicker">A RITUAL BEYOND BEAUTY</p>

        <div className="luxury-sacred-brand-wrap">
          <h1 className="luxury-sacred-wordmark">
            <span className="gold-text-shimmer">SHE’AURA</span>
          </h1>
          <span className="luxury-sacred-tagline">YOUR AURA · YOUR STORY</span>
        </div>

        {/* Interactive "ENTER RITUAL" prompt embedded inside the sacred halo */}
        <div className="luxury-sacred-cta-wrap">
          <button
            type="button"
            className="luxury-sacred-enter-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleEnter();
            }}
            aria-label="Enter She’Aura Ritual"
          >
            <span className="enter-btn-halo" />
            <span className="enter-btn-label">ENTER RITUAL</span>
            <span className="enter-btn-arrow">→</span>
          </button>
          <p className="luxury-sacred-hint">Tap anywhere or scroll to explore</p>
        </div>
      </div>
    </div>
  );
}
