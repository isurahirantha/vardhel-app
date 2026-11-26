"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface HeroParticleSectionProps {
  children: ReactNode;
  className?: string;
}

const PARTICLE_COLORS = ["#10b981", "#228870", "#06b6d4", "#14b8a6", "#3b82f6"];

/**
 * Wraps the hero section with a full-bleed interactive HTML5 Canvas fluid particle field
 * that reacts to cursor movement across the entire hero area.
 */
export function HeroParticleSection({
  children,
  className = "",
}: HeroParticleSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: -1000, y: -1000, isHovering: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId = 0;
    let particles: Particle[] = [];

    const initParticles = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = [];
      const density = 32;
      const cols = Math.floor(width / density);
      const rows = Math.floor(height / density);

      for (let r = 1; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
          const originX = c * density + (Math.random() - 0.5) * 8;
          const originY = r * density + (Math.random() - 0.5) * 8;
          particles.push({
            x: originX,
            y: originY,
            originX,
            originY,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.4 + 1.1,
            color: PARTICLE_COLORS[(c + r) % PARTICLE_COLORS.length] || "#10b981",
          });
        }
      }
    };

    const drawStatic = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.45;
        ctx.fill();
      }
    };

    initParticles();
    if (prefersReducedMotion) {
      drawStatic();
    }

    const resizeObserver = new ResizeObserver(() => {
      initParticles();
      if (prefersReducedMotion) drawStatic();
    });
    resizeObserver.observe(container);

    if (prefersReducedMotion) {
      return () => resizeObserver.disconnect();
    }

    const render = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      ctx.clearRect(0, 0, width, height);

      const mouse = mousePosRef.current;
      const mouseRadius = 130;
      const mouseRadiusSq = mouseRadius * mouseRadius;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p) continue;

        if (mouse.isHovering) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < mouseRadiusSq && distSq > 0.1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / mouseRadius) * 4.5;
            const angle = Math.atan2(dy, dx);
            p.vx -= Math.cos(angle) * force;
            p.vy -= Math.sin(angle) * force;
          }
        }

        const springX = (p.originX - p.x) * 0.055;
        const springY = (p.originY - p.y) * 0.055;

        p.vx = (p.vx + springX) * 0.88;
        p.vy = (p.vy + springY) * 0.88;

        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.62;
        ctx.fill();

        const displacement = Math.abs(p.x - p.originX) + Math.abs(p.y - p.originY);
        if (displacement > 3) {
          ctx.beginPath();
          ctx.moveTo(p.originX, p.originY);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = Math.min(displacement * 0.04, 0.45);
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePosRef.current = { x, y, isHovering: true };
  };

  const handleMouseEnter = () => {
    mousePosRef.current.isHovering = true;
  };

  const handleMouseLeave = () => {
    mousePosRef.current = { x: -1000, y: -1000, isHovering: false };
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Full-Hero Fluid Particle Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-85"
      />

      {/* Soft fade over left text column so copy stays crisp on clean white */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-3/5 bg-gradient-to-r from-[var(--bg-surface)]/85 via-[var(--bg-surface)]/45 to-transparent lg:block"
      />

      <div className="relative z-10">{children}</div>
    </section>
  );
}

