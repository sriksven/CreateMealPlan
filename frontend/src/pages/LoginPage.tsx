import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { ArrowLeft } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 🔐 Email + Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 🔥 Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="landing-page">
      {/* Background Elements */}
      <div className="landing-bg">
        <div className="blob blob-blue" />
        <div className="blob blob-purple" />
      </div>

      <div className="landing-main">
        <div className="glass-panel animate-fade-in-up" style={{ width: '100%', maxWidth: '400px', padding: 'var(--spacing-lg)' }}>

          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/" className="text-muted text-sm hover:text-white flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>

          <h2 className="text-2xl text-center mb-6">
            Welcome Back
          </h2>

          {error && (
            <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--danger)', padding: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
              <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="btn btn-secondary w-full"
            style={{ justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              style={{ width: '20px', height: '20px' }}
            />
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div style={{ height: '1px', flex: 1, background: 'var(--glass-border)' }} />
            <span className="text-muted text-sm">OR</span>
            <div style={{ height: '1px', flex: 1, background: 'var(--glass-border)' }} />
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleEmailLogin}>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ marginTop: '0.5rem' }}
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-muted mt-6 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
