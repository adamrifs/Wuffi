import { useEffect, useRef, useMemo } from "react";

/**
 * DustParticles — rewritten with pure CSS animations instead of Framer Motion.
 * Each particle uses a CSS @keyframes animation with will-change: transform,
 * which is composited entirely on the GPU. The parallax effect uses
 * requestAnimationFrame to avoid layout thrashing.
 */
export function DustParticles() {
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      if (rafRef.current) return; // skip if a frame is already scheduled
      rafRef.current = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        container.style.transform = `translate3d(${x * -30}px, ${y * -30}px, 0)`;
        rafRef.current = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.5 + 0.2,
      driftX: (Math.random() * 20 - 10),
    }));
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        width: '110vw',
        height: '110vh',
        left: '-5vw',
        top: '-5vh',
        willChange: 'transform',
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#ffea99]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: `0 0 ${p.size * 2}px ${p.size}px rgba(255, 234, 153, 0.4)`,
            animation: `dust-float-${p.id} ${p.duration}s linear ${p.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
      <style>{particles.map((p) => `
        @keyframes dust-float-${p.id} {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          10%  { opacity: ${p.opacity}; }
          90%  { opacity: ${p.opacity}; }
          100% { transform: translate3d(${p.driftX}vw, -100vh, 0); opacity: 0; }
        }
      `).join('')}</style>
    </div>
  );
}
