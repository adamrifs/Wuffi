import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ForestParticles } from "./ForestParticles";

// Phase 1: how many frames are scroll-driven (Wuffi runs away + forest slides)
const SCROLL_DRIVEN_FRAMES = 60;
// Phase 2: the remaining frames auto-play at this speed
const AUTOPLAY_FPS = 30;

export function ForestExplorer({ forestProgressRef, frameRef, startFrame }) {
  const rafRef = useRef(null); // rAF id for auto-play
  const [autoPlaying, setAutoPlaying] = useState(false);
  const autoPlayingRef = useRef(false); // non-reactive mirror for the rAF loop
  
  const [showText, setShowText] = useState(false);
  const showTextRef = useRef(false);

  // ── Logic Loop (Checks scroll progress and drives auto-play) ──────────────
  useEffect(() => {
    if (!forestProgressRef || !frameRef) return;
    const totalForestFrames = 192;
    let lastTime = performance.now();

    const tick = (now) => {
      const elapsed = Math.min(now - lastTime, 100);
      lastTime = now;
      
      const progress = forestProgressRef.current;

      if (progress > 0 && !autoPlayingRef.current) {
        // Phase 1: Scroll driven
        frameRef.current = startFrame + progress * SCROLL_DRIVEN_FRAMES;
        if (progress >= 1) {
          autoPlayingRef.current = true;
          setAutoPlaying(true);
        }
      } else if (autoPlayingRef.current) {
        // Phase 2: Auto-play
        frameRef.current = Math.min(
          startFrame + totalForestFrames - 1,
          frameRef.current + (elapsed / 1000) * AUTOPLAY_FPS
        );
      }

      // Handle Text Triggers
      if (progress > 0) {
        const forestCurrentFrame = frameRef.current - startFrame;
        const textProgress = (forestCurrentFrame - SCROLL_DRIVEN_FRAMES) / (totalForestFrames - SCROLL_DRIVEN_FRAMES);
        
        // Only show text on the final frames of the animation
        const shouldShowText = textProgress > 0.75;
        if (shouldShowText !== showTextRef.current) {
          showTextRef.current = shouldShowText;
          setShowText(shouldShowText);
        }
      }

      // If user scrolls back up past the trigger point
      if (progress === 0 && autoPlayingRef.current) {
        autoPlayingRef.current = false;
        setAutoPlaying(false);
        showTextRef.current = false;
        setShowText(false);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [forestProgressRef, frameRef, startFrame]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      {/* ── Living Forest Particles (appear during auto-play) ── */}
      {autoPlaying && <ForestParticles />}

      {/* ── Bottom Vignette ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "20vh",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Text Content ── */}
      <div
        className="fredoka-text"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          fontFamily: "'Fredoka', sans-serif"
        }}
      >
        <AnimatePresence>
          {showText && (
            <motion.h2
              initial={{ opacity: 0, y: 40, scale: 0.95, filter: "blur(20px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -40, filter: "blur(20px)" }}
              transition={{ duration: 3.0, ease: [0.25, 1, 0.5, 1] }}
              className="text-[80px] md:text-[120px] lg:text-[140px] font-medium text-white text-center px-4 leading-[1.1] tracking-[-2px]"
            >
              The Adventure Never Ends
            </motion.h2>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
