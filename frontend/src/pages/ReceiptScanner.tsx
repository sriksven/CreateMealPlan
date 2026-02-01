import React, { useState, useRef } from "react";
import { auth } from "../firebase";
import { API_BASE_URL } from "../config";
import { Camera, Upload, X, Check } from "lucide-react";

const ReceiptScanner: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Trigger File Upload
  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Trigger Camera
  const handleCameraClick = () => {
    if (cameraInputRef.current) cameraInputRef.current.click();
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
      setMessage(`success|Added ${data.items.length} items to your pantry!`);
      setFile(null); // Clear after success
      setPreview(null);
    } catch (err) {
      console.error(err);
      setMessage("error|Failed to scan receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.startsWith("success|");
  const displayMessage = message.split("|")[1] || message;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <div className="glass-panel w-full max-w-lg p-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-2 text-center">Scan Receipt</h2>
        <p className="text-muted text-center mb-8">
          Take a photo or upload a receipt to auto-add items.
        </p>

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

        {/* Preview Area */}
        {preview ? (
          <div className="relative w-full h-64 bg-black/50 rounded-lg overflow-hidden mb-6 border border-[var(--glass-border)]">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <button
              onClick={clearSelection}
              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
            >
              <X size={20} color="white" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-8">
            {/* Big Camera Action */}
            <button
              onClick={handleCameraClick}
              className="btn btn-primary text-lg py-4 flex-col gap-2 h-32 border-2 border-[var(--accent-primary)] bg-[rgba(59,130,246,0.1)] hover:bg-[rgba(59,130,246,0.2)]"
            >
              <Camera size={40} />
              <span>Open Camera</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="h-[1px] bg-[var(--glass-border)] flex-1"></div>
              <span className="text-sm text-muted">OR</span>
              <div className="h-[1px] bg-[var(--glass-border)] flex-1"></div>
            </div>

            {/* Upload Action */}
            <button
              onClick={handleUploadClick}
              className="btn btn-secondary py-3"
            >
              <Upload size={20} />
              <span>Upload from Gallery</span>
            </button>
          </div>
        )}

        {/* Scan Action */}
        {file && (
          <button
            className="btn btn-primary w-full text-lg py-3 mb-4"
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Receipt"}
          </button>
        )}

        {/* Messages */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${isSuccess ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {isSuccess ? <Check size={20} /> : <X size={20} />}
            <span>{displayMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;
