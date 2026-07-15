import { useMemo } from "react";

// ── God Rays ─────────────────────────────────────────────────────────────────
// Commented out by default for perf, uncomment below if wanted
/*
function GodRays() { ... }
*/

// ── Floating Dust — pure CSS ──────────────────────────────────────────────────
function ForestDust() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 18 + 10,
      delay: Math.random() * -25,
      opacity: Math.random() * 0.45 + 0.15,
      driftX: (Math.random() - 0.5) * 12,
    }));
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background:
              "radial-gradient(circle, rgba(255,235,150,0.9) 0%, rgba(255,220,100,0.4) 70%)",
            boxShadow: `0 0 ${p.size * 2}px ${p.size}px rgba(255,234,153,0.35)`,
            animation: `forest-dust-${p.id} ${p.duration}s linear ${p.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
      <style>{particles.map((p) => `
        @keyframes forest-dust-${p.id} {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          10%  { opacity: ${p.opacity}; }
          90%  { opacity: ${p.opacity}; }
          100% { transform: translate3d(${p.driftX}vw, -100vh, 0); opacity: 0; }
        }
      `).join('')}</style>
    </div>
  );
}

// ── Drifting Leaves — pure CSS ───────────────────────────────────────────────
const LEAF_COLORS = ["#a8d47a", "#7cbf52", "#c8e89e", "#e4b84a", "#d4a832"];

const LeafSVG = ({ color }) => (
  <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="20" rx="12" ry="7" fill={color} opacity="0.85" />
    <line x1="8" y1="20" x2="32" y2="20" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
  </svg>
);

function DriftingLeaves() {
  const leaves = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      size: Math.random() * 18 + 12,
      startX: Math.random() * 110 - 5,
      endX: (Math.random() - 0.5) * 60,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      duration: Math.random() * 12 + 10,
      delay: Math.random() * -20,
      rotateEnd: (Math.random() - 0.5) * 720,
    }));
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {leaves.map((l) => (
        <div
          key={l.id}
          className="absolute"
          style={{
            width: l.size,
            height: l.size,
            left: `${l.startX}%`,
            top: 0,
            animation: `leaf-drift-${l.id} ${l.duration}s ease-in ${l.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        >
          <LeafSVG color={l.color} />
        </div>
      ))}
      <style>{leaves.map((l) => `
        @keyframes leaf-drift-${l.id} {
          0%   { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.9; }
          90%  { opacity: 0.9; }
          100% { transform: translate3d(${l.endX}vw, 110vh, 0) rotate(${l.rotateEnd}deg); opacity: 0; }
        }
      `).join('')}</style>
    </div>
  );
}

// ── Fireflies — pure CSS ─────────────────────────────────────────────────────
function Fireflies() {
  const flies = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 80 + 10,
      size: Math.random() * 5 + 3,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * -5,
      driftX: (Math.random() - 0.5) * 80,
      driftY: (Math.random() - 0.5) * 80,
    }));
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {flies.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.size,
            height: f.size,
            background:
              "radial-gradient(circle, #fff9c4 0%, #ffd700 60%, transparent 100%)",
            boxShadow: `0 0 ${f.size * 3}px ${f.size * 2}px rgba(255,250,150,0.6)`,
            animation: `firefly-${f.id} ${f.duration}s ease-in-out ${f.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
      <style>{flies.map((f) => `
        @keyframes firefly-${f.id} {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          15%  { opacity: 1; }
          50%  { transform: translate3d(${f.driftX}px, ${f.driftY}px, 0); opacity: 0.3; scale: 1.4; }
          85%  { opacity: 1; }
          100% { transform: translate3d(0, 0, 0); opacity: 0; scale: 0.8; }
        }
      `).join('')}</style>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export function ForestParticles({ className = "" }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <ForestDust />
      <DriftingLeaves />
      <Fireflies />
    </div>
  );
}
