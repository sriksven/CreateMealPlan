import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
    return (
        <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <h2 className="text-2xl text-center" style={{ marginBottom: '2rem' }}>Welcome Back</h2>
                <form className="flex flex-col gap-4">
                    <div>
                        <label className="label">Email</label>
                        <input type="email" className="input-field" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <input type="password" className="input-field" placeholder="••••••••" />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                        Sign In
                    </button>
                </form>
                <p className="text-center text-muted" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-primary)' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
