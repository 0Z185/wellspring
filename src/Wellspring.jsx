import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

const GIPHY_SUGGESTIONS = [
  "https://media.giphy.com/media/g5R9dok94mrIvplmZd/giphy.gif",
  "https://media.giphy.com/media/SwIMZUJE3ZPpHAfTC4/giphy.gif",
  "https://media.giphy.com/media/l4KhVp1aGeqzeMDok/giphy.gif",
  "https://media.giphy.com/media/WRL7YgP42OKns6RSt0/giphy.gif",
  "https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif",
  "https://media.giphy.com/media/U4LhzzpfTP7NZ4UlmH/giphy.gif",
  "https://media.giphy.com/media/feio2yIUMtdqWjRiaF/giphy.gif",
  "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
];

const STICKERS = ["🎂", "🎁", "🎈", "🎉", "🥳", "💐", "🌟", "💖", "🍰", "🎊", "✨", "🪅"];

const REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "🎉", label: "Celebrate" },
  { emoji: "😂", label: "Haha" },
  { emoji: "🥹", label: "Touched" },
  { emoji: "🔥", label: "Fire" },
];

const PALETTE = {
  bg: ["#F5E4E8", "#E8DDF2", "#F5E4E8", "#F0E8F2"],
  purple: "#6B4C8A",
  coral: "#E87B5A",
  blue: "#4A7AB5",
  orange: "#E8954B",
  magenta: "#C44B7A",
  green: "#5CA86B",
  yellow: "#E8C84B",
  lilac: "#C9B8D9",
  text: "#1E1E2E",
  textMid: "#4A4060",
  textLight: "#8A7A9A",
};

const CARD_COLORS = [
  "#FFFBFD", "#FAF5FF", "#FFF7F4", "#F5F8FF", "#FFF9F0", "#F8F5FF", "#FFF5F8", "#F5FAFF"
];

const CanvasGrain = () => (
  <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none", zIndex: 1 }}>
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

const WatercolourSplatters = () => {
  const colors = [PALETTE.coral, PALETTE.blue, PALETTE.purple, PALETTE.magenta, PALETTE.orange];
  const opacities = [0.04, 0.05, 0.06, 0.07, 0.05, 0.04, 0.06, 0.07];
  return (
    <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
      <defs>
        <filter id="distort">
          <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3" result="turb" />
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="12" />
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      {[...Array(8)].map((_, i) => (
        <g key={i} filter="url(#distort)" style={{ opacity: opacities[i] }}>
          {[...Array(10)].map((__, j) => (
            <ellipse
              key={j}
              cx={`${2 + Math.random() * 96}%`}
              cy={`${2 + Math.random() * 96}%`}
              rx={40 + Math.random() * 210}
              ry={40 + Math.random() * 210}
              fill={colors[Math.floor(Math.random() * colors.length)]}
              transform={`rotate(${Math.random() * 360})`}
            />
          ))}
        </g>
      ))}
    </svg>
  );
};

const BrushStrokes = () => (
  <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none", zIndex: 1 }}>
    <filter id="roughen">
      <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" />
    </filter>
    <path d="M-80,180 Q250,20 600,280 T1400,80" stroke={PALETTE.coral} strokeWidth="600" fill="none" strokeLinecap="round" filter="url(#roughen)" transform="rotate(-5 600 180)" />
    <path d="M1400,750 Q1050,920 580,680 T-150,880" stroke={PALETTE.blue} strokeWidth="520" fill="none" strokeLinecap="round" filter="url(#roughen)" transform="rotate(8 600 750)" />
    <path d="M180,1100 Q520,850 1150,1150" stroke={PALETTE.purple} strokeWidth="480" fill="none" strokeLinecap="round" filter="url(#roughen)" />
    <path d="M-100,500 Q300,350 800,520 T1500,400" stroke={PALETTE.magenta} strokeWidth="420" fill="none" strokeLinecap="round" filter="url(#roughen)" transform="rotate(3 700 500)" />
    <path d="M200,50 Q700,200 1100,30 T1600,120" stroke={PALETTE.orange} strokeWidth="380" fill="none" strokeLinecap="round" filter="url(#roughen)" transform="rotate(-8 800 100)" />
  </svg>
);

const SketchyMarks = () => (
  <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.09, pointerEvents: "none", zIndex: 1 }}>
    {/* Circles */}
    <circle cx="15%" cy="25%" r="55" fill="none" stroke="#2E3A5C" strokeWidth="1" strokeDasharray="4 4" transform="rotate(15 15% 25%)" />
    <circle cx="78%" cy="12%" r="38" fill="none" stroke={PALETTE.purple} strokeWidth="1" strokeDasharray="5 3" />
    <circle cx="90%" cy="70%" r="70" fill="none" stroke={PALETTE.coral} strokeWidth="1.2" strokeDasharray="3 5" />
    <circle cx="5%" cy="60%" r="44" fill="none" stroke={PALETTE.blue} strokeWidth="1" strokeDasharray="4 4" transform="rotate(-20 5% 60%)" />
    <circle cx="50%" cy="95%" r="30" fill="none" stroke="#2E3A5C" strokeWidth="1" strokeDasharray="3 3" />
    <circle cx="35%" cy="8%" r="50" fill="none" stroke={PALETTE.magenta} strokeWidth="1" strokeDasharray="5 4" />
    {/* Lines & curves */}
    <path d="M85% 65% L92% 75% M87% 75% L94% 65%" stroke={PALETTE.purple} strokeWidth="1.5" strokeDasharray="3 2" />
    <path d="M5% 85% C 15 85, 25 95, 35% 85%" stroke="#2E3A5C" strokeWidth="1" fill="none" transform="rotate(-10 5% 85%)" />
    <path d="M60% 5% Q70% 15%, 80% 5%" stroke={PALETTE.orange} strokeWidth="1.2" fill="none" strokeDasharray="4 3" />
    <path d="M2% 45% L10% 50% M3% 52% L11% 47%" stroke={PALETTE.coral} strokeWidth="1.5" strokeDasharray="2 3" />
    <path d="M92% 30% Q96% 40%, 90% 48%" stroke="#2E3A5C" strokeWidth="1" fill="none" strokeDasharray="3 4" />
    <path d="M40% 92% L48% 98% M44% 98% L52% 92%" stroke={PALETTE.blue} strokeWidth="1.2" strokeDasharray="2 2" />
  </svg>
);

const ConfettiDots = () => {
  const colors = [PALETTE.coral, PALETTE.blue, PALETTE.purple, PALETTE.magenta, PALETTE.orange, PALETTE.green, PALETTE.yellow];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      {[...Array(35)].map((_, i) => (
        <div
          key={i}
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
};

const Constellations = () => (
  <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, opacity: 0.5 }} preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
    <defs>
      {/* Glow filter for stars */}
      <filter id="starGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>

    {/* ARIES — top-left, large */}
    <g transform="translate(200, 210) scale(2.4)">
      <path d="M0,40 L30,0 L70,15 L100,50" stroke={PALETTE.purple} fill="none" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.5" />
      <circle cx="0"   cy="40" r="2.5" fill={PALETTE.purple} filter="url(#starGlow)" style={{ animation: "twinkle 2.4s ease-in-out 0s infinite" }} />
      <circle cx="30"  cy="0"  r="4"   fill={PALETTE.purple} filter="url(#starGlow)" style={{ animation: "twinkle 2.1s ease-in-out 0.4s infinite" }} />
      <circle cx="70"  cy="15" r="2.5" fill={PALETTE.purple} filter="url(#starGlow)" style={{ animation: "twinkle 1.8s ease-in-out 0.8s infinite" }} />
      <circle cx="100" cy="50" r="2.5" fill={PALETTE.purple} filter="url(#starGlow)" style={{ animation: "twinkle 2.6s ease-in-out 0.2s infinite" }} />
      <text x="28" y="-14" fill={PALETTE.purple} fontSize="7" fontFamily="Lexend" opacity="0.55" letterSpacing="3">ARIES</text>
    </g>

    {/* SAGITTARIUS — right, large */}
    <g transform="translate(1050, 200) scale(2.4)">
      <path d="M0,50 L40,0 L100,20 L140,70 L110,110 L30,110 Z" stroke={PALETTE.blue} fill="none" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.5" />
      <path d="M40,0 L-40,30 L0,50" stroke={PALETTE.blue} fill="none" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.5" />
      <circle cx="0"   cy="50"  r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" style={{ animation: "twinkle 2.2s ease-in-out 0.1s infinite" }} />
      <circle cx="40"  cy="0"   r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" style={{ animation: "twinkle 1.9s ease-in-out 0.6s infinite" }} />
      <circle cx="100" cy="20"  r="4"   fill={PALETTE.blue} filter="url(#starGlow)" style={{ animation: "twinkle 2.7s ease-in-out 0s infinite" }} />
      <circle cx="140" cy="70"  r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" style={{ animation: "twinkle 2.0s ease-in-out 0.9s infinite" }} />
      <circle cx="110" cy="110" r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" style={{ animation: "twinkle 2.4s ease-in-out 0.3s infinite" }} />
      <circle cx="30"  cy="110" r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" style={{ animation: "twinkle 1.7s ease-in-out 0.7s infinite" }} />
      <circle cx="-40" cy="30"  r="2.5" fill={PALETTE.blue} filter="url(#starGlow)" style={{ animation: "twinkle 2.3s ease-in-out 0.5s infinite" }} />
      <text x="30" y="-18" fill={PALETTE.blue} fontSize="7" fontFamily="Lexend" opacity="0.55" letterSpacing="3">SAGITTARIUS</text>
    </g>

    {/* VIRGO — bottom-centre, large */}
    <g transform="translate(480, 580) scale(2.4)">
      <path d="M0,0 L40,50 L100,30 L150,100 L80,140 L20,120 L40,50" stroke={PALETTE.coral} fill="none" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.5" />
      <circle cx="0"   cy="0"   r="2.5" fill={PALETTE.coral} filter="url(#starGlow)" style={{ animation: "twinkle 2.5s ease-in-out 0.2s infinite" }} />
      <circle cx="40"  cy="50"  r="2.5" fill={PALETTE.coral} filter="url(#starGlow)" style={{ animation: "twinkle 1.8s ease-in-out 0.8s infinite" }} />
      <circle cx="100" cy="30"  r="2.5" fill={PALETTE.coral} filter="url(#starGlow)" style={{ animation: "twinkle 2.2s ease-in-out 0.4s infinite" }} />
      <circle cx="150" cy="100" r="5"   fill={PALETTE.coral} filter="url(#starGlow)" style={{ animation: "twinkle 2.0s ease-in-out 0s infinite" }} />
      <circle cx="80"  cy="140" r="2.5" fill={PALETTE.coral} filter="url(#starGlow)" style={{ animation: "twinkle 2.8s ease-in-out 0.6s infinite" }} />
      <circle cx="20"  cy="120" r="2.5" fill={PALETTE.coral} filter="url(#starGlow)" style={{ animation: "twinkle 1.9s ease-in-out 1.0s infinite" }} />
      <text x="40" y="-14" fill={PALETTE.coral} fontSize="7" fontFamily="Lexend" opacity="0.55" letterSpacing="3">VIRGO</text>
    </g>
  </svg>
);

const BORDER_COLORS = [PALETTE.lilac, PALETTE.coral, PALETTE.blue, PALETTE.magenta, PALETTE.purple, PALETTE.orange];

const SketchyBorder = ({ seed, color }) => {
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
};

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const Sparkler = ({ style }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" style={{ position: "absolute", ...style, pointerEvents: "none" }}>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <line
        key={angle}
        x1="12" y1="12" x2="20" y2="12"
        stroke="#FFB800"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{
          transformOrigin: "12px 12px",
          transform: `rotate(${angle}deg)`,
          animation: `sparkleLine 0.8s ease-in-out ${i * 0.1}s infinite`,
        }}
      />
    ))}
  </svg>
);

export default function Wellspring() {
  const [cards, setCards] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedGif, setSelectedGif] = useState(null);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [activeTab, setActiveTab] = useState("message");
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState([]);
  const [heroAnimDone, setHeroAnimDone] = useState(false);
  const [myWishes, setMyWishes] = useState(() => JSON.parse(localStorage.getItem('myWishes') || '[]'));
  const [editingCardId, setEditingCardId] = useState(null);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const fileInputRef = useRef(null);


  // Load cards from Firestore
  useEffect(() => {
    const q = query(collection(db, "wishes"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const fbCards = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCards(fbCards);
      setLoading(false);
    }, (error) => {
      console.error("Error loading wishes:", error);
      setLoading(false);
    });

    setTimeout(() => setHeroAnimDone(true), 1800);
    return () => unsub();
  }, []);

  const launchConfetti = () => {
    const paletteColors = [PALETTE.coral, PALETTE.blue, PALETTE.purple, PALETTE.magenta, PALETTE.orange, PALETTE.green, PALETTE.yellow];
    const pieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      color: paletteColors[i % paletteColors.length],
      duration: 3 + Math.random() * 2,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 5000);
  };

  const handleAddCard = async () => {
    if (!authorName.trim()) return;
    if (!message.trim() && !selectedImage && !selectedGif && !selectedSticker) return;

    try {
      if (editingCardId) {
        const updateData = {
          author: authorName.trim(),
          message: message.trim(),
          image: selectedImage,
          gif: selectedGif,
          sticker: selectedSticker,
        };
        await updateDoc(doc(db, "wishes", editingCardId), updateData);
      } else {
        const newCard = {
          author: authorName.trim(),
          message: message.trim(),
          image: selectedImage,
          gif: selectedGif,
          sticker: selectedSticker,
          reactions: {},
          bg: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
          createdAt: Date.now(),
        };
        const docRef = await addDoc(collection(db, "wishes"), newCard);

        const newMyWishes = [...myWishes, docRef.id];
        setMyWishes(newMyWishes);
        localStorage.setItem("myWishes", JSON.stringify(newMyWishes));
      }

      setShowAddModal(false);
      resetForm();
      if (!editingCardId) launchConfetti();
    } catch (e) {
      console.error("Error saving document: ", e);
      alert("Uh oh, the post failed to save. Error: " + e.message);
    }
  };

  const resetForm = () => {
    setAuthorName("");
    setMessage("");
    setSelectedImage(null);
    setSelectedGif(null);
    setSelectedSticker(null);
    setActiveTab("message");
    setEditingCardId(null);
  };

  const handleEditClick = (card) => {
    setEditingCardId(card.id);
    setAuthorName(card.author);
    setMessage(card.message || "");
    setSelectedImage(card.image || null);
    setSelectedGif(card.gif || null);
    setSelectedSticker(card.sticker || null);
    if (card.image) setActiveTab("photo");
    else if (card.gif) setActiveTab("gif");
    else if (card.sticker) setActiveTab("sticker");
    else setActiveTab("message");
    setShowAddModal(true);
  };

  const handleReaction = async (cardId, label) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const reactions = { ...card.reactions };
    reactions[label] = (reactions[label] || 0) + 1;

    try {
      await updateDoc(doc(db, "wishes", cardId), { reactions });
    } catch (e) {
      console.error("Error updating reaction:", e);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Maximum dimensions to keep file size small
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG with 70% quality
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

        // Check if it's still bigger than Firestore's ~1MB limit
        if (dataUrl.length > 1000000) {
          alert("Image is still too large after compression. Please choose a smaller photo.");
          return;
        }

        setSelectedImage(dataUrl);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await deleteDoc(doc(db, "wishes", cardId));
    } catch (e) {
      console.error("Error deleting card:", e);
    }
  };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Delius+Swash+Caps&family=Delius&family=Lexend:wght@300;400;500;600;700&family=Quicksand:ital,wght@0,300;0,400;0,700;1,400&family=Ultra&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes scalePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes brushReveal {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes heroSlide {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bokehDrift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, 50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes starGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes sparkleLine {
          0%, 100% { opacity: 0; transform: scale(0.6) rotate(var(--angle)); }
          50% { opacity: 1; transform: scale(1.1) rotate(var(--angle)); }
        }
        @keyframes lineShimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        .hero-section {
          animation: heroSlide 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .card-item {
          animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }

        .add-btn:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 8px 30px rgba(128, 0, 32, 0.4) !important;
        }

        .reaction-btn:hover {
          transform: scale(1.25) !important;
          background: rgba(255,255,255,0.95) !important;
        }

        .reaction-btn:active { transform: scale(0.9) !important; }

        .gif-item:hover { transform: scale(1.03); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }

        .sticker-btn:hover { transform: scale(1.3) !important; }
        .sticker-btn:active { transform: scale(0.9) !important; }

        .tab-btn:hover { background: rgba(80,200,120,0.15) !important; }

        .modal-overlay { animation: fadeIn 0.25s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-content { animation: modalIn 0.35s cubic-bezier(0.22, 1, 0.36, 1); }

        .card-controls {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .card-wrapper:hover .card-controls {
          opacity: 1;
        }
        .control-btn:hover { background: rgba(0,0,0,0.15) !important; color: #333 !important; }

        .bokeh-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          z-index: 1;
          pointer-events: none;
        }

        .sparkle-dot {
          position: absolute;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(255,255,255,0.8);
          z-index: 1;
          pointer-events: none;
        }

        .bg-pattern {
          position: fixed;
          inset: 0;
          background-image: radial-gradient(rgba(255, 200, 200, 0.07) 0.5px, transparent 0.5px);
          background-size: 28px 28px;
          opacity: 1;
          z-index: 1;
          pointer-events: none;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 32px;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(30,30,46,0.85);
          backdrop-filter: blur(12px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
          animation: fadeIn 0.3s ease forwards;
        }
        .lightbox-content {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          cursor: default;
          animation: scaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .lightbox-close {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          color: white;
          border: none;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .lightbox-close:hover {
          background: rgba(255,255,255,0.2);
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
      `}</style>

      {/* Confetti */}
      {confetti.map((p) => (
        <div
          key={p.id}
          style={{
            position: "fixed",
            left: `${p.x}%`,
            top: 0,
            width: 10,
            height: 10,
            borderRadius: p.id % 3 === 0 ? "50%" : "2px",
            background: p.color,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Custom Background Elements */}
      {/* Background Art Layers */}
      <CanvasGrain />
      <WatercolourSplatters />
      <BrushStrokes />
      <SketchyMarks />
      <ConfettiDots />
      <Constellations />


      {/* Hero Section */}
      <div className="hero-section" style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroPreTitle}>✦ A CELEBRATION ✦</div>
          <div style={styles.heroTitleWrapper}>
            <svg style={styles.heroBrush} viewBox="0 0 400 60" preserveAspectRatio="none">
              <path d="M10,30 Q100,10 200,30 T390,30" stroke={PALETTE.coral} strokeWidth="40" fill="none" strokeLinecap="round" />
            </svg>
            <h1 style={styles.heroTitle}>Happy Birthday</h1>
          </div>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Sparkler style={{ top: -15, left: -25, transform: "scale(0.8)" }} />
            <Sparkler style={{ top: -20, right: -20, transform: "scale(0.6) rotate(15deg)" }} />
            <div style={styles.heroName}>Omoye Zindzi Iyayi</div>
            <Sparkler style={{ bottom: -10, left: "20%", transform: "scale(0.5)" }} />
            <Sparkler style={{ bottom: -5, right: "15%", transform: "scale(0.7) rotate(-10deg)" }} />
          </div>

          <div style={styles.heroDivider}>
            <svg width="120" height="20" viewBox="0 0 120 20">
              <path d="M0,10 Q30,0 60,10 T120,10" fill="none" stroke={PALETTE.lilac} strokeWidth="1.5" />
              <circle cx="5" cy="10" r="3" fill={PALETTE.coral} />
              <circle cx="60" cy="10" r="3" fill={PALETTE.blue} />
              <circle cx="115" cy="10" r="3" fill={PALETTE.purple} />
            </svg>
          </div>

          <p style={styles.heroSub}>warm wishes, gathered</p>

          <div style={styles.heroCounter}>
            <span style={styles.countNum}>{cards.length}</span>
            <span style={styles.countLabel}>wishes</span>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <button className="add-btn" style={styles.addBtn} onClick={() => setShowAddModal(true)}>
        <span style={{ fontSize: 22 }}>+</span>
        <span>Add to Board</span>
      </button>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <div style={{ fontSize: 40, animation: "pulse 1.5s infinite" }}>🖌️</div>
          <p style={{ color: PALETTE.textLight, marginTop: 10 }}>Curating the gallery...</p>
        </div>
      ) : cards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}>No wishes yet</p>
          <p style={{ color: PALETTE.textLight, marginTop: 8 }}>Be the first to leave a mark in the gallery.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {cards.map((card, i) => (
            <div
              key={card.id}
              className="card-item card-wrapper"
              style={{
                ...styles.card,
                background: card.bg || CARD_COLORS[i % CARD_COLORS.length],
                animation: `fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.07}s forwards`,
                opacity: 0
              }}
            >
              <SketchyBorder color={BORDER_COLORS[i % BORDER_COLORS.length]} seed={i + 1} />

              {/* Edit / Delete buttons */}
              {myWishes.includes(card.id) && (
                <div className="card-controls" style={styles.cardControls}>
                  <button className="control-btn" onClick={() => handleEditClick(card)} title="Edit">✎</button>
                  <button className="control-btn" onClick={() => handleDeleteCard(card.id)} title="Remove">×</button>
                </div>
              )}

              {card.sticker && <div style={styles.cardSticker}>{card.sticker}</div>}
              
              {(card.image || card.gif) && (
                <div style={styles.cardImageWrap} onClick={() => setLightboxMedia(card.image || card.gif)}>
                  <img src={card.image || card.gif} alt="" style={styles.cardImage} />
                </div>
              )}

              {card.message && <div style={styles.cardMessage}>"{card.message}"</div>}

              <div style={styles.cardAuthor}>— {card.author}</div>

              <div style={styles.reactionsRow}>
                {REACTIONS.map((r) => {
                  const count = card.reactions?.[r.label] || 0;
                  return (
                    <button
                      key={r.label}
                      className="reaction-btn"
                      style={{
                        ...styles.reactionBtn,
                        ...(count > 0 ? styles.reactionBtnActive : {}),
                      }}
                      onClick={() => handleReaction(card.id, r.label)}
                    >
                      <span style={{ fontSize: 13 }}>{r.emoji}</span>
                      {count > 0 && <span style={styles.reactionCount}>{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Add Modal */}
      {showAddModal && (
        <div
          className="modal-overlay"
          style={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && (setShowAddModal(false), resetForm())}
        >
          <div className="modal-content" style={styles.modal}>
            <button style={styles.closeBtn} onClick={() => { setShowAddModal(false); resetForm(); }}>✕</button>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingCardId ? "Refine Your Mark" : "Leave Your Mark"}</h2>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Your Name</label>
              <input
                style={styles.input}
                placeholder="Write your name..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>

            <div style={styles.tabNav}>
              {[
                { id: "message", label: "words" },
                { id: "photo", label: "photo" },
                { id: "gif", label: "gif" },
                { id: "sticker", label: "mark" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  style={{
                    ...styles.tabBtn,
                    ...(activeTab === tab.id ? styles.tabBtnActive : {}),
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {activeTab === tab.id && <div style={styles.tabUnderline} />}
                </button>
              ))}
            </div>

            <div style={styles.tabContent}>
              {activeTab === "message" && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Birthday Wish</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Write something heartfelt..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              {activeTab === "photo" && (
                <div style={styles.photoTab}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                  {selectedImage ? (
                    <div style={{ position: "relative" }}>
                      <img src={selectedImage} alt="" style={styles.previewImage} />
                      <button style={styles.removeMediaBtn} onClick={() => setSelectedImage(null)}>✕</button>
                    </div>
                  ) : (
                    <div style={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                      <span>📸 Upload from gallery</span>
                    </div>
                  )}
                  <div style={{ ...styles.fieldGroup, marginTop: 16 }}>
                    <textarea
                      style={{ ...styles.textarea, minHeight: 60 }}
                      placeholder="Add a caption..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "gif" && (
                <div>
                  <div style={styles.gifGrid}>
                    {GIPHY_SUGGESTIONS.map((url, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.gifItem,
                          ...(selectedGif === url ? styles.gifItemSelected : {}),
                        }}
                        onClick={() => setSelectedGif(url === selectedGif ? null : url)}
                      >
                        <img src={url} alt="" style={styles.gifImg} />
                      </div>
                    ))}
                  </div>
                  <div style={{ ...styles.fieldGroup, marginTop: 16 }}>
                    <textarea
                      style={{ ...styles.textarea, minHeight: 60 }}
                      placeholder="Add a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "sticker" && (
                <div>
                  <div style={styles.stickerGrid}>
                    {STICKERS.map((s, i) => (
                      <button
                        key={i}
                        style={{
                          ...styles.stickerBtn,
                          ...(selectedSticker === s ? styles.stickerBtnSelected : {}),
                        }}
                        onClick={() => setSelectedSticker(s === selectedSticker ? null : s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div style={{ ...styles.fieldGroup, marginTop: 16 }}>
                    <textarea
                      style={{ ...styles.textarea, minHeight: 60 }}
                      placeholder="Add a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              style={{
                ...styles.submitBtn,
                opacity: authorName.trim() ? 1 : 0.5,
              }}
              onClick={handleAddCard}
              disabled={!authorName.trim()}
            >
              {editingCardId ? "Save Refinement" : "Post to Gallery"}
            </button>
          </div>
        </div>
      )}
      {lightboxMedia && (
        <div className="lightbox-overlay" onClick={() => setLightboxMedia(null)}>
          <button className="lightbox-close" onClick={() => setLightboxMedia(null)}>×</button>
          <img src={lightboxMedia} alt="Expanded view" className="lightbox-content" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <footer style={styles.footer}>
        <div style={styles.footerDivider}>
          <div style={{ ...styles.footerDot, background: PALETTE.coral }} />
          <div style={{ ...styles.footerDot, background: PALETTE.blue }} />
          <div style={{ ...styles.footerDot, background: PALETTE.purple }} />
        </div>
        <div style={styles.footerText}>WELLSPRING</div>
      </footer>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${PALETTE.bg[0]} 0%, ${PALETTE.bg[1]} 33%, ${PALETTE.bg[2]} 66%, ${PALETTE.bg[3]} 100%)`,
    backgroundAttachment: "fixed",
    fontFamily: "'Lexend', sans-serif",
    color: PALETTE.text,
    position: "relative",
    overflow: "hidden",
  },
  hero: {
    position: "relative",
    textAlign: "center",
    padding: "80px 24px 60px",
    zIndex: 2,
  },
  heroInner: {
    position: "relative",
    maxWidth: 800,
    margin: "0 auto",
  },
  heroPreTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.25em",
    color: PALETTE.textLight,
    marginBottom: 16,
    fontWeight: 500,
  },
  heroTitleWrapper: {
    position: "relative",
    display: "inline-block",
    marginBottom: 8,
  },
  heroBrush: {
    position: "absolute",
    bottom: -10,
    left: "5%",
    width: "90%",
    height: 40,
    opacity: 0.15,
    zIndex: -1,
    transformOrigin: "left",
    animation: "brushReveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
  },
  heroTitle: {
    fontFamily: "'Ultra', serif",
    fontSize: "clamp(42px, 8vw, 72px)",
    fontWeight: 900,
    color: PALETTE.text,
    lineHeight: 1,
    margin: 0,
  },
  heroName: {
    fontFamily: "'Delius Swash Caps', cursive",
    fontSize: "clamp(32px, 6vw, 48px)",
    color: PALETTE.purple,
    marginTop: 0,
  },
  heroDivider: {
    margin: "24px 0",
    display: "flex",
    justifyContent: "center",
  },
  heroSub: {
    fontSize: 14,
    color: PALETTE.textLight,
    letterSpacing: "0.15em",
    textTransform: "lowercase",
    marginBottom: 24,
  },
  heroCounter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  countNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 32,
    fontWeight: 900,
    color: PALETTE.text,
  },
  countLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: PALETTE.textLight,
    marginTop: -4,
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "0 auto 48px",
    padding: "16px 32px",
    background: PALETTE.purple,
    color: "#FFF",
    border: "none",
    borderRadius: 0,
    fontFamily: "'Lexend', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(107, 76, 138, 0.2)",
    transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
    position: "relative",
    overflow: "hidden",
    zIndex: 10,
  },
  grid: {
    // Legacy styles, now handled by .masonry-grid class
  },
  card: {
    borderRadius: 0,
    padding: "28px 24px 20px",
    position: "relative",
    border: "none",
    boxShadow: "none",
    transition: "transform 0.35s",
    cursor: "default",
    overflow: "visible",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "auto",
  },
  cardControls: {
    position: "absolute",
    top: -12,
    right: -12,
    display: "flex",
    gap: 6,
    zIndex: 20,
  },
  controlBtn: {
    width: 32,
    height: 32,
    borderRadius: 0,
    border: "1px solid #EEE",
    background: "#FFF",
    color: PALETTE.textMid,
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  cardSticker: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: 16,
  },
  cardImageWrap: {
    borderRadius: 0,
    overflow: "hidden",
    flexShrink: 0,
    width: "100%",
    marginBottom: 16,
    border: "1px solid rgba(107,76,138,0.08)",
    cursor: "zoom-in",
  },
  cardImage: {
    width: "100%",
    display: "block",
    maxHeight: 200,
    objectFit: "cover",
  },
  cardMessage: {
    fontFamily: "'Quicksand', sans-serif",
    fontSize: 16,
    lineHeight: 1.75,
    color: "#1E1E2E",
    marginBottom: 16,
  },
  cardAuthor: {
    fontFamily: "'Delius', cursive",
    fontSize: 18,
    color: "#6B4C8A",
    marginBottom: 20,
  },
  reactionsRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: "auto",
  },
  reactionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    borderRadius: 0,
    border: "1px solid rgba(107,76,138,0.08)",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
  },
  reactionBtnActive: {
    background: "rgba(107,76,138,0.06)",
    borderColor: "rgba(107,76,138,0.25)",
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: 700,
    color: "#6B4C8A",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(30, 30, 46, 0.2)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    background: "#FFFBFD",
    borderRadius: 0,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90vh",
    overflow: "auto",
    padding: 40,
    boxShadow: "0 30px 90px rgba(0,0,0,0.15)",
    position: "relative",
  },
  modalHeader: {
    textAlign: "center",
    marginBottom: 32,
  },
  modalTitle: {
    fontFamily: "'Caveat', cursive",
    fontSize: 32,
    color: PALETTE.purple,
    margin: 0,
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    border: "none",
    background: "none",
    fontSize: 24,
    color: PALETTE.textLight,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tabNav: {
    display: "flex",
    justifyContent: "center",
    gap: 24,
    marginBottom: 32,
    borderBottom: `1px solid ${PALETTE.lilac}44`,
  },
  tabBtn: {
    padding: "8px 4px",
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: "0.15em",
    fontWeight: 600,
    color: PALETTE.textLight,
    background: "none",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "color 0.2s",
  },
  tabBtnActive: {
    color: PALETTE.text,
  },
  tabUnderline: {
    position: "absolute",
    bottom: -1,
    left: 0,
    width: "100%",
    height: 2,
    background: PALETTE.coral,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    display: "block",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: PALETTE.textLight,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: "12px 0",
    border: "none",
    borderBottom: `1px solid ${PALETTE.lilac}`,
    background: "none",
    fontFamily: "'Lexend', sans-serif",
    fontSize: 15,
    color: PALETTE.text,
    borderRadius: 0,
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    padding: "12px 0",
    border: "none",
    borderBottom: `1px solid ${PALETTE.lilac}`,
    background: "none",
    fontFamily: "'Quicksand', sans-serif",
    fontSize: 16,
    color: PALETTE.text,
    borderRadius: 0,
    outline: "none",
    resize: "none",
  },
  uploadArea: {
    border: `1px dashed ${PALETTE.lilac}`,
    padding: 32,
    textAlign: "center",
    cursor: "pointer",
    color: PALETTE.textLight,
    fontSize: 14,
    transition: "all 0.2s",
  },
  submitBtn: {
    width: "100%",
    padding: "16px",
    background: PALETTE.purple,
    color: "#FFF",
    border: "none",
    borderRadius: 0,
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    fontFamily: "'Lexend', sans-serif",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  footer: {
    padding: "60px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  footerDivider: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
  },
  footerText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.25em",
    color: PALETTE.textLight,
  },
};
