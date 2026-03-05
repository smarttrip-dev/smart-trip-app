import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ISO6391 from 'iso-639-1';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/plain.css';

// All 184 ISO 639-1 languages, sorted alphabetically
const LANGUAGES = ISO6391.getAllNames().sort();

// Country codes handled by react-phone-input-2 (195+ countries)

const SL_CITIES = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle', 'Ella', 'Sigiriya', 'Dambulla',
];

const TRAVEL_INTERESTS = [
  { id: 'beach',     label: '🏖️ Beach & Coastal' },
  { id: 'culture',   label: '🏛️ Culture & Heritage' },
  { id: 'wildlife',  label: '🐘 Wildlife & Safari' },
  { id: 'adventure', label: '🧗 Adventure & Trekking' },
  { id: 'food',      label: '🍜 Food & Cuisine' },
  { id: 'nature',    label: '🌿 Nature & Scenery' },
  { id: 'history',   label: '📜 History & Temples' },
  { id: 'wellness',  label: '🧘 Wellness & Yoga' },
  { id: 'luxury',    label: '✨ Luxury & Resorts' },
  { id: 'budget',    label: '💰 Budget Travel' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Account, 2 = Profile
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
    role: 'user',
    // Step 2 — traveler
    countryCode: '+94',
    phone: '',
    dateOfBirth: '',
    location: '',
    preferredLanguage: 'English',
    travelInterests: [],
    bio: '',
    // Step 2 — vendor business info
    businessName: '',
    businessType: '',
    businessEmail: '',
    businessPhone: '',
    registrationNumber: '',
    website: '',
    // vendor address
    addressLine1: '',
    addressCity: '',
    addressProvince: '',
    addressPostalCode: '',
    // vendor primary contact
    contactName: '',
    contactDesignation: '',
    contactPhone: '',
    contactEmail: '',
    // vendor bank details
    bankName: '',
    bankBranch: '',
    bankAccountName: '',
    bankAccountNumber: '',
  });

  const clearForm = () => {
    setFormData({
      name: '', email: '', password: '', confirmPassword: '', agreedToTerms: false, role: 'user',
      countryCode: '+94', phone: '', dateOfBirth: '', location: '', preferredLanguage: 'English',
      travelInterests: [], bio: '',
      businessName: '', businessType: '', businessEmail: '', businessPhone: '',
      registrationNumber: '', website: '',
      addressLine1: '', addressCity: '', addressProvince: '', addressPostalCode: '',
      contactName: '', contactDesignation: '', contactPhone: '', contactEmail: '',
      bankName: '', bankBranch: '', bankAccountName: '', bankAccountNumber: '',
    });
    setStep(1);
  };

  const toggleInterest = (id) => {
    setFormData((prev) => ({
      ...prev,
      travelInterests: prev.travelInterests.includes(id)
        ? prev.travelInterests.filter((i) => i !== id)
        : [...prev.travelInterests, id],
    }));
  };

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getPasswordStrength = (pw) => {
    if (!pw) return { pct: 0, label: '', color: 'bg-gray-200' };
    if (pw.length < 6) return { pct: 25, label: 'Weak', color: 'bg-red-500' };
    if (pw.length < 10) return { pct: 50, label: 'Fair', color: 'bg-yellow-400' };
    if (pw.length < 14) return { pct: 75, label: 'Good', color: 'bg-blue-500' };
    return { pct: 100, label: 'Strong', color: 'bg-green-500' };
  };
  const pwStrength = getPasswordStrength(formData.password);

  const goToStep2 = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return toast.error('Please fill in all required fields');
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!formData.agreedToTerms) return toast.error('Please agree to the Terms & Conditions');
    setStep(2);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload;
      if (formData.role === 'vendor') {
        // Validate required vendor fields
        if (!formData.businessName || !formData.businessType || !formData.businessEmail || !formData.businessPhone) {
          toast.error('Please fill in all required business fields');
          setLoading(false);
          return;
        }
        if (!formData.addressLine1 || !formData.addressCity || !formData.addressProvince) {
          toast.error('Please fill in the required address fields');
          setLoading(false);
          return;
        }
        if (!formData.contactName || !formData.contactPhone || !formData.contactEmail) {
          toast.error('Please fill in the required primary contact fields');
          setLoading(false);
          return;
        }
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'vendor',
          vendor: {
            businessName: formData.businessName,
            businessType: formData.businessType,
            businessEmail: formData.businessEmail,
            businessPhone: formData.businessPhone,
            registrationNumber: formData.registrationNumber,
            website: formData.website,
            address: {
              addressLine1: formData.addressLine1,
              city: formData.addressCity,
              province: formData.addressProvince,
              postalCode: formData.addressPostalCode,
              country: 'Sri Lanka',
            },
            primaryContact: {
              name: formData.contactName,
              designation: formData.contactDesignation,
              phone: formData.contactPhone,
              email: formData.contactEmail,
            },
            bankDetails: (formData.bankName && formData.bankAccountName && formData.bankAccountNumber) ? {
              bankName: formData.bankName,
              branch: formData.bankBranch,
              accountName: formData.bankAccountName,
              accountNumber: formData.bankAccountNumber,
            } : undefined,
          },
        };
      } else {
        const { confirmPassword, agreedToTerms, countryCode, travelInterests, ...rest } = formData;
        payload = { ...rest, phone: formData.phone ? `${formData.countryCode} ${formData.phone}` : '', travelInterests };
      }
      await axios.post('/api/auth/register', payload);
      toast.success(formData.role === 'vendor' ? 'Vendor account created! Pending admin approval.' : 'Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans flex flex-col items-center justify-center p-4 z-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.25),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.15),_transparent_35%)]" />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row lg:px-10 lg:py-12">
        {/* Left hero / storyboard */}
        <section className="flex-1 space-y-6">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#BFBD31]/80">
            <span className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
              Create your trail
            </span>
            <span className="hidden h-px w-16 bg-[#BFBD31]/40 lg:block" />
            <span className="hidden lg:block text-slate-400">Step {step} of 2 · SmartTrip account</span>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#BFBD31]/15 bg-slate-900/70 shadow-2xl">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(7,16,22,0.9) 70%), url(https://images.unsplash.com/photo-1500534314211-0a24cd03f2c0?auto=format&fit=crop&w=1600&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="relative flex h-full flex-col justify-between gap-6 p-8 sm:p-10">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 text-white/90">
                  <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#BFBD31]/80">SmartTrip</p>
                    <p className="text-lg font-semibold leading-none">Adventure</p>
                  </div>
                </Link>
                <div className="hidden items-center gap-3 text-[11px] text-[#BFBD31]/80 sm:flex">
                  <span className="h-px w-10 bg-[#BFBD31]/40" />
                  <span>Account</span>
                  <span className="h-px w-10 bg-[#BFBD31]/40" />
                  <span>Profile</span>
                  <span className="h-px w-10 bg-[#BFBD31]/40" />
                  <span>Trips</span>
                </div>
              </div>

              <div className="space-y-4 sm:max-w-xl">
                <h1
                  className="text-3xl leading-tight sm:text-4xl lg:text-5xl font-gotham"
                >
                  Join thousands of explorers discovering Sri Lanka their way.
                </h1>
                <p className="max-w-lg text-sm text-slate-200/80 sm:text-base">
                  Build a profile once and reuse it for every journey—sync preferences, travelers, vendors, and hidden
                  favorites across your SmartTrip experiences.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { n: 1, title: 'Account setup', desc: 'Name, email & secure password.' },
                  { n: 2, title: 'Travel profile', desc: 'Contact, language & story.' },
                ].map((s) => (
                  <div
                    key={s.n}
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm backdrop-blur ${{
                      1: 'border-white/15 bg-white/5',
                      2: 'border-white/10 bg-white/5',
                    }[s.n]}`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        step > s.n
                          ? 'bg-emerald-400 text-slate-900'
                          : step === s.n
                            ? 'bg-[#BFBD31] text-slate-900'
                            : 'bg-white/10 text-white'
                      }`}
                    >
                      {step > s.n ? '✓' : s.n}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{s.title}</p>
                      <p className="text-xs text-slate-200/80">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-300/80">Takes under 2 minutes · You can edit everything later.</p>
            </div>
          </div>
        </section>

        {/* Right form card */}
        <section className="flex w-full max-w-xl flex-1 items-center">
          <div className="w-full rounded-3xl border border-[#BFBD31]/15 bg-slate-900/70 p-6 shadow-2xl backdrop-blur sm:p-8 lg:p-9">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#BFBD31]/80">
                  {step === 1 ? 'Step 1 · Account' : formData.role === 'vendor' ? 'Step 2 · Business' : 'Step 2 · Profile'}
                </p>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                  {step === 1 ? 'Create your explorer ID' : formData.role === 'vendor' ? 'Set up your business' : 'Shape your travel profile'}
                </h2>
                <p className="text-sm text-slate-400">
                  {step === 1
                    ? 'We only ask for what we need to keep your trips secure.'
                    : formData.role === 'vendor'
                    ? 'Your business details — you can update these anytime from the vendor dashboard.'
                    : 'Optional details that help us fine-tune routes and recommendations.'}
                </p>
              </div>
              <Link to="/" className="hidden text-xs font-semibold text-[#BFBD31]/80 hover:text-[#BFBD31] sm:inline-flex">
                Home
              </Link>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <form onSubmit={goToStep2} className="space-y-4">

                {/* Role selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                    I am joining as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: 'user',
                        icon: (
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ),
                        title: 'Traveler',
                        desc: 'Explore & book trips',
                      },
                      {
                        value: 'vendor',
                        icon: (
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        ),
                        title: 'Vendor',
                        desc: 'List & sell services',
                      },
                    ].map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, role: r.value }))}
                        className={`relative flex flex-col items-center gap-2 rounded-2xl border px-4 py-4 text-sm font-semibold transition-all ${
                          formData.role === r.value
                            ? 'border-[#BFBD31] bg-[#BFBD31]/10 text-[#BFBD31]'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        <span className={formData.role === r.value ? 'text-[#BFBD31]' : 'text-slate-500'}>
                          {r.icon}
                        </span>
                        <span>{r.title}</span>
                        <span className="text-xs font-normal opacity-70">{r.desc}</span>
                        {formData.role === r.value && (
                          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#BFBD31]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                    Full name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={onChange}
                      placeholder="Your full name"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-10 py-3 text-sm text-white placeholder:text-slate-500 transition focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                    Email address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
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
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-10 py-3 text-sm text-white placeholder:text-slate-500 transition focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={onChange}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-10 py-3 pr-12 text-sm text-white placeholder:text-slate-500 transition focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-[#BFBD31]/80"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        ) : (
                          <>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pwStrength.color}`}
                          style={{ width: `${pwStrength.pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        Strength: <span className="font-semibold text-slate-100">{pwStrength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                    Confirm password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <input
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={onChange}
                      placeholder="Repeat your password"
                      className={`w-full rounded-2xl border px-10 py-3 pr-12 text-sm text-white placeholder:text-slate-500 transition bg-white/5 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 ${
                        formData.confirmPassword && formData.confirmPassword !== formData.password
                          ? 'border-red-400'
                          : 'border-white/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-[#BFBD31]/80"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showConfirm ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        ) : (
                          <>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                    <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      formData.agreedToTerms ? 'bg-[#BFBD31] border-[#BFBD31]' : 'border-white/20 bg-white/5 group-hover:border-[#BFBD31]/50'
                    }`}>
                      {formData.agreedToTerms && (
                        <svg className="h-3 w-3 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-[#BFBD31] hover:text-[#BFBD31] underline underline-offset-2">Terms & Conditions</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-[#BFBD31] hover:text-[#BFBD31] underline underline-offset-2">Privacy Policy</Link>
                  </span>
                </label>

                {/* Google Sign-Up */}
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-xs text-slate-500">or</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/>
                    <path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/>
                    <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/>
                  </svg>
                  Sign up with Google
                </button>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={clearForm}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 transition"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-[#BFBD31] px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-[#BFBD31]/20 transition focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    Continue
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>

                <p className="pt-1 text-xs text-slate-400 text-center">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-[#BFBD31]/80 hover:text-[#BFBD31]">
                    Login
                  </Link>
                </p>
              </form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form onSubmit={onSubmit} className="space-y-4">

                {/* ─── VENDOR STEP 2 ─────────────────────────────── */}
                {formData.role === 'vendor' ? (
                  <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                    <div className="text-xs text-[#BFBD31]/80 font-semibold uppercase tracking-widest border-b border-white/10 pb-2">Business Info</div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Business name <span className="text-red-400">*</span></label>
                        <input name="businessName" value={formData.businessName} onChange={onChange} placeholder="e.g. Ceylon Journeys Pvt Ltd"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Business type <span className="text-red-400">*</span></label>
                        <select name="businessType" value={formData.businessType} onChange={onChange}
                          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none">
                          <option value="" className="text-slate-400">Select business type</option>
                          {['Hotel/Guest House','Transport Provider','Tour Guide','Activity Provider','Restaurant/Cafe','Tour Operator','Travel Agency','Other'].map(t => (
                            <option key={t} value={t} className="bg-slate-900">{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Business email <span className="text-red-400">*</span></label>
                        <input name="businessEmail" type="email" value={formData.businessEmail} onChange={onChange} placeholder="business@example.com"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Business phone <span className="text-red-400">*</span></label>
                        <input name="businessPhone" value={formData.businessPhone} onChange={onChange} placeholder="+94 11 234 5678"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Registration no. <span className="text-slate-500 font-normal">(optional)</span></label>
                        <input name="registrationNumber" value={formData.registrationNumber} onChange={onChange} placeholder="BR 12345"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Website <span className="text-slate-500 font-normal">(optional)</span></label>
                        <input name="website" value={formData.website} onChange={onChange} placeholder="https://yourbusiness.lk"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                    </div>

                    <div className="text-xs text-[#BFBD31]/80 font-semibold uppercase tracking-widest border-b border-white/10 pb-2 pt-2">Business Address</div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Address line 1 <span className="text-red-400">*</span></label>
                        <input name="addressLine1" value={formData.addressLine1} onChange={onChange} placeholder="123 Galle Road"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">City <span className="text-red-400">*</span></label>
                        <select name="addressCity" value={formData.addressCity} onChange={onChange}
                          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none">
                          <option value="">Select city</option>
                          {SL_CITIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Province <span className="text-red-400">*</span></label>
                        <select name="addressProvince" value={formData.addressProvince} onChange={onChange}
                          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none">
                          <option value="">Select province</option>
                          {['Western','Central','Southern','Northern','Eastern','North Western','North Central','Uva','Sabaragamuwa'].map(p => (
                            <option key={p} value={p} className="bg-slate-900">{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Postal code</label>
                        <input name="addressPostalCode" value={formData.addressPostalCode} onChange={onChange} placeholder="10100"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                    </div>

                    <div className="text-xs text-[#BFBD31]/80 font-semibold uppercase tracking-widest border-b border-white/10 pb-2 pt-2">Primary Contact</div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Contact name <span className="text-red-400">*</span></label>
                        <input name="contactName" value={formData.contactName} onChange={onChange} placeholder="Full name"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Designation</label>
                        <input name="contactDesignation" value={formData.contactDesignation} onChange={onChange} placeholder="Manager / Owner"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Contact phone <span className="text-red-400">*</span></label>
                        <input name="contactPhone" value={formData.contactPhone} onChange={onChange} placeholder="+94 77 123 4567"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Contact email <span className="text-red-400">*</span></label>
                        <input name="contactEmail" type="email" value={formData.contactEmail} onChange={onChange} placeholder="contact@business.lk"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                    </div>

                    <div className="text-xs text-[#BFBD31]/80 font-semibold uppercase tracking-widest border-b border-white/10 pb-2 pt-2">Bank Details <span className="text-slate-500 font-normal normal-case">(optional — add later)</span></div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Bank name</label>
                        <input name="bankName" value={formData.bankName} onChange={onChange} placeholder="Bank of Ceylon"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Branch</label>
                        <input name="bankBranch" value={formData.bankBranch} onChange={onChange} placeholder="Colombo 03"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Account name</label>
                        <input name="bankAccountName" value={formData.bankAccountName} onChange={onChange} placeholder="Ceylon Journeys Pvt Ltd"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Account number</label>
                        <input name="bankAccountNumber" value={formData.bankAccountNumber} onChange={onChange} placeholder="000123456789"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                    </div>
                  </div>

                ) : (
                  /* ─── USER STEP 2 ─────────────────────────────── */
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-2xl border border-[#BFBD31]/20 bg-[#BFBD31]/5 p-3 text-sm text-slate-200">
                      <svg className="mt-0.5 h-5 w-5 text-[#BFBD31] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs sm:text-sm">Everything on this step is optional. Add what you like now, or skip and refine your profile from the dashboard later.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-1.5">Phone number</label>
                      <PhoneInput
                        country="lk"
                        value={formData.countryCode.replace('+', '') + formData.phone}
                        onChange={(value, country) => {
                          const dialCode = country.dialCode;
                          const number = value.slice(dialCode.length);
                          setFormData(prev => ({ ...prev, countryCode: '+' + dialCode, phone: number }));
                        }}
                        inputStyle={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white', paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '3.5rem', fontSize: '0.875rem', height: 'auto' }}
                        buttonStyle={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: 'none', borderRadius: '1rem 0 0 1rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
                        dropdownStyle={{ background: '#0f172a', color: 'white' }}
                        enableSearch searchPlaceholder="Search country..." placeholder="77 123 4567"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">Date of birth</label>
                        <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={onChange}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">City / Location</label>
                        <select name="location" value={formData.location} onChange={onChange}
                          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none">
                          <option value="" className="text-slate-400">Select your city</option>
                          {SL_CITIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                          <option value="Other" className="bg-slate-900">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-1.5">Preferred language</label>
                      <select name="preferredLanguage" value={formData.preferredLanguage} onChange={onChange}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none">
                        {LANGUAGES.map(l => <option key={l} className="bg-slate-900">{l}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">Travel Interests <span className="ml-2 text-xs font-normal text-slate-400">Select all that apply</span></label>
                      <div className="grid grid-cols-2 gap-2">
                        {TRAVEL_INTERESTS.map((interest) => {
                          const selected = formData.travelInterests.includes(interest.id);
                          return (
                            <button key={interest.id} type="button" onClick={() => toggleInterest(interest.id)}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium text-left transition-all ${
                                selected ? 'border-[#BFBD31]/50 bg-[#BFBD31]/10 text-[#BFBD31]' : 'border-white/10 bg-white/5 text-slate-300 hover:border-[#BFBD31]/30'
                              }`}>
                              <div className={`h-4 w-4 rounded flex-shrink-0 border flex items-center justify-center transition-all ${
                                selected ? 'bg-[#BFBD31] border-[#BFBD31]' : 'border-white/20'
                              }`}>
                                {selected && <svg className="h-2.5 w-2.5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                              </div>
                              {interest.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-1.5">About you <span className="text-xs font-normal text-slate-400">(short bio)</span></label>
                      <textarea name="bio" value={formData.bio} onChange={onChange} rows={3}
                        placeholder="Travel enthusiast, love cultural experiences and scenic destinations..."
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/50 outline-none resize-none" />
                    </div>
                  </div>
                )}

                <div className="mt-2 flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 transition">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#BFBD31] px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-[#BFBD31]/20 transition focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60">
                    {loading ? (
                      <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating account...</>
                    ) : (
                      <>{formData.role === 'vendor' ? 'Submit for review' : 'Create account'}<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></>
                    )}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-slate-500">
              <Link to="/" className="hover:text-[#BFBD31]/80">
                ← Return to home
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
