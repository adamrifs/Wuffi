import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function WhiteSectionOverlay() {
  const overlayRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 4200, // Starts exactly as the crossfade begins
          end: 6000,   // Finishes sliding out, revealing the new butterfly scene
          scrub: 1,
        }
      });

      tl.fromTo(overlayRef.current, 
        { y: "100%" }, 
        { y: "0%", ease: "power2.inOut", duration: 0.4 } // Slower reveal
      )
      .to(overlayRef.current, { y: "0%", duration: 0.4 }) // Hold steady
      .to(overlayRef.current, { y: "-100%", ease: "power2.inOut", duration: 0.4 }); // Slide out at the same speed as the reveal
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-40 bg-white flex flex-col items-center justify-center py-20 px-[8%]"
      style={{ transform: "translateY(100%)" }}
    >
      <h2 className="text-black text-[64px] font-medium font-['Fredoka'] text-center tracking-tight max-[850px]:text-[42px]">
        More magic to discover...
      </h2>
    </div>
  );
}
