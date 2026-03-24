import { useState, useRef } from "react";
import { PALETTE, GIPHY_SUGGESTIONS, STICKERS } from "../constants";
import { styles } from "../Wellspring.styles";

export default function AddWishModal({ editingCard, onAdd, onClose }) {
  const [authorName, setAuthorName] = useState(editingCard?.author || "");
  const [message, setMessage] = useState(editingCard?.message || "");
  const [selectedImage, setSelectedImage] = useState(editingCard?.image || null);
  const [selectedGif, setSelectedGif] = useState(editingCard?.gif || null);
  const [selectedSticker, setSelectedSticker] = useState(editingCard?.sticker || null);
  const [activeTab, setActiveTab] = useState(
    editingCard?.image ? "photo" : 
    editingCard?.gif ? "gif" : 
    editingCard?.sticker ? "sticker" : "message"
  );
  
  const fileInputRef = useRef(null);

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
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

        if (dataUrl.length > 1000000) {
          alert("Image is still too large. Please choose a smaller photo.");
          return;
        }
        setSelectedImage(dataUrl);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    onAdd({
      authorName,
      message,
      selectedImage,
      selectedGif,
      selectedSticker
    });
  };

  return (
    <div className="modal-overlay" style={styles.overlay} onClick={onClose}>
      <div className="modal-content" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" style={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <header style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{editingCard ? "Refine your wish" : "Leave a wish"}</h2>
        </header>

        <nav style={styles.tabNav}>
          {["message", "photo", "gif", "sticker"].map((tab) => (
            <button
              key={tab}
              className="tab-btn"
              style={{ ...styles.tabBtn, ...(activeTab === tab ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {activeTab === tab && <div style={styles.tabUnderline} />}
            </button>
          ))}
        </nav>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Your Name</label>
          <input
            style={styles.input}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="How should they address you?"
          />
        </div>

        {activeTab === "message" && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Your Message</label>
            <textarea
              style={styles.textarea}
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share a memory, a joke, or a warm thought..."
            />
          </div>
        )}

        {activeTab === "photo" && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Upload image</label>
            <div style={styles.uploadArea} onClick={() => fileInputRef.current.click()}>
              {selectedImage ? (
                <img src={selectedImage} alt="Preview" style={{ maxWidth: "100%", maxHeight: 150 }} />
              ) : (
                <div>Click to select a photo</div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={styles.label}>Message (Optional)</label>
              <textarea
                style={{ ...styles.textarea, minHeight: 60 }}
                rows="2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a caption to your photo..."
              />
            </div>
          </div>
        )}

        {activeTab === "gif" && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Choose a GIF</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }} className="gif-grid">
              {GIPHY_SUGGESTIONS.map((url) => (
                <img
                  key={url}
                  src={url}
                  className="gif-item"
                  alt="Giphy suggestion"
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                    cursor: "pointer",
                    border: selectedGif === url ? `3px solid ${PALETTE.coral}` : "none"
                  }}
                  onClick={() => {
                    setSelectedGif(url);
                    setSelectedImage(null);
                    setSelectedSticker(null);
                  }}
                />
              ))}
            </div>
            <div>
              <label style={styles.label}>Message (Optional)</label>
              <textarea
                style={{ ...styles.textarea, minHeight: 60 }}
                rows="2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a caption to your GIF..."
              />
            </div>
          </div>
        )}

        {activeTab === "sticker" && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Choose a sticker</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 15, marginBottom: 16 }} className="sticker-grid">
              {STICKERS.map((s) => (
                <button
                  key={s}
                  className="sticker-btn"
                  style={{
                    fontSize: 28,
                    background: "none",
                    border: selectedSticker === s ? `2px solid ${PALETTE.coral}` : "none",
                    cursor: "pointer",
                    borderRadius: 8
                  }}
                  onClick={() => {
                    setSelectedSticker(s);
                    setSelectedImage(null);
                    setSelectedGif(null);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div>
              <label style={styles.label}>Message (Optional)</label>
              <textarea
                style={{ ...styles.textarea, minHeight: 60 }}
                rows="2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a caption to your sticker..."
              />
            </div>
          </div>
        )}

        <button style={styles.submitBtn} className="submit-btn" onClick={handleSubmit}>
          {editingCard ? "Save Changes" : "Post to Board"}
        </button>
      </div>
    </div>
  );
}
