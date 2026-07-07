import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

export function DustParticles() {
  const containerRef = useRef(null);
  
  // Interactive Parallax: Move the entire dust layer slightly in the opposite direction of the mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      // Calculate mouse position relative to center of screen (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      // Move container opposite to mouse for parallax depth
      containerRef.current.style.transform = `translate(${x * -30}px, ${y * -30}px)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate 50 static particles with random initial properties
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1, // 1px to 5px
      x: Math.random() * 100, // 0 to 100vw
      y: Math.random() * 100, // 0 to 100vh
      duration: Math.random() * 20 + 10, // 10s to 30s float duration
      delay: Math.random() * -20, // Start at different times
      opacity: Math.random() * 0.5 + 0.2, // 0.2 to 0.7 opacity
    }));
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out"
      style={{ width: '110vw', height: '110vh', left: '-5vw', top: '-5vh' }} // Slightly larger to hide edges during parallax
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#ffea99]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: `0 0 ${p.size * 2}px ${p.size}px rgba(255, 234, 153, 0.4)`,
            opacity: p.opacity,
          }}
          animate={{
            y: ["0vh", "-100vh"],
            x: ["0vw", `${Math.random() * 20 - 10}vw`], 
            opacity: [0, p.opacity, p.opacity, 0], // Fade in and out at edges
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
