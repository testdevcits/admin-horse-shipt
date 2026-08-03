import React from "react";
import "../css/Loader.css";
import { PageSkeleton } from "./Skeleton";

const PageLoader = ({
  text = "Loading...",
  fullScreen = false,
  color = "#BF9B53",
  size = 18,
  overlay = false,
  variant = "skeleton",
}) => {
  if (variant === "skeleton" && !fullScreen && !overlay) {
    return <PageSkeleton />;
  }

  const cubes = Array.from({ length: 9 });
  const loaderSize = size;
  const wrapperClass = overlay
    ? "absolute inset-0 z-40 min-h-full bg-white/80 dark:bg-gray-900/80"
    : fullScreen
    ? "fixed inset-0 z-50 min-h-screen bg-white/90 dark:bg-gray-900/80"
    : "w-full min-h-[70vh]";
  const contentClass = overlay ? "min-h-[240px] -translate-y-4" : "";
  const textClass = "text-gray-900 dark:text-white";

  return (
    <div
      className={`flex flex-col items-center justify-center font-montserrat text-center ${wrapperClass}`}
    >
      <div className={`flex flex-col items-center ${contentClass}`}>
        <div
          className={fullScreen ? "cube-loader-fullscreen" : "cube-loader-root"}
          style={{ "--cube-size": `${loaderSize}px`, "--cube-color": color }}
        >
          <span className="sr-only">Loading…</span>
          <div className="cube-grid">
            {cubes.map((_, i) => (
              <div
                key={i}
                className="cube"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        </div>

        {text && (
          <p className={`mt-4 text-sm sm:text-base ${textClass}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageLoader;
