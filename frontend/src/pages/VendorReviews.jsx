import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// ── helpers ──────────────────────────────────────────────────────────────────
function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  if (m < 43200) return `${Math.floor(m / 1440)}d ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—';
}
function Stars({ rating, size = 'md' }) {
  const sz = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base';
  return (
    <span className={sz}>
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-slate-600'}>★</span>
      ))}
    </span>
  );
}

const STAR_COLORS = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

// ── main component ────────────────────────────────────────────────────────────
export default function VendorReviews() {
  const navigate = useNavigate();

  const [data, setData]               = useState(null);   // { stats, reviews }
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('all');  // all | pending | 5star | 4star | low
  const [sortBy, setSortBy]           = useState('newest');
  const [searchQ, setSearchQ]         = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');

  // per-review reply state
  const [replyOpen, setReplyOpen]     = useState(null);   // review._id
  const [replyText, setReplyText]     = useState('');
  const [saving, setSaving]           = useState(null);

  const getAuth = () => {
    const info = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!info?.token) { navigate('/vendor-login'); return null; }
    return { Authorization: `Bearer ${info.token}` };
  };

  const fetchReviews = async () => {
    const headers = getAuth(); if (!headers) return;
    setLoading(true);
    try {
      const { data: d } = await axios.get('/api/reviews/vendor', { headers });
      setData(d);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []); // eslint-disable-line

  // ── submit reply ──────────────────────────────────────────────────────────
  const submitReply = async (reviewId) => {
    if (!replyText.trim()) { toast.error('Reply cannot be empty'); return; }
    const headers = getAuth(); if (!headers) return;
    setSaving(reviewId);
    try {
      const { data: updated } = await axios.post(`/api/reviews/${reviewId}/reply`, { text: replyText }, { headers });
      setData(prev => ({
        ...prev,
        reviews: prev.reviews.map(r => r._id === updated._id ? updated : r),
      }));
      toast.success('Reply posted!');
      setReplyOpen(null);
      setReplyText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setSaving(null);
    }
  };

  const deleteReply = async (reviewId) => {
    const headers = getAuth(); if (!headers) return;
    setSaving(reviewId);
    try {
      await axios.delete(`/api/reviews/${reviewId}/reply`, { headers });
      setData(prev => ({
        ...prev,
        reviews: prev.reviews.map(r => r._id === reviewId
          ? { ...r, vendorReply: { text: '', repliedAt: null } }
          : r
        ),
      }));
      toast.success('Reply removed');
    } catch (err) {
      toast.error('Failed to remove reply');
    } finally {
      setSaving(null);
    }
  };

  // ── filtering & sorting ───────────────────────────────────────────────────
  const reviews = useMemo(() => {
    if (!data?.reviews) return [];
    let list = [...data.reviews];

    // Tab filter
    if (activeTab === 'pending') list = list.filter(r => !r.vendorReply?.text);
    else if (activeTab === '5star') list = list.filter(r => r.rating === 5);
    else if (activeTab === '4star') list = list.filter(r => r.rating === 4);
    else if (activeTab === 'low')   list = list.filter(r => r.rating <= 2);

    // Service filter
    if (serviceFilter !== 'all') list = list.filter(r => r.inventoryItem?._id === serviceFilter);

    // Search
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(r =>
        (r.customer?.name || '').toLowerCase().includes(q) ||
        (r.title || '').toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q) ||
        (r.inventoryItem?.name || '').toLowerCase().includes(q)
      );
    }

    // Sort
    return list.sort((a, b) =>
      sortBy === 'oldest'    ? new Date(a.createdAt) - new Date(b.createdAt) :
      sortBy === 'highest'   ? b.rating - a.rating :
      sortBy === 'lowest'    ? a.rating - b.rating :
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [data, activeTab, serviceFilter, searchQ, sortBy]);

  const uniqueServices = useMemo(() => {
    if (!data?.reviews) return [];
    const map = {};
    data.reviews.forEach(r => {
      if (r.inventoryItem) {
        map[r.inventoryItem._id] = r.inventoryItem.name;
      }
    });
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [data]);

  // ── loading state ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#BFBD31] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400">Loading reviews…</p>
      </div>
    </div>
  );

  const { stats } = data || {};
  const tabCount = (tab) => {
    if (!data?.reviews) return 0;
    if (tab === 'all')     return data.reviews.length;
    if (tab === 'pending') return data.reviews.filter(r => !r.vendorReply?.text).length;
    if (tab === '5star')   return data.reviews.filter(r => r.rating === 5).length;
    if (tab === '4star')   return data.reviews.filter(r => r.rating === 4).length;
    if (tab === 'low')     return data.reviews.filter(r => r.rating <= 2).length;
    return 0;
  };

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
              <h1 className="text-2xl font-bold text-white">Reviews & Ratings</h1>
              <p className="text-slate-400 mt-1">
                {stats?.total ?? 0} review{stats?.total !== 1 ? 's' : ''} · {stats?.pendingReplies ?? 0} awaiting your reply
              </p>
            </div>
            <button onClick={fetchReviews} className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Summary Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5 flex flex-col items-center text-center">
            <p className="text-5xl font-bold text-[#BFBD31]">{stats?.avgRating?.toFixed(1) ?? '—'}</p>
            <Stars rating={stats?.avgRating ?? 0} size="lg" />
            <p className="text-xs text-slate-500 mt-1">Average Rating</p>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5 text-center">
            <p className="text-4xl font-bold text-white">{stats?.total ?? 0}</p>
            <p className="text-sm text-slate-400 mt-1">Total Reviews</p>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5 text-center">
            <p className="text-4xl font-bold text-orange-400">{stats?.pendingReplies ?? 0}</p>
            <p className="text-sm text-slate-400 mt-1">Need Reply</p>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5 text-center">
            <p className="text-4xl font-bold text-green-400">
              {stats?.total > 0 ? Math.round((stats.recommendations / stats.total) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-400 mt-1">Recommend Rate</p>
          </div>
        </div>

        {/* ── Rating Distribution + Per-service ──────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Rating Distribution */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-5">Rating Distribution</h3>
            {stats?.total === 0
              ? <p className="text-slate-500 text-sm">No reviews yet</p>
              : <div className="space-y-3">
                  {[5,4,3,2,1].map(star => {
                    const item = stats?.distribution?.find(d => d.star === star) ?? { count: 0, pct: 0 };
                    return (
                      <div key={star} className="flex items-center gap-3 text-sm">
                        <span className="text-slate-300 w-8 shrink-0">{star} ★</span>
                        <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                          <div className={`h-3 rounded-full transition-all ${STAR_COLORS[star]}`} style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="text-slate-400 w-14 text-right shrink-0">{item.count} ({item.pct}%)</span>
                      </div>
                    );
                  })}
                </div>
            }
          </div>

          {/* Per-service stats */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-5">By Service</h3>
            {!stats?.serviceStats?.length
              ? <p className="text-slate-500 text-sm">No service data yet</p>
              : <div className="space-y-3">
                  {stats.serviceStats.slice(0, 6).map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 font-medium truncate">{s.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{s.type} · {s.total} review{s.total !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <Stars rating={s.avg} size="sm" />
                        <span className="text-sm font-bold text-[#BFBD31]">{s.avg}</span>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

        {/* ── Tabs + Filters ──────────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-0 overflow-x-auto border-b border-white/10">
            {[
              { id: 'all',     label: 'All Reviews' },
              { id: 'pending', label: 'Needs Reply' },
              { id: '5star',   label: '⭐⭐⭐⭐⭐ 5 Star' },
              { id: '4star',   label: '★★★★ 4 Star' },
              { id: 'low',     label: '⚠️ 1-2 Star' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 font-semibold border-b-2 transition-all whitespace-nowrap text-sm ${
                  activeTab === tab.id ? 'border-[#BFBD31] text-[#BFBD31]' : 'border-transparent text-slate-400 hover:text-white'
                }`}>
                {tab.label}
                {tabCount(tab.id) > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300">{tabCount(tab.id)}</span>
                )}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="p-4 flex flex-wrap items-center gap-3 border-b border-white/10">
            <input type="text" placeholder="Search reviews, customers…" value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-white/20 rounded-lg text-sm" />
            <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="px-3 py-2 border border-white/20 rounded-lg text-sm">
              <option value="all">All Services</option>
              {uniqueServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 border border-white/20 rounded-lg text-sm">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
            <span className="text-slate-500 text-sm">{reviews.length} result{reviews.length !== 1 ? 's' : ''}</span>
          </div>

          {/* ── Review list ─────────────────────────────────────────────────── */}
          <div className="divide-y divide-white/10">
            {reviews.length === 0
              ? (
                <div className="p-16 text-center">
                  <p className="text-4xl mb-3">⭐</p>
                  <p className="text-slate-300 font-semibold text-lg">
                    {data?.reviews?.length === 0 ? 'No reviews yet' : 'No reviews matching your filters'}
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    {data?.reviews?.length === 0
                      ? 'Reviews left by customers for your services will appear here.'
                      : 'Try adjusting your search or filter.'}
                  </p>
                </div>
              )
              : reviews.map(review => (
                <div key={review._id} className="p-6 hover:bg-slate-800/20 transition-colors">
                  {/* Top row */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#BFBD31]/20 border border-[#BFBD31]/40 flex items-center justify-center text-[#BFBD31] font-bold text-sm shrink-0">
                      {(review.customer?.name || '?').charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="font-semibold text-white">{review.customer?.name || 'Anonymous'}</span>
                          {review.recommend && <span className="ml-2 text-xs text-green-400">✓ Recommends</span>}
                        </div>
                        <div className="text-right shrink-0">
                          <Stars rating={review.rating} />
                          <p className="text-xs text-slate-500 mt-0.5">{timeAgo(review.createdAt)}</p>
                        </div>
                      </div>

                      {/* Service tag */}
                      {review.inventoryItem && (
                        <span className="inline-block mb-2 px-2 py-0.5 bg-[#BFBD31]/10 text-[#BFBD31] text-xs rounded capitalize">
                          {review.inventoryItem.name}
                        </span>
                      )}

                      {/* Review content */}
                      {review.title && <p className="text-base font-semibold text-slate-100 mb-1">{review.title}</p>}
                      <p className="text-sm text-slate-300 leading-relaxed">{review.body}</p>

                      {/* Sub-ratings */}
                      {review.subRatings && Object.entries(review.subRatings).some(([, v]) => v) && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {Object.entries(review.subRatings).filter(([, v]) => v).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
                              <span className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <Stars rating={val} size="sm" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Vendor reply */}
                      {review.vendorReply?.text && (
                        <div className="mt-4 ml-4 p-4 bg-[#BFBD31]/5 border border-[#BFBD31]/20 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-[#BFBD31]">Your Response</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-500">{fmtDate(review.vendorReply.repliedAt)}</span>
                              <button onClick={() => deleteReply(review._id)} disabled={saving === review._id}
                                className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">Remove</button>
                              <button onClick={() => { setReplyOpen(review._id); setReplyText(review.vendorReply.text); }}
                                className="text-xs text-[#BFBD31] hover:text-yellow-300">Edit</button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-300">{review.vendorReply.text}</p>
                        </div>
                      )}

                      {/* Reply form / button */}
                      {replyOpen === review._id
                        ? (
                          <div className="mt-4">
                            <textarea rows={3} value={replyText} onChange={e => setReplyText(e.target.value)}
                              placeholder="Write your reply to this customer…"
                              className="w-full px-4 py-2 border border-white/20 rounded-lg text-sm resize-none" />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => submitReply(review._id)} disabled={saving === review._id}
                                className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg text-sm font-semibold hover:bg-[#a8a628] disabled:opacity-50 flex items-center gap-2">
                                {saving === review._id && <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
                                Post Reply
                              </button>
                              <button onClick={() => { setReplyOpen(null); setReplyText(''); }}
                                className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg text-sm hover:bg-slate-800">
                                Cancel
                              </button>
                            </div>
                          </div>
                        )
                        : !review.vendorReply?.text && (
                          <button onClick={() => { setReplyOpen(review._id); setReplyText(''); }}
                            className="mt-3 px-4 py-2 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg text-sm font-medium hover:bg-[#BFBD31]/10 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                            Reply to Review
                          </button>
                        )
                      }
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── Info box – how to get more reviews ─────────────────────────────── */}
        {(stats?.total ?? 0) === 0 && (
          <div className="bg-gradient-to-r from-[#BFBD31]/10 to-transparent border border-[#BFBD31]/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#BFBD31] mb-3">How to Get Reviews</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2"><span className="text-[#BFBD31] mt-0.5">1.</span> Customers who complete a booking can leave a review for your service.</li>
              <li className="flex items-start gap-2"><span className="text-[#BFBD31] mt-0.5">2.</span> Ensure bookings are marked <strong>completed</strong> so customers can review.</li>
              <li className="flex items-start gap-2"><span className="text-[#BFBD31] mt-0.5">3.</span> Always reply to reviews — it builds trust with future customers.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
