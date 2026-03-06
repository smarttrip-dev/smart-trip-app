import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
  confirmed:     'bg-green-500/20 text-green-400',
  completed:     'bg-blue-500/20 text-blue-400',
  pending:       'bg-yellow-500/20 text-yellow-400',
  cancelled:     'bg-red-500/20 text-red-400',
  rejected:      'bg-red-500/20 text-red-400',
  approved:      'bg-green-500/20 text-green-400',
  pending_review:'bg-yellow-500/20 text-yellow-400',
  suspended:     'bg-red-500/20 text-red-400',
  paid:          'bg-green-500/20 text-green-400',
  unpaid:        'bg-yellow-500/20 text-yellow-400',
  refunded:      'bg-blue-500/20 text-blue-400',
};

const Badge = ({ status }) => (
  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${STATUS_COLORS[status] || 'bg-slate-700 text-slate-300'}`}>
    {status?.replace('_', ' ')}
  </span>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [vendorFilter, setVendorFilter] = useState('all');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const [stats, setStats] = useState({
    totalVendors: 0, pendingApprovals: 0, activeVendors: 0, suspendedVendors: 0,
    totalUsers: 0, totalBookings: 0, totalRevenue: 0,
    platformCommission: 0, pendingPayouts: 0, activeLiveChats: 0, pendingTickets: 0,
  });
  const [allVendors, setAllVendors]       = useState([]);
  const [allUsers, setAllUsers]           = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [allBookings, setAllBookings]     = useState([]);
  const [revenueData, setRevenueData]     = useState([]);
  const [destinations, setDestinations]   = useState([]);
  const [showDestModal, setShowDestModal] = useState(false);
  const [editingDest, setEditingDest]     = useState(null);
  const [formData, setFormData]           = useState({ name: '', tag: '', description: '', defaultDays: 3, defaultPrice: 50000, region: '', image: '', attractions: '' });

  const authHeader = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return { Authorization: `Bearer ${userInfo.token}` };
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const headers = authHeader();
      const [notifRes, unreadRes] = await Promise.all([
        axios.get('/api/notifications', { headers }),
        axios.get('/api/notifications/unread-count', { headers }),
      ]);
      setNotifications(notifRes.data || []);
      setUnreadCount(unreadRes.data?.count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      const headers = authHeader();
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, { headers });
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const headers = authHeader();
      const [dashRes, bookingsRes, destRes] = await Promise.all([
        axios.get('/api/dashboard/admin', { headers }),
        axios.get('/api/bookings/all', { headers }),
        axios.get('/api/config/destinations'),
      ]);
      setStats(dashRes.data.stats);
      setRecentBookings(dashRes.data.recentBookings || []);
      setAllVendors(dashRes.data.allVendors || []);
      setAllUsers(dashRes.data.allUsers || []);
      setRevenueData(dashRes.data.monthlyRevenue || []);
      setDestinations(destRes.data || []);
      const mapped = (bookingsRes.data || []).map(b => ({
        id: b._id,
        customer: b.user?.name || 'Unknown',
        email: b.user?.email || '',
        service: b.destination || b.items?.map(i => i.inventory?.name || '').filter(Boolean).join(', ') || '—',
        amount: b.totalCost || 0,
        status: b.status,
        paymentStatus: b.paymentStatus,
        date: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '—',
        pax: b.pax,
        location: b.location,
        duration: b.duration,
        specialRequests: b.specialRequests,
      }));
      setAllBookings(mapped);
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchDashboard();
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const notifInterval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(notifInterval);
  }, [fetchDashboard, fetchNotifications]);

  const updateVendorStatus = async (vendorId, status) => {
    setActionLoading(vendorId + status);
    try {
      await axios.patch(`/api/vendors/${vendorId}/status`, { status }, { headers: authHeader() });
      setAllVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status } : v));
      const statusDelta = {
        approved:      { activeVendors: 1, pendingApprovals: -1 },
        rejected:      { pendingApprovals: -1 },
        suspended:     { activeVendors: -1, suspendedVendors: 1 },
      }[status];
      if (statusDelta) {
        setStats(prev => ({
          ...prev,
          activeVendors:   (prev.activeVendors   || 0) + (statusDelta.activeVendors   || 0),
          pendingApprovals:(prev.pendingApprovals || 0) + (statusDelta.pendingApprovals || 0),
          suspendedVendors:(prev.suspendedVendors || 0) + (statusDelta.suspendedVendors|| 0),
        }));
      }
    } catch (err) {
      console.error('Vendor status update failed:', err);
    } finally {
      setActionLoading(null);
    }
  };



  const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.revenue), 1) : 1;

  const filteredVendors = vendorFilter === 'all'
    ? allVendors
    : allVendors.filter(v => v.status === vendorFilter);

  const filteredBookings = bookingFilter === 'all'
    ? allBookings
    : allBookings.filter(b => b.status === bookingFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#BFBD31] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      `}</style>

      {/* Top Navigation */}
      <nav className="bg-slate-900 border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ST</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-200">SmartTRIP Admin</h1>
                <p className="text-xs text-slate-400">Platform Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs font-semibold text-[#BFBD31]">{unreadCount} unread</span>
                        )}
                      </div>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-slate-400 text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {notifications.slice(0, 5).map((notif) => (
                          <div 
                            key={notif._id}
                            onClick={() => !notif.isRead && markNotificationAsRead(notif._id)}
                            className={`p-4 cursor-pointer transition-colors ${
                              notif.isRead 
                                ? 'bg-transparent hover:bg-slate-800/30' 
                                : 'bg-slate-800/40 hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.isRead ? 'bg-slate-600' : 'bg-[#BFBD31]'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-100 line-clamp-1">{notif.title}</p>
                                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(notif.createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {notifications.length > 5 && (
                          <div className="p-3 text-center border-t border-white/5">
                            <a href="/notifications" className="text-xs font-semibold text-[#BFBD31] hover:text-[#d4cb2a]">
                              View all notifications →
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="w-8 h-8 bg-[#BFBD31] rounded-full flex items-center justify-center">
                <span className="text-slate-950 text-sm font-bold">AD</span>
              </div>
              <button onClick={handleLogout} className="px-3 py-1.5 text-sm text-red-400 border border-red-400/40 rounded-lg hover:bg-red-500/10 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-slate-900 border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'vendors',  label: 'Vendor Management' },
              { id: 'users',    label: 'User Management' },
              { id: 'bookings', label: 'Bookings' },
              { id: 'destinations', label: 'Destinations' },
              { id: 'revenue',  label: 'Revenue & Payouts' },
              { id: 'settings', label: 'System Settings' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'border-[#BFBD31] text-[#BFBD31]' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
                {tab.id === 'vendors' && stats.pendingApprovals > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{stats.pendingApprovals}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* â”€â”€ OVERVIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Vendors', value: stats.totalVendors, sub: `${stats.activeVendors} approved`, badge: stats.pendingApprovals > 0 ? `${stats.pendingApprovals} pending` : null, color: 'text-[#BFBD31]', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                { label: 'Total Users', value: stats.totalUsers.toLocaleString(), sub: 'Registered travellers', color: 'text-blue-400', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { label: 'Total Bookings', value: stats.totalBookings.toLocaleString(), sub: `${stats.pendingTickets} pending`, color: 'text-green-400', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { label: 'Platform Revenue', value: `LKR ${(stats.totalRevenue / 1000000).toFixed(2)}M`, sub: `Commission: LKR ${(stats.platformCommission / 1000).toFixed(0)}K`, color: 'text-orange-400', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              ].map((card, i) => (
                <div key={i} className="bg-slate-900 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                      <svg className={`w-6 h-6 ${card.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon}/>
                      </svg>
                    </div>
                    {card.badge && <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">{card.badge}</span>}
                  </div>
                  <h3 className="text-sm text-slate-400 mb-1">{card.label}</h3>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Platform Revenue & Commission (last 7 months)</h3>
              {revenueData.every(d => d.revenue === 0) ? (
                <p className="text-slate-500 text-sm text-center py-12">No confirmed revenue data yet.</p>
              ) : (
                <div className="h-64 flex items-end justify-around gap-2 pb-4">
                  {revenueData.map((data, index) => {
                    const revenueH    = Math.max((data.revenue / maxRevenue) * 100, data.revenue > 0 ? 4 : 0);
                    const commissionH = Math.max((data.commission / maxRevenue) * 100, data.commission > 0 ? 4 : 0);
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex gap-1 items-end h-52">
                          <div className="flex-1 relative group cursor-pointer">
                            <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:opacity-80" style={{ height: `${revenueH}%` }}>
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                LKR {(data.revenue / 1000).toFixed(0)}K
                              </div>
                            </div>
                          </div>
                          <div className="w-1/3 bg-gradient-to-t from-[#BFBD31]/80 to-[#BFBD31] rounded-t-lg" style={{ height: `${commissionH}%` }} title={`Commission: LKR ${(data.commission / 1000).toFixed(0)}K`} />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{data.month}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-6 mt-4 text-sm text-slate-400">
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded inline-block"/> Revenue</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#BFBD31] rounded inline-block"/> Commission</span>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Bookings</h3>
              {recentBookings.length === 0 ? (
                <p className="text-slate-500 text-sm">No bookings yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-white/10">
                        <th className="text-left pb-3 font-medium">Customer</th>
                        <th className="text-left pb-3 font-medium">Service</th>
                        <th className="text-left pb-3 font-medium">Date</th>
                        <th className="text-right pb-3 font-medium">Amount</th>
                        <th className="text-left pb-3 font-medium pl-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentBookings.slice(0, 8).map(b => (
                        <tr key={b.id} className="hover:bg-slate-800/40">
                          <td className="py-3">
                            <p className="text-white font-medium">{b.customer}</p>
                            <p className="text-slate-500 text-xs">{b.email}</p>
                          </td>
                          <td className="py-3 text-slate-300 max-w-[200px] truncate">{b.service}</td>
                          <td className="py-3 text-slate-400">{b.date}</td>
                          <td className="py-3 text-right font-semibold text-white">LKR {b.amount.toLocaleString()}</td>
                          <td className="py-3 pl-4"><Badge status={b.status}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* â”€â”€ VENDOR MANAGEMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Approved', value: stats.activeVendors, color: 'text-green-400' },
                { label: 'Pending Review', value: stats.pendingApprovals, color: 'text-yellow-400' },
                { label: 'Suspended', value: stats.suspendedVendors, color: 'text-red-400' },
              ].map(c => (
                <div key={c.label} className="bg-slate-900 border border-white/10 rounded-xl p-6">
                  <p className="text-sm text-slate-400 mb-1">{c.label}</p>
                  <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Filter + Table */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h3 className="text-lg font-bold text-white">All Vendors <span className="text-slate-400 text-sm font-normal">({filteredVendors.length})</span></h3>
                <div className="flex gap-2">
                  {['all','pending_review','approved','suspended','rejected'].map(f => (
                    <button key={f} onClick={() => setVendorFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${vendorFilter === f ? 'bg-[#BFBD31] text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                      {f === 'all' ? 'All' : f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {filteredVendors.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-10">No vendors found.</p>
              ) : (
                <div className="space-y-3">
                  {filteredVendors.map(vendor => (
                    <div key={vendor.id} className="border border-white/10 rounded-lg p-4 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h4 className="font-bold text-white text-base">{vendor.businessName}</h4>
                            <Badge status={vendor.status} />
                            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">{vendor.type}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm text-slate-400">
                            <span>📍 {vendor.location}</span>
                            <span>✉️ {vendor.email}</span>
                            <span>📞 {vendor.phone}</span>
                            <span>👤 {vendor.ownerName}</span>
                            <span>🗓 Applied: {vendor.appliedDate}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 flex-wrap">
                          {vendor.status === 'pending_review' && (
                            <>
                              <button
                                disabled={!!actionLoading}
                                onClick={() => updateVendorStatus(vendor.id, 'approved')}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors">
                                {actionLoading === vendor.id + 'approved' ? '...' : 'Approve'}
                              </button>
                              <button
                                disabled={!!actionLoading}
                                onClick={() => updateVendorStatus(vendor.id, 'rejected')}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors">
                                {actionLoading === vendor.id + 'rejected' ? '...' : 'Reject'}
                              </button>
                            </>
                          )}
                          {vendor.status === 'approved' && (
                            <button
                              disabled={!!actionLoading}
                              onClick={() => updateVendorStatus(vendor.id, 'suspended')}
                              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors">
                              {actionLoading === vendor.id + 'suspended' ? '...' : 'Suspend'}
                            </button>
                          )}
                          {(vendor.status === 'suspended' || vendor.status === 'rejected') && (
                            <button
                              disabled={!!actionLoading}
                              onClick={() => updateVendorStatus(vendor.id, 'approved')}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors">
                              {actionLoading === vendor.id + 'approved' ? '...' : 'Reinstate'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* â”€â”€ USER MANAGEMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">All Users & Vendors <span className="text-slate-400 text-sm font-normal">({allUsers.length})</span></h3>
            </div>
            {allUsers.length === 0 ? (
              <p className="text-slate-500 text-sm">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10 text-left">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Bookings</th>
                      <th className="pb-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="py-3 text-white font-medium">{u.name}</td>
                        <td className="py-3 text-slate-400">{u.email}</td>
                        <td className="py-3"><Badge status={u.role}/></td>
                        <td className="py-3 text-slate-300">{u.bookings}</td>
                        <td className="py-3 text-slate-400">{u.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ BOOKINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Status summary */}
            <div className="grid grid-cols-4 gap-4">
              {['all','confirmed','pending','cancelled'].map(f => {
                const count = f === 'all' ? allBookings.length : allBookings.filter(b => b.status === f).length;
                return (
                  <button key={f} onClick={() => setBookingFilter(f)}
                    className={`p-4 rounded-xl border transition-all text-left ${bookingFilter === f ? 'border-[#BFBD31] bg-[#BFBD31]/10' : 'border-white/10 bg-slate-900 hover:bg-slate-800/60'}`}>
                    <p className="text-sm text-slate-400 capitalize">{f === 'all' ? 'All Bookings' : f}</p>
                    <p className="text-2xl font-bold text-white mt-1">{count}</p>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Bookings <span className="text-slate-400 text-sm font-normal capitalize">({bookingFilter === 'all' ? 'all' : bookingFilter}) — {filteredBookings.length} records</span>
              </h3>
              {filteredBookings.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-10">No bookings match this filter.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-white/10 text-left">
                        <th className="pb-3 font-medium">Customer</th>
                        <th className="pb-3 font-medium">Service</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium text-right">Amount</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-slate-800/40">
                          <td className="py-3">
                            <p className="text-white font-medium">{b.customer}</p>
                            <p className="text-slate-500 text-xs">{b.email}</p>
                          </td>
                          <td className="py-3 text-slate-300 max-w-[180px] truncate">{b.service}</td>
                          <td className="py-3 text-slate-400 whitespace-nowrap">{b.date}</td>
                          <td className="py-3 text-right font-semibold text-white whitespace-nowrap">LKR {b.amount.toLocaleString()}</td>
                          <td className="py-3"><Badge status={b.status}/></td>
                          <td className="py-3"><Badge status={b.paymentStatus}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* â”€â”€ REVENUE & PAYOUTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Total Revenue', value: `LKR ${(stats.totalRevenue / 1000000).toFixed(2)}M`, color: 'text-blue-400' },
                { label: 'Platform Commission (10%)', value: `LKR ${(stats.platformCommission / 1000).toFixed(1)}K`, color: 'text-[#BFBD31]' },
                { label: 'Vendor Payouts Pending', value: `LKR ${(stats.pendingPayouts / 1000).toFixed(1)}K`, color: 'text-orange-400' },
              ].map(c => (
                <div key={c.label} className="bg-slate-900 border border-white/10 rounded-xl p-6">
                  <p className="text-sm text-slate-400 mb-2">{c.label}</p>
                  <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Monthly Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10 text-left">
                      <th className="pb-3 font-medium">Month</th>
                      <th className="pb-3 font-medium text-right">Revenue (LKR)</th>
                      <th className="pb-3 font-medium text-right">Commission (LKR)</th>
                      <th className="pb-3 font-medium text-right">Vendor Payout (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {revenueData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="py-3 text-white font-medium">{row.month}</td>
                        <td className="py-3 text-right text-slate-300">{row.revenue.toLocaleString()}</td>
                        <td className="py-3 text-right text-[#BFBD31]">{row.commission.toLocaleString()}</td>
                        <td className="py-3 text-right text-slate-300">{(row.revenue - row.commission).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* ─── DESTINATIONS ────────────────────────────────────────────────────────────── */}
        {activeTab === 'destinations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Destination Management</h2>
              <button
                onClick={() => { setEditingDest(null); setFormData({ name: '', tag: '', description: '', defaultDays: 3, defaultPrice: 50000, region: '', image: '', attractions: '' }); setShowDestModal(true); }}
                className="px-6 py-3 bg-[#BFBD31] text-slate-950 font-bold rounded-lg hover:bg-[#BFBD31]/90"
              >
                + Add Destination
              </button>
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map(dest => (
                <div key={dest._id} className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden hover:border-[#BFBD31]/50 transition-all">
                  {dest.image ? (
                    <img 
                      src={dest.image.startsWith('http') ? dest.image : dest.image} 
                      alt={dest.name} 
                      className="w-full h-40 object-cover" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-40 bg-slate-800 flex items-center justify-center text-3xl">{dest.emoji}</div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">{dest.name}</h3>
                      <span className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300">{dest.tag}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{dest.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400">Duration</p>
                        <p className="text-white font-semibold">{dest.defaultDays} days</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400">Price</p>
                        <p className="text-[#BFBD31] font-semibold">Rs {dest.defaultPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingDest(dest); setFormData(dest); setShowDestModal(true); }}
                        className="flex-1 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete ${dest.name}? This action cannot be undone.`)) {
                            try {
                              await axios.delete(`/api/config/destinations/${dest._id}`, { headers: authHeader() });
                              setDestinations(prev => prev.filter(d => d._id !== dest._id));
                              toast.success(`${dest.name} deleted successfully`);
                            } catch (err) {
                              console.error('Delete error:', err);
                              toast.error(err.response?.data?.message || 'Failed to delete destination');
                            }
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add/Edit Modal */}
            {showDestModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-white mb-4">{editingDest ? 'Edit Destination' : 'Add Destination'}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Destination Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Kandy"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Tag</label>
                      <select
                        value={formData.tag}
                        onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-[#BFBD31] outline-none"
                      >
                        <option value="">Select Tag</option>
                        {['Cultural', 'Coastal', 'Hill Country', 'Heritage', 'Wildlife', 'Nature', 'Beach', 'City', 'Other'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Description</label>
                      <textarea
                        placeholder="Short description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] outline-none h-20 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Default Days</label>
                        <input
                          type="number"
                          value={formData.defaultDays}
                          onChange={(e) => setFormData({ ...formData, defaultDays: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-[#BFBD31] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Default Price (LKR)</label>
                        <input
                          type="number"
                          value={formData.defaultPrice}
                          onChange={(e) => setFormData({ ...formData, defaultPrice: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-[#BFBD31] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Region</label>
                      <input
                        type="text"
                        placeholder="e.g., Kandy District"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Destination Image</label>
                      <div className="space-y-2">
                        {formData.image && (
                          <div className="relative w-full h-32 bg-slate-800 rounded-lg overflow-hidden border border-white/10">
                            <img 
                              src={formData.image.startsWith('http') ? formData.image : formData.image} 
                              alt="Preview" 
                              className="w-full h-full object-cover" 
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image: '' })}
                              className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const formDataUpload = new FormData();
                                formDataUpload.append('image', file);
                                const uploadRes = await axios.post('/api/config/destinations/upload-image', formDataUpload, {
                                  headers: authHeader()
                                });
                                console.log('Upload response:', uploadRes.data);
                                setFormData({ ...formData, image: uploadRes.data.imagePath });
                                toast.success('Image uploaded successfully!');
                              } catch (err) {
                                console.error('Upload error:', err);
                                console.error('Error response:', err.response?.data);
                                toast.error(err.response?.data?.message || 'Failed to upload image');
                              }
                            }
                          }}
                          className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#BFBD31] file:text-slate-950 hover:file:bg-[#BFBD31]/90 focus:border-[#BFBD31] outline-none"
                        />
                        <p className="text-xs text-slate-400">Or paste URL below:</p>
                        <input
                          type="text"
                          placeholder="/images/destinations/kandy.jpg"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] outline-none text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Attractions (comma-separated)</label>
                      <textarea
                        placeholder="e.g., Temple, Lake, Gardens"
                        value={typeof formData.attractions === 'string' ? formData.attractions : (formData.attractions || []).join(', ')}
                        onChange={(e) => setFormData({ ...formData, attractions: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] outline-none h-16 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={async () => {
                        try {
                          const payload = {
                            ...formData,
                            attractions: typeof formData.attractions === 'string' ? formData.attractions.split(',').map(a => a.trim()).filter(Boolean) : formData.attractions
                          };
                          if (editingDest) {
                            await axios.put(`/api/config/destinations/${editingDest._id}`, payload, { headers: authHeader() });
                            setDestinations(prev => prev.map(d => d._id === editingDest._id ? { ...d, ...payload } : d));
                          } else {
                            const res = await axios.post('/api/config/destinations', payload, { headers: authHeader() });
                            setDestinations(prev => [...prev, res.data]);
                          }
                          setShowDestModal(false);
                        } catch (err) {
                          console.error('Save error:', err);
                          alert('Error: ' + err.response?.data?.message || err.message);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-[#BFBD31] text-slate-950 font-bold rounded-lg hover:bg-[#BFBD31]/90"
                    >
                      {editingDest ? 'Update' : 'Create'}
                    </button>
                    <button
                      onClick={() => setShowDestModal(false)}
                      className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* â”€â”€ SYSTEM SETTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white mb-6">Platform Settings</h3>
            {[
              { label: 'Platform Commission Rate', sub: 'Current: 10%', action: 'Edit' },
              { label: 'New Vendor Auto-Approval', sub: 'Require manual approval' },
              { label: 'Maintenance Mode', sub: 'Platform is currently online' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                <div>
                  <p className="font-semibold text-white">{s.label}</p>
                  <p className="text-sm text-slate-400">{s.sub}</p>
                </div>
                {s.action ? (
                  <button className="px-4 py-2 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg hover:bg-[#BFBD31]/10 text-sm">{s.action}</button>
                ) : (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-[#BFBD31]" />
                    <div className="absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition-all peer-checked:translate-x-5" />
                  </label>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
