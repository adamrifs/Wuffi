import { useEffect, useRef } from "react";

export function CanvasRenderer({ imagesRef, frameRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    let animationFrameId;
    let lastRenderedFrame = -1;
    // These are the PHYSICAL pixel dimensions of the canvas buffer
    let bufferWidth = 0;
    let bufferHeight = 0;

    const handleResize = () => {
      // Device pixel ratio — typically 1 on standard screens, 2 on Retina/HiDPI
      const dpr = window.devicePixelRatio || 1;

      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight;

      // The canvas pixel BUFFER must match physical screen pixels for crisp rendering
      bufferWidth = Math.round(cssWidth * dpr);
      bufferHeight = Math.round(cssHeight * dpr);

      canvas.width = bufferWidth;
      canvas.height = bufferHeight;

      // The canvas CSS size stays at 100vw / 100vh (CSS pixels)
      // The browser handles the scaling — we just ensure the buffer is sharp
      // (no ctx.scale needed because we draw to physical pixels directly)

      lastRenderedFrame = -1; // force redraw after resize
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // run once on mount

    /**
     * Draw in COVER mode using the PHYSICAL pixel buffer dimensions.
     * This ensures the image is drawn at full resolution without upscaling blur.
     */
    const drawImageCover = (ctx, img, bw, bh) => {
      const iw = img.width;
      const ih = img.height;

      // Cover: scale so the image fills the entire buffer
      const scale = Math.max(bw / iw, bh / ih);

      const drawWidth = iw * scale;
      const drawHeight = ih * scale;

      // Center the image in the buffer
      const drawX = (bw - drawWidth) / 2;
      const drawY = (bh - drawHeight) / 2;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    const OVERLAP_FRAMES = 30;
    const SEQ1_COUNT = 240;

    const renderLoop = () => {
      const currentFrame = frameRef.current;
      const roundedFrame = Math.round(currentFrame);

      if (roundedFrame !== lastRenderedFrame) {
        const sequences = imagesRef.current;
        if (sequences && sequences.length >= 2) {
          const seq1 = sequences[0];
          const seq2 = sequences[1];

          let img1 = null;
          let img2 = null;
          let alpha2 = 0;

          if (currentFrame < SEQ1_COUNT - OVERLAP_FRAMES) {
            // Pure seq 1
            img1 = seq1[Math.min(SEQ1_COUNT - 1, roundedFrame)];
          } else if (currentFrame < SEQ1_COUNT) {
            // Crossfade
            img1 = seq1[Math.min(SEQ1_COUNT - 1, roundedFrame)];
            
            // Frame index for seq 2 starts at 0 when currentFrame hits (SEQ1_COUNT - OVERLAP_FRAMES)
            const seq2Index = roundedFrame - (SEQ1_COUNT - OVERLAP_FRAMES);
            img2 = seq2[Math.max(0, Math.min(seq2.length - 1, seq2Index))];
            
            alpha2 = (currentFrame - (SEQ1_COUNT - OVERLAP_FRAMES)) / OVERLAP_FRAMES;
          } else {
            // Pure seq 2
            const seq2Index = roundedFrame - (SEQ1_COUNT - OVERLAP_FRAMES);
            img2 = seq2[Math.max(0, Math.min(seq2.length - 1, seq2Index))];
            alpha2 = 1;
          }

          // Clear buffer before drawing
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, bufferWidth, bufferHeight);

          if (img1 && alpha2 < 1) {
            ctx.globalAlpha = 1;
            drawImageCover(ctx, img1, bufferWidth, bufferHeight, false); 
          }
          if (img2 && alpha2 > 0) {
            ctx.globalAlpha = alpha2;
            drawImageCover(ctx, img2, bufferWidth, bufferHeight, false);
          }
          
          ctx.globalAlpha = 1;
          lastRenderedFrame = roundedFrame;
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imagesRef, frameRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        // CSS display size: always fill the visible viewport
        width: "100vw",
        height: "100vh",
        display: "block",
        maxWidth: "100vw",
      }}
    />
  );
}
