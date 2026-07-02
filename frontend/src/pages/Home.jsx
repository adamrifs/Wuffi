import { useRef } from "react";
import { useImagePreloader } from "../hooks/useImagePreloader";
import { LoadingScreen } from "../components/LoadingScreen";
import { CanvasRenderer } from "../components/CanvasRenderer";
import { ScrollController } from "../components/ScrollController";

import { HeroOverlay } from "../components/HeroOverlay";

const TOTAL_FRAMES = 240;
const FRAME_PREFIX = "/frames_Wuffi.mp4_30fps_png/";

export default function Home() {
  const { progress, isLoaded, imagesRef } = useImagePreloader(
    FRAME_PREFIX,
    TOTAL_FRAMES,
  );

  // Mutable ref shared between ScrollController (writer) and CanvasRenderer (reader)
  const frameRef = useRef(0);

  return (
    // position:relative, no overflow:hidden — let the page scroll naturally
    <main style={{ position: "relative", width: "100%", background: "#000" }}>
      <LoadingScreen progress={progress} isLoaded={isLoaded} />

      {isLoaded && (
        <ScrollController frameRef={frameRef} totalFrames={TOTAL_FRAMES}>
          {/* Canvas is position:fixed so it's always fullscreen.
              This div just provides stacking context for overlays. */}
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <CanvasRenderer imagesRef={imagesRef} frameRef={frameRef} />
            <HeroOverlay />
          </div>
        </ScrollController>
      )}
    </main>
  );
}
