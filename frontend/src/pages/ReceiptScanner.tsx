import React, { useState, useRef } from "react";
import { auth } from "../firebase";
import { API_BASE_URL } from "../config";
import { Camera, Upload, X, Check, Edit2, Trash2 } from "lucide-react";

interface ScannedItem {
  name: string;
  quantity: string;
  unit: string;
  count?: string;
  isGrocery?: boolean;
  confidence?: number;
}

const ReceiptScanner: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [confirmedItems, setConfirmedItems] = useState<ScannedItem[]>([]);
  const [suggestedRemovals, setSuggestedRemovals] = useState<ScannedItem[]>([]);
  const [receiptMetadata, setReceiptMetadata] = useState<any>(null);
  const [possibleDuplicate, setPossibleDuplicate] = useState(false);
  const [lastScannedAt, setLastScannedAt] = useState<string | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Detect if device is mobile
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
  };

  // Trigger File Upload
  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Open Camera - choose method based on device
  const handleCameraClick = async () => {
    // On mobile, use native camera input
    if (isMobileDevice()) {
      if (cameraInputRef.current) cameraInputRef.current.click();
      return;
    }

    // On desktop, use WebRTC
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      setIsCameraOpen(true);

      // Wait a bit for state to update, then attach stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera access error:", error);
      setMessage("error|Unable to access camera. Please check permissions.");
      // Fallback to file input
      if (cameraInputRef.current) cameraInputRef.current.click();
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
            setFile(file);
            setPreview(URL.createObjectURL(blob));
            closeCamera();
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  // Close camera stream
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setMessage("");
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setMessage("");
    setConfirmedItems([]);
    setSuggestedRemovals([]);
    setEditingIndex(null);
    setReceiptMetadata(null);
    setPossibleDuplicate(false);
    setLastScannedAt(null);
    setShowDuplicateWarning(false);
    closeCamera();
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleScan = async () => {
    if (!file) {
      setMessage("Please select a receipt image.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("User not authenticated");

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_BASE_URL}/api/scanner/scan`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Scan failed");
      }

      const data = await res.json();
      const items = data.items || [];

      // Split items into confirmed groceries and suggested removals
      const confirmed = items.filter((item: ScannedItem) => item.isGrocery !== false);
      const suggested = items.filter((item: ScannedItem) => item.isGrocery === false);

      setConfirmedItems(confirmed);
      setSuggestedRemovals(suggested);
      setReceiptMetadata(data.metadata);
      setPossibleDuplicate(data.possibleDuplicate);
      setLastScannedAt(data.lastScannedAt);

      const totalFound = items.length;
      const suggestedCount = suggested.length;

      if (suggestedCount > 0) {
        setMessage(`success|Found ${totalFound} items! ${suggestedCount} non-grocery item(s) detected for review.`);
      } else {
        setMessage(`success|Found ${totalFound} grocery items! Review and save to pantry.`);
      }
    } catch (err) {
      console.error(err);
      setMessage("error|Failed to scan receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const initiateSave = () => {
    if (possibleDuplicate) {
      setShowDuplicateWarning(true);
    } else {
      handleSaveItems();
    }
  };

  const handleSaveItems = async () => {
    if (confirmedItems.length === 0) return;

    setLoading(true);
    setShowDuplicateWarning(false);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("User not authenticated");

      const res = await fetch(`${API_BASE_URL}/api/scanner/save-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: confirmedItems,
          metadata: receiptMetadata // Include metadata for future duplicate checks
        }),
      });

      if (!res.ok) throw new Error("Failed to save items");

      setMessage(`success|Added ${confirmedItems.length} items to your pantry!`);
      setTimeout(() => {
        clearSelection();
      }, 2000);
    } catch (err) {
      console.error(err);
      setMessage("error|Failed to save items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateConfirmedItem = (index: number, field: keyof ScannedItem, value: string) => {
    const updated = [...confirmedItems];
    updated[index] = { ...updated[index], [field]: value };
    setConfirmedItems(updated);
  };

  const deleteConfirmedItem = (index: number) => {
    setConfirmedItems(confirmedItems.filter((_, i) => i !== index));
  };

  const approveSuggested = (index: number) => {
    const item = suggestedRemovals[index];
    setConfirmedItems([...confirmedItems, item]);
    setSuggestedRemovals(suggestedRemovals.filter((_, i) => i !== index));
  };

  const rejectSuggested = (index: number) => {
    const suggested = [...suggestedRemovals];
    suggested.splice(index, 1);
    setSuggestedRemovals(suggested);
  };

  const isSuccess = message.startsWith("success|");
  const displayMessage = message.split("|")[1] || message;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl" style={{ marginBottom: '0.5rem' }}>Scan Receipt</h1>
          <p className="text-muted">Take a photo or upload a receipt to auto-add items.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Hidden Inputs */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          style={{ display: "none" }}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
          style={{ display: "none" }}
        />

        {/* Hidden canvas for capturing photos */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Camera View */}
        {isCameraOpen ? (
          <div style={{ position: 'relative', width: '100%', backgroundColor: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', minHeight: '400px', maxHeight: '500px', objectFit: 'cover' }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play();
                }
              }}
            />
            <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '1rem', padding: '0 1rem' }}>
              <button
                onClick={capturePhoto}
                className="btn btn-primary"
                style={{ gap: '0.5rem' }}
              >
                <Camera size={20} />
                Capture Photo
              </button>
              <button
                onClick={closeCamera}
                className="btn"
                style={{ gap: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          </div>
        ) : preview ? (
          <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
            <img
              src={preview}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <button
              onClick={clearSelection}
              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              className="hover-scale"
            >
              <X size={20} color="white" />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {/* Big Camera Action */}
            <button
              onClick={handleCameraClick}
              className="btn btn-primary"
              style={{
                fontSize: '1.125rem',
                padding: '2rem',
                flexDirection: 'column',
                gap: '0.75rem',
                height: 'auto',
                border: '2px solid var(--accent-primary)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
              }}
            >
              <Camera size={40} />
              <span>Open Camera</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', flex: 1 }}></div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>OR</span>
              <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', flex: 1 }}></div>
            </div>

            {/* Upload Action */}
            <button
              onClick={handleUploadClick}
              className="btn btn-secondary"
              style={{ gap: '0.5rem' }}
            >
              <Upload size={20} />
              <span>Upload from Gallery</span>
            </button>
          </div>
        )}

        {/* Scan Action */}
        {file && confirmedItems.length === 0 && suggestedRemovals.length === 0 && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '1.125rem', marginBottom: '1rem' }}
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Receipt"}
          </button>
        )}

        {/* PROMPT: Duplicate Warning Modal */}
        {showDuplicateWarning && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 className="text-xl" style={{ marginBottom: '0.5rem' }}>Duplicate Receipt?</h3>
                <p className="text-muted">
                  It looks like you scanned a receipt from <strong>{receiptMetadata?.merchantName || 'this merchant'}</strong> on <strong>{receiptMetadata?.date || 'this date'}</strong> before.
                </p>
                {lastScannedAt && (
                  <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Last duplicate scan: {new Date(lastScannedAt).toLocaleDateString()}
                  </p>
                )}
                <p className="text-muted" style={{ marginTop: '1rem' }}>
                  Do you still want to add these items?
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowDuplicateWarning(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleSaveItems}
                >
                  Yes, Add Items
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmed Groceries Section - Show First */}
        {confirmedItems.length > 0 && !showDuplicateWarning && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 className="text-xl" style={{ marginBottom: '1rem' }}>
              ✅ Confirmed Groceries ({confirmedItems.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
              {confirmedItems.map((item: ScannedItem, index: number) => (
                <div
                  key={`confirmed-${index}`}
                  className="glass-panel"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                      {item.quantity} {item.unit}{item.count ? ` • ${item.count} count` : ''}
                    </div>
                  </div>
                  {editingIndex === index ? (
                    <>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateConfirmedItem(index, "name", e.target.value)}
                        className="input-field"
                        style={{ flex: 1 }}
                        placeholder="Item name"
                      />
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => updateConfirmedItem(index, "quantity", e.target.value)}
                        className="input-field"
                        style={{ width: '80px' }}
                        placeholder="Qty"
                      />
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateConfirmedItem(index, "unit", e.target.value)}
                        className="input-field"
                        style={{ width: '80px' }}
                        placeholder="Unit"
                      />
                      <input
                        type="text"
                        value={item.count || ''}
                        onChange={(e) => updateConfirmedItem(index, "count", e.target.value)}
                        className="input-field"
                        style={{ width: '70px' }}
                        placeholder="Count"
                      />
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="btn btn-sm"
                        style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--success)', padding: '0.5rem' }}
                      >
                        <Check size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="btn btn-sm"
                        style={{ padding: '0.5rem' }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteConfirmedItem(index)}
                        className="btn btn-sm"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', padding: '0.5rem' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={initiateSave}
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1, fontSize: '1.125rem' }}
              >
                {loading ? "Saving..." : `Save ${confirmedItems.length} Items to Pantry`}
              </button>
              <button
                onClick={clearSelection}
                className="btn btn-secondary"
                style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Suggested Removals Section - Show Below Save Button */}
        {suggestedRemovals.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 className="text-xl" style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Items That Don't Belong in Pantry ({suggestedRemovals.length})
            </h3>
            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              These items don't appear to be groceries. Move to pantry or delete?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
              {suggestedRemovals.map((item: ScannedItem, index: number) => (
                <div
                  key={`suggested-${index}`}
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(156, 163, 175, 0.05)',
                    borderColor: 'rgba(156, 163, 175, 0.2)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                      {item.quantity} {item.unit}{item.count ? ` • ${item.count} count` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => approveSuggested(index)}
                    className="btn btn-sm"
                    title="Move to groceries"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: 'var(--accent-primary)',
                      padding: '0.5rem',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    ↑ Move
                  </button>
                  <button
                    onClick={() => rejectSuggested(index)}
                    className="btn btn-sm"
                    title="Delete item"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: 'var(--danger)',
                      padding: '0.5rem'
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Clear All button when there are only suggestions (wrong receipt edge case) */}
            {confirmedItems.length === 0 && (
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={clearSelection}
                  className="btn"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--danger)',
                    gap: '0.5rem'
                  }}
                >
                  <X size={20} />
                  Reject All & Start Over
                </button>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {message && (
          <div
            className="glass-panel"
            style={{
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: isSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: isSuccess ? 'var(--success)' : 'var(--danger)'
            }}
          >
            {isSuccess ? <Check size={20} /> : <X size={20} />}
            <span>{displayMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;
