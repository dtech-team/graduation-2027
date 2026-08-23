"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Flower2, Flame, EyeOff } from "lucide-react";

export type AtmosphereMode = "stardust" | "petals" | "fireworks" | "off";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay?: number;
  rotation?: number;
  vRot?: number;
  type?: "star" | "petal" | "dust" | "spark";
}

interface Meteor {
  x: number;
  y: number;
  len: number;
  speed: number;
  color: string;
  alpha: number;
}

const NEON_COLORS = [
  "#fde400", // Yellow Gold
  "#00f2d1", // Cyan Neon
  "#ff3af2", // Magenta Neon
  "#ffd700", // Gold
  "#ffffff", // Pure Sparkle
  "#a855f7", // Purple Neon
];

export default function AmbientAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<AtmosphereMode>("petals");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load mode from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("dung_atmosphere_mode_v2") as AtmosphereMode | null;
    if (saved && ["stardust", "petals", "fireworks", "off"].includes(saved)) {
      setMode(saved);
    }
  }, []);

  const changeMode = (newMode: AtmosphereMode) => {
    setMode(newMode);
    localStorage.setItem("dung_atmosphere_mode_v2", newMode);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (mode === "off") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle Collections
    let particles: Particle[] = [];
    const cursorParticles: Particle[] = [];
    const meteors: Meteor[] = [];

    // Tỉ lệ hạt dựa trên màn hình
    const isMobile = width < 768;
    const maxParticles = isMobile ? 30 : 65;

    // Khởi tạo hạt nền ban đầu
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        particles.push(createNewParticle(true));
      }
    };

    const createNewParticle = (randomY = false): Particle => {
      const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
      if (mode === "petals") {
        return {
          x: Math.random() * width,
          y: randomY ? Math.random() * height : -20,
          vx: (Math.random() - 0.5) * 1.2 + 0.3,
          vy: Math.random() * 1.5 + 0.8,
          size: Math.random() * 8 + 6,
          color: Math.random() > 0.5 ? "#ff70d9" : Math.random() > 0.5 ? "#fde400" : "#ffffff",
          alpha: Math.random() * 0.7 + 0.3,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.04,
          type: "petal",
        };
      } else {
        // Mode stardust / sparks
        return {
          x: Math.random() * width,
          y: randomY ? Math.random() * height : height + 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: mode === "fireworks" ? -(Math.random() * 1.5 + 0.5) : -(Math.random() * 0.6 + 0.2),
          size: Math.random() * 3 + 1,
          color,
          alpha: Math.random() * 0.8 + 0.2,
          decay: Math.random() * 0.005 + 0.002,
          type: Math.random() > 0.7 ? "star" : "dust",
        };
      }
    };

    initParticles();

    // Spawn Meteor thỉnh thoảng
    const meteorTimer = 0;
    const spawnMeteor = () => {
      if (mode === "stardust" && Math.random() < 0.015) {
        meteors.push({
          x: Math.random() * width * 1.2,
          y: -50,
          len: Math.random() * 120 + 80,
          speed: Math.random() * 8 + 7,
          color: Math.random() > 0.5 ? "#00f2d1" : "#ff3af2",
          alpha: 1,
        });
      }
    };

    // Ambient Fireworks Burst (thỉnh thoảng bắn 1 chùm nhỏ phía xa ở mode fireworks)
    let fireworkTimer = 0;
    const spawnAmbientBurst = () => {
      if (mode === "fireworks" && fireworkTimer++ > 120) {
        fireworkTimer = 0;
        const bx = Math.random() * (width * 0.8) + width * 0.1;
        const by = Math.random() * (height * 0.4) + height * 0.1;
        const burstColor = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 3 + 1;
          cursorParticles.push({
            x: bx,
            y: by,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 1.5,
            color: burstColor,
            alpha: 1,
            decay: Math.random() * 0.02 + 0.015,
            type: "spark",
          });
        }
      }
    };

    // Cursor Movement Trail
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      // Sinh ra 2-3 hạt sao ma thuật tại vị trí con trỏ
      for (let i = 0; i < 2; i++) {
        const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
        cursorParticles.push({
          x: clientX + (Math.random() - 0.5) * 12,
          y: clientY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 0.5,
          size: Math.random() * 3.5 + 1.5,
          color,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
          type: "spark",
        });
      }
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    // Drawing Helpers
    const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string, alpha: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.restore();
    };

    const drawPetal = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
      ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.restore();
    };

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render Background Floating Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.rotation !== undefined && p.vRot !== undefined) {
          p.rotation += p.vRot;
        }

        // Draw particle
        if (p.type === "petal") {
          drawPetal(ctx, p);
        } else if (p.type === "star") {
          drawStar(ctx, p.x, p.y, 4, p.size * 2, p.size, p.color, p.alpha);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }

        // Reset if out of bounds
        if (p.y < -30 || p.y > height + 30 || p.x < -30 || p.x > width + 30) {
          particles[i] = createNewParticle(false);
        }
      }

      // 2. Render & Update Cursor Trail Sparkles
      for (let i = cursorParticles.length - 1; i >= 0; i--) {
        const sp = cursorParticles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay || 0.02;

        if (sp.alpha <= 0) {
          cursorParticles.splice(i, 1);
          continue;
        }

        drawStar(ctx, sp.x, sp.y, 4, sp.size * 1.5, sp.size * 0.6, sp.color, sp.alpha);
      }

      // 3. Render Meteors (Shooting Stars)
      spawnMeteor();
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x -= m.speed;
        m.y += m.speed * 0.8;
        m.alpha -= 0.012;

        if (m.alpha <= 0 || m.x < -100 || m.y > height + 100) {
          meteors.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        const grad = ctx.createLinearGradient(m.x, m.y, m.x + m.len, m.y - m.len * 0.8);
        grad.addColorStop(0, m.color);
        grad.addColorStop(1, "transparent");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = m.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = m.color;
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x + m.len, m.y - m.len * 0.8);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Ambient Firework Spawner
      spawnAmbientBurst();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
    };
  }, [mode]);

  return (
    <>
      {/* Hardware-Accelerated 60fps Ambient Canvas */}
      {mode !== "off" && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-10 w-full h-full"
          style={{ mixBlendMode: "screen" }}
        />
      )}

      {/* Floating Atmosphere Controller Pill in Bottom Corner */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 select-none">
        {/* Expanded Mode Menu */}
        {isMenuOpen && (
          <div className="bg-[#180924]/95 border-2 border-secondary-fixed p-2 rounded-2xl shadow-[4px_4px_0px_0px_#000] backdrop-blur-md flex flex-col gap-1 text-xs font-display font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => changeMode("stardust")}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                mode === "stardust" ? "bg-secondary-fixed text-black font-black" : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {/* <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> */}
              <span>✨ Vũ Trụ & Sao Băng</span>
            </button>

            <button
              onClick={() => changeMode("petals")}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                mode === "petals" ? "bg-[#ff3af2] text-white font-black" : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {/* <Flower2 className="w-3.5 h-3.5 text-pink-400" /> */}
              <span>🌸 Cánh Hoa Neon Rơi</span>
            </button>

            <button
              onClick={() => changeMode("fireworks")}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                mode === "fireworks" ? "bg-tertiary-fixed text-black font-black" : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {/* <Flame className="w-3.5 h-3.5 text-cyan-400" /> */}
              <span>🎆 Pháo Hoa Nền</span>
            </button>

            <button
              onClick={() => changeMode("off")}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                mode === "off" ? "bg-gray-700 text-white font-black" : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {/* <EyeOff className="w-3.5 h-3.5 text-gray-400" /> */}
              <span>🔇 Tắt Hiệu Ứng</span>
            </button>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-[#1a0a28] hover:bg-[#28103d] border-2 border-secondary-fixed text-secondary-fixed hover:text-white p-2.5 sm:px-3 sm:py-2 rounded-full shadow-[3px_3px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#00f2d1] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
          title="Tùy chỉnh hiệu ứng không gian"
        >
          {mode === "stardust" && <span>✨</span>}
          {mode === "petals" && <span>🌸</span>}
          {mode === "fireworks" && <span>🎆</span>}
          {mode === "off" && <span>🔇</span>}
          <span className="hidden sm:inline text-[11px] font-display font-black uppercase tracking-wider">
            {mode === "stardust" ? "Hiệu Ứng Vũ Trụ" : mode === "petals" ? "Cánh Hoa Neon" : mode === "fireworks" ? "Pháo Hoa Nền" : "Tắt Hiệu Ứng"}
          </span>
        </button>
      </div>
    </>
  );
}
