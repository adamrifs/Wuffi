import { useRef } from "react";
import { useImagePreloader } from "../hooks/useImagePreloader";
import { LoadingScreen } from "../components/LoadingScreen";
import { CanvasRenderer } from "../components/CanvasRenderer";
import { ScrollController } from "../components/ScrollController";

import { HeroOverlay } from "../components/HeroOverlay";
import { SectionTwoOverlay } from "../components/SectionTwoOverlay";
import { WhiteSectionOverlay } from "../components/WhiteSectionOverlay";

const SEQUENCES = [
  { prefix: "/frames_Wuffi.mp4_30fps_png/", count: 240 },
  { prefix: "/frames_Wuffi_playing_with_butterfly.mp4_30fps_png/", count: 240 }
];
const OVERLAP_FRAMES = 30;
const TOTAL_FRAMES = SEQUENCES[0].count + SEQUENCES[1].count - OVERLAP_FRAMES;

export default function Home() {
  const { progress, isLoaded, imagesRef } = useImagePreloader(SEQUENCES);

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
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            <CanvasRenderer imagesRef={imagesRef} frameRef={frameRef} />
            <HeroOverlay />
            <WhiteSectionOverlay />
            <SectionTwoOverlay />
          </div>
        </ScrollController>
      )}
    </main>
  );
}
