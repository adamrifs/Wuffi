import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function ScrollController({
  frameRef,
  scrolledRef,
  forestProgressRef,
  totalFrames,
  children,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    // --- Lenis v1.x setup ---
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: false,
    });

    // Forward lenis scroll position to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis via GSAP ticker (most reliable approach)
    const lenisRafCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(lenisRafCallback);
    gsap.ticker.lagSmoothing(0);

    // --- GSAP ScrollTrigger pin + scrub ---
    // The trigger is the container div. GSAP will pin it at "top top"
    // We add 2700px to the scrollable height to pause during the white section
    // We add 1500px for the ForestExplorer scroll-driven phase
    const endOfPlaying = totalFrames * 20 + 2700;
    const forestScrollPx = 1500;
    const totalScrollPx = endOfPlaying + forestScrollPx;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${totalScrollPx}`,
        pin: true, // pin the container in place
        pinSpacing: true, // let GSAP add the spacer div below
        anticipatePin: 1, // prevents jump at pin moment
        scrub: 0.5, // smooth scrub (0 = instant, higher = more lag)
        onUpdate: (self) => {
          const scrolledPx = self.progress * totalScrollPx;

          // Signal CanvasRenderer that the user has started scrolling
          if (scrolledRef) {
            scrolledRef.current = scrolledPx > 10;
          }

          let currentFrame = 0;
          if (scrolledPx <= 4800) {
            // 0 - 4800px: play frames 0 to 240 (this completes the crossfade)
            currentFrame = scrolledPx / 20;
          } else if (scrolledPx <= 7500) {
            // 4800 - 7500px: pause at frame 240 (pure sequence 2) while white section scrolls
            currentFrame = 240;
          } else {
            // 7500 - end of playing: resume playing sequence 2
            currentFrame = 240 + (scrolledPx - 7500) / 20;
          }

          // Update Forest Progress and yield frame control to ForestExplorer
          if (forestProgressRef) {
            if (scrolledPx <= endOfPlaying) {
              forestProgressRef.current = 0;
              // We only let ScrollController drive the frameRef if we are not in the forest
              frameRef.current = Math.min(
                totalFrames - 1,
                Math.max(0, currentFrame),
              );
            } else {
              const forestPx = scrolledPx - endOfPlaying;
              forestProgressRef.current = Math.min(1, forestPx / forestScrollPx);
              // Do NOT cap frameRef.current here; ForestExplorer handles it natively
            }
          } else {
             // Fallback if ForestExplorer is missing
             frameRef.current = Math.min(
                totalFrames - 1,
                Math.max(0, currentFrame),
             );
          }
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(lenisRafCallback);
    };
  }, [frameRef, totalFrames]);

  return (
    // This div is the ScrollTrigger anchor. It MUST be in the normal document
    // flow (not fixed/absolute) and have a real viewport height so GSAP can
    // pin it correctly.
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
      }}
    >
      {children}
    </div>
  );
}
