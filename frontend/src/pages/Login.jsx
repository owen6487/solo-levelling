import React, { useState } from 'react';
import useAuth from '../Hooks/useAuth';
import { useNavigate, Navigate, Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lockedUntil, setLockedUntil] = useState(null);
    const [countdown, setCountdown] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Live countdown timer when account is locked
    React.useEffect(() => {
        if (!lockedUntil) return;
        const tick = () => {
            const remainingMs = new Date(lockedUntil) - Date.now();
            if (remainingMs <= 0) {
                setLockedUntil(null);
                setCountdown('');
                setError('');
                return;
            }
            const m = Math.floor(remainingMs / 60000);
            const s = Math.ceil((remainingMs % 60000) / 1000);
            setCountdown(`${m}m ${s}s`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [lockedUntil]);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLockedUntil(null);
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            const data = err.response?.data;
            const msg = data?.message || err.message || 'Login failed. Please check your credentials and try again.';
            setError(msg);
            if (data?.lockedUntil) {
                setLockedUntil(data.lockedUntil);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020409] flex items-center justify-center font-[Rajdhani,sans-serif] relative overflow-hidden p-5">

            {/* Animated background grid */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    animation: 'gridMove 4s linear infinite',
                }}
            />

            {/* Glowing orbs */}
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: '400px', height: '400px',
                    top: '-100px', left: '-100px',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    animation: 'pulse1 6s ease-in-out infinite',
                }}
            />
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: '350px', height: '350px',
                    bottom: '-80px', right: '-80px',
                    background: 'radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    animation: 'pulse2 8s ease-in-out infinite',
                }}
            />

            {/* Card */}
            <div
                className="relative z-10 w-full max-w-[420px] rounded-[4px] px-10 py-12 backdrop-blur-xl"
                style={{
                    background: 'rgba(5,10,30,0.85)',
                    border: '1px solid rgba(59,130,246,0.25)',
                    boxShadow: '0 0 60px rgba(59,130,246,0.1), 0 0 120px rgba(59,130,246,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
                    animation: 'fadeSlideIn 0.6s ease-out',
                }}
            >
                {/* Icon */}
                <div className="relative flex justify-center items-center mb-7 h-20">
                    <div
                        className="absolute w-[72px] h-[72px] rounded-full"
                        style={{
                            border: '1px solid rgba(59,130,246,0.4)',
                            borderTop: '1px solid #3b82f6',
                            animation: 'ringRotate 3s linear infinite',
                        }}
                    />
                    <svg className="w-[52px] h-[52px]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" stroke="#3b82f6" strokeWidth="2" fill="rgba(59,130,246,0.08)" />
                        <polygon points="32,12 50,22 50,42 32,52 14,42 14,22" stroke="#60a5fa" strokeWidth="1.5" fill="rgba(96,165,250,0.06)" />
                        <path d="M32 22 L38 29 L32 24 L26 29 Z" fill="#3b82f6" />
                        <path d="M26 29 L32 24 L38 29 L38 38 L32 42 L26 38 Z" fill="rgba(59,130,246,0.4)" stroke="#60a5fa" strokeWidth="1" />
                        <circle cx="32" cy="33" r="4" fill="#60a5fa" />
                    </svg>
                </div>

                {/* Title block */}
                <div className="text-center mb-9">
                    <div
                        className="inline-block text-[10px] text-blue-400 px-3 py-1 mb-3.5"
                        style={{
                            fontFamily: "'Orbitron', monospace",
                            letterSpacing: '4px',
                            border: '1px solid rgba(59,130,246,0.4)',
                            background: 'rgba(59,130,246,0.06)',
                        }}
                    >
                        SYSTEM ACCESS
                    </div>
                    <h1
                        className="text-[22px] font-black text-white m-0 mb-2"
                        style={{
                            fontFamily: "'Orbitron', monospace",
                            letterSpacing: '8px',
                            textShadow: '0 0 20px rgba(59,130,246,0.5)',
                        }}
                    >
                        SOLO LEVELLING
                    </h1>
                    <p
                        className="text-[13px] text-slate-400/80 m-0 uppercase"
                        style={{ letterSpacing: '2px' }}
                    >
                        Hunter Authentication Portal
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Error */}
                    {error && (
                        <div
                            className="flex items-center gap-2.5 rounded-[3px] px-4 py-3 text-red-400 text-[13px]"
                            style={{
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                letterSpacing: '1px',
                            }}
                        >
                            <span className="text-sm">{lockedUntil ? '🔒' : '⚠'}</span>
                            <span>
                                {error}
                                {lockedUntil && countdown && (
                                    <span style={{ color: '#f87171', fontWeight: 700 }}> ({countdown} remaining)</span>
                                )}
                            </span>
                        </div>
                    )}

                    {/* Hunter ID */}
                    <div className="flex flex-col gap-2">
                        <label
                            className="text-[11px] text-blue-400 font-semibold"
                            style={{ fontFamily: "'Orbitron', monospace", letterSpacing: '3px' }}
                        >
                            HUNTER ID
                        </label>
                        <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="hunter@system.com"
                                required
                                className="w-full rounded-[3px] py-3.5 pl-11 pr-11 text-slate-200 text-[15px] outline-none transition-all duration-200 box-border"
                                style={{
                                    background: 'rgba(10,20,50,0.6)',
                                    border: '1px solid rgba(59,130,246,0.3)',
                                    fontFamily: "'Rajdhani', sans-serif",
                                    letterSpacing: '1px',
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = 'rgba(59,130,246,0.3)'}
                            />
                        </div>
                    </div>

                    {/* Cipher Key */}
                    <div className="flex flex-col gap-2">
                        <label
                            className="text-[11px] text-blue-400 font-semibold"
                            style={{ fontFamily: "'Orbitron', monospace", letterSpacing: '3px' }}
                        >
                            CIPHER KEY
                        </label>
                        <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full rounded-[3px] py-3.5 pl-11 pr-11 text-slate-200 text-[15px] outline-none transition-all duration-200 box-border"
                                style={{
                                    background: 'rgba(10,20,50,0.6)',
                                    border: '1px solid rgba(59,130,246,0.3)',
                                    fontFamily: "'Rajdhani', sans-serif",
                                    letterSpacing: '1px',
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = 'rgba(59,130,246,0.3)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 bg-none border-none cursor-pointer flex items-center p-1 opacity-70 hover:opacity-100 transition-opacity duration-200"
                                style={{ background: 'none', border: 'none' }}
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-2 py-4 rounded-[3px] text-white text-[12px] font-bold tracking-[4px] cursor-pointer transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        style={{
                            background: loading
                                ? 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)'
                                : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
                            border: '1px solid rgba(59,130,246,0.6)',
                            fontFamily: "'Orbitron', monospace",
                            boxShadow: '0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.1)',
                        }}
                        onMouseEnter={e => {
                            if (!loading) {
                                e.currentTarget.style.boxShadow = '0 0 30px rgba(59,130,246,0.6), 0 0 60px rgba(59,130,246,0.2)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = '0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2.5">
                                <span
                                    className="inline-block w-3.5 h-3.5 rounded-full"
                                    style={{
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTop: '2px solid #ffffff',
                                        animation: 'spin 0.8s linear infinite',
                                    }}
                                />
                                AUTHENTICATING...
                            </span>
                        ) : (
                            <span>ENTER THE SYSTEM</span>
                        )}
                    </button>
                </form>
                <div className="mt-5 text-center">
                    <Link to="/forgotpassword" className="text-sm text-blue-400 hover:text-blue-600 transition-colors duration-200">
                        FORGOT CIPHER KEY?
                    </Link>
                </div>                                       
                                       
                

                {/* Footer */}
                <div className="flex items-center gap-3 mt-8">
                    <div
                        className="flex-1 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }}
                    />
                    <span
                        className="text-[9px] text-blue-500/40 whitespace-nowrap"
                        style={{ fontFamily: "'Orbitron', monospace", letterSpacing: '3px' }}
                    >
                        PRIVATE HUNTER TERMINAL
                    </span>
                    <div
                        className="flex-1 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }}
                    />
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');

                @keyframes gridMove {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(40px); }
                }
                @keyframes pulse1 {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(1.1); }
                }
                @keyframes pulse2 {
                    0%, 100% { opacity: 0.1; transform: scale(1); }
                    50% { opacity: 0.2; transform: scale(1.15); }
                }
                @keyframes ringRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default Login;