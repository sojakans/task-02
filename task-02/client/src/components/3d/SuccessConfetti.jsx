import React, { useEffect, useRef } from 'react';

export function SuccessConfetti({ duration = 4000 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle generator
    const colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#38bdf8', '#e879f9'];
    const particles = Array.from({ length: 80 }, () => ({
      x: width / 2,
      y: height * 0.45,
      radius: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.8) * 16,
      gravity: 0.35,
      friction: 0.98,
      opacity: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    }));

    const startTime = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const elapsed = Date.now() - startTime;
      if (elapsed > duration) return;

      particles.forEach((p) => {
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - elapsed / duration);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        // Draw diamond spark
        ctx.beginPath();
        ctx.moveTo(0, -p.radius * 1.5);
        ctx.lineTo(p.radius, 0);
        ctx.lineTo(0, p.radius * 1.5);
        ctx.lineTo(-p.radius, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [duration]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
