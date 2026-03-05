import React, { useState, useEffect } from 'react';
import LocationAutocomplete from '../components/LocationAutocomplete';
import axios from 'axios';

export default function LandingPageAlt() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeDestination, setActiveDestination] = useState(0);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [budget, setBudget] = useState('');
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Fetch activities based on location and budget
  useEffect(() => {
    const fetchActivities = async () => {
      if (!pickupLocation && !budget) {
        setActivities([]);
        return;
      }

      setLoadingActivities(true);
      try {
        const params = new URLSearchParams();
        if (pickupLocation) params.append('location', pickupLocation);
        if (budget) {
          const budgetNum = parseFloat(budget.replace(/,/g, ''));
          if (!isNaN(budgetNum)) params.append('maxPrice', budgetNum);
        }

        const url = `/api/inventory/public?${params.toString()}`;
        console.log('Fetching from:', url);
        const response = await axios.get(url);
        console.log('Response data:', response.data);
        if (response.data && response.data.length > 0) {
          console.log('First item:', response.data[0]);
          console.log('First item images:', response.data[0].images);
        }
        setActivities(response.data || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    const timer = setTimeout(fetchActivities, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [pickupLocation, budget]);

  const destinations = [
    {
      id: 1,
      name: 'Kandy',
      tagline: 'Temple City',
      description: 'Immerse yourself in ancient Buddhist culture and pristine natural beauty',
      image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      price: '45,000',
      days: 3,
      highlights: ['Temple of Tooth', 'Royal Gardens', 'Cultural Shows']
    },
    {
      id: 2,
      name: 'Galle',
      tagline: 'Dutch Fort Paradise',
      description: 'Colonial architecture meets turquoise waters in this coastal gem',
      image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      price: '55,000',
      days: 4,
      highlights: ['Galle Fort', 'Beach Resorts', 'Whale Watching']
    },
    {
      id: 3,
      name: 'Ella',
      tagline: 'Hill Country Haven',
      description: 'Misty mountains, lush tea estates, and breathtaking viewpoints',
      image: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      price: '40,000',
      days: 3,
      highlights: ['Nine Arch Bridge', 'Little Adams Peak', 'Tea Factories']
    },
    {
      id: 4,
      name: 'Sigiriya',
      tagline: 'Ancient Wonder',
      description: 'Climb the legendary rock fortress and explore 5th-century frescoes',
      image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      price: '50,000',
      days: 2,
      highlights: ['Rock Fortress', 'Water Gardens', 'Cave Temples']
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Michael Chen',
      role: 'Travel Blogger',
      image: 'MC',
      rating: 5,
      text: 'The Smart Planning Engine saved me hours of research. Everything was perfectly organized within my budget.',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 2,
      name: 'Priya Kumar',
      role: 'Adventure Seeker',
      image: 'PK',
      rating: 5,
      text: 'Best travel platform for families! The customization options are incredible and so easy to use.',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      id: 3,
      name: 'James Wilson',
      role: 'Digital Nomad',
      image: 'JW',
      rating: 5,
      text: 'Transparent pricing, no hidden fees. The soft-booking system is brilliant for flexible planners.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 4,
      name: 'Sofia Martinez',
      role: 'Photographer',
      image: 'SM',
      rating: 5,
      text: 'Found hidden gems I never would have discovered on my own. The local recommendations are gold!',
      gradient: 'from-green-500 to-teal-500'
    }
  ];

  const faqs = [
    {
      question: 'How does Smart planning work?',
      answer: 'Our Smart Planning Engine analyzes thousands of trip combinations based on your budget, preferences, travel dates, and interests. It learns from millions of traveler data points to suggest the perfect itinerary tailored just for you.'
    },
    {
      question: 'What makes SmartTRIP different?',
      answer: 'Unlike traditional booking sites, we focus on budget-first planning with complete transparency. Our Smart Planning Engine creates entire trip packages, not just hotel bookings, and our soft-booking system ensures you only pay when everything is confirmed.'
    },
    {
      question: 'Is my payment secure?',
      answer: 'Absolutely. We use bank-level encryption and never store your payment details. Plus, you only pay after vendors confirm your booking, so there\'s zero risk of paying for unavailable services.'
    },
    {
      question: 'Can I make changes after booking?',
      answer: 'Yes! Before confirmation, you have full flexibility. After confirmation, you can request changes through our support team, subject to vendor policies. We make modifications as smooth as possible.'
    },
    {
      question: 'Do you offer group discounts?',
      answer: 'Yes! Groups of 5+ travelers qualify for special rates. Our Smart Planning Engine automatically applies group discounts when you specify the number of travelers during planning.'
    },
    {
      question: 'What if I need to cancel?',
      answer: 'We offer flexible cancellation: 100% refund up to 7 days before, 50% refund 3-7 days before, and individual vendor policies apply within 3 days of your trip.'
    }
  ];

  const features = [
    {
      title: 'Smart Budget Tracker',
      description: 'Watch your spending in real-time with visual budget meters',
      icon: '💰',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      title: 'Smart Instant Itineraries',
      description: 'Get personalized trip plans in under 60 seconds',
      icon: '⚡',
      color: 'from-blue-400 to-indigo-500'
    },
    {
      title: 'Zero Hidden Fees',
      description: 'All costs displayed upfront with complete transparency',
      icon: '✨',
      color: 'from-green-400 to-teal-500'
    },
    {
      title: 'Verified Partners',
      description: 'Every vendor is personally vetted and rated by travelers',
      icon: '🛡️',
      color: 'from-pink-400 to-rose-500'
    },
    {
      title: 'Live Support 24/7',
      description: 'Human experts ready to help anytime, anywhere',
      icon: '💬',
      color: 'from-purple-400 to-pink-500'
    },
    {
      title: 'One-Click Booking',
      description: 'Submit your entire trip for approval with a single click',
      icon: '🚀',
      color: 'from-cyan-400 to-blue-500'
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans flex flex-col items-center justify-center p-4 z-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.15),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.05),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap');
        .font-heading { font-family: 'Gotham', 'Montserrat', sans-serif; }
        .font-body { font-family: 'Open Sans', 'Inter', sans-serif; }

        .blob-1 { animation: blob 7s infinite; }
        .blob-2 { animation: blob 9s infinite; }
        .blob-3 { animation: blob 11s infinite; }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Modern Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg">
                <span className="text-2xl">✈️</span>
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold gradient-text">SmartTRIP</h1>
                <p className="text-xs text-slate-500 font-body">Smart Travel Planning</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-8 font-body">
              <a href="#features" className="text-slate-300 hover:text-[#BFBD31] font-medium transition-colors">Features</a>
              <a href="#destinations" className="text-slate-300 hover:text-[#BFBD31] font-medium transition-colors">Destinations</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-[#BFBD31] font-medium transition-colors">How It Works</a>
              <a href="#pricing" className="text-slate-300 hover:text-[#BFBD31] font-medium transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-5 py-2.5 text-slate-300 font-semibold hover:text-[#BFBD31] transition-colors font-body"
              >
                Sign In
              </button>
              <button 
                onClick={() => setShowSignupModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all font-body"
              >
                Get Started →
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Completely Different Design */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="blob-1 absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="blob-2 absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="blob-3 absolute bottom-0 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-[#BFBD31] font-body">🔥 10,000+ trips planned this month</span>
              </div>

              <h1 className="text-6xl lg:text-7xl font-heading font-bold leading-tight">
                Travel Smarter,
                <br />
                <span className="gradient-text">Not Harder</span>
              </h1>

              <p className="text-xl text-slate-400 leading-relaxed font-body">
                Smart Planning Engine creates your perfect Sri Lankan adventure in 60 seconds. 
                Budget-friendly, stress-free, and completely personalized.
              </p>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowSignupModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-2xl transition-all text-lg font-body flex items-center gap-2"
                >
                  Start Planning Free
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </button>
                <button className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                  </svg>
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-slate-300 font-body">4.9/5 from 2,400+ reviews</p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <p className="text-2xl font-bold text-slate-100 font-heading">500+</p>
                  <p className="text-sm text-slate-400 font-body">Destinations</p>
                </div>
              </div>
            </div>

            {/* Hero Card */}
            <div className="relative float">
              <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-100 font-heading">Plan Your Trip</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-body">
                    FREE
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <LocationAutocomplete 
                    value={pickupLocation}
                    onChange={setPickupLocation}
                    placeholder="Enter your starting location..."
                    label="🚩 Pickup Location"
                  />

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 font-body">📍 Destination</label>
                    <select className="w-full bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-3 text-slate-100">
                      <option>Kandy</option>
                      <option>Galle</option>
                      <option>Ella</option>
                      <option>Sigiriya</option>
                      <option>Nuwara Eliya</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2 font-body">💰 Budget</label>
                      <input 
                        type="text" 
                        placeholder="LKR 100,000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2 font-body">👥 Travelers</label>
                      <input 
                        type="text" 
                        placeholder="2 Adults"
                        className="w-full bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 font-body">📅 Travel Dates</label>
                    <input 
                      type="text" 
                      placeholder="Mar 15 - Mar 18, 2025"
                      className="w-full bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setShowSignupModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl transition-all font-body text-lg"
                >
                  ✨ Generate Smart Itinerary
                </button>

                {/* Show fetched activities if location/budget is entered */}
                {(pickupLocation || budget) && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-bold text-slate-300 mb-3">
                      Available Activities {loadingActivities && '(loading...)'}
                    </h4>
                    {activities.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {activities.slice(0, 5).map((activity) => {
                          // Construct full image URL
                          let imageUrl = null;
                          if (activity.images && activity.images.length > 0) {
                            const img = activity.images[0];
                            if (img) {
                              // If it's an external URL (http/https), use as-is
                              if (img.startsWith('http')) {
                                imageUrl = img;
                              } else {
                                // If it's a relative path, prepend the API base URL
                                // Use window.location to handle different environments
                                const apiBase = window.location.origin.includes('5173') 
                                  ? 'http://localhost:5001'
                                  : window.location.origin;
                                imageUrl = `${apiBase}${img}`;
                              }
                            }
                          }
                          
                          return (
                            <div key={activity._id} className="overflow-hidden rounded-lg border border-white/10 hover:border-[#BFBD31] transition-all hover:shadow-lg">
                              {/* Image Container */}
                              <div className="relative h-32 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
                                {imageUrl ? (
                                  <img 
                                    src={imageUrl} 
                                    alt={activity.name}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                      console.error('Image load failed:', imageUrl);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                                    <span className="text-3xl">📸</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Content Container */}
                              <div className="bg-slate-800/60 p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-100">{activity.name}</p>
                                    <p className="text-xs text-slate-400">{activity.location || 'Location not specified'}</p>
                                  </div>
                                  <p className="text-sm font-bold text-[#BFBD31] ml-2">LKR {activity.price.toLocaleString()}</p>
                                </div>
                                {activity.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2">{activity.description}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {activities.length > 5 && (
                          <p className="text-xs text-slate-500 text-center py-2">
                            +{activities.length - 5} more activities
                          </p>
                        )}
                      </div>
                    ) : (
                      !loadingActivities && (
                        <p className="text-xs text-slate-400">No activities found for your selection</p>
                      )
                    )}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between text-sm font-body">
                    <span className="text-slate-400">Powered by</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg"></div>
                      <span className="font-bold text-slate-100">AI Planning Engine</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl shadow-xl flex items-center justify-center text-4xl transform rotate-12">
                ✈️
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl shadow-xl flex items-center justify-center text-3xl transform -rotate-12">
                🏖️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Card Style */}
      <section id="features" className="py-20 px-6 lg:px-8 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-heading font-bold mb-4">
              Why Choose <span className="gradient-text">SmartTRIP</span>?
            </h2>
            <p className="text-xl text-slate-400 font-body">Everything you need for the perfect trip</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 font-heading">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-body">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Timeline Style */}
      <section id="how-it-works" className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-heading font-bold mb-4">
              Get Started in <span className="gradient-text">4 Easy Steps</span>
            </h2>
            <p className="text-xl text-slate-400 font-body">From idea to itinerary in minutes</p>
          </div>

          <div className="space-y-12">
            {[
              { 
                num: '01', 
                title: 'Tell Us Your Dream',
                desc: 'Share your destination, budget, dates, and travel style. Takes less than 2 minutes.',
                icon: '💭',
                color: 'from-purple-500 to-pink-500'
              },
              { 
                num: '02', 
                title: 'AI Works Its Magic',
                desc: 'Our intelligent system creates multiple personalized itineraries matching your exact needs.',
                icon: '🤖',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                num: '03', 
                title: 'Customize & Perfect',
                desc: 'Adjust hotels, activities, and services with real-time budget tracking.',
                icon: '✏️',
                color: 'from-green-500 to-teal-500'
              },
              { 
                num: '04', 
                title: 'Book & Relax',
                desc: 'One-click soft booking. Pay only after vendors confirm. Then just enjoy your trip!',
                icon: '🎉',
                color: 'from-orange-500 to-red-500'
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center text-4xl shadow-xl`}>
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1 pt-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-6xl font-black text-slate-300 font-heading">{step.num}</span>
                    <h3 className="text-3xl font-bold text-slate-100 font-heading">{step.title}</h3>
                  </div>
                  <p className="text-lg text-slate-400 leading-relaxed font-body">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button 
              onClick={() => setShowSignupModal(true)}
              className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-2xl transition-all text-xl font-body"
            >
              Start Your Journey Now →
            </button>
          </div>
        </div>
      </section>

      {/* Destinations - Carousel Style */}
      <section id="destinations" className="py-20 px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-heading font-bold mb-4">
              Explore Amazing <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Destinations</span>
            </h2>
            <p className="text-xl text-slate-300 font-body">Handpicked experiences across Sri Lanka</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {destinations.map((dest, index) => (
              <div 
                key={dest.id}
                className="group relative rounded-3xl overflow-hidden cursor-pointer card-hover"
                style={{ background: dest.image }}
                onMouseEnter={() => setActiveDestination(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="relative p-8 h-96 flex flex-col justify-end">
                  <div className="mb-4">
                    <span className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
                      {dest.tagline}
                    </span>
                    <h3 className="text-4xl font-bold mb-3 font-heading">{dest.name}</h3>
                    <p className="text-lg text-slate-300 mb-6 font-body">{dest.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {dest.highlights.map((highlight, idx) => (
                      <span key={idx} className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
                        ✓ {highlight}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold font-heading">LKR {dest.price}</p>
                      <p className="text-sm text-slate-300 font-body">{dest.days} Days Package</p>
                    </div>
                    <button 
                      onClick={() => setShowSignupModal(true)}
                      className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"
                    >
                      Explore →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
              View All 500+ Destinations
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials - Grid Cards */}
      <section className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-heading font-bold mb-4">
              Loved by <span className="gradient-text">10,000+ Travelers</span>
            </h2>
            <p className="text-xl text-slate-400 font-body">Real stories from real adventurers</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 font-body">{testimonial.name}</h4>
                    <p className="text-xs text-slate-400 font-body">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-body">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - Modern Accordion */}
      <section className="py-20 px-6 lg:px-8 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-heading font-bold mb-4">
              Got <span className="gradient-text">Questions</span>?
            </h2>
            <p className="text-xl text-slate-400 font-body">We've got answers</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-950 transition-colors"
                >
                  <span className="font-bold text-slate-100 text-lg font-heading pr-4">{faq.question}</span>
                  <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </button>
                {expandedFaq === index && (
                  <div className="px-8 pb-6">
                    <p className="text-slate-300 leading-relaxed font-body">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-400 mb-4 font-body">Need more help?</p>
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-xl transition-all font-body">
              Contact Support Team
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-heading font-bold text-white mb-6">
            Your Dream Trip Awaits
          </h2>
          <p className="text-2xl text-white/90 mb-12 font-body">
            Join 10,000+ travelers who've discovered smarter travel planning
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <button 
              onClick={() => setShowSignupModal(true)}
              className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"
            >
              Start Planning for Free
            </button>
            <button className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
              Schedule a Demo
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-12 text-white font-body">
            <div className="text-center">
              <p className="text-3xl font-bold font-heading">No Credit Card</p>
              <p className="text-white/80">Required to start</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"></div>
            <div className="text-center">
              <p className="text-3xl font-bold font-heading">100% Free</p>
              <p className="text-white/80">AI planning tool</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"></div>
            <div className="text-center">
              <p className="text-3xl font-bold font-heading">24/7 Support</p>
              <p className="text-white/80">Always here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
                  <span className="text-2xl">✈️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-heading font-bold">SmartTRIP</h1>
                  <p className="text-xs text-slate-400 font-body">AI Travel Planning</p>
                </div>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed font-body">
                Revolutionizing travel planning with AI-powered itineraries that match your budget and dreams.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-lime-500 text-slate-950 transition-colors">
                  <span className="text-lg">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-lime-500 text-slate-950 transition-colors">
                  <span className="text-lg">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-lime-500 text-slate-950 transition-colors">
                  <span className="text-lg">in</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-lime-500 text-slate-950 transition-colors">
                  <span className="text-lg">📷</span>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4 font-heading text-lg">Product</h3>
              <ul className="space-y-3 text-slate-400 font-body">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Destinations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 font-heading text-lg">Company</h3>
              <ul className="space-y-3 text-slate-400 font-body">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 font-heading text-lg">Support</h3>
              <ul className="space-y-3 text-slate-400 font-body">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm font-body">&copy; 2025 SmartTRIP. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-slate-400 font-body">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals remain the same as before */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-100 font-heading">Welcome Back</h2>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="p-2 hover:bg-slate-900 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 font-body">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 font-body">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"
                />
              </div>
              <div className="flex items-center justify-between text-sm font-body">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-[#BFBD31] rounded" />
                  <span className="text-slate-300">Remember me</span>
                </label>
                <a href="#" className="text-[#BFBD31] hover:text-purple-700 font-semibold">
                  Forgot password?
                </a>
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl transition-all font-body">
                Sign In
              </button>
              <p className="text-center text-sm text-slate-400 font-body">
                Don't have an account?{' '}
                <button 
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowSignupModal(true);
                  }}
                  className="text-[#BFBD31] hover:text-purple-700 font-bold"
                >
                  Sign up free
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {showSignupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-100 font-heading">Get Started Free</h2>
              <button 
                onClick={() => setShowSignupModal(false)}
                className="p-2 hover:bg-slate-900 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 font-body">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 font-body">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 font-body">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"
                />
              </div>
              <label className="flex items-start gap-2 text-sm font-body">
                <input type="checkbox" className="w-4 h-4 text-[#BFBD31] rounded mt-0.5" />
                <span className="text-slate-300">
                  I agree to the{' '}
                  <a href="#" className="text-[#BFBD31] hover:text-purple-700 font-bold">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-[#BFBD31] hover:text-purple-700 font-bold">Privacy Policy</a>
                </span>
              </label>
              <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl transition-all font-body">
                Create Account
              </button>
              <p className="text-center text-sm text-slate-400 font-body">
                Already have an account?{' '}
                <button 
                  onClick={() => {
                    setShowSignupModal(false);
                    setShowLoginModal(true);
                  }}
                  className="text-[#BFBD31] hover:text-purple-700 font-bold"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
