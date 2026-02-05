import { Bell, Lock, CreditCard, Sparkles } from 'lucide-react';
import '../index.css';

const Subscriptions = () => {
    return (
        <div className="page-content">
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 className="page-title">Subscription</h1>

                {/* Coming Soon Hero Section */}
                <div
                    className="glass-panel animate-fade-in-up"
                    style={{
                        padding: 'var(--spacing-xl)',
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-lg)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Animated gradient background */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
                        animation: 'pulse 4s ease-in-out infinite',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-flex',
                            padding: '1rem',
                            background: 'rgba(124, 58, 237, 0.1)',
                            borderRadius: '50%',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            <Sparkles size={48} style={{ color: 'var(--accent-primary)' }} />
                        </div>

                        <h2 style={{
                            fontSize: '2rem',
                            marginBottom: 'var(--spacing-sm)',
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Premium Features Coming Soon
                        </h2>

                        <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-lg)' }}>
                            We're working on exciting premium features to enhance your meal planning experience
                        </p>

                        {/* Notify Me Button */}
                        <button className="btn btn-primary" style={{
                            gap: '0.5rem',
                            padding: '0.75rem 2rem',
                            fontSize: '1rem'
                        }}>
                            <Bell size={20} />
                            Notify Me When Available
                        </button>
                    </div>
                </div>

                {/* Preview Features */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    {/* Feature 1 */}
                    <div className="glass-panel animate-fade-in-up" style={{
                        padding: 'var(--spacing-lg)',
                        animationDelay: '0.1s'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            padding: '0.75rem',
                            background: 'rgba(124, 58, 237, 0.1)',
                            borderRadius: '12px',
                            marginBottom: 'var(--spacing-sm)'
                        }}>
                            <CreditCard size={24} style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Premium Plans</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            Unlock unlimited recipes and advanced AI meal planning
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="glass-panel animate-fade-in-up" style={{
                        padding: 'var(--spacing-lg)',
                        animationDelay: '0.2s'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            padding: '0.75rem',
                            background: 'rgba(124, 58, 237, 0.1)',
                            borderRadius: '12px',
                            marginBottom: 'var(--spacing-sm)'
                        }}>
                            <Lock size={24} style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Exclusive Features</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            Access to nutrition tracking and personalized recommendations
                        </p>
                    </div>
                </div>

                {/* Current Status */}
                <div className="glass-panel animate-fade-in-up" style={{
                    padding: 'var(--spacing-lg)',
                    animationDelay: '0.3s'
                }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Current Plan</h3>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 'var(--spacing-md)'
                    }}>
                        <div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                marginBottom: '0.25rem'
                            }}>
                                Free Plan
                            </div>
                            <p className="text-muted">Full access to all core features</p>
                        </div>
                        <div className="badge" style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(124, 58, 237, 0.2)',
                            border: '1px solid var(--accent-primary)',
                            borderRadius: '20px',
                            color: 'var(--accent-primary)',
                            fontWeight: 600
                        }}>
                            Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscriptions;
