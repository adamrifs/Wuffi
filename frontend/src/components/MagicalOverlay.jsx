import { useEffect, useState, useRef } from "react";
import { DustParticles } from "./DustParticles";
import { FlyingButterflies } from "./FlyingButterflies";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function MagicalOverlay() {
  const containerRef = useRef(null);
  
  // Optional: We can use GSAP to fade this out in later sections if needed
  useEffect(() => {
    // Currently keeps the magic visible everywhere, 
    // but you can add a ScrollTrigger here to fade it out past 7500px if requested!
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-30 pointer-events-none overflow-hidden mix-blend-screen"
    >
      <DustParticles />
      <FlyingButterflies />
    </div>
  );
}
