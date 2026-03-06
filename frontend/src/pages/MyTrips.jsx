import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';

export default function MyTrips() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [cancelConfirm, setCancelConfirm] = useState({ show: false, tripId: null, tripName: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentTrip, setSelectedPaymentTrip] = useState(null);

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchTrips = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!userInfo?.token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      console.log('📥 Fetching bookings for user...');
      const { data } = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      console.log(`✅ Received ${data.length} bookings:`, data);
      
      // Normalize Booking fields into the shape the template expects
      const mappedTrips = data.map(b => ({
        id: b._id,
        destination: b.destination || 'My Trip',
        location: b.location || '—',
        status: b.status,
        totalCost: b.totalCost || 0,
        duration: b.duration || '—',
        dates: {
          from: b.tripDates?.startDate || '—',
          to: b.tripDates?.endDate || '—',
        },
        travelers: {
          adults: b.pax?.adults || 1,
          children: b.pax?.children || 0,
        },
        image: null,
        vendor: '—',
        bookingDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—',
        reviewStatus: 'none',
        paymentStatus: b.paymentStatus,
        specialRequests: b.specialRequests || '',
      }));
      
      console.log('📊 Mapped trips:', mappedTrips);
      setTrips(mappedTrips);
    } catch (err) {
      console.error('❌ Error fetching trips:', err);
      setError(err.response?.data?.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [navigate, refreshTrigger]);

  const tabs = [
    { id: 'upcoming', label: 'Upcoming Trips', count: trips.filter(t => t.status === 'confirmed' || t.status === 'pending').length },
    { id: 'pending', label: 'Pending Approval', count: trips.filter(t => t.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: trips.filter(t => t.status === 'confirmed').length },
    { id: 'completed', label: 'Completed', count: trips.filter(t => t.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: trips.filter(t => t.status === 'cancelled').length }
  ];

  console.log('📑 Tab counts:', {
    upcoming: trips.filter(t => t.status === 'confirmed' || t.status === 'pending').length,
    pending: trips.filter(t => t.status === 'pending').length,
    confirmed: trips.filter(t => t.status === 'confirmed').length,
    completed: trips.filter(t => t.status === 'completed').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length,
    total: trips.length
  });

  const statusConfig = {
    pending: { color: 'yellow', label: 'Pending Approval', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    confirmed: { color: 'green', label: 'Confirmed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    completed: { color: 'blue', label: 'Completed', icon: 'M5 13l4 4L19 7' },
    cancelled: { color: 'red', label: 'Cancelled', icon: 'M6 18L18 6M6 6l12 12' }
  };

  const filterTrips = () => {
    let filtered = trips;

    // Filter by active tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(t => t.status === 'confirmed' || t.status === 'pending');
    } else if (activeTab !== 'all') {
      filtered = filtered.filter(t => t.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    // Filter by date range
    if (dateFilter.from) {
      filtered = filtered.filter(t => new Date(t.dates?.from) >= new Date(dateFilter.from));
    }
    if (dateFilter.to) {
      filtered = filtered.filter(t => new Date(t.dates?.to) <= new Date(dateFilter.to));
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.bookingDate) - new Date(a.bookingDate);
        case 'oldest':
          return new Date(a.bookingDate) - new Date(b.bookingDate);
        case 'price-high':
          return b.totalCost - a.totalCost;
        case 'price-low':
          return a.totalCost - b.totalCost;
        case 'date':
          return new Date(a.dates.from) - new Date(b.dates.from);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredTrips = filterTrips();

  const toggleTripSelection = (tripId) => {
    if (selectedTrips.includes(tripId)) {
      setSelectedTrips(selectedTrips.filter(id => id !== tripId));
    } else {
      setSelectedTrips([...selectedTrips, tripId]);
    }
  };

  const selectAllTrips = () => {
    if (selectedTrips.length === filteredTrips.length) {
      setSelectedTrips([]);
    } else {
      setSelectedTrips(filteredTrips.map(t => t.id));
    }
  };

  const handleBulkExport = () => {
    toast.success(`Exporting ${selectedTrips.length} trip(s) as PDF...`);
  };

  const handleBulkPrint = () => {
    toast.success(`Preparing ${selectedTrips.length} trip(s) for print...`);
    setTimeout(() => window.print(), 500);
  };

  const handleCancelTrip = async () => {
    const { tripId } = cancelConfirm;
    setCancelConfirm({ show: false, tripId: null, tripName: '' });
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      await axios.patch(`/api/bookings/${tripId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'cancelled' } : t));
      toast.success('Booking cancelled successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel trip');
    }
  };

  const getTripActions = (trip) => {
    const actions = [
      { id: 'details', label: 'View Full Details', icon: 'eye', color: 'purple' },
      { id: 'pdf', label: 'Download PDF', icon: 'download', color: 'gray' },
      { id: 'share', label: 'Share Trip', icon: 'share', color: 'gray' }
    ];

    if (trip.status === 'pending') {
      actions.push(
        { id: 'track', label: 'Track Status', icon: 'clock', color: 'blue' },
        { id: 'modify', label: 'Modify Trip', icon: 'edit', color: 'orange' }
      );
    }

    if (trip.status === 'confirmed') {
      if (trip.paymentStatus !== 'paid') {
        actions.push(
          { id: 'pay', label: '💳 Pay Now', icon: 'credit-card', color: 'green' }
        );
      }
      actions.push(
        { id: 'contact', label: 'Contact Vendor', icon: 'message', color: 'green' }
      );
    }

    if (trip.status === 'completed' && trip.reviewStatus === 'pending') {
      actions.push(
        { id: 'review', label: 'Leave Review', icon: 'star', color: 'yellow' }
      );
    }

    if (trip.status === 'completed') {
      actions.push(
        { id: 'book-again', label: 'Book Again', icon: 'refresh', color: 'purple' }
      );
    }

    if (trip.status === 'pending' || trip.status === 'confirmed') {
      actions.push(
        { id: 'cancel', label: 'Cancel Booking', icon: 'x', color: 'red' }
      );
    }

    return actions;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .trip-card { transition: transform 0.2s, box-shadow 0.2s; }
        .trip-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
      `}</style>

      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#BFBD31] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Loading your trips...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-xl hover:bg-[#d4d235] transition">Retry</button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>

      {/* Top Navigation */}
      <nav className="bg-slate-900 border border-white/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <svg className="h-5 w-5 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-slate-200">My Trips</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/plan-trip')}
                className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-xl font-medium hover:bg-[#d4d235] transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                Plan New Trip
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-slate-400 hover:bg-slate-800/50 rounded-xl transition"
                title="Profile"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-sm p-2 mb-6 flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#BFBD31] text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by destination, location, or booking ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/40 outline-none transition"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/40 outline-none transition"
              >
                <option value="all" className="bg-slate-900">All Statuses</option>
                <option value="pending" className="bg-slate-900">Pending</option>
                <option value="confirmed" className="bg-slate-900">Confirmed</option>
                <option value="completed" className="bg-slate-900">Completed</option>
                <option value="cancelled" className="bg-slate-900">Cancelled</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/40 outline-none transition"
              >
                <option value="newest" className="bg-slate-900">Newest First</option>
                <option value="oldest" className="bg-slate-900">Oldest First</option>
                <option value="price-high" className="bg-slate-900">Price: High to Low</option>
                <option value="price-low" className="bg-slate-900">Price: Low to High</option>
                <option value="date" className="bg-slate-900">By Trip Date</option>
              </select>
              <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-[#BFBD31]/10 hover:border-[#BFBD31]/40 hover:text-[#BFBD31] transition-all"
                title="Refresh trips"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Travel Date From</label>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/40 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Travel Date To</label>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/40 outline-none transition"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTrips.length === filteredTrips.length && filteredTrips.length > 0}
                  onChange={selectAllTrips}
                  className="w-5 h-5 text-[#BFBD31] rounded"
                />
                <span className="text-sm font-medium text-slate-300">
                  Select All ({filteredTrips.length})
                </span>
              </label>
              {selectedTrips.length > 0 && (
                <span className="text-sm text-[#BFBD31] font-medium">
                  {selectedTrips.length} selected
                </span>
              )}
            </div>
            {selectedTrips.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkExport}
                  className="px-4 py-2 text-sm font-medium text-slate-300 border border-white/20 rounded-xl hover:bg-white/5 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Export Selected
                </button>
                <button
                  onClick={handleBulkPrint}
                  className="px-4 py-2 text-sm font-medium text-slate-300 border border-white/20 rounded-xl hover:bg-white/5 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  Print Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trip Cards Grid */}
        {filteredTrips.length === 0 ? (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <h3 className="text-xl font-bold text-slate-200 mb-2">No trips found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your filters or start planning a new adventure!</p>
            <button onClick={() => navigate('/plan-trip')} className="px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-xl font-semibold hover:bg-[#d4d235] transition">
              Plan New Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTrips.map(trip => {
              const status = statusConfig[trip.status];
              const actions = getTripActions(trip);
              const isSelected = selectedTrips.includes(trip.id);

              return (
                <div
                  key={trip.id}
                  className={`trip-card bg-slate-900 border border-white/10 rounded-xl shadow-md overflow-hidden ${
                    isSelected ? 'ring-2 ring-[#BFBD31]' : ''
                  }`}
                >
                  {/* Trip Header */}
                  <div className="relative h-40 overflow-hidden">
                    {trip.image ? (
                      <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <span className="text-5xl font-bold text-white/20">{trip.destination?.[0] || '?'}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/90 backdrop-blur-sm border border-white/10 text-${status.color}-400`}>
                          {status.label}
                        </span>
                        {trip.paymentStatus === 'paid' && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/90 backdrop-blur-sm border border-green-400 text-green-100 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.218c0 1.262.891 2.348 2.118 2.472V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-.652c1.227-.124 2.118-1.21 2.118-2.472V6.517c0-1.413.894-2.612 2.134-3.062zM12 16a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                            </svg>
                            Paid
                          </span>
                        )}
                        {trip.paymentStatus === 'unpaid' && trip.status === 'confirmed' && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/90 backdrop-blur-sm border border-orange-400 text-orange-100 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.485 2.495c.673-1.346 2.357-1.346 3.03 0l6.28 12.495c.668 1.34-.36 2.801-1.604 2.801H3.81c-1.216 0-2.141-1.41-1.604-2.801L8.485 2.495zM9 13a1 1 0 102 0 1 1 0 00-2 0z"/>
                            </svg>
                            Payment Due
                          </span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTripSelection(trip.id)}
                        className="w-5 h-5 text-[#BFBD31] rounded bg-slate-900 border border-white/10"
                      />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                        {trip.destination}
                      </h3>
                      <p className="text-white/90 text-sm drop-shadow-lg">{trip.location}</p>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Travel Dates</p>
                        <p className="text-sm font-semibold text-slate-200">
                          {trip.dates.from} - {trip.dates.to}
                        </p>
                        <p className="text-xs text-slate-400">{trip.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Travelers</p>
                        <p className="text-sm font-semibold text-slate-200">
                          {trip.travelers.adults} Adult{trip.travelers.adults > 1 ? 's' : ''}
                          {trip.travelers.children > 0 && `, ${trip.travelers.children} Child${trip.travelers.children > 1 ? 'ren' : ''}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Booking ID</p>
                        <p className="text-sm font-semibold text-slate-200">{trip.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Total Cost</p>
                        <p className="text-sm font-semibold text-[#BFBD31]">
                          LKR {trip.totalCost.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-slate-950 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        <span>Primary Vendor: <span className="font-medium text-slate-200">{trip.vendor}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span>Booked on: {trip.bookingDate}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs mt-2 px-2 py-1.5 rounded-md ${
                        trip.paymentStatus === 'paid' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-orange-500/20 text-orange-300'
                      }`}>
                        {trip.paymentStatus === 'paid' ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.218c0 1.262.891 2.348 2.118 2.472V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-.652c1.227-.124 2.118-1.21 2.118-2.472V6.517c0-1.413.894-2.612 2.134-3.062zM12 16a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                            </svg>
                            <span className="font-semibold">Payment Completed ✓</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span className="font-semibold">Payment Pending</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons - All Visible */}
                    <div className="grid grid-cols-2 gap-2">
                      {actions.map(action => (
                        <button
                          key={action.id}
                          onClick={async () => {
                            if (action.id === 'cancel') {
                              setCancelConfirm({ show: true, tripId: trip.id, tripName: trip.destination });
                            } else if (action.id === 'details') {
                              navigate(`/trip/${trip.id}`);
                            } else if (action.id === 'modify') {
                              navigate('/itinerary', {
                                state: {
                                  existingTripId: trip.id,
                                  destination: trip.destination,
                                  location: trip.location,
                                  duration: trip.duration,
                                  budget: trip.totalCost,
                                  travelers: trip.pax,
                                  dates: { from: trip.startDate, to: trip.endDate },
                                },
                              });
                            } else if (action.id === 'pay') {
                              setSelectedPaymentTrip(trip);
                              setShowPaymentModal(true);
                            } else if (action.id === 'book-again') {
                              navigate('/plan-trip');
                            } else if (action.id === 'review') {
                              navigate(`/reviews?trip=${trip.id}`);
                            } else if (action.id === 'contact') {
                              navigate(`/help?trip=${trip.id}`);
                            } else if (action.id === 'track') {
                              toast(`Tracking status for booking ${trip.id}`, { icon: '🔍' });
                            } else if (action.id === 'share') {
                              if (navigator.share) {
                                navigator.share({ title: trip.destination, text: `Check out my trip to ${trip.destination}!` });
                              } else {
                                navigator.clipboard.writeText(window.location.origin + `/trip/${trip.id}`);
                                toast.success('Trip link copied to clipboard!');
                              }
                            } else if (action.id === 'pdf') {
                              toast.success(`Downloading PDF for ${trip.id}...`);
                            }
                          }}
                          className={`px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                            action.color === 'purple'
                              ? 'bg-[#BFBD31] text-slate-950 hover:bg-[#d4d235]'
                              : action.color === 'red'
                              ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10'
                              : action.color === 'yellow'
                              ? 'border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10'
                              : action.color === 'blue'
                              ? 'border border-[#BFBD31]/40 text-[#BFBD31] hover:bg-[#BFBD31]/10'
                              : action.color === 'green'
                              ? 'border border-green-500/40 text-green-400 hover:bg-green-500/10'
                              : action.color === 'orange'
                              ? 'border border-orange-500/40 text-orange-400 hover:bg-orange-500/10'
                              : 'border border-white/10 text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredTrips.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button className="px-4 py-2 border border-white/20 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition">
              Previous
            </button>
            <button className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-xl text-sm font-medium">
              1
            </button>
            <button className="px-4 py-2 border border-white/20 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition">
              2
            </button>
            <button className="px-4 py-2 border border-white/20 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition">
              3
            </button>
            <button className="px-4 py-2 border border-white/20 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition">
              Next
            </button>
          </div>
        )}
      </div>
        </>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirm.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-100 text-center mb-2">Cancel Booking</h3>
            <p className="text-slate-400 text-center mb-2">Are you sure you want to cancel your trip to</p>
            <p className="text-[#BFBD31] font-semibold text-center text-lg mb-4">{cancelConfirm.tripName}</p>
            <p className="text-slate-500 text-xs text-center mb-6">This action cannot be undone. Refund eligibility depends on the vendor's cancellation policy.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirm({ show: false, tripId: null, tripName: '' })}
                className="flex-1 py-3 border border-white/10 text-slate-300 rounded-xl font-semibold hover:bg-white/5 transition"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelTrip}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedPaymentTrip && (
        <PaymentModal
          trip={selectedPaymentTrip}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setTrips(prev => prev.map(t => t.id === selectedPaymentTrip.id ? { ...t, paymentStatus: 'paid' } : t));
            setRefreshTrigger(prev => prev + 1); // Refresh trips list after payment
          }}
        />
      )}
    </div>
  );
}