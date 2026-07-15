import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Star,
  Calendar,
  Clock,
  Phone,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { SERVICES, DOCTORS, REVIEWS, STATS } from "./data.js";

gsap.registerPlugin(ScrollTrigger);

// Animated wildflower reflecting Wuffi's signature yellow forest flowers
function Wildflower({ className, delay = 0 }) {
  return (
    <motion.div
      className={`pointer-events-auto z-10 ${className}`}
      initial={{ scale: 0.8, rotate: -5 }}
      animate={{
        scale: [0.95, 1.05, 0.95],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration: 4 + delay * 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 40 60"
        className="w-10 h-16 cursor-pointer group/flower"
      >
        {/* Flower stem */}
        <path
          d="M 20 25 Q 18 45 20 60"
          fill="none"
          stroke="#2D6A4F"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Green leaf */}
        <path
          d="M 19 40 Q 8 36 15 32 Q 20 34 19 40"
          fill="#2D6A4F"
          stroke="#2D6A4F"
          strokeWidth="1"
        />

        {/* Flower petals group that spins on hover */}
        <motion.g
          className="origin-[20px_25px]"
          whileHover={{ rotate: 180, scale: 1.15 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {/* Yellow Petals matching Wuffi's forest dandelions */}
          {[...Array(8)].map((_, i) => (
            <path
              key={i}
              d="M 20 25 C 15 15 25 15 20 25"
              fill="#E58F12"
              stroke="#F59E0B"
              strokeWidth="1"
              transform={`rotate(${i * 45} 20 25)`}
              className="group-hover/flower:fill-amber-400"
            />
          ))}
          {/* Flower Center */}
          <circle
            cx="20"
            cy="25"
            r="5"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="1.5"
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}

function RevealHeading({ children, className = "", as: Component = "h2" }) {
  const MotionComponent = motion[Component];
  return (
    <MotionComponent
      className={className}
      initial={{ opacity: 0, y: 35, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // easeOutExpo
    >
      {children}
    </MotionComponent>
  );
}

function RevealParagraph({ children, className = "" }) {
  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, x: -25 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 1, 0.5, 1] }} // easeOutQuart
    >
      {children}
    </motion.p>
  );
}

export function WhiteSectionOverlay() {
  const overlayRef = useRef(null);
  const textContainerRef = useRef(null);
  const textInnerRef = useRef(null);

  // Interactive States
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: SERVICES[0].id,
    doctor: DOCTORS[0].id,
    date: "",
    time: "",
  });

  // Wuffi Interactive Mascot States
  const [spots, setSpots] = useState([true, true, true]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const mouseRafRef = useRef(null);

  const cleanProgress = Math.round(
    ((3 - spots.filter(Boolean).length) / 3) * 100,
  );

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    if (mouseRafRef.current) return; // skip if already scheduled
    mouseRafRef.current = requestAnimationFrame(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        mouseRafRef.current = null;
        return;
      }
      const x = (e.clientX - rect.left - rect.width / 2) / 12;
      const y = (e.clientY - rect.top - rect.height / 2) / 12;
      const limit = 6;
      const dist = Math.sqrt(x * x + y * y);
      if (dist > limit) {
        setMousePos({
          x: (x / dist) * limit,
          y: (y / dist) * limit,
        });
      } else {
        setMousePos({ x, y });
      }
      mouseRafRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleCleanSpot = (index) => {
    setSpots((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  const handleBrushAll = () => {
    setSpots([false, false, false]);
  };

  const handleFeedWuffi = () => {
    setSpots([true, true, true]);
  };

  // Slider Handlers
  const handlePrevReview = () => {
    setActiveReviewIndex((prev) =>
      prev === 0 ? REVIEWS.length - 1 : prev - 1,
    );
  };

  const handleNextReview = () => {
    setActiveReviewIndex((prev) =>
      prev === REVIEWS.length - 1 ? 0 : prev + 1,
    );
  };

  // Booking Form Submission Handlers
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSubmitted(true);
    setTimeout(() => {
      setBookingSubmitted(false);
      setShowBookingModal(false);
      // Reset form
      setBookingForm({
        name: "",
        email: "",
        phone: "",
        service: SERVICES[0].id,
        doctor: DOCTORS[0].id,
        date: "",
        time: "",
      });
    }, 2500);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 4200, // Starts exactly as the crossfade begins
          end: 7500, // Extended the end for a longer scroll duration
          scrub: 1,
        },
      });

      // 1. Overlay enters (0.0 to 0.2)
      tl.fromTo(
        overlayRef.current,
        { y: "100vh" },
        { y: "0%", ease: "power2.inOut", duration: 0.2 },
      )
        // 2. Overlay scrolls through its 200vh height (0.2 to 0.8)
        .to(overlayRef.current, { y: "-50%", ease: "none", duration: 0.6 })
        // 4. Overlay exits screen upwards (0.8 to 1.0)
        .to(
          overlayRef.current,
          { y: "-100%", ease: "power2.inOut", duration: 0.2 },
          0.8,
        );

      // -- TEXT ANIMATIONS --

      // Reveal animation: Fade in, scale up, unblur (0.1 to 0.25)
      tl.fromTo(
        textInnerRef.current,
        { opacity: 0, y: 50, scale: 0.8, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          ease: "power2.out",
          duration: 0.15,
        },
        0.1,
      );

      // Exit animation: Fade out, scale up, blur (0.3 to 0.4)
      tl.to(
        textInnerRef.current,
        {
          opacity: 0,
          y: -50,
          scale: 1.1,
          filter: "blur(10px)",
          ease: "power2.in",
          duration: 0.1,
        },
        0.3,
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={overlayRef}
      className="absolute top-0 left-0 w-full h-auto z-40 bg-white flex flex-col items-center justify-start"
      style={{ transform: "translateY(100vh)" }}
    >
      {/* Container for the hold effect */}
      <div
        ref={textContainerRef}
        className="w-full h-screen flex flex-col items-center justify-center"
      >
        <h2
          ref={textInnerRef}
          className="text-amber-950 text-[64px] font-medium font-['Fredoka'] text-center tracking-tight max-[850px]:text-[42px]"
          style={{ opacity: 0 }} // Starts invisible before JS kicks in
        >
          More magic to discover...
        </h2>
      </div>

      {/* INTEGRATED INTERACTIVE COMPONENTS */}
      <div
        id="app-root"
        className="w-full bg-white text-amber-950 font-sans selection:bg-amber-100 selection:text-amber-950 mt-16 overflow-hidden"
      >
        {/* SECTION 1: DISCOVER OUR SIGNATURE DENTAL SERVICES */}
        <section
          id="services"
          className="py-20 md:py-20 px-20 w-full mx-auto bg-white relative overflow-hidden"
        >
          {/* Title and Description Row */}
          <div
            id="services-header-grid"
            className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 relative z-10 w-full"
          >
            <div className="lg:w-1/2">
              <RevealHeading
                as="h1"
                className="font-['Fredoka'] text-4xl sm:text-5xl lg:text-6xl font-semibold text-amber-950 tracking-tight leading-[1.05]"
              >
                A Heart Full of Wonder
              </RevealHeading>
            </div>
            <div className="lg:w-[40%]">
              <RevealParagraph className="text-amber-900/70 text-sm sm:text-xl leading-relaxed font-normal">
                Every flower hides a tiny surprise, every breeze carries a new
                adventure. Wuffi sees magic where others see the ordinary,
                reminding us that curiosity can turn even the smallest moments
                into unforgettable memories.
              </RevealParagraph>
            </div>
          </div>

          {/* Content Layout: 3 Interactive Service Cards */}
          <div
            id="services-content-grid"
            className="w-full relative z-10"
          >
            <div id="services-cards-wrapper" className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
                {SERVICES.map((service, index) => (
                  <motion.div
                    id={`service-card-${service.id}`}
                    key={service.id}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    whileHover={{ y: -8 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: index * 0.15,
                    }}
                    className="group relative h-[360px] rounded-[1.75rem] overflow-hidden bg-neutral-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Service Image */}
                    <img
                      src={service.image}
                      alt="Wuffi moment"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Plain visual overlay (gradual shading at the bottom for readability) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-50" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: EXCELLENCE IN DENTISTRY WITH COMPASSIONATE CARE */}
        <section
          id="about"
          className="py-20 md:py-20 md:pb-36 px-20 w-full mx-auto bg-white  relative overflow-hidden"
        >
          {/* Subtle background golden glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl" />
            <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
          </div>

          <div
            id="about-content-grid"
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative z-10"
          >
            {/* Left Column: Big rounded Treatment Image + Stats Grid Underneath */}
            <div
              id="about-visuals-column"
              className="lg:col-span-6 flex flex-col space-y-10"
            >
              {/* Big Rounded Image */}
              <div
                id="about-image-frame"
                className="rounded-[2.5rem] overflow-hidden bg-amber-50/50 shadow-sm relative h-[400px]"
              >
                <video
                  src="/wuffi-talking-video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-700"
                />
              </div>

              {/* Dedicated descriptive paragraph replacing the statistics row - Warm Amber Tint */}
              <RevealParagraph className="text-amber-900/70 text-xl leading-relaxed font-normal pt-4">
                Simple moments become extraordinary when seen through curious
                eyes. Wuffi invites you to slow down, explore with an open
                heart, and rediscover the magic hidden in everyday nature. From
                golden wildflowers to quiet forest trails, every little
                discovery becomes a reminder that wonder is always waiting for
                those who choose to look.
              </RevealParagraph>
            </div>

            {/* Right Column: About Info & Dentist Profiles */}
            <div
              id="about-text-column"
              className="lg:col-span-6 flex flex-col space-y-10 lg:pl-4"
            >
              {/* Header, Title, and Desc */}
              <div className="space-y-6">
                <RevealHeading className="font-['Fredoka'] text-4xl sm:text-5xl lg:text-6xl font-semibold text-amber-950 tracking-tight leading-[1.05]">
                  Every Step Tells a Story
                </RevealHeading>
                <RevealParagraph
                  className="text-amber-900/70 text-xl
                 sm:text-xl leading-relaxed font-normal"
                >
                  The forest is more than a home—it's a place where every moment
                  holds a new adventure. Every hidden trail, every dancing
                  butterfly, every blooming flower, and every beam of warm
                  sunlight invites Wuffi to explore a little further. Guided by
                  curiosity and a heart full of wonder, Wuffi discovers that the
                  greatest adventures aren't found at the end of the
                  path—they're created in the little moments shared along the
                  way.
                </RevealParagraph>
              </div>

              {/* cards section" */}
              <div id="team" className="space-y-5 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {DOCTORS.map((doc, index) => (
                    <motion.div
                      id={`doctor-card-${doc.id}`}
                      key={doc.id}
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      whileHover={{ y: -5 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: index * 0.15,
                      }}
                      className="group relative rounded-2xl overflow-hidden bg-amber-50 h-[240px] shadow-sm"
                    >
                      {/* Doctor Photo */}
                      <img
                        src={doc.image}
                        alt="Wuffi companion"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />

                      {/* Card overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-50" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
