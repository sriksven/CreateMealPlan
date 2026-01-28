import React from 'react';
import { User, Settings, Award } from 'lucide-react';

const Profile: React.FC = () => {
    return (
        <div>
            <div className="flex items-center gap-4" style={{ marginBottom: '2.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>JD</span>
                </div>
                <div>
                    <h2 className="text-2xl">John Doe</h2>
                    <p className="text-muted">Pro Member</p>
                </div>
            </div>

            <h3 className="text-xl" style={{ marginBottom: '1rem' }}>Dietary Goals</h3>
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                        <label className="label">Daily Protein Target</label>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>140g</span>
                    </div>
                    <input type="range" className="w-full" style={{ accentColor: 'var(--accent-primary)' }} defaultValue={70} />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {['Keto', 'Veggie', 'No Dairy'].map(tag => (
                        <span key={tag} className="badge" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)' }}>
                            {tag}
                        </span>
                    ))}
                    <span className="badge" style={{ borderStyle: 'dashed', cursor: 'pointer' }}>+ Add Tag</span>
                </div>
            </div>

            <h3 className="text-xl" style={{ marginBottom: '1rem' }}>Settings</h3>
            <div className="glass-panel" style={{ padding: 0 }}>
                {[
                    { icon: User, label: 'Account Details' },
                    { icon: Award, label: 'Subscription' },
                    { icon: Settings, label: 'App Preferences' },
                ].map((item, i) => (
                    <div key={i} style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: i < 2 ? '1px solid var(--glass-border)' : 'none', cursor: 'pointer' }}>
                        <item.icon className="text-muted" size={20} />
                        <span style={{ flexGrow: 1 }}>{item.label}</span>
                    </div>
                ))}
            </div>

            <button className="btn btn-secondary w-full" style={{ marginTop: '2rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                Log Out
            </button>
        </div>
    );
};

export default Profile;
