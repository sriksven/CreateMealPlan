import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBasket, ScanLine, User, UtensilsCrossed, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MainLayout: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <div className="layout-root">
            {/* Glassmorphism Header */}
            <header className="app-header">
                <div className="logo-area">
                    <ShoppingBasket color="var(--accent-primary)" size={24} />
                    <span className="text-xl text-gradient">
                        My Pantry
                    </span>
                </div>

                {/* Tab Navigation */}
                <nav className="hidden-mobile" style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to="/recipes" className={`nav-link ${isActive('/recipes')}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UtensilsCrossed size={18} />
                        Recipes
                    </Link>
                    <Link to="/pantry" className={`nav-link ${isActive('/pantry')}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingBasket size={18} />
                        My Pantry
                    </Link>
                    <Link to="/scanner" className={`nav-link ${isActive('/scanner')}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ScanLine size={18} />
                        Scanner
                    </Link>
                    <Link to="/profile" className={`nav-link ${isActive('/profile')}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={18} />
                        Profile
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="text-sm text-muted hidden-mobile">
                            {user?.email?.split('@')[0]}
                        </span>
                        <button
                            onClick={() => logout()}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.4rem' }}
                        >
                            <LogOut size={14} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Tab Bar (Visible only on small screens) */}
            <nav className="glass-panel" style={{
                position: 'fixed',
                bottom: '1rem',
                left: '1rem',
                right: '1rem',
                height: '60px',
                zIndex: 100,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: 0,
                borderRadius: '20px'
            }}>
                {[
                    { path: '/recipes', icon: UtensilsCrossed, label: 'Recipes' },
                    { path: '/pantry', icon: ShoppingBasket, label: 'Pantry' },
                    { path: '/scanner', icon: ScanLine, label: 'Scan' },
                    { path: '/profile', icon: User, label: 'Profile' }
                ].map(tab => (
                    <Link key={tab.path} to={tab.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === tab.path ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        <tab.icon size={20} />
                        <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>{tab.label}</span>
                    </Link>
                ))}
            </nav>
            {/* End Mobile Tab Bar */}

            {/* Main Content Area */}
            <main className="page-content container">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
