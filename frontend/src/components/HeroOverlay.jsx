import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HeroOverlay() {
  const containerRef = useRef(null);
  const middleTextRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade out and softly slide up the entire hero overlay on scroll
      gsap.to(containerRef.current, {
        y: -120,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: 0,
          end: 800,
          scrub: 1,
        }
      });

      // Reveal and hide the middle text smoothly using a unified timeline
      if (middleTextRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            start: 1600,
            end: 3600,
            scrub: 1,
          }
        });

        tl.fromTo(middleTextRef.current,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: 0.3 } 
        )
        .to(middleTextRef.current, { opacity: 1, y: 0, duration: 0.4 }) 
        .to(middleTextRef.current, { opacity: 0, y: -60, scale: 1.05, ease: "power2.in", duration: 0.3 }); 
      }
    });

    return () => ctx.revert();
  }, []);

  // Framer Motion animation variants for the premium entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.2, 
        delayChildren: 0.4 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } // Apple-like custom ease out
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap');
          .fredoka-text, .fredoka-text * {
            font-family: 'Fredoka', sans-serif !important;
          }
          .text-shadow-hero {
            text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.3);
          }
          .text-shadow-sub {
            text-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
          }
        `}
      </style>
      <div 
        ref={containerRef}
        className="fredoka-text absolute inset-0 z-20 flex flex-col justify-end pb-[8vh] px-[6vw] pointer-events-none text-white"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 md:gap-12 items-end"
        >
          {/* Left Side: Title & Subtitle */}
          <div className="flex flex-col">
            <motion.h1 
              variants={itemVariants}
              className="text-[90px] sm:text-[110px] md:text-[140px] font-semibold tracking-[-0.03em] leading-[0.9] mb-2 text-shadow-hero"
            >
              Wuffi
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-[22px] sm:text-[26px] md:text-[32px] text-white/90 font-medium m-0 text-shadow-sub"
            >
              The cutest explorer in the woods.
            </motion.p>
          </div>

          {/* Right Side: Description */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:items-end md:text-right"
          >
            <p className="text-[16px] sm:text-[18px] md:text-[22px] leading-[1.6] text-white/80 max-w-[420px] font-normal m-0 text-shadow-sub">
              A tiny forest spirit with a big heart, spreading wonder, kindness, and a little magic wherever tiny paws wander.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Middle Animated Text (Scroll Triggered) */}
      <div
        ref={middleTextRef}
        className="fredoka-text absolute inset-0 z-20 flex items-center justify-center pointer-events-none text-white px-[8vw]"
      >
        <h2 className="text-[40px] sm:text-[54px] md:text-[72px] font-medium leading-[1.1] tracking-tight text-center max-w-[1000px] text-shadow-hero">
          Deep in the enchanted forest, magic awaits at every turn.
        </h2>
      </div>
    </>
  );
}
