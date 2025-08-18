import React, { useId, useMemo } from "react";

export default function HeartbeatLine({
  width = 1500,
  height = 500,
  strokeWidth = 0.8,
  opacity = 1,
  className = "",
  showGlow = true,
  background = "transparent",
  repeats = 3,   // số lần lặp nhịp tim
  scale = 2      // độ phóng to nhịp tim
}) {
  const gid = useId();

  // Path cho 1 nhịp tim
  const pathD = useMemo(() => {
    return [
      "M 0 60",
      "L 13 60",
      "L 18 25",
      "L 22 70",
      "L 25 40",
      "L 27 60",
      "L 37 60",
      "L 39 73",
      "L 41 41",
      "L 45 71",
      "L 46 60",
      "L 60 60",
      "L 63 56",
      "L 65 70",
      "L 67 60",
      "L 71 60",
      "L 72 43",
      "L 74 78",
      "L 76 60",
      "L 98 60",
      "L 101 28",
      "L 107 80",
      "L 109 52",
      "L 112 70",
      "L 112 60",
      "L 120 60",
      "L 122 76",
      "L 125 40",
      "L 127 60",
      "L 140 60"
    ].join(" ");
  }, []);

  // Lặp lại pathD theo trục X
  const tiledPath = useMemo(() => {
    const seg = 140; // độ dài 1 nhịp tim
    const parts = [];
    for (let i = 0; i < repeats; i++) {
      const offset = i * seg;
      parts.push(
        pathD.replace(
          /(\d+\.?\d*)\s(\d+\.?\d*)/g,
          (m, x, y) => `${parseFloat(x) + offset} ${y}`
        )
      );
    }
    return parts.join(" ");
  }, [pathD, repeats]);

  const viewWidth = 140 * repeats;

  return (
    <div
      className={`relative ${background} ${className}`}
      style={{ width, height }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewWidth * scale} ${120 * scale}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`hb-grad-${gid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1eae75" />
            <stop offset="35%" stopColor="#7ad9bd" />
            <stop offset="65%" stopColor="#8fcbab" />
            <stop offset="100%" stopColor="#c6eebb" />
          </linearGradient>
          <filter id={`hb-glow-${gid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* baseline */}
        <path
          d={`M 0 60 L ${viewWidth} 60`}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
          transform={`scale(${scale},${scale})`}
        />

        {/* nhịp tim lặp 3 lần */}
        <path
          d={tiledPath}
          stroke={`url(#hb-grad-${gid})`}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
          transform={`scale(${scale},${scale})`}
          style={{
            filter: showGlow ? `url(#hb-glow-${gid})` : undefined,
            opacity,
          }}
        />
      </svg>
    </div>
  );
}
