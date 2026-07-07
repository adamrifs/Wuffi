import { useMemo } from "react";
import { motion } from "framer-motion";

const ButterflySVG = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="origin-center" style={{ animation: "flap 0.3s ease-in-out infinite alternate" }}>
      {/* Left Wing */}
      <path 
        d="M50 50 C 30 20, 10 10, 5 30 C 0 50, 20 70, 50 50 Z" 
        fill="rgba(255, 234, 153, 0.8)" 
        style={{ filter: "drop-shadow(0 0 5px rgba(255, 234, 153, 0.8))" }}
      />
      {/* Right Wing */}
      <path 
        d="M50 50 C 70 20, 90 10, 95 30 C 100 50, 80 70, 50 50 Z" 
        fill="rgba(255, 234, 153, 0.8)"
        style={{ filter: "drop-shadow(0 0 5px rgba(255, 234, 153, 0.8))" }}
      />
    </g>
    <style>
      {`
        @keyframes flap {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.1); }
        }
      `}
    </style>
  </svg>
);

export function FlyingButterflies() {
  const butterflies = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      const startX = Math.random() * 120 - 10; // -10vw to 110vw
      const startY = Math.random() * 50 + 50;  // Start in lower half
      const endX = startX + (Math.random() * 40 - 20); // Drift left/right
      const endY = startY - 100; // Fly upwards

      return {
        id: i,
        size: Math.random() * 15 + 15, // 15px to 30px
        startX,
        startY,
        endX,
        endY,
        duration: Math.random() * 10 + 15, // 15s to 25s
        delay: Math.random() * -20,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {butterflies.map((b) => (
        <motion.div
          key={b.id}
          className="absolute"
          style={{ width: b.size, height: b.size }}
          initial={{ x: `${b.startX}vw`, y: `${b.startY}vh`, opacity: 0 }}
          animate={{
            x: [`${b.startX}vw`, `${b.endX}vw`],
            y: [`${b.startY}vh`, `${b.endY}vh`],
            opacity: [0, 1, 1, 0],
            // Add a slight rotation wobble to simulate erratic flight
            rotate: [0, 15, -15, 20, -10, 0],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
        >
          <ButterflySVG />
        </motion.div>
      ))}
    </div>
  );
}
