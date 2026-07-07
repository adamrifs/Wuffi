import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function WhiteSectionOverlay() {
  const overlayRef = useRef(null);
  const textContainerRef = useRef(null);
  const textInnerRef = useRef(null);
  const fogRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 4200, // Starts exactly as the crossfade begins
          end: 7500,   // Extended the end for a longer scroll duration
          scrub: 1,
        }
      });

      // 1. Overlay enters (0.0 to 0.2)
      tl.fromTo(overlayRef.current, 
        { y: "100vh" }, 
        { y: "0%", ease: "power2.inOut", duration: 0.2 } 
      )
      // 2. Overlay scrolls through its 200vh height (0.2 to 0.8)
      .to(overlayRef.current, { y: "-50%", ease: "none", duration: 0.6 }) 
      // 3. Fade out the bottom fog edge so it doesn't wipe over the final sequence (0.8 to 0.9)
      .to(fogRef.current, { opacity: 0, duration: 0.1 }, 0.8)
      // 4. Overlay exits screen upwards (0.8 to 1.0)
      .to(overlayRef.current, { y: "-100%", ease: "power2.inOut", duration: 0.2 }, 0.8); 

      // -- TEXT ANIMATIONS --

      // Hold effect: Move the container down to counteract the scroll (0.2 to 0.5)
      tl.to(textContainerRef.current, { y: "50vh", ease: "none", duration: 0.3 }, 0.2); 

      // Reveal animation: Fade in, scale up, unblur (0.1 to 0.25)
      tl.fromTo(textInnerRef.current,
        { opacity: 0, y: 50, scale: 0.8, filter: "blur(10px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", ease: "power2.out", duration: 0.15 },
        0.1
      );

      // Exit animation: Fade out, scale up, blur (0.55 to 0.7)
      tl.to(textInnerRef.current,
        { opacity: 0, y: -50, scale: 1.1, filter: "blur(10px)", ease: "power2.in", duration: 0.15 },
        0.55
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={overlayRef}
      className="absolute top-0 left-0 w-full h-[200vh] z-40 bg-white flex flex-col items-center justify-start py-[20vh] px-[8%]"
      style={{ transform: "translateY(100vh)" }}
    >
      {/* Container for the hold effect */}
      <div ref={textContainerRef}>
        {/* Inner element for the reveal/exit animation */}
        <h2 
          ref={textInnerRef}
          className="text-black text-[64px] font-medium font-['Fredoka'] text-center tracking-tight max-[850px]:text-[42px]"
          style={{ opacity: 0 }} // Starts invisible before JS kicks in
        >
          More magic to discover...
        </h2>
      </div>
      
      {/* We can add our Wuffi interactive elements down here */}
      <div className="mt-auto mb-[20vh] flex flex-col items-center">
         <h3 className="text-gray-500 text-2xl font-['Fredoka']">Keep scrolling!</h3>
      </div>

      {/* Cloud/Fog Transition Edge at the bottom */}
      <div 
        ref={fogRef}
        className="absolute top-full left-0 w-full h-[15vh] pointer-events-none bg-gradient-to-b from-white to-transparent" 
      />
    </div>
  );
}
