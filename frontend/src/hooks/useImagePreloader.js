import { useState, useEffect, useRef } from "react";

export function useImagePreloader(framePrefix, totalFrames) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const imagesRef = useRef([]);

  useEffect(() => {
    let isCancelled = false;

    const loadImages = async () => {
      let loadedCount = 0;
      const loadedImages = new Array(totalFrames);

      const loadImage = async (index) => {
        const frameNumber = String(index).padStart(6, "0");
        const url = `${framePrefix}frame_${frameNumber}.png`;

        try {
          const response = await fetch(url);
          const blob = await response.blob();
          
          if (window.createImageBitmap) {
            loadedImages[index] = await createImageBitmap(blob);
          } else {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            await new Promise((resolve, reject) => {
              img.onload = () => resolve(img);
              img.onerror = reject;
            });
            loadedImages[index] = img;
          }
        } catch (error) {
          console.error(`Failed to load image at index ${index}`, error);
        }

        loadedCount++;
        if (!isCancelled) {
          setProgress(Math.round((loadedCount / totalFrames) * 100));
        }
      };

      // Load images in batches to prevent overwhelming the browser
      const concurrency = 10;
      for (let i = 0; i < totalFrames; i += concurrency) {
        if (isCancelled) break;
        const batch = [];
        for (let j = 0; j < concurrency && i + j < totalFrames; j++) {
          batch.push(loadImage(i + j));
        }
        await Promise.all(batch);
      }

      if (!isCancelled) {
        imagesRef.current = loadedImages;
        setIsLoaded(true);
      }
    };

    loadImages();

    return () => {
      isCancelled = true;
    };
  }, [framePrefix, totalFrames]);

  return { progress, isLoaded, imagesRef };
}
