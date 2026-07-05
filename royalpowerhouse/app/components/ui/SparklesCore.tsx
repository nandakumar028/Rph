"use client";
import React, { useEffect, useRef, useId } from "react";
import { cn } from "@/app/lib/utils";

type SparklesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacitySpeed: number;
};

export const SparklesCore = ({
  id,
  className,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  speed = 1,
  particleColor = "#ffffff",
  particleDensity = 120,
}: SparklesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const generatedId = useId();
  const canvasId = id ?? generatedId;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    });
    resizeObserver.observe(canvas);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    function initParticles() {
      if (!canvas) return;
      const count = Math.floor((canvas.width * canvas.height) / (10000 / particleDensity));
      particles.current = Array.from({ length: count }, () => createParticle(canvas!));
    }

    function createParticle(c: HTMLCanvasElement): Particle {
      const size = Math.random() * (maxSize - minSize) + minSize;
      return {
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        size,
        speedX: (Math.random() - 0.5) * speed * 0.3,
        speedY: (Math.random() - 0.5) * speed * 0.3,
        opacity: Math.random(),
        opacitySpeed: (Math.random() * 0.02 + 0.005) * speed,
      };
    }

    initParticles();

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.opacitySpeed;

        if (p.opacity >= 1 || p.opacity <= 0) p.opacitySpeed *= -1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = Math.abs(p.opacity);
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [minSize, maxSize, speed, particleColor, particleDensity]);

  return (
    <canvas
      id={canvasId}
      ref={canvasRef}
      className={cn("h-full w-full", className)}
      style={{ background }}
    />
  );
};
