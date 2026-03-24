import { memo } from "react";
import { PALETTE } from "../constants";

export const CanvasGrain = memo(() => (
  <div style={{ 
    position: "fixed", 
    inset: 0, 
    opacity: 0.04, 
    pointerEvents: "none", 
    zIndex: 1, 
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize: "100px 100px",
    transform: "translateZ(0)",
    backfaceVisibility: "hidden"
  }} />
));

export const WatercolourSplatters = memo(() => {
  const colors = [PALETTE.coral, PALETTE.blue, PALETTE.purple, PALETTE.magenta, PALETTE.orange];
  const opacities = [0.04, 0.05, 0.06, 0.07, 0.05, 0.04, 0.06, 0.07];
  return (
    <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, transform: "translateZ(0)", backfaceVisibility: "hidden" }}>
      <defs>
        <filter id="distort">
          <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="1" result="turb" />
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="12" />
        </filter>
      </defs>
      {[...Array(4)].map((_, i) => (
        <g key={i} filter="url(#distort)" style={{ opacity: opacities[i] }}>
          {[...Array(5)].map((__, j) => (
            <ellipse
              key={j}
              cx={`${5 + Math.random() * 90}%`}
              cy={`${5 + Math.random() * 90}%`}
              rx={60 + Math.random() * 200}
              ry={60 + Math.random() * 200}
              fill={colors[(i + j) % colors.length]}
              transform={`rotate(${Math.random() * 360})`}
            />
          ))}
        </g>
      ))}
    </svg>
  );
});

export const BrushStrokes = memo(() => (
  <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none", zIndex: 1, transform: "translateZ(0)", backfaceVisibility: "hidden" }}>
    <filter id="roughen">
      <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="1" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" />
    </filter>
    {/* Only apply filter on desktop/large screens via CSS if needed, or keep it light */}
    <g className="brush-layer">
      <path d="M-80,180 Q250,20 600,280 T1400,80" stroke={PALETTE.coral} strokeWidth="600" fill="none" strokeLinecap="round" transform="rotate(-5 600 180)" />
      <path d="M1400,750 Q1050,920 580,680 T-150,880" stroke={PALETTE.blue} strokeWidth="520" fill="none" strokeLinecap="round" transform="rotate(8 600 750)" />
      <path d="M180,1100 Q520,850 1150,1150" stroke={PALETTE.purple} strokeWidth="480" fill="none" strokeLinecap="round" />
      <path d="M-100,500 Q300,350 800,520 T1500,400" stroke={PALETTE.magenta} strokeWidth="420" fill="none" strokeLinecap="round" transform="rotate(3 700 500)" />
      <path d="M200,50 Q700,200 1100,30 T1600,120" stroke={PALETTE.orange} strokeWidth="380" fill="none" strokeLinecap="round" transform="rotate(-8 800 100)" />
    </g>
  </svg>
));

export const SketchyMarks = memo(() => (
  <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.09, pointerEvents: "none", zIndex: 1, transform: "translate3d(0,0,0)", willChange: "transform" }}>
    <circle cx="15%" cy="25%" r="55" fill="none" stroke="#2E3A5C" strokeWidth="1" strokeDasharray="4 4" transform="rotate(15 15% 25%)" />
    <circle cx="78%" cy="12%" r="38" fill="none" stroke={PALETTE.purple} strokeWidth="1" strokeDasharray="5 3" />
    <circle cx="90%" cy="70%" r="70" fill="none" stroke={PALETTE.coral} strokeWidth="1.2" strokeDasharray="3 5" />
    <circle cx="5%" cy="60%" r="44" fill="none" stroke={PALETTE.blue} strokeWidth="1" strokeDasharray="4 4" transform="rotate(-20 5% 60%)" />
    <circle cx="50%" cy="95%" r="30" fill="none" stroke="#2E3A5C" strokeWidth="1" strokeDasharray="3 3" />
    <circle cx="35%" cy="8%" r="50" fill="none" stroke={PALETTE.magenta} strokeWidth="1" strokeDasharray="5 4" />
    <path d="M85% 65% L92% 75% M87% 75% L94% 65%" stroke={PALETTE.purple} strokeWidth="1.5" strokeDasharray="3 2" />
    <path d="M5% 85% C 15 85, 25 95, 35% 85%" stroke="#2E3A5C" strokeWidth="1" fill="none" transform="rotate(-10 5% 85%)" />
    <path d="M60% 5% Q70% 15%, 80% 5%" stroke={PALETTE.orange} strokeWidth="1.2" fill="none" strokeDasharray="4 3" />
    <path d="M2% 45% L10% 50% M3% 52% L11% 47%" stroke={PALETTE.coral} strokeWidth="1.5" strokeDasharray="2 3" />
    <path d="M92% 30% Q96% 40%, 90% 48%" stroke="#2E3A5C" strokeWidth="1" fill="none" strokeDasharray="3 4" />
    <path d="M40% 92% L48% 98% M44% 98% L52% 92%" stroke={PALETTE.blue} strokeWidth="1.2" strokeDasharray="2 2" />
  </svg>
));

export const ConfettiDots = memo(() => {
  const colors = [PALETTE.coral, PALETTE.blue, PALETTE.purple, PALETTE.magenta, PALETTE.orange, PALETTE.green, PALETTE.yellow];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, transform: "translate3d(0,0,0)", willChange: "transform" }}>
      {[...Array(35)].map((_, i) => (
        <div
          key={i}
          className="confetti-dot"
          style={{
            position: "absolute",
            width: 7 + Math.random() * 10,
            height: 7 + Math.random() * 10,
            backgroundColor: colors[i % colors.length],
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.14,
            animation: `scalePulse ${2 + Math.random() * 3}s infinite ease-in-out`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
});

export const Constellations = memo(() => (
  <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, opacity: 0.5, transform: "translateZ(0)", backfaceVisibility: "hidden" }} preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
    <defs>
      <filter id="starGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <g transform="translate(200, 210) scale(2.4)">
      <path d="M0,40 L30,0 L70,15 L100,50" stroke={PALETTE.purple} fill="none" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.5" />
      <circle cx="0"   cy="40" r="2.5" fill={PALETTE.purple} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.4s ease-in-out 0s infinite" }} />
      <circle cx="30"  cy="0"  r="4"   fill={PALETTE.purple} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.1s ease-in-out 0.4s infinite" }} />
      <circle cx="70"  cy="15" r="2.5" fill={PALETTE.purple} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 1.8s ease-in-out 0.8s infinite" }} />
      <circle cx="100" cy="50" r="2.5" fill={PALETTE.purple} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.6s ease-in-out 0.2s infinite" }} />
      <text x="28" y="-14" fill={PALETTE.purple} fontSize="7" fontFamily="Lexend" opacity="0.55" letterSpacing="3">ARIES</text>
    </g>
    <g transform="translate(1050, 200) scale(2.4)">
      <path d="M0,50 L40,0 L100,20 L140,70 L110,110 L30,110 Z" stroke={PALETTE.blue} fill="none" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.5" />
      <path d="M40,0 L-40,30 L0,50" stroke={PALETTE.blue} fill="none" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.5" />
      <circle cx="0"   cy="50"  r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.2s ease-in-out 0.1s infinite" }} />
      <circle cx="40"  cy="0"   r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 1.9s ease-in-out 0.6s infinite" }} />
      <circle cx="100" cy="20"  r="4"   fill={PALETTE.blue} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.7s ease-in-out 0s infinite" }} />
      <circle cx="140" cy="70"  r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.0s ease-in-out 0.9s infinite" }} />
      <circle cx="110" cy="110" r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.4s ease-in-out 0.3s infinite" }} />
      <circle cx="30"  cy="110" r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 1.7s ease-in-out 0.7s infinite" }} />
      <circle cx="-40" cy="30"  r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.3s ease-in-out 0.5s infinite" }} />
      <text x="30" y="-18" fill={PALETTE.blue} fontSize="7" fontFamily="Lexend" opacity="0.55" letterSpacing="3">SAGITTARIUS</text>
    </g>
    <g transform="translate(480, 580) scale(2.4)">
      <path d="M0,0 L40,50 L100,30 L150,100 L80,140 L20,120 L40,50" stroke={PALETTE.coral} fill="none" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.5" />
      <circle cx="0"   cy="0"   r="2.5" fill={PALETTE.coral} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.5s ease-in-out 0.2s infinite" }} />
      <circle cx="40"  cy="50"  r="2.5" fill={PALETTE.coral} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 1.8s ease-in-out 0.8s infinite" }} />
      <circle cx="100" cy="30"  r="2.5" fill={PALETTE.coral} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.2s ease-in-out 0.4s infinite" }} />
      <circle cx="150" cy="100" r="5"   fill={PALETTE.coral} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.0s ease-in-out 0s infinite" }} />
      <circle cx="80"  cy="140" r="2.5" fill={PALETTE.coral} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 2.8s ease-in-out 0.6s infinite" }} />
      <circle cx="20"  cy="120" r="2.5" fill={PALETTE.coral} filter="url(#starGlow)" className="star-circle" style={{ animation: "twinkle 1.9s ease-in-out 1.0s infinite" }} />
      <text x="40" y="-14" fill={PALETTE.coral} fontSize="7" fontFamily="Lexend" opacity="0.55" letterSpacing="3">VIRGO</text>
    </g>
  </svg>
));
