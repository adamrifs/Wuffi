import { useRef } from "react";
import { useImagePreloader } from "../hooks/useImagePreloader";
import { LoadingScreen } from "../components/LoadingScreen";
import { CanvasRenderer } from "../components/CanvasRenderer";
import { ScrollController } from "../components/ScrollController";
import { ForestExplorer } from "../components/ForestExplorer";

import { HeroOverlay } from "../components/HeroOverlay";
import { SectionTwoOverlay } from "../components/SectionTwoOverlay";
import { WhiteSectionOverlay } from "../components/WhiteSectionOverlay";
import { MagicalOverlay } from "../components/MagicalOverlay";

// Scroll-driven sequences (6-digit, 0-indexed)
const SEQUENCES = [
  {
    prefix: "/wuffi-intro/",
    count: 240,
    urlBuilder: (i) =>
      `/wuffi-intro/frame_${String(i + 1).padStart(4, "0")}.png`,
  },
  { prefix: "/wuffi-playing/", count: 240 },
  {
    prefix: "/wuffi-forest/",
    count: 192,
    urlBuilder: (i) =>
      `/wuffi-forest/frame_${String(i + 1).padStart(4, "0")}.png`,
  },
];
const OVERLAP_FRAMES = 30;
const MAIN_TOTAL_FRAMES = SEQUENCES[0].count + SEQUENCES[1].count - OVERLAP_FRAMES;

// Idle sequence (4-digit, 1-indexed — e.g. frame_0001.png)
const IDLE_SEQUENCES = [
  {
    prefix: "/wuffi-idle/",
    count: 192,
    urlBuilder: (i) =>
      `/wuffi-idle/frame_${String(i + 1).padStart(4, "0")}.png`,
  },
];

export default function Home() {
  const { progress, isLoaded, imagesRef } = useImagePreloader(SEQUENCES);
  const { isLoaded: idleLoaded, imagesRef: idleImagesRef } =
    useImagePreloader(IDLE_SEQUENCES);

  // Mutable ref shared between ScrollController (writer) and CanvasRenderer (reader)
  const frameRef = useRef(0);
  // Tracks whether the user has started scrolling
  const scrolledRef = useRef(false);
  // Tracks scroll progress for the forest section (0 to 1)
  const forestProgressRef = useRef(0);

  return (
    // position:relative, no overflow:hidden — let the page scroll naturally
    <main style={{ position: "relative", width: "100%", background: "#000" }}>
      <LoadingScreen progress={progress} isLoaded={isLoaded} />

      {isLoaded && (
        <ScrollController
          frameRef={frameRef}
          scrolledRef={scrolledRef}
          forestProgressRef={forestProgressRef}
          totalFrames={MAIN_TOTAL_FRAMES}
        >
          {/* Canvas is position:fixed so it's always fullscreen.
              This div just provides stacking context for overlays. */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <CanvasRenderer
              imagesRef={imagesRef}
              frameRef={frameRef}
              scrolledRef={scrolledRef}
              idleImagesRef={idleLoaded ? idleImagesRef : null}
              idleCount={192}
            />
            <MagicalOverlay />
            <HeroOverlay />
            <WhiteSectionOverlay />
            <SectionTwoOverlay />
            <ForestExplorer
              forestProgressRef={forestProgressRef}
              frameRef={frameRef}
              startFrame={MAIN_TOTAL_FRAMES}
            />
          </div>
        </ScrollController>
      )}
    </main>
  );
}
