import { useEffect, useRef } from "react";

export function CanvasRenderer({ imagesRef, frameRef, scrolledRef, idleImagesRef, idleCount }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    let animationFrameId;
    let lastRenderedFrame = -1;
    let bufferWidth = 0;
    let bufferHeight = 0;

    // --- Idle animation state ---
    let idleFrame = 0;                
    let idleLastTime = -1;            
    let lastValidIdleImg = null;      
    const IDLE_FPS = 30;

    // --- Crossfade state ---
    let crossfadeAlpha = 0;          
    let wasScrolled = false;          
    const CROSSFADE_SPEED = 0.03;    

    // --- Scroll fallback state ---
    let lastValidImg1 = null;
    let lastValidImg2 = null;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight;
      bufferWidth = Math.round(cssWidth * dpr);
      bufferHeight = Math.round(cssHeight * dpr);
      canvas.width = bufferWidth;
      canvas.height = bufferHeight;
      lastRenderedFrame = -1; 
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const drawImageCover = (ctx, img, bw, bh, extraScale = 1.0) => {
      if (!img) return;
      const iw = img.width;
      const ih = img.height;
      if (!iw || !ih) return; // In case the image is somehow broken
      const scale = Math.max(bw / iw, bh / ih) * extraScale;
      const drawWidth = iw * scale;
      const drawHeight = ih * scale;
      const drawX = (bw - drawWidth) / 2;
      const drawY = (bh - drawHeight) / 2;
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    const OVERLAP_FRAMES = 30;
    const SEQ1_COUNT = 240;

    // Helper to fallback to nearest previous loaded frame if target is missing
    const getNearestFrame = (seq, index) => {
      if (seq[index]) return seq[index];
      // search backwards
      for (let i = index - 1; i >= 0; i--) {
         if (seq[i]) return seq[i];
      }
      return null;
    };

    const renderLoop = (now) => {
      const sequences = imagesRef.current;
      const hasScrolled = scrolledRef?.current ?? false;
      const hasIdle = idleImagesRef?.current?.[0] != null;

      if (hasScrolled) {
        crossfadeAlpha = Math.min(1, crossfadeAlpha + CROSSFADE_SPEED);
      } else {
        crossfadeAlpha = Math.max(0, crossfadeAlpha - CROSSFADE_SPEED);
      }

      if (hasIdle && crossfadeAlpha < 1) {
        if (idleLastTime < 0 || wasScrolled) {
          idleLastTime = now;
        }
        const elapsed = Math.min(now - idleLastTime, 100);
        idleLastTime = now;
        idleFrame = idleFrame + (elapsed / 1000) * IDLE_FPS;
      }
      wasScrolled = hasScrolled;

      const currentFrame = frameRef.current;
      const roundedFrame = Math.round(currentFrame);
      
      const L = idleCount - 1;
      const cycle = 2 * L;
      const x = Math.floor(idleFrame) % cycle;
      const roundedIdle = x <= L ? x : cycle - x;

      const needsRedraw =
        crossfadeAlpha > 0 || 
        crossfadeAlpha < 1 || 
        roundedFrame !== lastRenderedFrame;

      if (!needsRedraw) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, bufferWidth, bufferHeight);

      const transitionPeak = Math.sin(crossfadeAlpha * Math.PI);
      const currentBlur = transitionPeak * 25; 
      const currentZoom = 1.0 + (transitionPeak * 0.15); 
      
      if (currentBlur > 0.1) {
        ctx.filter = `blur(${currentBlur}px)`;
      } else {
        ctx.filter = "none";
      }

      // ---- IDLE LAYER ----
      if (hasIdle && crossfadeAlpha < 1) {
        const idleImg = getNearestFrame(idleImagesRef.current[0], roundedIdle);
        const frameToDraw = idleImg || lastValidIdleImg;
        if (idleImg) lastValidIdleImg = idleImg; 
        if (frameToDraw) {
          ctx.globalAlpha = 1 - crossfadeAlpha;
          drawImageCover(ctx, frameToDraw, bufferWidth, bufferHeight, currentZoom);
        }
      }

      // ---- SCROLL LAYER ----
      if (sequences && sequences.length >= 2 && crossfadeAlpha > 0) {
        const seq1 = sequences[0];
        const seq2 = sequences[1];
        const seq3 = sequences.length > 2 ? sequences[2] : null;

        const seq2Start = SEQ1_COUNT - OVERLAP_FRAMES;
        const seq3Start = seq2Start + seq2.length; 

        let img1 = null;
        let img2 = null;
        let alpha2 = 0;

        if (currentFrame < seq2Start) {
          img1 = getNearestFrame(seq1, Math.min(seq1.length - 1, roundedFrame));
        } else if (currentFrame < SEQ1_COUNT) {
          img1 = getNearestFrame(seq1, Math.min(seq1.length - 1, roundedFrame));
          const seq2Index = roundedFrame - seq2Start;
          img2 = getNearestFrame(seq2, Math.max(0, Math.min(seq2.length - 1, seq2Index)));
          alpha2 = (currentFrame - seq2Start) / OVERLAP_FRAMES;
        } else if (!seq3 || currentFrame < seq3Start) {
          const seq2Index = roundedFrame - seq2Start;
          img2 = getNearestFrame(seq2, Math.max(0, Math.min(seq2.length - 1, seq2Index)));
          alpha2 = 1;
        } else {
          const seq3Index = roundedFrame - seq3Start;
          img2 = getNearestFrame(seq3, Math.max(0, Math.min(seq3.length - 1, seq3Index)));
          alpha2 = 1;
        }

        const frameToDraw1 = img1 || lastValidImg1;
        if (img1) lastValidImg1 = img1;
        if (frameToDraw1 && alpha2 < 1) {
          ctx.globalAlpha = crossfadeAlpha;
          drawImageCover(ctx, frameToDraw1, bufferWidth, bufferHeight, currentZoom);
        }

        const frameToDraw2 = img2 || lastValidImg2;
        if (img2) lastValidImg2 = img2;
        if (frameToDraw2 && alpha2 > 0) {
          ctx.globalAlpha = crossfadeAlpha * alpha2;
          drawImageCover(ctx, frameToDraw2, bufferWidth, bufferHeight, 1.0);
        }
      }

      ctx.globalAlpha = 1;
      ctx.filter = "none";
      lastRenderedFrame = roundedFrame;

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imagesRef, frameRef, scrolledRef, idleImagesRef, idleCount]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        transition: "opacity 0s",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        className="animate-slow-zoom"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
