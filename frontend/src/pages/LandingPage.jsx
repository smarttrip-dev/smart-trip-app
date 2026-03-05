import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SearchResultsModal from '../components/SearchResultsModal';
import sigiriyaImg from '../images/sigiriya.jpg';
import galleImg from '../images/galle.jpg';
import yalaImg from '../images/yala.jpg';
import ellaImg from '../images/ella.jpg';
import heroImg from '../images/hero/hero.jpg';
import bluebeachImg from '../images/Vacation/bluebeach.jpg';
import kandyDestImg from '../images/destinations/kandy.jpg';
import galleDestImg from '../images/destinations/galle.jpg';
import ellaDestImg from '../images/destinations/ella.jpg';
import sigiriyaDestImg from '../images/destinations/sigiriya.jpg';
import yalaDestImg from '../images/destinations/yala.png';
import nuwaraEliyaDestImg from '../images/destinations/nuwaraeliya.jpg';
import bundalaImg from '../images/Vacation/bundala.jpg';
import daladhaImg from '../images/Vacation/daladha.jpg';
import ruwanweliseyaImg from '../images/Vacation/ruwanweliseya.jpg';
import footerBgImg from '../images/footer/footer-bg.jpg';
import dondraFooterImg from '../images/footer/featured.jpg';

const faqs = [
  { id: 1, question: 'How does SmartTRIP work?', answer: 'SmartTRIP uses Smart Planning Engine to create personalized itineraries based on your budget, preferences, and travel dates. Simply enter your requirements, review Smart-generated options, customize as needed, and submit a soft booking request to our partner vendors.' },
  { id: 2, question: 'What is soft-booking?', answer: 'Soft-booking means your trip request is sent to vendors for confirmation before payment. You receive confirmation within 24�48 hours and only pay once everything is confirmed. This ensures availability and prevents upfront payment for unconfirmed bookings.' },
  { id: 3, question: 'How accurate is the budget tracking?', answer: 'Our budget tracking is highly accurate and updates in real-time as you customize your itinerary. The system shows exact costs from our partner vendors, including all taxes and fees, so there are no surprises.' },
  { id: 4, question: 'Can I modify my itinerary after booking?', answer: 'Yes! Before vendor confirmation, you can modify your itinerary freely. After confirmation, modifications are subject to vendor policies and may incur additional charges. Contact our support team for assistance.' },
  { id: 5, question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and bank transfers. Payment is only required after your booking is confirmed by vendors.' },
  { id: 6, question: 'What is your cancellation policy?', answer: 'Free cancellation up to 7 days before check-in. 50% refund for cancellations 3�7 days before check-in. No refund within 3 days of check-in. Specific services may have different policies which will be communicated upon booking.' },
  { id: 7, question: 'Do you offer travel insurance?', answer: "While we don't provide insurance directly, we partner with reputable insurance providers and can help you add comprehensive travel insurance to your booking at competitive rates." },
  { id: 8, question: 'How do I contact customer support?', answer: 'Our 24/7 support team is available via email at support@smarttrip.lk, phone at +94 11 234 5678, or live chat on our website. We typically respond within 2 hours during business hours and 4 hours after hours.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [searchForm, setSearchForm] = useState({ 
    destination: '', 
    budget: '', 
    adults: 2,
    children: 0,
    startDate: '',
    endDate: ''
  });
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  const handleSearch = () => {
    if (!searchForm.destination.trim()) {
      toast.error('Please select a destination');
      return;
    }
    if (!searchForm.budget) {
      toast.error('Please enter a budget');
      return;
    }
    if (!searchForm.startDate) {
      toast.error('Please select a start date');
      return;
    }

    const budgetNum = parseInt(searchForm.budget.replace(/,/g, '')) || 150000;
    const selectedDest = allDestinations.find(d => d.name.toLowerCase() === searchForm.destination.toLowerCase());
    
    let duration = selectedDest?.defaultDays || 3;
    if (searchForm.startDate && searchForm.endDate) {
      const start = new Date(searchForm.startDate);
      const end = new Date(searchForm.endDate);
      const diffTime = Math.abs(end - start);
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const travelers = `${searchForm.adults} Adult${searchForm.adults !== 1 ? 's' : ''}${searchForm.children > 0 ? `, ${searchForm.children} Child${searchForm.children !== 1 ? 'ren' : ''}` : ''}`;

    // Store search parameters and show modal instead of navigating
    setSearchParams({
      destination: searchForm.destination,
      budget: budgetNum,
      travelers: travelers,
      duration: `${duration} Day${duration !== 1 ? 's' : ''}`,
      dates: {
        from: searchForm.startDate,
        to: searchForm.endDate || searchForm.startDate
      }
    });
    setShowSearchResults(true);
  };

  // Local fallback images keyed by destination name
  const localDestImages = {
    'Kandy': kandyDestImg,
    'Galle': galleDestImg,
    'Ella': ellaDestImg,
    'Sigiriya': sigiriyaDestImg,
    'Yala': yalaDestImg,
    'Nuwara Eliya': nuwaraEliyaDestImg,
  };

  const getDestImage = (dest) => {
    // Prefer local bundled images for known destinations (always available)
    if (localDestImages[dest.name]) return localDestImages[dest.name];
    // Use DB image path for admin-uploaded images
    if (dest.image) return dest.image.startsWith('http') ? dest.image : dest.image;
    return kandyDestImg;
  };

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setDestinationsLoading(true);
        // Fetch all destinations for search dropdown
        const allRes = await axios.get('/api/config/destinations');
        setAllDestinations(allRes.data || []);
        
        // Fetch limited destinations for display cards
        const limitedRes = await axios.get('/api/config/destinations?limit=6');
        setDestinations(limitedRes.data || []);
      } catch (err) {
        console.error('Failed to fetch destinations:', err);
      } finally {
        setDestinationsLoading(false);
      }
    };
    const stored = localStorage.getItem('userInfo');
    if (stored) setUserInfo(JSON.parse(stored));
    fetchDestinations();
  }, []);

  const getDashboardLink = () => {
    if (!userInfo) return '/login';
    if (userInfo.role === 'admin') return '/admin/dashboard';
    if (userInfo.role === 'vendor') return '/vendor/dashboard';
    return '/dashboard';
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.15),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.05),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      {/* Search Results Modal */}
      <SearchResultsModal
        isOpen={showSearchResults}
        onClose={() => setShowSearchResults(false)}
        searchParams={searchParams}
        destinations={allDestinations}
      />

      {/* Hero Section */}
      <div className="relative w-full p-4 sm:p-6 lg:p-8">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 shadow-2xl min-h-[90vh] 2xl:max-w-[1920px] 2xl:mx-auto">
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.75) 60%, rgba(15,23,42,0.95) 100%), url(${heroImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 40%',
            }}
          />
          
          {/* Header */}
          <header className="relative z-10 flex items-center justify-between p-6 sm:px-10 sm:py-8">
            <Link to="/" className="flex items-center gap-3 text-white/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <svg className="h-5 w-5 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </Link>

            <div className="hidden items-center gap-8 rounded-full bg-white/5 border border-white/10 px-8 py-3 backdrop-blur-md md:flex">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none w-24 focus:w-32 transition-all placeholder:text-slate-500" />
              </div>
              <span className="h-4 w-px bg-white/20"></span>
              {['How it Works', 'Destinations', 'About', 'Blogs'].map((item) => {
                const isAnchor = ['How it Works', 'Destinations', 'About'].includes(item);
                const target = item.toLowerCase().replace(/\s+/g, '-');
                return isAnchor
                  ? <a key={item} href={`#${target}`} className="text-sm font-medium text-slate-200 hover:text-[#BFBD31] transition-colors">{item}</a>
                  : <Link key={item} to="#" className="text-sm font-medium text-slate-200 hover:text-[#BFBD31] transition-colors">{item}</Link>;
              })}
              <span className="h-4 w-px bg-white/20"></span>
              <a href="#book-now" className="text-sm font-medium text-slate-200 hover:text-[#BFBD31] transition-colors">Book Now</a>
            </div>

            {userInfo ? (
              <Link to={getDashboardLink()} className="rounded-full border border-[#BFBD31]/50 px-6 py-2.5 text-sm font-medium text-[#BFBD31] backdrop-blur-md transition-colors hover:bg-[#BFBD31]/10 hover:text-white">
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="rounded-full border border-[#BFBD31]/50 px-6 py-2.5 text-sm font-medium text-[#BFBD31] backdrop-blur-md transition-colors hover:bg-[#BFBD31]/10 hover:text-white">
                  Login
                </Link>
                <Link to="/register" className="rounded-full bg-[#BFBD31] px-6 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-[#d4d235] hover:scale-105 shadow-[0_0_16px_rgba(191,189,49,0.3)]">
                  Sign Up
                </Link>
              </div>
            )}
          </header>

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-end pb-10 sm:pb-16 px-4 text-center">

            {/* Badge */}
            <div className="mb-5 flex items-center gap-2 rounded-full border border-[#BFBD31]/30 bg-[#BFBD31]/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-[#BFBD31] animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#BFBD31]">Pearl of the Indian Ocean</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white mb-4 max-w-3xl">
              Plan Your Dream Trip<br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BFBD31] to-[#d4d235]"> Within Your Budget</span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-xl text-sm sm:text-base text-slate-300/80 leading-relaxed mb-8">
              Smart travel planning that creates personalized itineraries matching your budget, preferences, and schedule. No hidden fees, complete transparency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-[#BFBD31] hover:bg-[#d4d235] text-slate-950 px-8 py-3 text-sm font-semibold transition-all hover:scale-105 shadow-[0_0_24px_rgba(191,189,49,0.4)]">
                Start Planning Free
              </Link>
              <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 hover:bg-white/15 text-white px-8 py-3 text-sm font-medium transition-all backdrop-blur-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Watch Demo
              </a>
            </div>

            {/* Quick Search Card */}
            <div className="w-full max-w-4xl rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md p-6 shadow-2xl">
              <p className="text-sm font-semibold text-white mb-4">Quick Search Preview</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
                {/* Destination Dropdown */}
                <div className="lg:col-span-1">
                  <p className="text-xs text-slate-300 mb-1.5">Where to?</p>
                  <div className="relative">
                    <button 
                      onClick={() => setShowDestDropdown(!showDestDropdown)}
                      className="w-full text-left rounded-lg bg-slate-800/80 border border-white/10 text-slate-300 hover:border-[#BFBD31]/50 text-sm px-3 py-2.5 outline-none focus:border-[#BFBD31]/50 transition"
                    >
                      {searchForm.destination ? `${allDestinations.find(d => d.name === searchForm.destination)?.emoji || '🏖️'} ${searchForm.destination}` : 'Select'}
                    </button>
                    {showDestDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                        {allDestinations.map(dest => (
                          <button
                            key={dest._id}
                            onClick={() => {
                              setSearchForm({ ...searchForm, destination: dest.name });
                              setShowDestDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-[#BFBD31]/20 transition text-slate-300 text-sm"
                          >
                            {dest.emoji} {dest.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget */}
                <div className="lg:col-span-1">
                  <p className="text-xs text-slate-300 mb-1.5">Budget (LKR)</p>
                  <input 
                    type="number" 
                    placeholder="100,000" 
                    className="w-full rounded-lg bg-slate-800/80 border border-white/10 text-slate-300 placeholder:text-slate-500 text-sm px-3 py-2.5 outline-none focus:border-[#BFBD31]/50 transition" 
                    value={searchForm.budget} 
                    onChange={(e) => setSearchForm({ ...searchForm, budget: e.target.value })}
                  />
                </div>

                {/* Travelers */}
                <div className="lg:col-span-1">
                  <p className="text-xs text-slate-300 mb-1.5">Travelers</p>
                  <div className="rounded-lg bg-slate-800/80 border border-white/10 px-3 py-2.5 flex items-center justify-center gap-2 text-sm">
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => setSearchForm({...searchForm, adults: Math.max(1, searchForm.adults - 1)})} className="bg-slate-700 px-1.5 py-0 rounded hover:bg-[#BFBD31]/30 text-slate-300 text-sm leading-tight">−</button>
                      <span className="text-slate-300 text-sm w-4 text-center leading-tight font-medium">{searchForm.adults}</span>
                      <button onClick={() => setSearchForm({...searchForm, adults: searchForm.adults + 1})} className="bg-slate-700 px-1.5 py-0 rounded hover:bg-[#BFBD31]/30 text-slate-300 text-sm leading-tight">+</button>
                    </div>
                    <span className="text-slate-400 text-xs">A</span>
                    <span className="text-slate-600 text-xs mx-0.5">/</span>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => setSearchForm({...searchForm, children: Math.max(0, searchForm.children - 1)})} className="bg-slate-700 px-1.5 py-0 rounded hover:bg-[#BFBD31]/30 text-slate-300 text-sm leading-tight">−</button>
                      <span className="text-slate-300 text-sm w-4 text-center leading-tight font-medium">{searchForm.children}</span>
                      <button onClick={() => setSearchForm({...searchForm, children: searchForm.children + 1})} className="bg-slate-700 px-1.5 py-0 rounded hover:bg-[#BFBD31]/30 text-slate-300 text-sm leading-tight">+</button>
                    </div>
                    <span className="text-slate-400 text-xs">C</span>
                  </div>
                </div>

                {/* Start Date */}
                <div className="lg:col-span-1">
                  <p className="text-xs text-slate-300 mb-1.5">Start Date</p>
                  <input 
                    type="date" 
                    className="w-full rounded-lg bg-slate-800/80 border border-white/10 text-slate-300 placeholder:text-slate-500 text-sm px-3 py-2.5 outline-none focus:border-[#BFBD31]/50 transition" 
                    value={searchForm.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSearchForm({ ...searchForm, startDate: e.target.value })}
                  />
                </div>

                {/* End Date */}
                <div className="lg:col-span-1">
                  <p className="text-xs text-slate-300 mb-1.5">End Date (Optional)</p>
                  <input 
                    type="date" 
                    className="w-full rounded-lg bg-slate-800/80 border border-white/10 text-slate-300 placeholder:text-slate-500 text-sm px-3 py-2.5 outline-none focus:border-[#BFBD31]/50 transition" 
                    value={searchForm.endDate}
                    min={searchForm.startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSearchForm({ ...searchForm, endDate: e.target.value })}
                  />
                </div>

                {/* Search Button */}
                <div className="lg:col-span-1 flex items-flex-end">
                  <button 
                    onClick={handleSearch} 
                    disabled={searching}
                    className={`w-full h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-slate-950 transition-all ${
                      searching 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-[#BFBD31] hover:bg-[#d4d235] shadow-[0_0_20px_rgba(191,189,49,0.35)] hover:shadow-[0_0_30px_rgba(191,189,49,0.5)]'
                    }`}
                  >
                    {searching ? '🔄' : '🔍'}
                    {searching ? 'Planning' : 'Search'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                <Link to="/register" className="text-[#BFBD31] hover:text-[#d4d235] underline underline-offset-2">Sign up</Link> to unlock full search and Smart Planning Engine features
              </p>
            </div>

            {/* Scroll Indicator */}
            <div className="flex flex-col items-center gap-2 text-[#BFBD31]/40 animate-bounce mt-8">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
            </div>
          </div>

          {/* Stats Strip � flush inside hero card */}
          <div className="relative z-10 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4">
            {[
              { value: '10,000+', label: 'Happy Travelers' },
              { value: '500+',    label: 'Destinations' },
              { value: '4.9/5',   label: 'Average Rating' },
              { value: '24/7',    label: 'Support Available' },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                className={`flex flex-col items-center justify-center py-6 gap-1 ${i !== 0 ? 'border-l border-white/10' : ''}`}
              >
                <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{value}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-20 lg:py-28 scroll-mt-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-gotham font-medium text-white">How SmartTRIP Works</h2>
          <p className="text-slate-400 text-sm sm:text-base">Four simple steps to your perfect vacation</p>
        </div>
        
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10"></div>
          
          {[
            { 
              step: '1', 
              title: 'Share Your Preferences', 
              desc: 'Tell us your destination, budget, dates, and what you love to do', 
              icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
              color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20'
            },
            { 
              step: '2', 
              title: 'Get Smart Recommendations', 
              desc: 'Our Smart Planning Engine creates personalized itineraries matching your needs and budget', 
              icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
              color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20'
            },
            { 
              step: '3', 
              title: 'Customize Your Trip', 
              desc: 'Adjust hotels, activities, and services while tracking your budget', 
              icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
              color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20'
            },
            { 
              step: '4', 
              title: 'Confirm & Travel', 
              desc: 'Vendors confirm availability, you pay, and we handle the rest', 
              icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
              color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20'
            }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className={`flex h-[88px] w-[88px] items-center justify-center rounded-2xl ${item.bg} ${item.border} border bg-slate-900/80 backdrop-blur shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-transform group-hover:-translate-y-2 group-hover:shadow-[0_10px_30px_rgba(99,102,241,0.2)] mb-6 relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} opacity-50`}></div>
                <svg className={`w-10 h-10 ${item.color} relative z-10`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
                </svg>
              </div>
              
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BFBD31] text-slate-900 font-bold text-sm mb-5 border border-[#BFBD31]/30">
                {item.step}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-[260px]">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 flex justify-center">
          <button className="bg-[#BFBD31] hover:bg-[#d4d235] text-slate-950 px-8 py-3.5 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(191,189,49,0.3)] hover:shadow-[0_0_30px_rgba(191,189,49,0.5)] hover:-translate-y-0.5">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Wonders of Nature Section */}
      <section className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-medium text-white">The Wonders Of Nature</h2>
            <p className="text-sm text-slate-400 max-w-md">We seek to provide the authentic contact for travel far around the world.</p>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#BFBD31]/20 text-[#BFBD31] hover:bg-[#BFBD31] hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { img: sigiriyaImg, title: 'Sigiriya Rock', label: 'Ancient' },
            { img: galleImg, title: 'Galle Fort', label: 'Coastal' },
            { img: yalaImg, title: 'Yala National Park', label: 'Safari' },
            { img: ellaImg, title: 'Ella Mountains', label: 'Hills' },
          ].map((card, i) => (
            <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-800">
              <img src={card.img} alt={card.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#BFBD31]"></span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#BFBD31]">{card.label}</span>
                </div>
                <h3 className="text-lg font-medium text-white">{card.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section id="destinations" className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-24 scroll-mt-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-gotham font-medium text-white">Popular Destinations</h2>
          <p className="text-slate-400 text-sm sm:text-base">Explore Sri Lanka's most loved destinations with Smart itineraries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {destinationsLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col bg-slate-900 border border-white/5 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-800" />
                <div className="p-6 flex flex-col gap-4">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                  <div className="flex justify-between">
                    <div className="h-5 bg-slate-800 rounded w-24" />
                    <div className="h-9 bg-slate-800 rounded w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : destinations.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <p className="text-lg font-medium mb-1">No destinations available</p>
              <p className="text-sm">Destinations will appear here once added by the admin.</p>
            </div>
          ) : (
            destinations.map((dest) => (
              <div key={dest._id} className="flex flex-col bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                {/* Card Header Image */}
                <div className="h-44 relative overflow-hidden">
                  <img
                    src={getDestImage(dest)}
                    alt={dest.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={e => { e.target.src = kandyDestImg; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 flex items-center gap-2">
                    {dest.emoji && <span className="text-xl">{dest.emoji}</span>}
                    <h3 className="text-2xl font-bold text-white tracking-wide drop-shadow-lg">{dest.name}</h3>
                  </div>
                  {dest.tag && (
                    <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/20">
                      {dest.tag}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-1 gap-5">
                  <p className="text-slate-400 text-sm flex-1">{dest.description || `Explore ${dest.name} with a personalized itinerary`}</p>

                  <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-300">
                      {dest.region && (
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          {dest.region}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500">{dest.defaultDays} {dest.defaultDays === 1 ? 'Day' : 'Days'}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-semibold text-[#BFBD31]">
                      From LKR {(dest.defaultPrice || 0).toLocaleString()}
                    </span>
                    <button
                      onClick={() => navigate('/itinerary', {
                        state: {
                          destination: `${dest.name} Tour`,
                          location: dest.name,
                          duration: `${dest.defaultDays} Days`,
                          budget: dest.defaultPrice || 50000,
                          dates: {},
                        }
                      })}
                      className="bg-[#BFBD31] hover:bg-[#d4d235] text-slate-950 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-14 flex justify-center">
          <button className="border border-[#BFBD31]/50 hover:bg-[#BFBD31]/10 text-[#BFBD31] px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
            View All Destinations <span className="text-lg leading-none">&rarr;</span>
          </button>
        </div>
      </section>

      {/* Reasons to Choose Us (About Section) */}
      <section id="about" className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-24 scroll-mt-20">
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-gotham font-semibold text-white">Why Choose SmartTRIP?</h2>
          <p className="text-slate-400 text-sm sm:text-base">Intelligent features designed for hassle-free travel planning</p>
        </div>
        
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            { title: 'Smart Planning Engine', text: 'Smart algorithms create optimal itineraries based on your preferences', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', glow: 'from-purple-500/20 to-transparent' },
            { title: 'Budget Control', text: 'Real-time tracking ensures you never exceed your budget', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', glow: 'from-blue-500/20 to-transparent' },
            { title: 'Verified Vendors', text: 'All partners are vetted for quality and reliability', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', glow: 'from-indigo-500/20 to-transparent' },
            { title: 'Flexible Booking', text: 'Soft-booking process with no payment until confirmation', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', glow: 'from-violet-500/20 to-transparent' },
          ].map((feat, i) => (
            <div key={i} className="group relative flex flex-col bg-slate-900 border border-white/5 rounded-3xl p-8 hover:bg-slate-800/80 transition-colors">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feat.glow} rounded-bl-full opacity-50`}></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#BFBD31] text-slate-900 mb-6 border border-[#BFBD31]/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={feat.icon} />
                </svg>
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-3">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vacation Perfect Section */}
      <section id="book-now" className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-20 scroll-mt-20">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Left Collage */}
          <div className="w-full max-w-xl grid grid-cols-2 gap-4 lg:gap-6">
            <div className="flex flex-col gap-4 lg:gap-6 pt-12">
              <img src={bluebeachImg} alt="Vacation 1" className="rounded-2xl rounded-tr-[40px] aspect-[4/5] object-cover border border-white/10 shadow-xl" />
              <img src={bundalaImg} alt="Vacation 2" className="rounded-2xl aspect-video object-cover border border-white/10 shadow-xl" />
            </div>
            <div className="flex flex-col gap-4 lg:gap-6">
              <img src={daladhaImg} alt="Vacation 3" className="rounded-2xl aspect-square object-cover border border-white/10 shadow-xl" />
              <img src={ruwanweliseyaImg} alt="Vacation 4" className="rounded-2xl rounded-bl-[40px] aspect-[4/5] object-cover border border-white/10 shadow-xl" />
            </div>
          </div>
          
          {/* Right Text */}
          <div className="w-full max-w-xl space-y-8">
            <h2 className="text-3xl sm:text-4xl font-medium text-white leading-snug">
              Here's makes a vacation <br className="hidden sm:block"/> perfect for you!
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Whether you're planning a family vacation with your pet, a relaxing weekend getaway, or an adventurous excursion, vacation rentals are ideal for trips of all types. You can find everything from charming mountain cabins and lakeside lodges to breathtaking city apartments.
            </p>
            <button className="bg-[#BFBD31] hover:bg-[#d4d235] text-slate-950 px-8 py-3.5 rounded-full font-semibold transition-transform hover:scale-105 inline-block">
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-gotham font-medium text-white">What Travelers Say</h2>
          <p className="text-slate-400 text-sm sm:text-base">Real experiences from real travelers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              initials: 'SJ', name: 'Sarah Johnson', country: 'Australia',
              rating: 5,
              review: "SmartTRIP made planning our Sri Lanka honeymoon so easy! The Smart recommendations were spot-on and we stayed perfectly within our budget. Highly recommended!",
              trip: 'Kandy & Galle Tour', date: 'January 2025',
            },
            {
              initials: 'RP', name: 'Raj Patel', country: 'India',
              rating: 5,
              review: "Amazing experience! The platform found us the perfect family-friendly hotels and activities. The vendor coordination was seamless.",
              trip: 'Ella Family Adventure', date: 'December 2024',
            },
            {
              initials: 'EW', name: 'Emma Williams', country: 'UK',
              rating: 4,
              review: "Best travel booking platform I've used. The budget tracking feature helped us avoid overspending, and the soft-booking process was stress-free.",
              trip: 'Cultural Triangle Tour', date: 'November 2024',
            },
          ].map((t) => (
            <div key={t.name} className="flex flex-col bg-slate-900 border border-white/5 rounded-2xl p-6 hover:border-white/15 transition-all duration-300 shadow-xl hover:-translate-y-1">
              {/* Avatar & Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.country}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-600'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Review */}
              <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-5">{t.review}</p>

              {/* Trip & Date */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-sm font-medium text-indigo-400">{t.trip}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-gotham font-medium text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm sm:text-base">Everything you need to know about SmartTRIP</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
              <button
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
              >
                <span className="text-sm font-semibold text-white">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-indigo-400 flex-shrink-0 transition-transform duration-300 ${expandedFaq === faq.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFaq === faq.id && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm mb-3">Still have questions?</p>
          <a href="mailto:support@smarttrip.lk" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors">
            Contact Our Support Team
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </section>

      {/* Explore Section */}
      <section className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-20 pb-4 mb-0">
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h2 className="text-2xl font-medium text-white">Explore The Nature With Us</h2>
            <div className="absolute -bottom-3 right-0 w-2/3 h-px bg-[#BFBD31]"></div>
          </div>
        </div>
        
        <div className="relative rounded-3xl border border-[#BFBD31]/15 overflow-hidden bg-slate-900 md:aspect-[21/9] flex flex-col md:flex-row justify-between" style={{
            backgroundImage: `linear-gradient(90deg, rgba(7,16,22,0.95) 0%, rgba(7,16,22,0.4) 100%), url(${footerBgImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
         }}>
           <div className="max-w-xs space-y-6 self-start p-8 md:p-12 md:pt-20">
             {[
               "Whether you're planning a family vacation with your pet, a relaxing weekend getaway. 2 million trys.",
               "Whether you're planning a family vacation with your pet, a relaxing",
               "Vacation with your pet, a relaxing weekend"
             ].map((text, idx) => (
                <div key={idx} className="relative group">
                  <p className="text-sm text-slate-300/80 leading-relaxed bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm relative z-10 w-[280px]">
                    {text}
                  </p>
                  {/* Visual connector lines for desktop */}
                  <svg className="hidden md:block absolute top-1/2 left-[280px] w-[300px] h-[150px] -z-10 overflow-visible" style={{ transform: 'translateY(-50%)' }}>
                    <path 
                      d={`M 0 75 L 100 75 L 200 ${idx === 0 ? 0 : idx === 1 ? 75 : 150} L 280 ${idx === 0 ? 0 : idx === 1 ? 75 : 150}`} 
                      fill="none" 
                      stroke="rgba(255,255,255,0.3)" 
                      strokeWidth="1.5"
                    />
                    <circle 
                      cx="280" 
                      cy={idx === 0 ? 0 : idx === 1 ? 75 : 150} 
                      r="4" 
                      fill="white" 
                    />
                  </svg>
                </div>
             ))}
           </div>
           
           <div className="hidden md:block self-center relative rounded-xl overflow-hidden border border-white/20 w-[460px] aspect-[16/9] mr-12 transform -translate-y-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <img src={dondraFooterImg} alt="Dondra Lighthouse" className="w-full h-full object-cover brightness-110 contrast-105"/>
           </div>

           {/* In-Panel Footer integrated as an overlay at the bottom */}
           <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950/95 via-slate-900/80 to-transparent pt-20">
             <div className="w-full max-w-7xl mx-auto px-10 pb-8 flex flex-wrap justify-between items-start text-sm border-b border-white/10 pb-6 mb-6">
                <div className="space-y-3">
                  <Link to="#" className="block text-slate-300 hover:text-[#BFBD31] transition">Book Now</Link>
                  <Link to="#" className="block text-slate-300 hover:text-[#BFBD31] transition">About</Link>
                  <Link to="#" className="block text-slate-300 hover:text-[#BFBD31] transition">Blogs</Link>
                </div>
                <div className="space-y-3">
                  <Link to="#" className="block text-slate-300 hover:text-[#BFBD31] transition">Supports</Link>
                  <Link to="#" className="block text-slate-300 hover:text-[#BFBD31] transition">Privacy</Link>
                  <Link to="#" className="block text-slate-300 hover:text-[#BFBD31] transition">Affiliates</Link>
                </div>
                <div className="space-y-3">
                  <p className="text-slate-300">008-557-990; 008-557-900</p>
                  <p className="text-slate-300">adventure@gmail.com</p>
                </div>
             </div>
             
             <div className="flex justify-between items-center px-10 pb-6 text-xs text-[#BFBD31]/80 w-full max-w-7xl mx-auto font-medium tracking-wide">
                <p>&#169; 2026, All Right Reserve</p>
                <Link to="#" className="hover:text-[#BFBD31] transition">Privacy Policy</Link>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
}







