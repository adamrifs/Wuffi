import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen({ progress, isLoaded }) {
  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111A12]"
        >
          {/* Subtle glow background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,80,50,0.3)_0%,transparent_70%)] opacity-50" />
          
          <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-8">
            {/* Logo placeholder */}
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-light text-[#E8F2E9] tracking-widest mb-12"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              WUFFI
            </motion.h1>

            {/* Loading Bar Container */}
            <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative mb-4">
              {/* Animated Progress Bar */}
              <motion.div
                className="h-full bg-gradient-to-r from-[#A3C9A6] to-[#E8F2E9]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>

            {/* Percentage Text */}
            <motion.p 
              className="text-[#A3C9A6]/70 text-sm font-medium tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {progress}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
