import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SectionTwoOverlay() {
  const [scrollState, setScrollState] = useState("hidden-down"); // "visible", "hidden-up", "hidden-down"

  useEffect(() => {
    // The white section finishes sliding out at 7500px.
    // The wuffi-playing sequence ends at 11700px.
    const trigger = ScrollTrigger.create({
      start: 7500,
      end: 11000, // Fade out slightly before the sequence ends
      onEnter: () => setScrollState("visible"),
      onLeave: () => setScrollState("hidden-up"),
      onEnterBack: () => setScrollState("visible"),
      onLeaveBack: () => setScrollState("hidden-down"),
    });

    return () => trigger.kill();
  }, []);

  return (
    <section
      className="absolute inset-0 z-20 flex items-center px-[8%] pointer-events-none"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
    >
      {/* Content Layer */}
      <div className="relative z-10 max-w-2xl text-left">
        {/* Headline */}
        <div className="overflow-hidden pb-2">
          <motion.h2
            initial={{ y: "120%", opacity: 0 }}
            animate={{ 
              y: scrollState === "visible" ? 0 : scrollState === "hidden-up" ? "-120%" : "120%",
              opacity: scrollState === "visible" ? 1 : 0 
            }}
            transition={{ duration: 0.5, delay: scrollState === "visible" ? 0.1 : 0, ease: "easeOut" }}
            className="text-[72px] font-medium text-white mb-[5px] drop-shadow-lg leading-[1] tracking-[-2px] max-[850px]:text-[48px]"
          >
            Playful by Nature
          </motion.h2>
        </div>

        {/* Minimal Divider */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ 
            width: scrollState === "visible" ? "80px" : 0,
            opacity: scrollState === "visible" ? 1 : 0 
          }}
          transition={{ duration: 0.6, delay: scrollState === "visible" ? 0.3 : 0, ease: "easeOut" }}
          className="h-[4px] bg-[#facc15] mb-[24px] rounded-full"
        />

        {/* Body Text */}
        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)", y: 0 }}
          animate={{
            opacity: scrollState === "visible" ? 1 : 0,
            filter: scrollState === "visible" ? "blur(0px)" : "blur(10px)",
            y: scrollState === "visible" ? 0 : scrollState === "hidden-up" ? -20 : 20,
          }}
          transition={{ duration: 0.6, delay: scrollState === "visible" ? 0.4 : 0, ease: "easeOut" }}
          className="text-white text-[20px] leading-[1.6] font-normal tracking-wide drop-shadow-md max-w-[450px] max-[850px]:text-[16px]"
        >
          Every flower is a new discovery, every butterfly a new friend. Wuffi
          finds joy in the smallest moments, turning an ordinary forest into a
          place full of wonder.
        </motion.p>
      </div>

      {/* Cinematic Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              y: scrollState === "visible" ? [0, -30, 0] : 0,
              opacity: scrollState === "visible" ? [0.1, 0.4, 0.1] : 0,
            }}
            transition={{
              y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute bg-white rounded-full blur-[4px]"
            style={{
              width: `${8 + i * 2}px`,
              height: `${8 + i * 2}px`,
              top: `${30 + 10 * i}%`,
              left: `${20 + 15 * i}%`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
