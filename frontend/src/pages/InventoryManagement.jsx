import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// ── field normalization helpers ─────────────────────────────────────────────
const TYPE_COLORS = {
  accommodation: '#667eea', transport: '#FF9500', activity: '#34C759',
  meal: '#FF3B30', package: '#764ba2', other: '#1E90FF',
};
const PRICE_UNITS = {
  accommodation: 'per night', transport: 'per day',
  activity: 'per person', meal: 'per person', package: 'per package', other: 'per unit',
};
const deriveAvailability = (item) => {
  if (!item.isActive) return 'inactive';
  if (item.availableCount === 0) return 'booked';
  if (item.availableCount <= 2) return 'limited';
  return 'available';
};
const mapItem = (raw) => ({
  id:           raw._id,
  name:         raw.name,
  category:     raw.type ? (raw.type.charAt(0).toUpperCase() + raw.type.slice(1)) : 'Other',
  image:        TYPE_COLORS[raw.type] || '#667eea',
  rating:       0,
  reviewCount:  0,
  price:        raw.price || 0,
  priceUnit:    PRICE_UNITS[raw.type] || 'per unit',
  location:     raw.location || '—',
  availability: deriveAvailability(raw),
  active:       raw.isActive,
  lastUpdated:  raw.updatedAt ? new Date(raw.updatedAt).toISOString().split('T')[0] : '—',
  bookingsToday: 0,
  totalBookings: 0,
  description:  raw.description || '',
  amenities:    raw.amenities || [],
  capacity:     raw.capacity || 0,
  availableCount: raw.availableCount || 0,
});

export default function InventoryManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, compact
  const [selectedServices, setSelectedServices] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    availability: 'all',
    priceMin: '',
    priceMax: '',
    location: '',
    rating: '',
    sortBy: 'name'
  });

  const [services, setServices] = useState([]);

  // ── auth helper ────────────────────────────────────────────────────────────
  const getToken = useCallback(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!userInfo?.token) { navigate('/vendor-login'); return null; }
    return userInfo.token;
  }, [navigate]);

  // ── fetch inventory from DB ────────────────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      setLoading(true); setError(null);
      const { data } = await axios.get('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(data.map(mapItem));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const tabs = [
    { id: 'all',           label: 'All Services' },
    { id: 'accommodation', label: 'Hotels / Accommodation' },
    { id: 'transport',     label: 'Transport / Vehicles' },
    { id: 'activity',      label: 'Activities / Experiences' },
    { id: 'meal',          label: 'Meal Packages' },
    { id: 'package',       label: 'Tour Packages' },
    { id: 'other',         label: 'Other' },
  ];

  const getFilteredServices = () => {
    let filtered = services;
    // TODO: debounce the search
    // Filter by tab
    if (activeTab !== 'all') {
      // activeTab id matches the DB type value directly (accommodation / transport / etc.)
      filtered = filtered.filter(s => s.category.toLowerCase() === activeTab);
    }

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.id.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by availability
    if (filters.availability !== 'all') {
      filtered = filtered.filter(s => s.availability === filters.availability);
    }

    return filtered;
  };

  const filteredServices = getFilteredServices();

  const statistics = {
    total: services.length,
    active: services.filter(s => s.active).length,
    inactive: services.filter(s => !s.active).length,
    bookedToday: services.reduce((sum, s) => sum + s.bookingsToday, 0),
    availableToday: services.filter(s => s.availability === 'available').length
  };

  // ── toggle active — calls PUT /api/inventory/:id ─────────────────────────
  const handleToggleActive = async (serviceId) => {
    const token = getToken();
    if (!token) return;
    const svc = services.find(s => s.id === serviceId);
    if (!svc) return;
    // Optimistic update
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, active: !s.active } : s));
    try {
      await axios.put(`/api/inventory/${serviceId}`,
        { isActive: !svc.active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Service ${!svc.active ? 'activated' : 'deactivated'}`);
    } catch {
      // Revert on failure
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, active: svc.active } : s));
      toast.error('Failed to update service status');
    }
  };

  const handleSelectService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map(s => s.id));
    }
  };

  // ── delete — calls DELETE /api/inventory/:id ──────────────────────────────
  const handleDeleteService = async (serviceId) => {
    const token = getToken();
    if (!token) return;
    try {
      await axios.delete(`/api/inventory/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(prev => prev.filter(s => s.id !== serviceId));
      setShowDeleteConfirm(null);
      toast.success('Service deleted');
    } catch {
      toast.error('Failed to delete service');
      setShowDeleteConfirm(null);
    }
  };

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available': return { bg: 'bg-green-100', text: 'text-green-300', dot: 'bg-green-500' };
      case 'limited': return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' };
      case 'booked': return { bg: 'bg-red-100', text: 'text-red-300', dot: 'bg-red-500' };
      case 'inactive': return { bg: 'bg-slate-800/50', text: 'text-slate-300', dot: 'bg-slate-9500' };
      default: return { bg: 'bg-slate-800/50', text: 'text-slate-300', dot: 'bg-slate-9500' };
    }
  };

  const getAvailabilityLabel = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'limited': return 'Limited Availability';
      case 'booked': return 'Fully Booked';
      case 'inactive': return 'Inactive/Unlisted';
      default: return 'Unknown';
    }
  };

  // ── loading / error guards ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#BFBD31] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading inventory...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button onClick={fetchInventory} className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans flex flex-col items-center justify-center p-4 z-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.15),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.05),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      `}</style>

      {/* Header */}
      <div className="bg-slate-900 border border-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
              <p className="text-slate-400 mt-1">Manage all your service listings and availability</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchInventory}
                className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Sync Availability
              </button>
              <button className="px-6 py-2 gradient-bg text-white rounded-lg font-semibold hover:opacity-90 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add New Service
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-slate-900 border border-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{statistics.total}</p>
              <p className="text-sm text-slate-400 mt-1">Total Services</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{statistics.active}</p>
              <p className="text-sm text-slate-400 mt-1">Active</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-400">{statistics.inactive}</p>
              <p className="text-sm text-slate-400 mt-1">Inactive</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#BFBD31]">{statistics.bookedToday}</p>
              <p className="text-sm text-slate-400 mt-1">Booked Today</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#BFBD31]">{statistics.availableToday}</p>
              <p className="text-sm text-slate-400 mt-1">Available Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border border-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#BFBD31] text-[#BFBD31]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                Upload Bulk Inventory
              </button>
              <button className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                </svg>
                Import from Template
              </button>
              <button className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Export All Inventory
              </button>
            </div>

            {selectedServices.length > 0 && (
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg hover:bg-[#BFBD31]/10">
                  Bulk Edit Pricing ({selectedServices.length})
                </button>
                <button className="px-4 py-2 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg hover:bg-[#d4d235]/10">
                  Bulk Update Availability
                </button>
                <button className="px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-500/10">
                  Bulk Activate/Deactivate
                </button>
                <button className="px-4 py-2 border border-red-300 text-red-400 rounded-lg hover:bg-red-500/10">
                  Bulk Delete
                </button>
                <button className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950">
                  Export Selected CSV
                </button>
              </div>
            )}
          </div>

          {/* View Mode & Filters */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === 'grid' ? 'bg-[#BFBD31] text-slate-950' : 'bg-slate-800/50 text-slate-300'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === 'list' ? 'bg-[#BFBD31] text-slate-950' : 'bg-slate-800/50 text-slate-300'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === 'compact' ? 'bg-[#BFBD31] text-slate-950' : 'bg-slate-800/50 text-slate-300'
                }`}
              >
                Compact View
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 bg-slate-800 border border-white/20 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/40"
            />
            <select
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              className="px-4 py-2 bg-slate-800 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/40"
            >
              <option value="all">All Availability</option>
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="booked">Fully Booked</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2 bg-slate-800 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/40"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
              <option value="date">Sort by Date Added</option>
              <option value="popularity">Sort by Popularity</option>
            </select>
            <div className="flex gap-2">
             
            </div>
          </div>
        </div>

        {/* Select All */}
        {filteredServices.length > 0 && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedServices.length === filteredServices.length}
                onChange={handleSelectAll}
                className="w-5 h-5 text-[#BFBD31] rounded"
              />
              <span className="text-sm font-medium text-slate-300">
                Select All ({filteredServices.length})
              </span>
            </label>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => {
              const availColors = getAvailabilityColor(service.availability);
              
              return (
                <div key={service.id} className="bg-slate-900 border border-white/10 rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:border-white/20 transition-all">
                  <div className="relative h-36 flex flex-col items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${service.image}cc, ${service.image}88)` }}>
                    <span className="text-4xl">
                      {service.category.toLowerCase() === 'accommodation' ? '🏨'
                        : service.category.toLowerCase() === 'transport' ? '🚗'
                        : service.category.toLowerCase() === 'activity'  ? '🎭'
                        : service.category.toLowerCase() === 'meal'      ? '🍽️'
                        : service.category.toLowerCase() === 'package'   ? '📦'
                        : '📋'}
                    </span>
                    <p className="text-white font-semibold text-sm px-4 text-center line-clamp-1 drop-shadow">{service.name}</p>
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleSelectService(service.id)}
                      className="absolute top-3 left-3 w-4 h-4 rounded"
                    />
                    <span className={`absolute top-3 right-3 px-2 py-0.5 ${availColors.bg} ${availColors.text} text-xs font-semibold rounded-full flex items-center gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${availColors.dot}`}></span>
                      {getAvailabilityLabel(service.availability)}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-bold text-white leading-snug">{service.name}</h3>
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs font-medium rounded mt-0.5 inline-block">
                          {service.category}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={service.active}
                          onChange={() => handleToggleActive(service.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#BFBD31]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-900 border border-white/10 after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BFBD31] text-slate-950"></div>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < Math.floor(service.rating) ? 'text-yellow-500' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-slate-400">
                        {service.rating} ({service.reviewCount} reviews)
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-[#BFBD31]">LKR {service.price.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{service.priceUnit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-300">📍 {service.location}</p>
                        <p className="text-xs text-slate-500">Updated: {service.lastUpdated}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <button
                        title="Edit"
                        className="p-2 border border-white/20 rounded-lg hover:bg-slate-950 text-slate-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        title="Duplicate"
                        className="p-2 border border-white/20 rounded-lg hover:bg-slate-950 text-slate-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                      </button>
                      <button
                        title="View Details"
                        className="p-2 border border-white/20 rounded-lg hover:bg-slate-950 text-slate-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setShowDeleteConfirm(service)}
                        className="p-2 border border-red-300 rounded-lg hover:bg-red-500/10 text-red-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-3 py-2 text-xs border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg hover:bg-[#BFBD31]/10 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        Availability
                      </button>
                      <button className="px-3 py-2 text-xs border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg hover:bg-[#d4d235]/10 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Pricing
                      </button>
                      <button className="px-3 py-2 text-xs border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        Bookings
                      </button>
                      <button className="px-3 py-2 text-xs border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        Analytics
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-950">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedServices.length === filteredServices.length}
                      onChange={handleSelectAll}
                      className="w-5 h-5 text-[#BFBD31] rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Rating</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Availability</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredServices.map(service => {
                  const availColors = getAvailabilityColor(service.availability);
                  
                  return (
                    <tr key={service.id} className="hover:bg-slate-950">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => handleSelectService(service.id)}
                          className="w-5 h-5 text-[#BFBD31] rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded" style={{ background: service.image }}></div>
                          <div>
                            <p className="font-semibold text-white">{service.name}</p>
                            <p className="text-xs text-slate-500">{service.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{service.location}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-semibold text-white">{service.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">LKR {service.price.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{service.priceUnit}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 ${availColors.bg} ${availColors.text} text-xs font-semibold rounded-full flex items-center gap-2 w-fit`}>
                          <span className={`w-2 h-2 rounded-full ${availColors.dot}`}></span>
                          {getAvailabilityLabel(service.availability).split(' ')[0]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={service.active}
                            onChange={() => handleToggleActive(service.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#BFBD31] text-slate-950 peer-focus:ring-4 peer-focus:ring-[#BFBD31]/30"></div>
                          <div className="absolute left-[2px] top-[2px] bg-slate-900 border border-white/10 w-5 h-5 rounded-full transition-all peer-checked:translate-x-5"></div>
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button title="Edit" className="text-[#BFBD31] hover:text-purple-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button title="View" className="text-[#BFBD31] hover:text-blue-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(service)}
                            title="Delete"
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Compact View */}
        {viewMode === 'compact' && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md divide-y divide-gray-200">
            {filteredServices.map(service => {
              const availColors = getAvailabilityColor(service.availability);
              
              return (
                <div key={service.id} className="p-4 hover:bg-slate-950 flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => handleSelectService(service.id)}
                    className="w-5 h-5 text-[#BFBD31] rounded"
                  />
                  <div className="w-16 h-16 rounded-lg" style={{ background: service.image }}></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{service.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs font-medium rounded">
                        {service.category}
                      </span>
                      <span className="text-sm text-slate-400">📍 {service.location}</span>
                      <span className="text-sm text-slate-400">★ {service.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#BFBD31]">LKR {service.price.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{service.priceUnit}</p>
                  </div>
                  <span className={`px-3 py-1 ${availColors.bg} ${availColors.text} text-xs font-semibold rounded-full flex items-center gap-2`}>
                    <span className={`w-2 h-2 rounded-full ${availColors.dot}`}></span>
                    {getAvailabilityLabel(service.availability).split(' ')[0]}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={service.active}
                      onChange={() => handleToggleActive(service.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#BFBD31] text-slate-950"></div>
                    <div className="absolute left-[2px] top-[2px] bg-slate-900 border border-white/10 w-5 h-5 rounded-full transition-all peer-checked:translate-x-5"></div>
                  </label>
                  <div className="flex gap-2">
                    <button className="text-[#BFBD31] hover:text-purple-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(service)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Delete Service?</h2>
            <p className="text-slate-400 text-center mb-6">
              Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteService(showDeleteConfirm.id)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}