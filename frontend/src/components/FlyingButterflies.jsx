import { useMemo } from "react";

/**
 * FlyingButterflies — pure CSS animations instead of Framer Motion.
 * The flap animation is defined once and shared. Each butterfly path
 * uses its own CSS keyframe for position/rotation.
 */
export function FlyingButterflies() {
  const butterflies = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => {
      const startX = Math.random() * 120 - 10;
      const startY = Math.random() * 50 + 50;
      const endX = startX + (Math.random() * 40 - 20);
      const endY = startY - 100;

      return {
        id: i,
        size: Math.random() * 15 + 15,
        startX,
        startY,
        endX,
        endY,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * -20,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {butterflies.map((b) => (
        <div
          key={b.id}
          className="absolute"
          style={{
            width: b.size,
            height: b.size,
            animation: `butterfly-fly-${b.id} ${b.duration}s ease-in-out ${b.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g style={{ animation: 'butterfly-flap 0.3s ease-in-out infinite alternate', transformOrigin: 'center' }}>
              <path
                d="M50 50 C 30 20, 10 10, 5 30 C 0 50, 20 70, 50 50 Z"
                fill="rgba(255, 234, 153, 0.8)"
              />
              <path
                d="M50 50 C 70 20, 90 10, 95 30 C 100 50, 80 70, 50 50 Z"
                fill="rgba(255, 234, 153, 0.8)"
              />
            </g>
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes butterfly-flap {
          0%   { transform: scaleX(1); }
          100% { transform: scaleX(0.1); }
        }
        ${butterflies.map((b) => `
          @keyframes butterfly-fly-${b.id} {
            0%   { transform: translate3d(${b.startX}vw, ${b.startY}vh, 0) rotate(0deg); opacity: 0; }
            10%  { opacity: 1; }
            50%  { transform: translate3d(${(b.startX + b.endX) / 2}vw, ${(b.startY + b.endY) / 2}vh, 0) rotate(15deg); opacity: 1; }
            90%  { opacity: 1; }
            100% { transform: translate3d(${b.endX}vw, ${b.endY}vh, 0) rotate(-10deg); opacity: 0; }
          }
        `).join('')}
      `}</style>
    </div>
  );
}
