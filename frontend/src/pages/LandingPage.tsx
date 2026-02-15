import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
    return (
        <div className="landing-page">
            {/* Background Elements */}
            <div className="landing-bg">
                <div className="blob blob-blue" />
                <div className="blob blob-purple" />
            </div>

            {/* Header */}
            <header className="app-header">
                <div className="logo-area">
                    <span className="text-2xl">CreateMealPlan</span>
                </div>
                <nav className="nav-actions">
                    <Link to="/login" className="btn btn-primary btn-sm">
                        Login
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="landing-main">
                <div className="hero-content animate-fade-in-up">
                    <span className="badge">AI-Powered Kitchen Assistant</span>

                    <h1 className="text-hero leading-tight">
                        Turn Your Pantry <br />
                        Into <span className="text-gradient">Perfect Meals</span>
                    </h1>

                    <p className="text-xl text-muted description">
                        Stop wasting food. Scan your receipts, track your pantry, and generate high-protein meal plans instantly with OpenAI.
                    </p>

                    <div className="cta-group">
                        <Link to="/login" className="btn btn-primary btn-lg">
                            Get Started Free
                        </Link>
                        <a href="#how-it-works" className="btn btn-secondary btn-lg">
                            How it Works
                        </a>
                    </div>
                </div>

                {/* Feature Grid Mockup */}
                <div id="how-it-works" className="features-grid">
                    <div className="glass-panel feature-card">
                        <div className="feature-icon">📸</div>
                        <h3 className="text-xl mb-2">Smart Scanning</h3>
                        <p className="text-muted">Snap a photo of your receipt. Our AI extracts existing ingredients and updates your pantry automatically.</p>
                    </div>
                    <div className="glass-panel feature-card">
                        <div className="feature-icon">🥗</div>
                        <h3 className="text-xl mb-2">Macro Tracking</h3>
                        <p className="text-muted">We prioritize your health. All generated recipes are optimized for your daily protein goals.</p>
                    </div>
                    <div className="glass-panel feature-card">
                        <div className="feature-icon">✨</div>
                        <h3 className="text-xl mb-2">AI Chef</h3>
                        <p className="text-muted">Don't know what to cook? Get creative recipes based strictly on what you have at home.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <p>© {new Date().getFullYear()} CreateMealPlan. Powered by OpenAI.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
