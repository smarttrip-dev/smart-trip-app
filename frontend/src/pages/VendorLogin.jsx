import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function VendorLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    emailOrUsername: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null); // null, 'pending', 'suspended', 'active'

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/login', {
        email: credentials.emailOrUsername,
        password: credentials.password,
      });
      const userData = res.data;
      if (userData.role !== 'vendor') {
        toast.error('This portal is for vendors only.');
        setIsLoading(false);
        return;
      }
      localStorage.setItem('userInfo', JSON.stringify(userData));
      toast.success('Login successful!');
      navigate('/vendor/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans flex flex-col items-center justify-center p-4 z-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.15),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.05),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8 slide-in">
          <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">ST</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Vendor Portal</h1>
          <p className="text-slate-400">Sign in to manage your listings</p>
        </div>

        {/* Status Messages */}
        {accountStatus === 'pending' && (
          <div className="slide-in bg-yellow-500/10 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-400 mb-1">Account Pending Approval</h3>
                <p className="text-sm text-yellow-700">
                  Your registration is under review. We'll notify you via email once approved (typically within 2-3 business days).
                </p>
                <button
                  onClick={() => alert('Application tracking feature coming soon')}
                  className="mt-2 text-sm font-medium text-yellow-400 hover:text-yellow-900 underline"
                >
                  Track Application Status
                </button>
              </div>
            </div>
          </div>
        )}

        {accountStatus === 'suspended' && (
          <div className="slide-in bg-red-500/10 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 className="font-semibold text-red-400 mb-1">Account Suspended</h3>
                <p className="text-sm text-red-300 mb-2">
                  Your account has been temporarily suspended due to policy violations or pending verification.
                </p>
                <p className="text-sm text-red-300 mb-3">
                  Please contact our support team for assistance.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert('Opening support chat...')}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700"
                  >
                    Contact Support
                  </button>
                  <button
                    onClick={() => window.location.href = 'mailto:vendor-support@smarttrip.lk'}
                    className="px-4 py-2 border border-red-300 text-red-300 text-sm rounded-lg font-medium hover:bg-red-500/10"
                  >
                    Email Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-xl p-8 slide-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email/Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={credentials.emailOrUsername}
                  onChange={(e) => setCredentials({ ...credentials, emailOrUsername: e.target.value })}
                  placeholder="Enter your email or username"
                  className="w-full pl-12 pr-4 py-3 border-2 border-white/10 rounded-lg focus:border-[#BFBD31] focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  disabled={accountStatus === 'pending' || accountStatus === 'suspended'}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Demo: Use "pending@test.com" or "suspended@test.com" to see status messages
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 border-2 border-white/10 rounded-lg focus:border-[#BFBD31] focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  disabled={accountStatus === 'pending' || accountStatus === 'suspended'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-400"
                  disabled={accountStatus === 'pending' || accountStatus === 'suspended'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={credentials.rememberMe}
                  onChange={(e) => setCredentials({ ...credentials, rememberMe: e.target.checked })}
                  className="w-4 h-4 text-[#BFBD31] rounded focus:ring-2 focus:ring-[#BFBD31]"
                  disabled={accountStatus === 'pending' || accountStatus === 'suspended'}
                />
                <span className="text-sm text-slate-300">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-[#BFBD31] hover:text-purple-700"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || accountStatus === 'pending' || accountStatus === 'suspended'}
              className="w-full py-3 gradient-bg text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  Login
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 border border-white/10 text-slate-500">New to SmartTRIP?</span>
            </div>
          </div>

          {/* Register Link */}
          <a
            href="/vendor-register"
            className="block w-full py-3 border-2 border-[#BFBD31] text-[#BFBD31] rounded-lg font-semibold text-center hover:bg-[#BFBD31]/10 transition-all"
          >
            Register as a Vendor
          </a>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center space-y-3 slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-center gap-4 text-sm">
            <a href="/help" className="text-slate-400 hover:text-[#BFBD31] transition-colors">
              Help &amp; Support
            </a>
            <span className="text-slate-400">•</span>
            <a href="#" className="text-slate-400 hover:text-[#BFBD31] transition-colors">
              Privacy Policy
            </a>
            <span className="text-slate-400">•</span>
            <a href="#" className="text-slate-400 hover:text-[#BFBD31] transition-colors">
              Terms of Service
            </a>
          </div>
          <p className="text-xs text-slate-500">
            © 2025 SmartTRIP. All rights reserved.
          </p>
        </div>

        {/* Quick Demo Info */}
        <div className="mt-6 bg-slate-900/50 border border-white/10 text-slate-300/10 border border-[#BFBD31]/20 rounded-lg p-4 text-center slide-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-[#BFBD31] font-medium mb-2">🎯 Demo Accounts</p>
          <div className="text-xs text-blue-300 space-y-1">
            <p>• Use <code className="bg-slate-900/50 border border-white/10 text-slate-300 px-1 py-0.5 rounded">pending@test.com</code> to see "Pending Approval" status</p>
            <p>• Use <code className="bg-slate-900/50 border border-white/10 text-slate-300 px-1 py-0.5 rounded">suspended@test.com</code> to see "Suspended" status</p>
            <p>• Use any other email to simulate successful login</p>
          </div>
        </div>
      </div>
    </div>
  );
}