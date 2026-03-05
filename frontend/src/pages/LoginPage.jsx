import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import loginImg from '../images/login/login.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', formData);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      toast.success('Welcome back!');
      const { role } = res.data;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'vendor') navigate('/vendor/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans flex flex-col items-center justify-center p-4 z-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.25),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.15),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row lg:px-10 lg:py-12">
        {/* Left story / hero */}
        <section className="flex-1 space-y-6">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#BFBD31]/80">
            <span className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">Sri Lanka Escapes</span>
            <span className="hidden h-px w-16 bg-[#BFBD31]/40 lg:block" />
            <span className="hidden lg:block text-slate-400">Curated by SmartTrip</span>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#BFBD31]/15 bg-slate-900/70 shadow-2xl">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(7,16,22,0.88) 70%), url(${loginImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="relative flex h-full flex-col justify-between gap-6 p-8 sm:p-10">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 text-white/90">
                  <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#BFBD31]/80">SmartTrip</p>
                  </div>
                </Link>
                <div className="hidden items-center gap-3 text-[11px] text-[#BFBD31]/80 sm:flex">
                  <span className="h-px w-10 bg-[#BFBD31]/40" />
                  <span>Wild routes</span>
                  <span className="h-px w-10 bg-[#BFBD31]/40" />
                  <span>Waterfalls</span>
                  <span className="h-px w-10 bg-[#BFBD31]/40" />
                  <span>Sunrise peaks</span>
                </div>
              </div>

              <div className="space-y-4 sm:max-w-2xl">
                <h1 className="text-3xl leading-tight sm:text-4xl lg:text-5xl font-gotham">
                  Adventure begins where maps end. Discover Sri Lanka with us.
                </h1>
                <p className="max-w-xl text-sm text-slate-200/80 sm:text-base">
                  From misty tea trails to hidden beaches and rainforest canopies, we orchestrate seamless trips that feel cinematic, safe, and deeply personal.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[{ label: 'Curated routes', value: '120+' }, { label: 'Travel partners', value: '80+' }, { label: 'Traveler trust', value: '10k+' }].map((item) => (
                  <div key={item.label} className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
                    <p className="text-sm uppercase tracking-[0.12em] text-[#BFBD31]/80">{item.label}</p>
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[{ icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', title: 'Tailored itineraries', copy: 'Design routes that match your pace, budget, and mood.' }, { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Live status', copy: 'Track bookings, transfers, and guides in real time.' }, { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', title: 'Secure payments', copy: 'Transparent pricing, receipts, and vendor protection.' }].map((item) => (
              <div key={item.title} className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BFBD31]/15 text-[#BFBD31]/80">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-300/80">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right form */}
        <section className="flex w-full max-w-xl flex-1 items-center">
          <div className="w-full rounded-3xl border border-[#BFBD31]/15 bg-slate-900/70 p-6 shadow-2xl backdrop-blur sm:p-8 lg:p-9">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#BFBD31]/80">Sign in</p>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">Welcome back, explorer</h2>
                <p className="text-sm text-slate-400">Access your saved trips, vendors, and live bookings.</p>
              </div>
              <Link to="/" className="hidden text-xs font-semibold text-[#BFBD31]/80 hover:text-[#BFBD31] sm:inline-flex">
                Home
              </Link>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-200">Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-200">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={onChange}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-10 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-[#BFBD31]/80"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={onChange}
                      className="sr-only"
                    />
                    <div className={`h-4 w-4 rounded border transition ${formData.rememberMe ? 'bg-[#BFBD31] border-[#BFBD31]' : 'border-white/20 bg-white/5'}`}>
                      {formData.rememberMe && (
                        <svg className="h-4 w-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#BFBD31]/80 hover:text-[#BFBD31]">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#BFBD31] px-4 py-3 text-sm font-semibold text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-10" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)', transform: 'translateX(-100%)' }} />
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Enter the wild
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Google Login */}
            <div className="mt-5">
              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-500">or continue with</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <button
                type="button"
                className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>

            {/* Bottom links */}
            <div className="mt-6 flex flex-col gap-3">
              <p className="text-center text-sm text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-[#BFBD31] hover:text-[#BFBD31]/80">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
