import { useState, useEffect, useRef, useMemo, memo } from "react";

export const SketchyBorder = memo(({ seed, color }) => {
  const [size, setSize] = useState({ w: 300, h: 400 });
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current?.parentElement) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    observer.observe(svgRef.current.parentElement);
    return () => observer.disconnect();
  }, []);

  const pathD = useMemo(() => {
    let s = seed || 1;
    const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const random = (min, max) => min + rng() * (max - min);
    
    const step = 8;
    const points = [];
    const { w, h } = size;

    for (let x = 0; x <= w; x += step) points.push([x + random(-1, 1), (x === 0 || x >= w) ? random(-3, 3) : random(-2.5, 2.5)]);
    for (let y = step; y <= h; y += step) points.push([w + (y >= h ? random(-3, 3) : random(-2.5, 2.5)), y + random(-1, 1)]);
    for (let x = w - step; x >= 0; x -= step) points.push([x + random(-1, 1), h + (x <= 0 ? random(-3, 3) : random(-2.5, 2.5))]);
    for (let y = h - step; y > 0; y -= step) points.push([random(-2.5, 2.5), y + random(-1, 1)]);

    return `M ${points.map(p => `${p[0]},${p[1]}`).join(" L ")} Z`;
  }, [size, seed]);

  return (
    <svg 
      ref={svgRef}
      preserveAspectRatio="none" 
      viewBox={`-4 -4 ${size.w + 8} ${size.h + 8}`} 
      style={{ position: "absolute", inset: "-4px", width: "calc(100% + 8px)", height: "calc(100% + 8px)", pointerEvents: "none", zIndex: 10 }}
    >
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.6" opacity="0.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

export const Sparkler = memo(({ style }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" style={{ position: "absolute", ...style, pointerEvents: "none" }}>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <line
        key={angle}
        x1="12" y1="12" x2="20" y2="12"
        stroke="#FFB800"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="sparkle-line"
        style={{
          transformOrigin: "12px 12px",
          "--angle": `${angle}deg`,
          animation: `sparkleLine 0.8s ease-in-out ${i * 0.1}s infinite`,
        }}
      />
    ))}
  </svg>
));
