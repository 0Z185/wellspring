import { useState, useEffect, useRef } from "react";
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import "./Wellspring.css";
import { 
  GIPHY_SUGGESTIONS, 
  STICKERS, 
  REACTIONS, 
  PALETTE, 
  CARD_COLORS, 
  BORDER_COLORS 
} from "./constants";
import { 
  CanvasGrain, 
  WatercolourSplatters, 
  BrushStrokes, 
  SketchyMarks, 
  ConfettiDots, 
  Constellations 
} from "./components/BackgroundArt";
import { SketchyBorder, Sparkler } from "./components/UIComponents";
import AddWishModal from "./components/AddWishModal";
import { styles } from "./Wellspring.styles";

export default function Wellspring() {
  const [cards, setCards] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState([]);
  const [heroAnimDone, setHeroAnimDone] = useState(false);
  const [myWishes, setMyWishes] = useState(() => JSON.parse(localStorage.getItem('myWishes') || '[]'));
  const [editingCard, setEditingCard] = useState(null);
  const [lightboxMedia, setLightboxMedia] = useState(null);


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

  const handleAddCardData = async (data) => {
    const { authorName, message, selectedImage, selectedGif, selectedSticker } = data;
    if (!authorName.trim()) return;

    try {
      if (editingCard) {
        const updateData = {
          author: authorName.trim(),
          message: message.trim(),
          image: selectedImage,
          gif: selectedGif,
          sticker: selectedSticker,
        };
        await updateDoc(doc(db, "wishes", editingCard.id), updateData);
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
        launchConfetti();
      }

      setShowAddModal(false);
      setEditingCard(null);
    } catch (e) {
      console.error("Error saving wish:", e);
    }
  };

  const handleEditClick = (card) => {
    setEditingCard(card);
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


  const handleDeleteCard = async (cardId) => {
    try {
      await deleteDoc(doc(db, "wishes", cardId));
    } catch (e) {
      console.error("Error deleting card:", e);
    }
  };

  return (
    <div style={styles.root}>
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

      {/* Background Art Layers */}
      <CanvasGrain />
      <WatercolourSplatters />
      <BrushStrokes />
      <SketchyMarks />
      <ConfettiDots />
      <Constellations />

      {/* Floating decorative elements */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {["🎈", "🎁", "✨", "🎂", "💖", "🎊"].map((emoji, i) => (
          <div
            key={i}
            className="floating-emoji"
            style={{
              position: "absolute",
              fontSize: 20 + Math.random() * 16,
              top: `${10 + Math.random() * 80}%`,
              left: `${5 + Math.random() * 90}%`,
              animation: `float ${3 + Math.random() * 3}s ${Math.random() * 2}s ease-in-out infinite`,
              opacity: 0.15,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
      {/* Hero Section */}
      <div className="hero-section" style={styles.hero}>
        <div className="hero-inner" style={styles.heroInner}>
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
      <div style={styles.celebrationDate}>April 3rd</div>
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

              <div className="card-controls" style={styles.cardControls}>
                {myWishes.includes(card.id) && (
                  <>
                    <button className="control-btn" style={styles.controlBtn} onClick={() => handleEditClick(card)}>✎</button>
                    <button className="control-btn" style={styles.controlBtn} onClick={() => {
                        if(confirm("Delete this wish?")) handleDeleteCard(card.id);
                    }}>✕</button>
                  </>
                )}
              </div>

              {card.sticker && <div style={styles.cardSticker}>{card.sticker}</div>}
              
              {(card.image || card.gif) && (
                <div style={styles.cardImageWrap} onClick={() => setLightboxMedia(card.image || card.gif)}>
                  <img src={card.image || card.gif} alt="Personal wish" style={styles.cardImage} />
                </div>
              )}

              {card.message && <p style={styles.cardMessage}>{card.message}</p>}
              
              <p style={styles.cardAuthor}>— {card.author}</p>

              <div style={styles.reactionsRow}>
                {REACTIONS.map((r) => (
                  <button
                    key={r.label}
                    className="reaction-btn"
                    style={styles.reactionBtn}
                    onClick={() => handleReaction(card.id, r.label)}
                  >
                    <span>{r.emoji}</span>
                    <span style={styles.reactionCount}>{card.reactions?.[r.label] || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddWishModal 
          editingCard={editingCard} 
          onAdd={handleAddCardData} 
          onClose={() => {
            setShowAddModal(false);
            setEditingCard(null);
          }} 
        />
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
