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

      // Make the array immediately available to the renderer
      imagesRef.current = allLoadedImages;

      const loadImage = async (seqIndex, frameIndex) => {
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
          
          // Optimization: Unblock the UI early.
          // Once we have a reasonable amount of frames loaded (e.g. 15 frames), start the experience.
          const threshold = Math.min(15, totalFramesToLoad);
          if (loadedCount >= threshold) {
            setIsLoaded(true);
          }
        }
      };

      // To optimize rendering, load frame 0-4 of every sequence first
      // so that if the user scrolls quickly, the beginning of sequences are ready.
      const priorityQueue = [];
      const backgroundQueue = [];

      for (let seqIndex = 0; seqIndex < sequences.length; seqIndex++) {
        for (let frameIndex = 0; frameIndex < sequences[seqIndex].count; frameIndex++) {
          if (frameIndex < 5) {
            priorityQueue.push({ seqIndex, frameIndex });
          } else {
            backgroundQueue.push({ seqIndex, frameIndex });
          }
        }
      }

      const processQueue = async (queue, concurrency) => {
        let activePromises = [];
        for (const { seqIndex, frameIndex } of queue) {
          if (isCancelled) break;
          activePromises.push(loadImage(seqIndex, frameIndex));
          if (activePromises.length >= concurrency) {
            await Promise.all(activePromises);
            activePromises = [];
          }
        }
        if (activePromises.length > 0) {
          await Promise.all(activePromises);
        }
      };

      // Load priority queue first
      await processQueue(priorityQueue, 10);
      
      // Then load the rest in the background with higher concurrency to fetch faster
      await processQueue(backgroundQueue, 20);

      if (!isCancelled) {
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
