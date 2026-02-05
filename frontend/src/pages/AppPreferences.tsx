import { useState } from 'react';
import { Bell, Globe, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppPreferences = () => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState(true);
    const [language, setLanguage] = useState('en');
    const [measurementUnit, setMeasurementUnit] = useState('metric');
    const [autoSync, setAutoSync] = useState(true);

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
            </div>
        </div>
    );
};

export default AppPreferences;
