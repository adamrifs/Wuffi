import { useState, useEffect, useRef } from "react";

export function useImagePreloader(sequences) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const imagesRef = useRef([]);

  useEffect(() => {
    let isCancelled = false;
    setIsLoaded(false);
    setProgress(0);

    const loadImages = async () => {
      let loadedCount = 0;
      const totalFramesToLoad = sequences.reduce((sum, seq) => sum + seq.count, 0);
      const allLoadedImages = sequences.map(seq => new Array(seq.count));

      const loadImage = async (seqIndex, frameIndex) => {
        // Each sequence can supply its own urlBuilder function.
        // If not provided, fall back to the original 6-digit, 0-indexed format.
        const seq = sequences[seqIndex];
        const url = seq.urlBuilder
          ? seq.urlBuilder(frameIndex)
          : `${seq.prefix}frame_${String(frameIndex).padStart(6, "0")}.png`;

        try {
          const response = await fetch(url);
          const blob = await response.blob();
          
          if (window.createImageBitmap) {
            allLoadedImages[seqIndex][frameIndex] = await createImageBitmap(blob);
          } else {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            await new Promise((resolve, reject) => {
              img.onload = () => resolve(img);
              img.onerror = reject;
            });
            allLoadedImages[seqIndex][frameIndex] = img;
          }
        } catch (error) {
          console.error(`Failed to load image at index ${frameIndex}`, error);
        }

        loadedCount++;
        if (!isCancelled) {
          setProgress(Math.round((loadedCount / totalFramesToLoad) * 100));
        }
      };

      const concurrency = 10;
      let activePromises = [];

      for (let seqIndex = 0; seqIndex < sequences.length; seqIndex++) {
        for (let frameIndex = 0; frameIndex < sequences[seqIndex].count; frameIndex++) {
          if (isCancelled) break;
          
          activePromises.push(loadImage(seqIndex, frameIndex));
          
          if (activePromises.length >= concurrency) {
            await Promise.all(activePromises);
            activePromises = [];
          }
        }
      }
      
      if (activePromises.length > 0) {
         await Promise.all(activePromises);
      }

      if (!isCancelled) {
        imagesRef.current = allLoadedImages;
        setIsLoaded(true);
      }
    };

    loadImages();

    return () => {
      isCancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sequences.map(s => ({ prefix: s.prefix, count: s.count })))]);

  return { progress, isLoaded, imagesRef };
}
