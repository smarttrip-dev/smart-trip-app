import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DESTINATIONS = [
  { name: 'Kandy',        tag: 'Cultural',    emoji: '🛕', days: 3, price: 45000,  desc: 'Ancient temples & scenic hills' },
  { name: 'Galle',        tag: 'Coastal',     emoji: '🏰', days: 4, price: 55000,  desc: 'Dutch fort & pristine beaches' },
  { name: 'Ella',         tag: 'Hill Country',emoji: '🌿', days: 3, price: 40000,  desc: 'Tea country & breathtaking views' },
  { name: 'Sigiriya',     tag: 'Heritage',    emoji: '🏯', days: 2, price: 50000,  desc: 'Ancient rock fortress wonder' },
  { name: 'Yala',         tag: 'Wildlife',    emoji: '🐘', days: 2, price: 60000,  desc: 'Premier safari experience' },
  { name: 'Nuwara Eliya', tag: 'Nature',      emoji: '🍃', days: 3, price: 48000,  desc: 'Cool climate & tea estates' },
  { name: 'Mirissa',      tag: 'Beach',       emoji: '🐋', days: 3, price: 42000,  desc: 'Whale watching & golden sands' },
  { name: 'Trincomalee',  tag: 'Beach',       emoji: '🌊', days: 4, price: 52000,  desc: 'Crystal waters & diving spots' },
  { name: 'Anuradhapura', tag: 'Heritage',    emoji: '🕌', days: 2, price: 38000,  desc: 'Sacred city & ancient ruins' },
  { name: 'Colombo',      tag: 'City',        emoji: '🌆', days: 2, price: 35000,  desc: 'Vibrant capital & street food' },
  { name: 'Dambulla',     tag: 'Heritage',    emoji: '🏛️', days: 2, price: 36000,  desc: 'Cave temples & rock paintings' },
  { name: 'Hikkaduwa',    tag: 'Beach',       emoji: '🤿', days: 3, price: 44000,  desc: 'Coral reefs & surf breaks' },
];

const TAG_COLORS = {
  Cultural:    'bg-purple-500/20 text-purple-300',
  Coastal:     'bg-blue-500/20 text-blue-300',
  'Hill Country': 'bg-emerald-500/20 text-emerald-300',
  Heritage:    'bg-amber-500/20 text-amber-300',
  Wildlife:    'bg-orange-500/20 text-orange-300',
  Nature:      'bg-teal-500/20 text-teal-300',
  Beach:       'bg-cyan-500/20 text-cyan-300',
  City:        'bg-slate-500/20 text-slate-300',
};

const DURATION_OPTIONS = ['2 Days', '3 Days', '4 Days', '5 Days', '6 Days', '7 Days', '10 Days', '14 Days'];

export default function TripPlanner() {
  const navigate = useNavigate();
  const { state: navState } = useLocation();

  const [step, setStep] = useState(1); // 1 = select destination, 2 = trip details
  const [selected, setSelected] = useState(null);
  const [customDest, setCustomDest] = useState('');
  const [filterTag, setFilterTag] = useState('All');
  const [form, setForm] = useState({
    startDate: '',
    duration: '3 Days',
    adults: 2,
    children: 0,
    budget: '',
    notes: '',
  });

  // Auto-select when coming from a "Explore" card with preselect state
  useEffect(() => {
    if (navState?.preselect) {
      const dest = DESTINATIONS.find(d => d.name === navState.preselect);
      if (dest) {
        setSelected(dest);
        setForm(f => ({ ...f, duration: `${dest.days} Days`, budget: dest.price.toString() }));
        setStep(2);
      }
    }
  }, [navState]);

  const allTags = ['All', ...Array.from(new Set(DESTINATIONS.map(d => d.tag)))];

  const filtered = filterTag === 'All'
    ? DESTINATIONS
    : DESTINATIONS.filter(d => d.tag === filterTag);

  const activeDest = selected || (customDest ? { name: customDest, tag: 'Custom', emoji: '📍', days: 3, price: 50000, desc: 'Custom destination' } : null);

  const handleStartPlanning = () => {
    if (!activeDest) return;
    const budgetNum = parseInt((form.budget || '').replace(/,/g, '')) || activeDest.price;
    const durationDays = parseInt(form.duration) || activeDest.days;

    navigate('/itinerary', {
      state: {
        destination: `${activeDest.name} Tour`,
        location: activeDest.name,
        duration: form.duration,
        budget: budgetNum,
        travelers: { adults: form.adults, children: form.children, infants: 0 },
        dates: { from: form.startDate, to: '' },
        notes: form.notes,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(191,189,49,0.07),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.06),transparent_40%)]" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => step === 2 ? setStep(1) : navigate('/dashboard')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">Plan a New Trip</h1>
              <p className="text-[11px] text-slate-500">Step {step} of 2 — {step === 1 ? 'Choose destination' : 'Trip details'}</p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-8 rounded-full transition-all ${step >= 1 ? 'bg-[#BFBD31]' : 'bg-white/10'}`} />
            <div className={`h-2 w-8 rounded-full transition-all ${step >= 2 ? 'bg-[#BFBD31]' : 'bg-white/10'}`} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* ── STEP 1: Destination Picker ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Where do you want to go?</h2>
              <p className="text-sm text-slate-400">Pick a popular destination or type your own</p>
            </div>

            {/* Custom destination input */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Type any destination..."
                  value={customDest}
                  onChange={e => { setCustomDest(e.target.value); setSelected(null); }}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 pl-9 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-[#BFBD31]/50 transition"
                />
              </div>
              {customDest && (
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-xl bg-[#BFBD31] px-5 py-3 text-sm font-bold text-slate-900 transition hover:opacity-90"
                >
                  Next
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>

            {/* Tag filter */}
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    filterTag === tag
                      ? 'bg-[#BFBD31] text-slate-900'
                      : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Destination grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map(dest => (
                <button
                  key={dest.name}
                  onClick={() => { setSelected(dest); setCustomDest(''); }}
                  className={`group relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all ${
                    selected?.name === dest.name
                      ? 'border-[#BFBD31] bg-[#BFBD31]/10 shadow-[0_0_20px_rgba(191,189,49,0.15)]'
                      : 'border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900'
                  }`}
                >
                  {/* Check mark */}
                  {selected?.name === dest.name && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#BFBD31] text-slate-900">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <span className="text-2xl">{dest.emoji}</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{dest.name}</p>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{dest.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TAG_COLORS[dest.tag] || 'bg-slate-700 text-slate-300'}`}>
                      {dest.tag}
                    </span>
                    <span className="text-[11px] text-slate-500">{dest.days}D</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#BFBD31]">From LKR {dest.price.toLocaleString()}</p>
                </button>
              ))}
            </div>

            {/* Next button */}
            {selected && (
              <div className="sticky bottom-6 flex justify-center">
                <button
                  onClick={() => {
                    setForm(f => ({ ...f, duration: `${selected.days} Days`, budget: selected.price.toString() }));
                    setStep(2);
                  }}
                  className="flex items-center gap-3 rounded-2xl bg-[#BFBD31] px-8 py-3.5 text-sm font-bold text-slate-900 shadow-[0_0_30px_rgba(191,189,49,0.4)] transition hover:opacity-90"
                >
                  <span className="text-lg">{selected.emoji}</span>
                  Continue with {selected.name}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Trip Details ── */}
        {step === 2 && activeDest && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Selected destination banner */}
            <div className="flex items-center gap-4 rounded-2xl border border-[#BFBD31]/20 bg-[#BFBD31]/5 px-5 py-4">
              <span className="text-3xl">{activeDest.emoji}</span>
              <div>
                <p className="font-bold text-white text-lg">{activeDest.name}</p>
                <p className="text-xs text-slate-400">{activeDest.desc}</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="ml-auto text-xs text-[#BFBD31] underline hover:no-underline"
              >
                Change
              </button>
            </div>

            <h2 className="text-xl font-bold text-white">Trip Details</h2>

            <div className="space-y-4">

              {/* Start Date */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <label className="block text-sm font-semibold text-white mb-3">
                  📅 Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-slate-300 outline-none focus:border-[#BFBD31]/50 transition"
                />
              </div>

              {/* Duration */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <label className="block text-sm font-semibold text-white mb-3">
                  🗓️ Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATION_OPTIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setForm(f => ({ ...f, duration: d }))}
                      className={`rounded-xl py-2.5 text-sm font-medium transition ${
                        form.duration === d
                          ? 'bg-[#BFBD31] text-slate-900'
                          : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travelers */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <label className="block text-sm font-semibold text-white mb-4">
                  👥 Travelers
                </label>
                <div className="space-y-3">
                  {[
                    { label: 'Adults', sub: 'Age 13+', key: 'adults', min: 1 },
                    { label: 'Children', sub: 'Age 2–12', key: 'children', min: 0 },
                  ].map(({ label, sub, key, min }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{label}</p>
                        <p className="text-xs text-slate-500">{sub}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setForm(f => ({ ...f, [key]: Math.max(min, f[key] - 1) }))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                          disabled={form[key] <= min}
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-base font-bold text-white">{form[key]}</span>
                        <button
                          onClick={() => setForm(f => ({ ...f, [key]: f[key] + 1 }))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <label className="block text-sm font-semibold text-white mb-3">
                  💰 Budget (LKR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">LKR</span>
                  <input
                    type="number"
                    placeholder={activeDest.price.toString()}
                    value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 pl-12 pr-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:border-[#BFBD31]/50 transition"
                  />
                </div>
                {/* Budget preset chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[30000, 50000, 75000, 100000, 150000, 200000].map(b => (
                    <button
                      key={b}
                      onClick={() => setForm(f => ({ ...f, budget: b.toString() }))}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        parseInt(form.budget) === b
                          ? 'bg-[#BFBD31] text-slate-900 font-semibold'
                          : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {(b / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
              </div>

              {/* Special requests */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <label className="block text-sm font-semibold text-white mb-3">
                  📝 Special Requests <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Any dietary requirements, accessibility needs, or preferences..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:border-[#BFBD31]/50 transition resize-none"
                />
              </div>
            </div>

            {/* Summary card */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 flex flex-wrap gap-4 text-sm">
              <div><p className="text-slate-500 text-xs">Destination</p><p className="font-semibold text-white">{activeDest.name}</p></div>
              <div><p className="text-slate-500 text-xs">Duration</p><p className="font-semibold text-white">{form.duration}</p></div>
              <div><p className="text-slate-500 text-xs">Travelers</p><p className="font-semibold text-white">{form.adults}A {form.children > 0 ? `${form.children}C` : ''}</p></div>
              <div><p className="text-slate-500 text-xs">Budget</p><p className="font-semibold text-[#BFBD31]">LKR {(parseInt(form.budget || activeDest.price)).toLocaleString()}</p></div>
              {form.startDate && <div><p className="text-slate-500 text-xs">Start Date</p><p className="font-semibold text-white">{new Date(form.startDate + 'T00:00:00').toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>}
            </div>

            {/* CTA */}
            <button
              onClick={handleStartPlanning}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#BFBD31] py-4 text-base font-bold text-slate-900 shadow-[0_0_30px_rgba(191,189,49,0.3)] transition hover:opacity-90 hover:shadow-[0_0_40px_rgba(191,189,49,0.45)]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Start Building Itinerary
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
