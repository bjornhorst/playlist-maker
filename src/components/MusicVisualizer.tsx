import React, { useEffect, useState } from "react";

const MusicVisualizer = () => {
  const totalBars = 175;
  const [heights, setHeights] = useState<number[]>(
    Array.from({ length: totalBars }, () => 40 + Math.random() * 30)
  );

  // Create animation effect by periodically updating heights
  useEffect(() => {
    const intervalId = setInterval(() => {
      setHeights(
        Array.from({ length: totalBars }, () => 60 + Math.random() * 80)
      );
    }, 800);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 flex items-end justify-center h-full w-full opacity-20 overflow-hidden pointer-events-none">
      <div className="absolute bottom-12 left-0 right-0 flex items-end justify-center gap-1.5 w-full pb-0">
        {Array.from({ length: totalBars }, (_, i) => {
          const height = heights[i];

          return (
            <div
              key={i}
              className="visualizer-bar bg-green-500/50 w-1.5 rounded-t-full transition-all duration-700 ease-in-out"
              style={{
                height: `${height}px`,
                minHeight: "20px",
                maxHeight: "160px",
                animationDelay: `${i * 0.1}s`,
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default MusicVisualizer;
