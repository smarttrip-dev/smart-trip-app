import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const RECOMMENDED = [
  { name: 'Ella', tag: 'Hill Country', bg: 'from-emerald-800 to-teal-900', emoji: '🌿', price: 'From LKR 12,000' },
  { name: 'Sigiriya', tag: 'Heritage', bg: 'from-orange-800 to-amber-900', emoji: '🏯', price: 'From LKR 8,500' },
  { name: 'Mirissa', tag: 'Beach', bg: 'from-blue-800 to-cyan-900', emoji: '🐋', price: 'From LKR 15,000' },
  { name: 'Kandy', tag: 'Culture', bg: 'from-purple-800 to-violet-900', emoji: '🛕', price: 'From LKR 9,000' },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!userInfo?.token) { navigate('/login'); return; }
    setUser(userInfo);

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${userInfo.token}` };
        const [tripsRes] = await Promise.allSettled([
          axios.get('/api/bookings', { headers }),
        ]);
        if (tripsRes.status === 'fulfilled') {
          setTrips(tripsRes.value.data.map(b => ({
            id: b._id,
            destination: b.destination,
            title: b.destination,
            status: b.status,
            startDate: b.tripDates?.startDate,
            location: b.location,
            duration: b.duration,
            totalCost: b.totalCost,
            budgetSaved: 0,
            pax: b.pax,
          })));
        }
        // Mock recent searches from localStorage
        const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(searches.slice(0, 5));
        // Mock notifications
        setNotifications([
          { id: 1, text: 'Your Ella trip is confirmed!', time: '2h ago', read: false, icon: '✅' },
          { id: 2, text: 'New discount on Kandy packages', time: '5h ago', read: false, icon: '🏷️' },
          { id: 3, text: 'Review your completed Galle trip', time: '1d ago', read: true, icon: '⭐' },
        ]);
        setUnreadCount(2);
      } catch {
        // silent — we still show the shell
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const stats = [
    {
      label: 'Active Trips',
      value: trips.filter(t => t.status === 'confirmed').length,
      icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
      color: 'from-[#BFBD31]/20 to-[#BFBD31]/10',
      accent: 'text-[#BFBD31]',
      border: 'border-[#BFBD31]/20',
    },
    {
      label: 'Total Spent',
      value: 'LKR ' + (trips.reduce((sum, t) => sum + (t.totalCost || 0), 0).toLocaleString() || '0'),
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'from-indigo-400/20 to-blue-400/10',
      accent: 'text-indigo-300',
      border: 'border-indigo-400/20',
    },
    {
      label: 'Pending Bookings',
      value: trips.filter(t => t.status === 'pending').length,
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'from-amber-400/20 to-yellow-400/10',
      accent: 'text-amber-300',
      border: 'border-amber-400/20',
    },
    {
      label: 'Completed Trips',
      value: trips.filter(t => t.status === 'completed').length,
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      color: 'from-teal-400/20 to-cyan-400/10',
      accent: 'text-teal-300',
      border: 'border-teal-400/20',
    },
  ];

  const upcomingTrips = trips
    .filter(t => t.status === 'confirmed')
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <svg className="h-10 w-10 animate-spin text-[#BFBD31]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(132,204,22,0.08),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.07),transparent_40%)]" />

      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#BFBD31]/15">
              <svg className="h-5 w-5 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white">SmartTrip</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/my-trips" className="text-slate-400 transition hover:text-[#BFBD31]">My Trips</Link>
            <Link to="/saved-trips" className="text-slate-400 transition hover:text-[#BFBD31]">Saved Trips</Link>
            <Link to="/plan-trip" className="text-slate-400 transition hover:text-[#BFBD31]">Plan a Trip</Link>
            <Link to="/help" className="text-slate-400 transition hover:text-[#BFBD31]">Help Center</Link>
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
              >
                <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#BFBD31] text-[10px] font-bold text-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifPanel && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <Link to="/notifications" onClick={() => setShowNotifPanel(false)} className="text-xs text-[#BFBD31] hover:text-[#BFBD31]">View all</Link>
                  </div>
                  <div className="divide-y divide-white/5">
                    {notifications.map(n => (
                      <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${!n.read ? 'bg-[#BFBD31]/5' : ''}`}>
                        <span className="text-lg">{n.icon}</span>
                        <div className="flex-1">
                          <p className="text-xs text-slate-200">{n.text}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">{n.time}</p>
                        </div>
                        {!n.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#BFBD31]" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link
              to="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
              title="Settings / Profile"
            >
              <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            {/* Avatar / Profile */}
            <Link to="/profile" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#BFBD31]/15 text-sm font-bold text-[#BFBD31] transition hover:bg-[#BFBD31]/25">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-red-400/40 hover:text-red-300 sm:flex"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Welcome Banner ── */}
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-[#BFBD31]/15 bg-gradient-to-br from-slate-900 via-slate-900 to-lime-950/30 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#BFBD31]/70">Welcome back</p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              {user?.name || 'Explorer'} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-400">Here's what's happening with your trips today.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/plan-trip"
              className="flex items-center gap-2 rounded-2xl bg-[#BFBD31] px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:opacity-90"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Plan New Trip
            </Link>
            <Link
              to="/my-trips"
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              View All Trips
            </Link>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.border} bg-gradient-to-br ${s.color} p-5`}>
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5`}>
                <svg className={`h-5 w-5 ${s.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} />
                </svg>
              </div>
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.accent}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ── Left column ── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Upcoming Trips Timeline */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-white">Upcoming Trips</h2>
                <Link to="/my-trips" className="text-xs text-[#BFBD31] hover:text-[#BFBD31]">View all →</Link>
              </div>
              {upcomingTrips.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <span className="text-4xl">🗺️</span>
                  <p className="text-sm text-slate-400">No upcoming trips yet.</p>
                  <Link
                    to="/plan-trip"
                    className="rounded-xl bg-[#BFBD31]/15 px-4 py-2 text-xs font-semibold text-[#BFBD31] transition hover:bg-[#BFBD31]/25"
                  >
                    Plan your first trip
                  </Link>
                </div>
              ) : (
                <ol className="relative border-l border-white/10 pl-6 space-y-5">
                  {upcomingTrips.map((trip) => (
                    <li key={trip.id} className="relative">
                      <span className="absolute -left-[25px] flex h-4 w-4 items-center justify-center rounded-full border border-[#BFBD31]/40 bg-[#BFBD31]/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#BFBD31]" />
                      </span>
                      <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{trip.destination || trip.title}</p>
                          <p className="text-xs text-slate-500">{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Date TBD'}</p>
                        </div>
                        <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                          Confirmed
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Recent Searches */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-white">Recent Searches</h2>
                {recentSearches.length > 0 && (
                  <button
                    onClick={() => { localStorage.removeItem('recentSearches'); setRecentSearches([]); }}
                    className="text-xs text-slate-500 hover:text-red-400 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
              {recentSearches.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <span className="text-3xl">🔍</span>
                  <p className="text-xs text-slate-500">No recent searches</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {recentSearches.map((s, i) => (
                    <li key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-slate-200">{s.destination}</p>
                          <p className="text-xs text-slate-500">{s.date} · {s.travelers}</p>
                        </div>
                      </div>
                      <Link
                        to="/itinerary"
                        state={{ search: s }}
                        className="rounded-lg bg-[#BFBD31]/10 px-2.5 py-1 text-xs font-medium text-[#BFBD31] transition hover:bg-[#BFBD31]/20"
                      >
                        Continue
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {recentSearches.length === 0 && (
                <div className="mt-3 flex justify-center">
                  <Link
                    to="/plan-trip"
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5"
                  >
                    Start a new search
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Recommended Destinations */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-white">Recommended for You</h2>
                <Link to="/plan-trip" className="text-xs text-[#BFBD31] hover:text-[#BFBD31]">View more →</Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {RECOMMENDED.map((dest) => (
                  <div key={dest.name} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${dest.bg} p-5 border border-white/10`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-2xl">{dest.emoji}</span>
                        <h3 className="mt-2 text-base font-bold text-white">{dest.name}</h3>
                        <p className="text-xs text-white/60">{dest.tag}</p>
                        <p className="mt-1 text-xs font-semibold text-[#BFBD31]">{dest.price}</p>
                      </div>
                      <Link
                        to="/plan-trip"
                        state={{ preselect: dest.name }}
                        className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                      >
                        Explore
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h2 className="mb-4 font-semibold text-white">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'My Profile', to: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { label: 'View Saved Trips', to: '/saved-trips', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
                  { label: 'Notifications', to: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
                  { label: 'Help Center', to: '/help', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:border-[#BFBD31]/20 hover:bg-[#BFBD31]/5 hover:text-[#BFBD31]"
                  >
                    <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    </svg>
                    {item.label}
                    <svg className="ml-auto h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/5 hover:text-red-300"
                >
                  <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                  <svg className="ml-auto h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-white">Notifications</h2>
                <Link to="/notifications" className="text-xs text-[#BFBD31] hover:text-[#BFBD31]">View all</Link>
              </div>
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 rounded-xl p-3 ${!n.read ? 'border border-[#BFBD31]/15 bg-[#BFBD31]/5' : 'border border-white/5 bg-white/5'}`}>
                    <span className="text-lg leading-none">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-200 leading-snug">{n.text}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{n.time}</p>
                    </div>
                    {!n.read && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#BFBD31]" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Last Search CTA */}
            {recentSearches.length > 0 && (
              <div className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-950/60 to-slate-900 p-5">
                <p className="text-xs uppercase tracking-widest text-indigo-300/70">Pick up where you left off</p>
                <p className="mt-1 text-sm font-semibold text-white">{recentSearches[0]?.destination}</p>
                <p className="text-xs text-slate-500">{recentSearches[0]?.date}</p>
                <Link
                  to="/itinerary"
                  state={{ search: recentSearches[0] }}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-indigo-500/20 px-4 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/30"
                >
                  Continue Last Search
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
