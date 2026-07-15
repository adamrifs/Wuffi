import { useEffect, useRef } from 'react';

/**
 * High-performance custom cursor — zero React re-renders.
 * All positioning uses requestAnimationFrame for buttery-smooth 60fps tracking.
 * Click scale uses direct style mutation on the img element.
 */
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const imgRef = useRef(null);
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const img = imgRef.current;
    if (!cursor || !img) return;

    // Use transform instead of left/top for GPU-accelerated positioning
    const updatePosition = () => {
      cursor.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      rafRef.current = null;
    };

    const handleMouseMove = (e) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updatePosition);
      }
    };

    const handleMouseDown = () => {
      img.style.transform = 'scale(0.85)';
    };

    const handleMouseUp = () => {
      img.style.transform = 'scale(1)';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        top: 0,
        left: 0,
        willChange: 'transform',
      }}
    >
      <img
        ref={imgRef}
        src="/corn.svg"
        alt=""
        style={{
          width: '32px',
          height: '32px',
          transition: 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
          transformOrigin: 'top left',
          display: 'block',
        }}
      />
    </div>
  );
};

export default CustomCursor;
