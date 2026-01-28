import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChefHat, ShoppingBasket, ScanLine, User, UtensilsCrossed } from 'lucide-react';

const MainLayout: React.FC = () => {
    const location = useLocation();

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
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} className="text-muted" />
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
