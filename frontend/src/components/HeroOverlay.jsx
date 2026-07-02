import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HeroOverlay() {
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const rightContentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const h1 = headingRef.current;
      
      if (h1) {
        // Clear any GSAP transforms momentarily to get pure unscaled coordinates
        gsap.set(h1, { clearProps: "all" });
        
        const rect = h1.getBoundingClientRect();
        const startX = (window.innerWidth / 2) - (rect.left + rect.width / 2);
        const startY = (window.innerHeight / 2) - (rect.top + rect.height / 2);

        gsap.fromTo(h1, 
          {
            x: startX,
            y: startY,
            scale: 3.5,
            transformOrigin: "center center"
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: document.body,
              start: "top top",
              end: "500px top",
              scrub: 1,
            }
          }
        );
      }

      if (subtitleRef.current && rightContentRef.current) {
        gsap.from([subtitleRef.current, rightContentRef.current], {
          opacity: 0,
          y: 20,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "500px top",
            scrub: 1,
          }
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');
        `}
      </style>
      <div 
        ref={containerRef}
        className="absolute inset-0 z-20 flex items-end pb-[80px] px-[8%] pointer-events-none text-white max-[850px]:pb-[60px]"
        style={{ fontFamily: "'Fredoka', sans-serif" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          className="w-full grid grid-cols-[1.2fr_0.8fr] items-end max-[850px]:grid-cols-1 max-[850px]:gap-[60px]"
        >
          {/* Left Side */}
          <div className="hero-title">
            <h1 
              ref={headingRef}
              className="text-[84px] font-medium tracking-[-3px] mb-[5px] leading-[1] max-[850px]:text-[60px] origin-center w-fit inline-block"
            >
              Wuffi
            </h1>
            <p ref={subtitleRef} className="text-[32px] text-white/50 font-normal m-0">The cutest explorer in the woods.</p>
          </div>

          {/* Right Side */}
          <div ref={rightContentRef} className="flex flex-col items-end text-right max-[850px]:items-start max-[850px]:text-left">
            <a 
              href="#" 
              className="pointer-events-auto py-[14px] px-[32px] border border-white/20 rounded-[100px] bg-white/5 text-white no-underline text-[14px] transition-all duration-300 ease-in-out backdrop-blur-[5px] mb-[30px] hover:bg-white hover:text-black"
            >
              Start Exploring
            </a>
            <p className="text-[18px] leading-[1.5] text-white/80 max-w-[380px] font-normal m-0">
              A tiny forest spirit with a big heart, spreading wonder, kindness, and a little magic wherever tiny paws wander.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
