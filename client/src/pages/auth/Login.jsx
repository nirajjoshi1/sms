import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, GraduationCap, Loader2, Lock, Mail } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Barlow', sans-serif"
    }}>
      {/* Background gradients */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(circle at 80% 20%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(236,72,153,0.08) 0%, transparent 50%)'
      }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px' }}>
        {/* Card using liquid-glass-strong */}
        <div 
          className="liquid-glass-strong"
          style={{
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)'
          }}
        >
          {/* Logo / Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
            <div 
              className="liquid-glass"
              style={{
                width: 60, height: 60, borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 0 20px rgba(99,102,241,0.25)'
              }}
            >
              <GraduationCap style={{ width: 28, height: 28, color: '#a78bfa' }} />
            </div>
            <h1 className="heading-display text-3xl text-white">Gradex SMS</h1>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
              School Management System
            </p>
          </div>

          <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 13, color: '#fff', textAlign: 'center', marginBottom: 28, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Sign in to your account
          </h2>

          {/* Error Alert */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} autoComplete="off">
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontFamily: "'Barlow', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 8 }} htmlFor="email">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    borderRadius: '14px',
                    padding: '14px 16px 14px 44px',
                    fontSize: '14px',
                    fontFamily: "'Barlow', sans-serif",
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontFamily: "'Barlow', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 8 }} htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    borderRadius: '14px',
                    padding: '14px 44px 14px 44px',
                    fontSize: '14px',
                    fontFamily: "'Barlow', sans-serif",
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', padding: 0,
                    color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: loading ? 'rgba(255,255,255,0.15)' : '#fff',
                color: '#000',
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
                marginTop: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontFamily: "'Barlow', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 32 }}>
            © {new Date().getFullYear()} Gradex School Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
