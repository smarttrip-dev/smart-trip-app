import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_META = {
  pending:   { label: 'Pending Requests', badge: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed',         badge: 'bg-green-100 text-green-700'  },
  rejected:  { label: 'Rejected',          badge: 'bg-red-100 text-red-700'      },
  completed: { label: 'Completed',         badge: 'bg-blue-100 text-blue-700'    },
  cancelled: { label: 'Cancelled',         badge: 'bg-slate-700 text-slate-300'  },
};
const SERVICE_ICONS = { accommodation: '🏨', transport: '🚗', activity: '🎭', meal: '🍽️', package: '📦' };
function fmt(d)     { return d ? new Date(d).toLocaleString('en-US',{month:'short',day:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}) : '—'; }
function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'Just now'; if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m/60)}h ago`; return `${Math.floor(m/1440)}d ago`;
}

export default function ReservationManager() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState('pending');
  const [viewMode, setViewMode]           = useState('card');
  const [allBookings, setAllBookings]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAcceptModal, setShowAcceptModal]   = useState(null);
  const [showRejectModal, setShowRejectModal]   = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [vendorStatus, setVendorStatus]   = useState(null);
  const [filters, setFilters] = useState({ search: '', serviceType: 'all', dateFrom: '', sortBy: 'newest' });
  const [acceptForm, setAcceptForm] = useState({ notes: '' });
  const [rejectForm, setRejectForm] = useState({ reason: '', notes: '' });

  const getAuth = () => {
    const info = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!info?.token) { navigate('/vendor-login'); return null; }
    return { Authorization: `Bearer ${info.token}` };
  };

  // Check vendor approval on mount
  useEffect(() => {
    const checkVendorStatus = async () => {
      const headers = getAuth();
      if (!headers) return;
      try {
        const { data } = await axios.get('/api/vendors/profile', { headers });
        setVendorStatus(data.status);
        if (data.status !== 'approved') {
          toast.error('Your vendor account must be approved to manage bookings');
        }
      } catch (err) {
        console.error('Failed to fetch vendor status');
      }
    };
    checkVendorStatus();
  }, []);

  const fetchBookings = async () => {
    const headers = getAuth(); if (!headers) return;
    try { setLoading(true);
      const { data } = await axios.get('/api/bookings/vendor', { headers });
      setAllBookings(data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to load bookings'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchBookings(); }, []); // eslint-disable-line

  const tabBookings = useMemo(() => {
    let list = allBookings.filter(b => b.status === activeTab);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(b =>
        b._id.toLowerCase().includes(q) ||
        (b.user?.name||'').toLowerCase().includes(q) ||
        (b.destination||'').toLowerCase().includes(q) ||
        b.items.some(i => (i.inventory?.name||'').toLowerCase().includes(q))
      );
    }
    if (filters.serviceType !== 'all') list = list.filter(b => b.items.some(i => i.inventory?.type === filters.serviceType));
    if (filters.dateFrom) { const from = new Date(filters.dateFrom); list = list.filter(b => new Date(b.createdAt) >= from); }
    return [...list].sort((a,b) =>
      filters.sortBy === 'oldest'      ? new Date(a.createdAt)-new Date(b.createdAt) :
      filters.sortBy === 'price-high'  ? b.totalCost - a.totalCost :
      filters.sortBy === 'price-low'   ? a.totalCost - b.totalCost :
      new Date(b.createdAt)-new Date(a.createdAt)
    );
  }, [allBookings, activeTab, filters]);

  const tabCount = (tab) => allBookings.filter(b => b.status === tab).length;

  const doAction = async (bookingId, action, extra = {}) => {
    const headers = getAuth(); if (!headers) return;
    setActionLoading(bookingId);
    try {
      const { data } = await axios.patch(`/api/bookings/${bookingId}/vendor-action`, { action, ...extra }, { headers });
      setAllBookings(prev => prev.map(b => b._id === data._id ? data : b));
      toast.success(action === 'confirmed' ? 'Booking accepted!' : 'Booking rejected');
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setActionLoading(null); setShowAcceptModal(null); setShowRejectModal(null); setAcceptForm({notes:''}); setRejectForm({reason:'',notes:''}); }
  };

  const handleAccept = () => { if (showAcceptModal) doAction(showAcceptModal._id, 'confirmed', { notes: acceptForm.notes }); };
  const handleReject = () => {
    if (!rejectForm.reason) { toast.error('Please select a rejection reason'); return; }
    if (showRejectModal) doAction(showRejectModal._id, 'rejected', { notes: `${rejectForm.reason}${rejectForm.notes ? ': '+rejectForm.notes : ''}` });
  };

  const exportCSV = () => {
    const rows = [['ID','Customer','Service','Total','Status','Date']];
    tabBookings.forEach(b => { rows.push([b._id, b.user?.name||'—', b.items.map(i=>i.inventory?.name||'').filter(Boolean).join(', ')||b.destination||'—', b.totalCost, b.status, fmtDate(b.createdAt)]); });
    const csv = rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download=`bookings-${activeTab}.csv`; a.click();
  };

  const BookingCard = ({ booking }) => {
    const svcName = booking.items.map(i=>i.inventory?.name||'').filter(Boolean).join(', ') || booking.destination || '—';
    const svcType = booking.items[0]?.inventory?.type || '';
    const busy = actionLoading === booking._id;
    return (
      <div className={`bg-slate-900 border rounded-xl overflow-hidden ${booking.status==='pending'?'border-yellow-500/40':'border-white/10'}`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h3 className="text-base font-bold text-white font-mono">{booking._id.slice(-8).toUpperCase()}</h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_META[booking.status]?.badge}`}>{booking.status.toUpperCase()}</span>
              </div>
              <p className="text-xs text-slate-400">Requested {timeAgo(booking.createdAt)} &middot; {fmt(booking.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-white">LKR {booking.totalCost.toLocaleString()}</p>
              <p className={`text-xs mt-0.5 font-medium ${booking.paymentStatus==='paid'?'text-green-400':'text-slate-400'}`}>{booking.paymentStatus}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Customer</h4>
              <div className="space-y-1 text-slate-300">
                <p><span className="text-slate-500">Name:</span> {booking.user?.name||'—'}</p>
                <p><span className="text-slate-500">Email:</span> {booking.user?.email||'—'}</p>
                <p><span className="text-slate-500">Guests:</span> {booking.pax?.adults||1} adult{(booking.pax?.adults||1)!==1?'s':''}{booking.pax?.children?`, ${booking.pax.children} child${booking.pax.children!==1?'ren':''}`:''}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Service</h4>
              <div className="space-y-1 text-slate-300">
                <p className="flex items-center gap-2"><span className="text-xl">{SERVICE_ICONS[svcType]||'📋'}</span><span className="font-medium capitalize">{svcType||'Trip'}</span></p>
                <p>{svcName}</p>
                {booking.tripDates?.startDate && <p><span className="text-slate-500">From:</span> {fmtDate(booking.tripDates.startDate)}</p>}
                {booking.tripDates?.endDate   && <p><span className="text-slate-500">To:</span>   {fmtDate(booking.tripDates.endDate)}</p>}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Notes</h4>
              {booking.specialRequests
                ? <div className="p-2 bg-[#BFBD31]/10 rounded text-xs text-[#BFBD31]">{booking.specialRequests}</div>
                : <p className="text-slate-500 text-xs">No special requests</p>}
              {booking.vendorNotes && <div className="mt-2 p-2 bg-slate-800 rounded text-xs text-slate-300"><span className="text-slate-500 block mb-0.5">Vendor note:</span>{booking.vendorNotes}</div>}
            </div>
          </div>
          <div className="flex gap-3 mt-5 pt-5 border-t border-white/10">
            {booking.status === 'pending' && <>
              <button disabled={busy} onClick={()=>setShowAcceptModal(booking)} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {busy?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:'✓'} Accept
              </button>
              <button disabled={busy} onClick={()=>setShowRejectModal(booking)} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {busy?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:'✕'} Reject
              </button>
            </>}
            <button onClick={()=>setShowDetailsModal(booking)} className="px-4 py-2.5 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-800 text-sm">Details</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#BFBD31] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-slate-400">Loading bookings…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        select, input, textarea { background: #0f172a; color: #cbd5e1; }
        select option { background: #0f172a; }
      `}</style>

      {/* Header */}
      <div className="bg-slate-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Reservation Manager</h1>
              <p className="text-slate-400 mt-1">
                {allBookings.length} total booking{allBookings.length !== 1 ? 's' : ''} · {tabCount('pending')} pending action
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchBookings} className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Refresh
              </button>
              <button onClick={exportCSV} className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {Object.entries(STATUS_META).map(([id, meta]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`px-5 py-4 font-semibold border-b-2 transition-all whitespace-nowrap text-sm ${activeTab===id?'border-[#BFBD31] text-[#BFBD31]':'border-transparent text-slate-400 hover:text-white'}`}>
                {meta.label}
                {tabCount(id) > 0 && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300 font-bold">{tabCount(id)}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setViewMode('card')} className={`px-4 py-2 rounded-lg font-medium text-sm ${viewMode==='card'?'bg-[#BFBD31] text-slate-950':'bg-slate-800 text-slate-300'}`}>Card View</button>
            <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg font-medium text-sm ${viewMode==='list'?'bg-[#BFBD31] text-slate-950':'bg-slate-800 text-slate-300'}`}>List View</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="Search by ID, name, service…" value={filters.search}
              onChange={e => setFilters(f=>({...f, search:e.target.value}))}
              className="px-4 py-2 border border-white/20 rounded-lg text-sm" />
            <select value={filters.serviceType} onChange={e => setFilters(f=>({...f, serviceType:e.target.value}))} className="px-4 py-2 border border-white/20 rounded-lg text-sm">
              <option value="all">All Service Types</option>
              <option value="accommodation">Accommodation</option>
              <option value="transport">Transport</option>
              <option value="activity">Activity</option>
              <option value="meal">Meal</option>
              <option value="package">Package</option>
            </select>
            <select value={filters.sortBy} onChange={e => setFilters(f=>({...f, sortBy:e.target.value}))} className="px-4 py-2 border border-white/20 rounded-lg text-sm">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>
            <input type="date" value={filters.dateFrom}
              onChange={e => setFilters(f=>({...f, dateFrom:e.target.value}))}
              className="px-4 py-2 border border-white/20 rounded-lg text-sm" />
          </div>
        </div>

        {/* Booking List */}
        {tabBookings.length === 0
          ? (
            <div className="bg-slate-900 border border-white/10 rounded-xl p-16 text-center">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-slate-300 font-semibold text-lg">No {activeTab} bookings</p>
              <p className="text-slate-500 text-sm mt-1">
                {filters.search || filters.serviceType !== 'all' || filters.dateFrom
                  ? 'Try adjusting your filters'
                  : `You have no ${activeTab} reservations yet.`}
              </p>
            </div>
          )
          : viewMode === 'list'
            ? (
              <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800 text-slate-400 text-left">
                    <tr>
                      <th className="px-4 py-3">Booking ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabBookings.map(b => {
                      const name = b.items.map(i=>i.inventory?.name||'').filter(Boolean).join(', ')||b.destination||'—';
                      const busy = actionLoading === b._id;
                      return (
                        <tr key={b._id} className="border-t border-white/10 hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-mono text-xs text-slate-400">{b._id.slice(-8).toUpperCase()}</td>
                          <td className="px-4 py-3 text-slate-200">{b.user?.name||'—'}</td>
                          <td className="px-4 py-3 text-slate-300 max-w-[180px] truncate">{name}</td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{fmtDate(b.createdAt)}</td>
                          <td className="px-4 py-3 text-white font-semibold">LKR {b.totalCost.toLocaleString()}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${STATUS_META[b.status]?.badge}`}>{b.status}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {b.status === 'pending' && <>
                                <button disabled={busy} onClick={()=>setShowAcceptModal(b)} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50">Accept</button>
                                <button disabled={busy} onClick={()=>setShowRejectModal(b)} className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50">Reject</button>
                              </>}
                              <button onClick={()=>setShowDetailsModal(b)} className="px-3 py-1 border border-white/20 text-slate-300 rounded text-xs hover:bg-slate-800">View</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
            : (
              <div className="space-y-4">
                {tabBookings.map(b => <BookingCard key={b._id} booking={b} />)}
              </div>
            )
        }

        {tabBookings.length > 0 && (
          <div className="bg-slate-900 border border-white/10 rounded-xl p-4 mt-6 flex items-center justify-between text-sm text-slate-400">
            <span>Showing {tabBookings.length} booking{tabBookings.length!==1?'s':''}</span>
            <span className="text-white font-semibold">Total: LKR {tabBookings.reduce((s,b)=>s+b.totalCost,0).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <h2 className="text-xl font-bold text-white mb-1">Accept Booking</h2>
            <p className="text-slate-400 text-sm mb-6">
              From <span className="text-white font-medium">{showAcceptModal.user?.name}</span> · LKR {showAcceptModal.totalCost.toLocaleString()}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Confirmation Note (optional)</label>
              <textarea value={acceptForm.notes} onChange={e=>setAcceptForm(f=>({...f,notes:e.target.value}))}
                rows={3} placeholder="Any instructions for the customer…"
                className="w-full px-4 py-2 border border-white/20 rounded-lg text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setShowAcceptModal(null)} className="flex-1 px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-800">Cancel</button>
              <button onClick={handleAccept} disabled={!!actionLoading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                Confirm Acceptance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <h2 className="text-xl font-bold text-white mb-1">Reject Booking</h2>
            <p className="text-slate-400 text-sm mb-6">From <span className="text-white font-medium">{showRejectModal.user?.name}</span></p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Reason <span className="text-red-500">*</span></label>
                <select value={rejectForm.reason} onChange={e=>setRejectForm(f=>({...f,reason:e.target.value}))} className="w-full px-4 py-2 border border-white/20 rounded-lg text-sm">
                  <option value="">Select reason…</option>
                  <option value="No Availability">No Availability</option>
                  <option value="Maintenance">Maintenance / Renovation</option>
                  <option value="Price Discrepancy">Price Discrepancy</option>
                  <option value="Customer Request">Customer Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Additional Notes</label>
                <textarea value={rejectForm.notes} onChange={e=>setRejectForm(f=>({...f,notes:e.target.value}))}
                  rows={3} placeholder="Provide more details…"
                  className="w-full px-4 py-2 border border-white/20 rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setShowRejectModal(null)} className="flex-1 px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-800">Cancel</button>
              <button onClick={handleReject} disabled={!!actionLoading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Booking Details</h2>
              <button onClick={()=>setShowDetailsModal(null)} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Booking ID</p>
                  <p className="text-white font-mono font-semibold">{showDetailsModal._id.slice(-12).toUpperCase()}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Status</p>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${STATUS_META[showDetailsModal.status]?.badge}`}>{showDetailsModal.status.toUpperCase()}</span>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Customer</p>
                  <p className="text-white font-semibold">{showDetailsModal.user?.name||'—'}</p>
                  <p className="text-slate-400 text-xs">{showDetailsModal.user?.email}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Guests</p>
                  <p className="text-white font-semibold">{showDetailsModal.pax?.adults||1} adult{(showDetailsModal.pax?.adults||1)!==1?'s':''}{showDetailsModal.pax?.children?`, ${showDetailsModal.pax.children} child${showDetailsModal.pax.children!==1?'ren':''}`:''}</p>
                </div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-2">Services Booked</p>
                {showDetailsModal.items.length > 0
                  ? showDetailsModal.items.map((item,i)=>(
                    <div key={i} className="flex justify-between items-center py-1 border-b border-white/10 last:border-0">
                      <span className="text-white">{item.inventory?.name||'—'}</span>
                      <span className="text-slate-300">LKR {(item.priceAtBooking||0).toLocaleString()}</span>
                    </div>
                  ))
                  : <p className="text-slate-400">{showDetailsModal.destination||'Itinerary booking'}</p>
                }
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/20">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-white">LKR {showDetailsModal.totalCost.toLocaleString()}</span>
                </div>
              </div>
              {(showDetailsModal.tripDates?.startDate||showDetailsModal.tripDates?.endDate) && (
                <div className="bg-slate-800 rounded-lg p-3 grid grid-cols-2 gap-3">
                  <div><p className="text-slate-500 text-xs mb-1">Start Date</p><p className="text-white">{fmtDate(showDetailsModal.tripDates.startDate)}</p></div>
                  <div><p className="text-slate-500 text-xs mb-1">End Date</p><p className="text-white">{fmtDate(showDetailsModal.tripDates.endDate)}</p></div>
                </div>
              )}
              {showDetailsModal.specialRequests && (
                <div className="bg-[#BFBD31]/10 border border-[#BFBD31]/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Special Requests</p>
                  <p className="text-[#BFBD31]">{showDetailsModal.specialRequests}</p>
                </div>
              )}
              {showDetailsModal.vendorNotes && (
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Vendor Notes</p>
                  <p className="text-slate-200">{showDetailsModal.vendorNotes}</p>
                </div>
              )}
              <p className="text-slate-500 text-xs text-right">Created: {fmt(showDetailsModal.createdAt)}</p>
            </div>
            {showDetailsModal.status === 'pending' && (
              <div className="flex gap-3 mt-6">
                <button onClick={()=>{setShowDetailsModal(null);setShowAcceptModal(showDetailsModal);}} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Accept</button>
                <button onClick={()=>{setShowDetailsModal(null);setShowRejectModal(showDetailsModal);}} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
