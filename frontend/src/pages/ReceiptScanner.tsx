import React from 'react';
import { Camera, Upload, ScanLine } from 'lucide-react';

const ReceiptScanner: React.FC = () => {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h1 className="text-2xl" style={{ marginBottom: '1.5rem' }}>Receipt Scanner</h1>

            <div className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--text-secondary)', background: 'rgba(255,255,255,0.02)' }}>

                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)' }}>
                    <Camera size={32} color="var(--accent-primary)" />
                </div>

                <h3 className="text-xl" style={{ marginBottom: '0.5rem' }}>Capture Receipt</h3>
                <p className="text-muted text-center" style={{ maxWidth: '300px', marginBottom: '2rem' }}>
                    Snap a photo of your grocery receipt. We'll automatically add items to your pantry.
                </p>

                <div className="flex gap-4">
                    <button className="btn btn-primary">
                        <Camera size={20} />
                        Take Photo
                    </button>
                    <button className="btn btn-secondary">
                        <Upload size={20} />
                        Upload
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1rem' }}>
                <div className="flex items-center gap-4">
                    <ScanLine className="text-muted" />
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Auto-Detect Active</div>
                        <div style={{ fontSize: '0.8rem' }} className="text-muted">Align receipt within frame</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptScanner;
