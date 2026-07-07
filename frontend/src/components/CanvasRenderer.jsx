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
    // These are the PHYSICAL pixel dimensions of the canvas buffer
    let bufferWidth = 0;
    let bufferHeight = 0;

    // --- Idle animation state ---
    let idleFrame = 0;                // current frame within the idle loop (float)
    let idleLastTime = -1;            // -1 means "not yet initialised"
    let lastValidIdleImg = null;      // fallback: last frame we successfully drew
    const IDLE_FPS = 30;

    // --- Crossfade state ---
    // When user starts scrolling we crossfade from idle → scroll sequence
    let crossfadeAlpha = 0;          // 0 = pure idle, 1 = pure scroll
    let wasScrolled = false;          // tracks previous scroll state to detect re-entry
    const CROSSFADE_SPEED = 0.03;    // slow and smooth transition (~33 frames = ~0.5 seconds)

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight;
      bufferWidth = Math.round(cssWidth * dpr);
      bufferHeight = Math.round(cssHeight * dpr);
      canvas.width = bufferWidth;
      canvas.height = bufferHeight;
      lastRenderedFrame = -1; // force redraw after resize
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    /**
     * Draw in COVER mode using the PHYSICAL pixel buffer dimensions.
     * extraScale is used for the quick zoom transition effect.
     */
    const drawImageCover = (ctx, img, bw, bh, extraScale = 1.0) => {
      const iw = img.width;
      const ih = img.height;
      const scale = Math.max(bw / iw, bh / ih) * extraScale;
      const drawWidth = iw * scale;
      const drawHeight = ih * scale;
      const drawX = (bw - drawWidth) / 2;
      const drawY = (bh - drawHeight) / 2;
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    const OVERLAP_FRAMES = 30;
    const SEQ1_COUNT = 240;

    const renderLoop = (now) => {
      const sequences = imagesRef.current;
      const hasScrolled = scrolledRef?.current ?? false;
      const hasIdle = idleImagesRef?.current?.[0] != null;

      // --- Update crossfade alpha ---
      if (hasScrolled) {
        crossfadeAlpha = Math.min(1, crossfadeAlpha + CROSSFADE_SPEED);
      } else {
        crossfadeAlpha = Math.max(0, crossfadeAlpha - CROSSFADE_SPEED);
      }

      // --- Advance idle frame at IDLE_FPS ---
      if (hasIdle && crossfadeAlpha < 1) {
        // Reset the clock if: first time, or re-entering idle from scroll
        if (idleLastTime < 0 || wasScrolled) {
          idleLastTime = now;
        }
        const elapsed = Math.min(now - idleLastTime, 100); // cap at 100ms to avoid a huge jump after tab is hidden
        idleLastTime = now;
        // Just increment infinitely, we'll use modulo math below to ping-pong
        idleFrame = idleFrame + (elapsed / 1000) * IDLE_FPS;
      }
      wasScrolled = hasScrolled;

      // --- Decide what to draw ---
      const currentFrame = frameRef.current;
      const roundedFrame = Math.round(currentFrame);
      
      // Ping-pong loop: plays 0 -> 191, then 191 -> 0, creating a mathematically perfect seamless loop
      const L = idleCount - 1;
      const cycle = 2 * L;
      const x = Math.floor(idleFrame) % cycle;
      const roundedIdle = x <= L ? x : cycle - x;

      // Only skip if nothing has changed at all (saves GPU work)
      const needsRedraw =
        crossfadeAlpha > 0 || // actively crossfading
        crossfadeAlpha < 1 || // idle is showing
        roundedFrame !== lastRenderedFrame;

      if (!needsRedraw) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, bufferWidth, bufferHeight);

      // --- Calculate dynamic zoom and blur for the transition effect ---
      // This creates a mathematical parabolic curve: it is 0 at both ends (alpha 0 and 1), and peaks at 1 in the exact middle (alpha 0.5)
      const transitionPeak = Math.sin(crossfadeAlpha * Math.PI);
      const currentBlur = transitionPeak * 25; // peaks at 25px blur
      const currentZoom = 1.0 + (transitionPeak * 0.15); // peaks at 1.15x scale
      
      // Apply the dynamic blur to the canvas context
      if (currentBlur > 0.1) {
        ctx.filter = `blur(${currentBlur}px)`;
      } else {
        ctx.filter = "none";
      }

      // ---- IDLE LAYER ----
      if (hasIdle && crossfadeAlpha < 1) {
        const idleImg = idleImagesRef.current[0][roundedIdle];
        // Use the current frame if valid, otherwise fall back to the last good frame
        // This prevents a single black flash when a frame is undefined at the loop boundary
        const frameToDraw = idleImg || lastValidIdleImg;
        if (idleImg) lastValidIdleImg = idleImg; // update fallback
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
        const seq3Start = seq2Start + seq2.length; // No overlap between seq2 and seq3

        let img1 = null;
        let img2 = null;
        let alpha2 = 0;

        if (currentFrame < seq2Start) {
          // Pure Sequence 1
          img1 = seq1[Math.min(seq1.length - 1, roundedFrame)];
        } else if (currentFrame < SEQ1_COUNT) {
          // Crossfade Sequence 1 -> Sequence 2
          img1 = seq1[Math.min(seq1.length - 1, roundedFrame)];
          const seq2Index = roundedFrame - seq2Start;
          img2 = seq2[Math.max(0, Math.min(seq2.length - 1, seq2Index))];
          alpha2 = (currentFrame - seq2Start) / OVERLAP_FRAMES;
        } else if (!seq3 || currentFrame < seq3Start) {
          // Pure Sequence 2
          const seq2Index = roundedFrame - seq2Start;
          img2 = seq2[Math.max(0, Math.min(seq2.length - 1, seq2Index))];
          alpha2 = 1;
        } else {
          // Pure Sequence 3 (Wuffi Forest)
          const seq3Index = roundedFrame - seq3Start;
          // Continue playing normally
          img2 = seq3[Math.max(0, Math.min(seq3.length - 1, seq3Index))];
          alpha2 = 1;
        }

        if (img1 && alpha2 < 1) {
          ctx.globalAlpha = crossfadeAlpha;
          drawImageCover(ctx, img1, bufferWidth, bufferHeight, currentZoom);
        }
        if (img2 && alpha2 > 0) {
          // Note: don't apply zoom to the sequence crossfade, only the idle crossfade
          ctx.globalAlpha = crossfadeAlpha * alpha2;
          drawImageCover(ctx, img2, bufferWidth, bufferHeight, 1.0);
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
        transition: "opacity 0s", // Instant handoff to prevent ghosting
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
