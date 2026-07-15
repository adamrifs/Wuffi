import { useEffect, useRef } from "react";
import { DustParticles } from "./DustParticles";
import { FlyingButterflies } from "./FlyingButterflies";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * MagicalOverlay — fixed overlay with particles.
 * Now fades out when the white section is active (scroll 4200–7500)
 * to avoid compositing expensive blend modes over the white UI.
 */
export function MagicalOverlay() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Fade out the particle overlay during the white section
      gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 3800,
          end: 4500,
          scrub: 0.3,
        },
      }).to(el, { opacity: 0, ease: "none" });

      // Fade back in after white section exits
      gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 7200,
          end: 7800,
          scrub: 0.3,
        },
      }).to(el, { opacity: 1, ease: "none" });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-30 pointer-events-none overflow-hidden mix-blend-screen"
      style={{ willChange: 'opacity' }}
    >
      <DustParticles />
      <FlyingButterflies />
    </div>
  );
}
