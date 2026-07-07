import { useMemo } from "react";
import { motion } from "framer-motion";

// ── God Rays ─────────────────────────────────────────────────────────────────
function GodRays() {
  const rays = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      left: 8 + i * 15 + Math.random() * 6,
      delay: i * 0.9,
      duration: 3 + Math.random() * 2,
      rotate: -18 + Math.random() * 36,
      opacity: 0.04 + Math.random() * 0.06,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {rays.map((r) => (
        <motion.div
          key={r.id}
          className="absolute top-0 h-full"
          style={{
            left: `${r.left}%`,
            width: "8vw",
            background:
              "linear-gradient(to bottom, rgba(255,240,160,0.9) 0%, rgba(255,240,160,0) 100%)",
            transform: `rotate(${r.rotate}deg)`,
            transformOrigin: "top center",
            opacity: r.opacity,
          }}
          animate={{ opacity: [r.opacity, r.opacity * 2.5, r.opacity] }}
          transition={{
            duration: r.duration,
            repeat: Infinity,
            delay: r.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Floating Dust ─────────────────────────────────────────────────────────────
function ForestDust() {
  const particles = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
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
        <motion.div
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
          }}
          animate={{
            y: ["0vh", "-100vh"],
            x: ["0px", `${p.driftX}vw`],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// ── Drifting Leaves ───────────────────────────────────────────────────────────
const LEAF_COLORS = ["#a8d47a", "#7cbf52", "#c8e89e", "#e4b84a", "#d4a832"];

const LeafSVG = ({ color }) => (
  <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="20" rx="12" ry="7" fill={color} opacity="0.85" />
    <line x1="8" y1="20" x2="32" y2="20" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
  </svg>
);

function DriftingLeaves() {
  const leaves = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
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
        <motion.div
          key={l.id}
          className="absolute"
          style={{ width: l.size, height: l.size, left: `${l.startX}%`, top: 0 }}
          animate={{
            y: ["0vh", "110vh"],
            x: ["0px", `${l.endX}vw`],
            rotate: [0, l.rotateEnd],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: l.duration,
            repeat: Infinity,
            delay: l.delay,
            ease: "easeIn",
          }}
        >
          <LeafSVG color={l.color} />
        </motion.div>
      ))}
    </div>
  );
}

// ── Fireflies ─────────────────────────────────────────────────────────────────
function Fireflies() {
  const flies = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 80 + 10,
      size: Math.random() * 5 + 3,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * -5,
      driftX: (Math.random() - 0.5) * 8,
      driftY: (Math.random() - 0.5) * 8,
    }));
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {flies.map((f) => (
        <motion.div
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
          }}
          animate={{
            x: [0, f.driftX * 10, 0],
            y: [0, f.driftY * 10, 0],
            opacity: [0, 1, 0.3, 1, 0],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: f.duration,
            repeat: Infinity,
            delay: f.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export function ForestParticles({ className = "" }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* <GodRays /> */}
      <ForestDust />
      <DriftingLeaves />
      <Fireflies />
    </div>
  );
}
