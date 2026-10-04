import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, showToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        if (isSignUp) {
          setIsSignUp(false);
        } else {
          setIsAuthModalOpen(false);
        }
      }
    };
    if (isAuthModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen, isSignUp, setIsAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const validate = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};

    if (!email) {
      newErrors.email = 'Please enter a valid email address.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Your password must contain at least 6 characters.';
    } else if (password.length < 6) {
      newErrors.password = 'Your password must contain between 6 and 60 characters.';
    }

    if (isSignUp && !name.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      login(email, name || undefined);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string, demoName: string) => {
    setEmail(demoEmail);
    setPassword('demopass123');
    login(demoEmail, demoName);
  };

  const handleForgotPassword = () => {
    showToast('Password recovery instructions sent to your email.');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setIsAuthModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto no-scrollbar bg-[#181818] border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 my-auto"
      >
        {/* Back Button (In Sign-Up mode) */}
        {isSignUp && (
          <button
            onClick={() => {
              setIsSignUp(false);
              setErrors({});
            }}
            className="absolute top-4 left-4 text-zinc-400 hover:text-white p-1 rounded transition-colors flex items-center gap-1 text-xs cursor-pointer"
            aria-label="Back to sign in"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6 pt-2 sm:pt-0">
          <span className="text-3xl font-black tracking-tight text-[#e50914]">
            RBFLIX
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
            {isSignUp ? 'Create your account' : 'Sign In'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Unlimited movies, TV shows, and original cinema.
          </p>
        </div>

        {/* Quick Demo Profiles */}
        <div className="mb-5 p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <div className="text-zinc-400 font-semibold mb-2 flex items-center justify-between">
            <span>Instant Demo Profile:</span>
            <span className="text-[10px] text-emerald-400 font-mono">1-CLICK</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('alex.rivera@rbflix.stream', 'Alex Rivera')}
              className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-center font-medium transition-colors cursor-pointer"
            >
              Alex (VIP)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('guest.viewer@rbflix.stream', 'Movie Buff')}
              className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-center font-medium transition-colors cursor-pointer"
            >
              Movie Buff
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className={`w-full bg-[#333] text-white px-3.5 py-2.5 sm:py-3 rounded text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 ${
                    errors.name ? 'ring-2 ring-[#e50914]' : 'focus:ring-zinc-400'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-[#e50914] mt-1">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Email or phone number
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full bg-[#333] text-white px-3.5 py-2.5 sm:py-3 rounded text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 ${
                  errors.email ? 'ring-2 ring-[#e50914]' : 'focus:ring-zinc-400'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-[#e50914] mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className={`w-full bg-[#333] text-white px-3.5 py-2.5 sm:py-3 rounded text-sm placeholder-zinc-500 pr-10 focus:outline-none focus:ring-2 ${
                  errors.password ? 'ring-2 ring-[#e50914]' : 'focus:ring-zinc-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[#e50914] mt-1">{errors.password}</p>
            )}
          </div>

          {/* Remember me & Need help */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-[#e50914] focus:ring-0 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="hover:underline text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Need help?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 sm:py-3 bg-[#e50914] hover:bg-red-700 text-white font-bold rounded text-sm transition-colors shadow-lg active:scale-98 cursor-pointer mt-2"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Switch Login / Sign Up */}
        <div className="mt-6 pt-4 border-t border-zinc-800 text-xs text-zinc-400 text-center">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setErrors({});
                }}
                className="text-white hover:underline font-semibold cursor-pointer"
              >
                Sign In now.
              </button>
            </p>
          ) : (
            <p>
              New to RBflix?{' '}
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setErrors({});
                }}
                className="text-white hover:underline font-semibold cursor-pointer"
              >
                Sign up now.
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
