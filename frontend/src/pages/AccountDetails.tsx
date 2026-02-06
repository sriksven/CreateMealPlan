import { useState } from 'react';
import { User, Mail, Calendar, Shield, Trash2, Save } from 'lucide-react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const AccountDetails = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email] = useState(user?.email || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        setTimeout(() => {
            setSaving(false);
            alert('Profile updated successfully!');
        }, 1000);
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            alert('Account deletion would be processed here');
        }
    };

    return (
        <div className="page-content">
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <button
                        onClick={() => navigate('/profile')}
                        className="btn btn-secondary btn-sm"
                        style={{ marginBottom: 'var(--spacing-md)' }}
                    >
                        ← Back to Profile
                    </button>
                    <h1 className="page-title">Account Details</h1>
                    <p className="text-muted">Manage your account information and settings</p>
                </div>

                {/* Profile Information */}
                <div className="glass-panel animate-fade-in-up" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={20} />
                        Profile Information
                    </h3>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label className="label">Display Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            Email cannot be changed
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        disabled={saving}
                        style={{ gap: '0.5rem' }}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Account Information */}
                <div className="glass-panel animate-fade-in-up" style={{ marginBottom: 'var(--spacing-lg)', animationDelay: '0.1s' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={20} />
                        Account Information
                    </h3>

                    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: 'var(--spacing-sm)',
                            background: 'rgba(124, 58, 237, 0.05)',
                            borderRadius: '8px'
                        }}>
                            <span className="text-muted">Account Status</span>
                            <span className="badge" style={{
                                background: 'rgba(34, 197, 94, 0.2)',
                                border: '1px solid rgb(34, 197, 94)',
                                color: 'rgb(34, 197, 94)'
                            }}>
                                Active
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: 'var(--spacing-sm)',
                            background: 'rgba(124, 58, 237, 0.05)',
                            borderRadius: '8px'
                        }}>
                            <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={16} />
                                Member Since
                            </span>
                            <span>
                                {user?.metadata.creationTime
                                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                                    : 'N/A'}
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: 'var(--spacing-sm)',
                            background: 'rgba(124, 58, 237, 0.05)',
                            borderRadius: '8px'
                        }}>
                            <span className="text-muted">User ID</span>
                            <span className="text-muted" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                {user?.uid.substring(0, 12)}...
                            </span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div
                    className="glass-panel animate-fade-in-up"
                    style={{
                        marginBottom: 'var(--spacing-lg)',
                        animationDelay: '0.2s',
                        borderColor: 'var(--danger)'
                    }}
                >
                    <h3 style={{
                        marginBottom: 'var(--spacing-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--danger)'
                    }}>
                        <Trash2 size={20} />
                        Danger Zone
                    </h3>

                    {/* Reset Data Section (First) */}
                    <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                        Resetting your data will clear your pantry and history, but keep your account active.
                    </p>
                    <button
                        onClick={async () => {
                            if (confirm("Are you SURE you want to reset all data? This cannot be undone.")) {
                                try {
                                    const token = await user?.getIdToken();
                                    if (!token) return;

                                    const res = await fetch(`http://localhost:8000/api/user/data`, {
                                        method: 'DELETE',
                                        headers: { Authorization: `Bearer ${token}` }
                                    });

                                    if (res.ok) {
                                        alert("All data has been reset.");
                                        window.location.reload();
                                    } else {
                                        alert("Failed to reset data.");
                                    }
                                } catch (e) {
                                    console.error(e);
                                    alert("Error resetting data.");
                                }
                            }
                        }}
                        className="btn w-full"
                        style={{
                            backgroundColor: 'transparent',
                            color: 'var(--danger)',
                            border: '1px solid var(--danger)',
                            opacity: 0.8
                        }}
                    >
                        Reset All Data (Keep Account)
                    </button>

                    {/* Delete Account Section (Second, with divider) */}
                    <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            className="btn btn-secondary"
                            style={{
                                borderColor: 'var(--danger)',
                                color: 'var(--danger)',
                                gap: '0.5rem',
                                width: '100%'
                            }}
                        >
                            <Trash2 size={18} />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountDetails;
