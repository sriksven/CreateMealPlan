import { useState, useEffect } from 'react';
import { Bell, Globe, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const API_BASE_URL = 'http://localhost:8000';

const AppPreferences = () => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState(true);
    const [language, setLanguage] = useState('en');
    const [measurementUnit, setMeasurementUnit] = useState('metric');
    const [autoSync, setAutoSync] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Load user preferences from backend
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const token = await auth.currentUser?.getIdToken();
                if (!token) return;

                const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.measurementUnit) {
                        setMeasurementUnit(data.measurementUnit);
                    }
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPreferences();
    }, []);

    // Save preferences to backend
    const handleSavePreferences = async () => {
        setSaving(true);
        setSaveSuccess(false);

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                console.error('No auth token available');
                alert('Please log in to save preferences');
                return;
            }

            console.log('Saving measurement unit:', measurementUnit);

            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ measurementUnit })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Save failed:', errorData);
                throw new Error(errorData.error || 'Failed to save');
            }

            console.log('Measurement unit saved successfully');
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving preferences:', error);
            alert('Failed to save preferences. Please try again.');
        } finally {
            setSaving(false);
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
                    <h1 className="page-title">App Preferences</h1>
                    <p className="text-muted">Customize your app experience</p>
                </div>

                {/* Notifications */}
                <div className="glass-panel animate-fade-in-up" style={{
                    marginBottom: 'var(--spacing-lg)',
                    animationDelay: '0.1s'
                }}>
                    <h3 style={{
                        marginBottom: 'var(--spacing-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Bell size={20} />
                        Notifications
                    </h3>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--spacing-sm) 0'
                    }}>
                        <div>
                            <div>Push Notifications</div>
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                                Receive notifications about recipe suggestions
                            </p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={notifications}
                                onChange={(e) => setNotifications(e.target.checked)}
                            />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                </div>

                {/* Regional Settings */}
                <div className="glass-panel animate-fade-in-up" style={{
                    marginBottom: 'var(--spacing-lg)',
                    animationDelay: '0.2s'
                }}>
                    <h3 style={{
                        marginBottom: 'var(--spacing-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Globe size={20} />
                        Regional Settings
                    </h3>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label className="label">Language</label>
                        <select
                            className="input-field"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Measurement Units</label>
                        <select
                            className="input-field"
                            value={measurementUnit}
                            onChange={(e) => setMeasurementUnit(e.target.value)}
                            disabled={loading || saving}
                        >
                            <option value="metric">Metric (kg, g, ml)</option>
                            <option value="imperial">Imperial (lb, oz, cup)</option>
                        </select>
                    </div>
                </div>

                {/* Data & Storage */}
                <div className="glass-panel animate-fade-in-up" style={{
                    animationDelay: '0.3s'
                }}>
                    <h3 style={{
                        marginBottom: 'var(--spacing-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Database size={20} />
                        Data & Storage
                    </h3>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--spacing-sm) 0',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        <div>
                            <div>Auto-sync Pantry</div>
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                                Automatically sync your pantry across devices
                            </p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={autoSync}
                                onChange={(e) => setAutoSync(e.target.checked)}
                            />
                            <span className="toggle-slider" />
                        </label>
                    </div>

                    <button className="btn btn-secondary w-full">
                        Clear Cache
                    </button>
                </div>

                {/* Save Button */}
                <div className="glass-panel animate-fade-in-up" style={{
                    animationDelay: '0.4s',
                    marginTop: 'var(--spacing-lg)'
                }}>
                    {saveSuccess && (
                        <div style={{
                            padding: 'var(--spacing-sm)',
                            marginBottom: 'var(--spacing-md)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: 'var(--border-radius)',
                            color: 'var(--success)',
                            textAlign: 'center',
                            fontSize: '0.9rem'
                        }}>
                            ✓ Preferences saved successfully!
                        </div>
                    )}
                    <button
                        onClick={handleSavePreferences}
                        disabled={saving || loading}
                        className="btn btn-primary w-full"
                        style={{ fontSize: '1rem', padding: '0.875rem' }}
                    >
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppPreferences;
