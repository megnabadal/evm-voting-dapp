"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 72;
const MAX_SPEED = 0.20;
const DOT_OPACITY = 0.30;
const LINE_OPACITY_MAX = 0.08;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

function getParticleColor(): string {
  if (typeof window === "undefined") return "200,216,240";
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue("--particle-color")
    .trim();
  return val || "200,216,240";
}

export default function ThreeHero() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
    mount.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    let w = 0, h = 0, connDist = 0;
    let animId: number;
    const particles: Particle[] = [];

    const setSize = () => {
      w = mount.clientWidth || window.innerWidth;
      h = mount.clientHeight || window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.scale(dpr, dpr);
      connDist = Math.min(w, h) * 0.19;
    };

    const scatter = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = MAX_SPEED * (0.25 + Math.random() * 0.75);
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          r: 1.0 + Math.random() * 1.4,
        });
      }
    };

    const draw = () => {
      animId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, w, h);

      const COLOR = getParticleColor();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < connDist) {
            const alpha = ((1 - d / connDist) * LINE_OPACITY_MAX).toFixed(3);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${COLOR},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = `rgba(${COLOR},${DOT_OPACITY})`;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    setSize();
    scatter();
    draw();

    const ro = new ResizeObserver(setSize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      if (mount.contains(canvas)) mount.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}