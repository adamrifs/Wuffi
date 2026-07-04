import { useState, useEffect, useRef } from "react";

export function useImagePreloader(sequences) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const imagesRef = useRef([]);

  useEffect(() => {
    let isCancelled = false;

    const loadImages = async () => {
      let loadedCount = 0;
      const totalFramesToLoad = sequences.reduce((sum, seq) => sum + seq.count, 0);
      const allLoadedImages = sequences.map(seq => new Array(seq.count));

      const loadImage = async (seqIndex, frameIndex) => {
        const frameNumber = String(frameIndex).padStart(6, "0");
        const url = `${sequences[seqIndex].prefix}frame_${frameNumber}.png`;

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
  }, [JSON.stringify(sequences)]);

  return { progress, isLoaded, imagesRef };
}
