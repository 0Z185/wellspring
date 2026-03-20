import { useState, useEffect, useRef, useCallback } from "react";
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

const CARD_COLORS = [
  "linear-gradient(135deg, #FFF2CC 0%, #FFDF99 100%)",
  "linear-gradient(135deg, #FFF5E6 0%, #FFE699 100%)",
  "linear-gradient(135deg, #E6F7EB 0%, #A8E4BC 100%)",
  "linear-gradient(135deg, #F2D2DA 0%, #D47A90 100%)",
  "linear-gradient(135deg, #FFDF99 0%, #FFD700 100%)",
  "linear-gradient(135deg, #FFE699 0%, #FFBF00 100%)",
  "linear-gradient(135deg, #A8E4BC 0%, #50C878 100%)",
  "linear-gradient(135deg, #D47A90 0%, #800020 100%)",
];

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

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
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ["#FFD700", "#FFBF00", "#50C878", "#800020"][i % 4],
      rotation: Math.random() * 360,
      duration: 1.5 + Math.random() * 1.5,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 3500);
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

  const handleReaction = async (cardId, emoji) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    const reactions = { ...card.reactions };
    reactions[emoji] = (reactions[emoji] || 0) + 1;
    
    try {
      await updateDoc(doc(db, "wishes", cardId), { reactions });
    } catch(e) {
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
    } catch(e) {
      console.error("Error deleting card:", e);
    }
  };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@400;500;600;700&family=Sacramento&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
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

      {/* Floating decorative elements */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {["🎈", "🎁", "✨", "🎂", "💖", "🎊"].map((emoji, i) => (
          <div
            key={i}
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
        <div style={styles.heroInner}>
          <div style={styles.heroEmoji}>🎂</div>
          <h1 style={styles.heroTitle}>Happy Birthday</h1>
          <div style={styles.heroName}>Omoye Zindzi Iyayi</div>
          <p style={styles.heroSub}>
            A collection of warm wishes from friends and colleagues
          </p>
          <div style={styles.cardCount}>
            <span style={styles.countNum}>{cards.length}</span>
            <span style={styles.countLabel}>{cards.length === 1 ? "wish" : "wishes"} so far</span>
          </div>
        </div>
        <div style={styles.heroDeco}></div>
      </div>

      {/* Add Button */}
      <button className="add-btn" style={styles.addBtn} onClick={() => setShowAddModal(true)}>
        <span style={{ fontSize: 22 }}>+</span>
        <span>Add to Board</span>
      </button>

      {/* Cards Grid */}
      {loading ? (
        <div style={styles.loadingWrap}>
          <div style={{ animation: "pulse 1.5s infinite", fontSize: 40 }}>🎂</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#999", marginTop: 12 }}>Loading wishes...</p>
        </div>
      ) : cards.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎈</div>
          <p style={styles.emptyTitle}>No wishes yet!</p>
          <p style={styles.emptySub}>Be the first to add a birthday wish for Omoye Zindzi.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {cards.map((card, i) => (
            <div
              key={card.id}
              className="card-item card-wrapper"
              style={{ ...styles.card, background: card.bg, animationDelay: `${i * 0.08}s` }}
            >
              {/* Edit / Delete buttons */}
              {myWishes.includes(card.id) && (
                <div className="card-controls" style={styles.cardControls}>
                  <button
                    className="control-btn"
                    onClick={() => handleEditClick(card)}
                    style={styles.controlBtn}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    className="control-btn"
                    onClick={() => handleDeleteCard(card.id)}
                    style={styles.controlBtn}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              )}

              {card.sticker && (
                <div style={styles.cardSticker}>{card.sticker}</div>
              )}
              {card.image && (
                <div style={styles.cardImageWrap}>
                  <img src={card.image} alt="" style={styles.cardImage} />
                </div>
              )}
              {card.gif && (
                <div style={styles.cardImageWrap}>
                  <img src={card.gif} alt="" style={styles.cardImage} />
                </div>
              )}
              {card.message && <p style={styles.cardMessage}>{card.message}</p>}
              <div style={styles.cardAuthor}>— {card.author}</div>

              {/* Reactions */}
              <div style={styles.reactionsRow}>
                {REACTIONS.map((r) => (
                  <button
                    key={r.emoji}
                    className="reaction-btn"
                    style={{
                      ...styles.reactionBtn,
                      ...(card.reactions[r.emoji] ? styles.reactionBtnActive : {}),
                    }}
                    onClick={() => handleReaction(card.id, r.emoji)}
                    title={r.label}
                  >
                    <span>{r.emoji}</span>
                    {card.reactions[r.emoji] > 0 && (
                      <span style={styles.reactionCount}>{card.reactions[r.emoji]}</span>
                    )}
                  </button>
                ))}
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
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingCardId ? "Edit Your Wish ✨" : "Add Your Wish ✨"}</h2>
              <button style={styles.closeBtn} onClick={() => { setShowAddModal(false); resetForm(); }}>×</button>
            </div>

            {/* Name input */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Your Name</label>
              <input
                style={styles.input}
                placeholder="Enter your name..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
              {[
                { id: "message", icon: "💬", label: "Message" },
                { id: "photo", icon: "📸", label: "Photo" },
                { id: "gif", icon: "🎬", label: "GIFs" },
                { id: "sticker", icon: "🎈", label: "Stickers" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className="tab-btn"
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab.id ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={styles.tabContent}>
              {activeTab === "message" && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Birthday Message</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Write a heartfelt birthday wish..."
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
                      <button
                        style={styles.removeMediaBtn}
                        onClick={() => setSelectedImage(null)}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      style={styles.uploadBtn}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span style={{ fontSize: 32 }}>📸</span>
                      <span style={{ fontWeight: 600 }}>Upload a Photo</span>
                      <span style={{ fontSize: 13, color: "#999" }}>JPG, PNG, GIF up to 5MB</span>
                    </button>
                  )}
                  <div style={{ ...styles.fieldGroup, marginTop: 14 }}>
                    <textarea
                      style={{ ...styles.textarea, minHeight: 60 }}
                      placeholder="Add a caption (optional)..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {activeTab === "gif" && (
                <div>
                  <p style={styles.gifHint}>Pick a birthday GIF:</p>
                  <div style={styles.gifGrid}>
                    {GIPHY_SUGGESTIONS.map((url, i) => (
                      <div
                        key={i}
                        className="gif-item"
                        style={{
                          ...styles.gifItem,
                          ...(selectedGif === url ? styles.gifItemSelected : {}),
                        }}
                        onClick={() => setSelectedGif(selectedGif === url ? null : url)}
                      >
                        <img src={url} alt="" style={styles.gifImg} />
                        {selectedGif === url && (
                          <div style={styles.gifCheck}>✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ ...styles.fieldGroup, marginTop: 14 }}>
                    <textarea
                      style={{ ...styles.textarea, minHeight: 60 }}
                      placeholder="Add a message (optional)..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {activeTab === "sticker" && (
                <div>
                  <p style={styles.gifHint}>Pick a sticker to add flair:</p>
                  <div style={styles.stickerGrid}>
                    {STICKERS.map((s, i) => (
                      <button
                        key={i}
                        className="sticker-btn"
                        style={{
                          ...styles.stickerBtn,
                          ...(selectedSticker === s ? styles.stickerBtnSelected : {}),
                        }}
                        onClick={() => setSelectedSticker(selectedSticker === s ? null : s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div style={{ ...styles.fieldGroup, marginTop: 14 }}>
                    <textarea
                      style={{ ...styles.textarea, minHeight: 60 }}
                      placeholder="Add a message (optional)..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              style={{
                ...styles.submitBtn,
                opacity: authorName.trim() && (message.trim() || selectedImage || selectedGif || selectedSticker) ? 1 : 0.5,
              }}
              onClick={handleAddCard}
              disabled={!authorName.trim() || (!message.trim() && !selectedImage && !selectedGif && !selectedSticker)}
            >
              {editingCardId ? "💾 Save Changes" : "🎉 Post Birthday Wish"}
            </button>
          </div>
        </div>
      )}

      <div style={styles.footer}>
        <p>Made with 💖 for Omoye Zindzi Iyayi's birthday</p>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #FFFDF5 0%, #FDF7EC 30%, #F4FAF6 70%, #FAF0F2 100%)",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  hero: {
    position: "relative",
    textAlign: "center",
    padding: "56px 24px 40px",
    overflow: "hidden",
  },
  heroInner: {
    position: "relative",
    zIndex: 2,
  },
  heroEmoji: {
    fontSize: 56,
    marginBottom: 8,
    animation: "float 4s ease-in-out infinite",
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(32px, 7vw, 52px)",
    fontWeight: 900,
    color: "#2D2D2D",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },
  heroName: {
    fontFamily: "'Sacramento', cursive",
    fontSize: "clamp(36px, 8vw, 64px)",
    color: "#50C878",
    marginTop: 4,
    lineHeight: 1.2,
  },
  heroSub: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    color: "#888",
    marginTop: 12,
    letterSpacing: "0.02em",
  },
  cardCount: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: 50,
    padding: "8px 20px",
    border: "1px solid rgba(212,175,55,0.3)",
  },
  countNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 900,
    color: "#D4AF37",
  },
  countLabel: {
    fontSize: 14,
    color: "#777",
    fontWeight: 500,
  },
  heroDeco: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,191,0,0.12) 0%, transparent 70%)",
    zIndex: 0,
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "0 auto 32px",
    padding: "14px 32px",
    background: "linear-gradient(135deg, #800020 0%, #B3002D 100%)",
    color: "white",
    border: "none",
    borderRadius: 50,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(128,0,32,0.3)",
    transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
    zIndex: 10,
    position: "relative",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
    padding: "0 24px 40px",
    maxWidth: 1100,
    margin: "0 auto",
  },
  card: {
    borderRadius: 18,
    padding: 24,
    position: "relative",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "default",
    overflow: "hidden",
  },
  cardControls: {
    position: "absolute",
    top: 8,
    right: 10,
    display: "flex",
    gap: 6,
    zIndex: 3,
  },
  controlBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.08)",
    color: "#888",
    fontSize: 15,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    lineHeight: 1,
  },
  cardSticker: {
    fontSize: 42,
    marginBottom: 10,
    textAlign: "center",
  },
  cardImageWrap: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  cardImage: {
    width: "100%",
    display: "block",
    maxHeight: 220,
    objectFit: "cover",
  },
  cardMessage: {
    fontSize: 15,
    lineHeight: 1.65,
    color: "#3D3D3D",
    marginBottom: 12,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  cardAuthor: {
    fontFamily: "'Playfair Display', serif",
    fontStyle: "italic",
    fontSize: 14,
    color: "#888",
    marginBottom: 14,
  },
  reactionsRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  reactionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    borderRadius: 50,
    border: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
  },
  reactionBtnActive: {
    border: "1px solid rgba(80,200,120,0.4)",
    background: "rgba(80,200,120,0.15)",
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: 700,
    color: "#50C878",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    background: "white",
    borderRadius: 24,
    width: "100%",
    maxWidth: 480,
    maxHeight: "90vh",
    overflow: "auto",
    padding: 28,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  modalTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#2D2D2D",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "none",
    background: "#f5f5f5",
    fontSize: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#999",
    transition: "background 0.2s",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#666",
    marginBottom: 6,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "2px solid #EEE",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "border 0.2s",
    background: "#FAFAFA",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "2px solid #EEE",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    resize: "vertical",
    minHeight: 100,
    lineHeight: 1.6,
    transition: "border 0.2s",
    background: "#FAFAFA",
  },
  tabs: {
    display: "flex",
    gap: 4,
    marginBottom: 16,
    background: "#F5F5F5",
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "10px 8px",
    borderRadius: 12,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    color: "#999",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "white",
    color: "#FF6B8A",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  tabContent: {
    marginBottom: 20,
  },
  photoTab: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  uploadBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "32px 24px",
    borderRadius: 16,
    border: "2px dashed #DDD",
    background: "#FAFAFA",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    color: "#666",
    transition: "all 0.2s",
    width: "100%",
  },
  previewImage: {
    width: "100%",
    maxHeight: 200,
    objectFit: "cover",
    borderRadius: 12,
    display: "block",
  },
  removeMediaBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: "6px 14px",
    borderRadius: 50,
    border: "none",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  gifHint: {
    fontSize: 13,
    color: "#999",
    marginBottom: 10,
    fontWeight: 500,
  },
  gifGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
    maxHeight: 240,
    overflow: "auto",
  },
  gifItem: {
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    position: "relative",
    transition: "all 0.2s",
    border: "3px solid transparent",
    aspectRatio: "1",
  },
  gifItemSelected: {
    border: "3px solid #FF6B8A",
  },
  gifImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  gifCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#FF6B8A",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
  },
  stickerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: 8,
  },
  stickerBtn: {
    fontSize: 32,
    padding: "10px 0",
    borderRadius: 12,
    border: "2px solid transparent",
    background: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
    textAlign: "center",
  },
  stickerBtnSelected: {
    border: "2px solid #FF6B8A",
    background: "rgba(255,107,138,0.08)",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg, #FF6B8A 0%, #FF8E53 100%)",
    color: "white",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 16px rgba(255,107,138,0.3)",
  },
  loadingWrap: {
    textAlign: "center",
    padding: "60px 24px",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 24px 80px",
  },
  emptyTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#2D2D2D",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 15,
    color: "#999",
  },
  footer: {
    textAlign: "center",
    padding: "24px",
    fontSize: 13,
    color: "#BBB",
    fontFamily: "'DM Sans', sans-serif",
  },
};
