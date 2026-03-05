import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// ── helpers ─────────────────────────────────────────────────────────────────
const COMMISSION_RATE = 0.10;
const COLORS = ['#667eea', '#34C759', '#FF9500', '#764ba2', '#ef4444', '#06b6d4'];
const TYPE_LABELS = { accommodation: 'Accommodation', transport: 'Transport', activity: 'Activity', meal: 'Meal', package: 'Package', other: 'Other' };

function fmtMoney(n = 0) {
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `LKR ${(n / 1_000).toFixed(1)}K`;
  return `LKR ${n.toLocaleString()}`;
}
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'; }

function Bar({ value, max, color = '#667eea', label }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 2;
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="w-full flex items-end h-40 bg-slate-800/30 rounded-lg overflow-hidden relative group">
        <div className="w-full transition-all duration-500 rounded-t-sm" style={{ height: `${pct}%`, background: color }} />
        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
          {typeof value === 'number' ? (value >= 1000 ? `LKR ${(value/1000).toFixed(0)}K` : value) : value}
        </div>
      </div>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.percentage, 0) || 1;
  let offset = 0;
  const R = 45, C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-8 flex-wrap">
      <svg viewBox="0 0 100 100" className="w-40 h-40 -rotate-90 shrink-0">
        {data.map((d, i) => {
          const dash = (d.percentage / 100) * C;
          const seg = <circle key={i} cx="50" cy="50" r={R} fill="none" stroke={d.color} strokeWidth="10"
            strokeDasharray={`${dash} ${C}`} strokeDashoffset={-offset} className="transition-all" />;
          offset += dash;
          return seg;
        })}
      </svg>
      <div className="space-y-2 flex-1 min-w-[140px]">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
              <span className="text-sm text-slate-300">{d.type || d.label}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-semibold text-white">{d.percentage}%</span>
              {d.count != null && <span className="text-xs text-slate-500 ml-1">({d.count})</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── main component ──────────────────────────────────────────────────────────
export default function RevenueAnalytics() {
  const navigate = useNavigate();
  const [dash, setDash]         = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dateRange, setDateRange]     = useState('all');
  const [customFrom, setCustomFrom]   = useState('');
  const [customTo, setCustomTo]       = useState('');
  const [topBy, setTopBy]             = useState('revenue');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const getAuth = () => {
    const info = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!info?.token) { navigate('/vendor-login'); return null; }
    return { Authorization: `Bearer ${info.token}` };
  };

  const fetchAll = async () => {
    const headers = getAuth(); if (!headers) return;
    setLoading(true);
    try {
      const [{ data: d }, { data: bk }] = await Promise.all([
        axios.get('/api/dashboard/vendor', { headers }),
        axios.get('/api/bookings/vendor', { headers }),
      ]);
      setDash(d);
      setBookings(bk);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  // ── date-filtered bookings ─────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    const now = Date.now();
    return bookings.filter(b => {
      const d = new Date(b.createdAt).getTime();
      if (dateRange === '30')  return d >= now - 30 * 86400000;
      if (dateRange === '90')  return d >= now - 90 * 86400000;
      if (dateRange === '365') return d >= now - 365 * 86400000;
      if (dateRange === 'custom') {
        if (customFrom && d < new Date(customFrom).getTime()) return false;
        if (customTo   && d > new Date(customTo).getTime() + 86399999) return false;
      }
      return true;
    });
  }, [bookings, dateRange, customFrom, customTo]);

  // ── computed metrics ───────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const revenue   = filteredBookings.filter(b => ['confirmed','completed'].includes(b.status)).reduce((s,b) => s+b.totalCost,0);
    const pending   = filteredBookings.filter(b => ['confirmed'].includes(b.status)).reduce((s,b) => s+b.totalCost,0);
    const paid      = filteredBookings.filter(b => b.status==='completed').reduce((s,b) => s+b.totalCost,0);
    const confirmed = filteredBookings.filter(b => ['confirmed','completed'].includes(b.status)).length;
    const avg       = confirmed > 0 ? Math.round(revenue / confirmed) : 0;
    const responded = filteredBookings.filter(b => ['confirmed','rejected','completed'].includes(b.status)).length;
    const respRate  = filteredBookings.length > 0 ? Math.round((responded / filteredBookings.length) * 100) : 0;
    const uniqueCustomers = new Set(filteredBookings.map(b => b.user?._id).filter(Boolean)).size;
    return { revenue, pending, paid, totalBookings: filteredBookings.length, confirmed, avg, respRate, uniqueCustomers };
  }, [filteredBookings]);

  // ── 6-month revenue trend (from dashboard OR computed from bookings) ────
  const revenueTrendData = useMemo(() => {
    // When showing all, use the pre-aggregated server data (accurate counts)
    if (dateRange === 'all' && dash?.revenueData?.length) return dash.revenueData;
    // Otherwise compute from filtered bookings grouped by month
    const map = {};
    filteredBookings.filter(b => ['confirmed','completed'].includes(b.status)).forEach(b => {
      const key = new Date(b.createdAt).toLocaleString('en-US', { month: 'short', year: '2-digit' });
      map[key] = (map[key] || 0) + b.totalCost;
    });
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
  }, [dash, filteredBookings, dateRange]);

  // ── bookings by month (confirmed / cancelled / pending) ─────────────────
  const bookingsTrendData = useMemo(() => {
    const map = {};
    filteredBookings.forEach(b => {
      const key = new Date(b.createdAt).toLocaleString('en-US', { month: 'short', year: '2-digit' });
      if (!map[key]) map[key] = { month: key, confirmed: 0, cancelled: 0, pending: 0 };
      if (['confirmed','completed'].includes(b.status)) map[key].confirmed++;
      else if (b.status === 'cancelled') map[key].cancelled++;
      else if (b.status === 'pending')   map[key].pending++;
    });
    return Object.values(map);
  }, [filteredBookings]);

  // ── top services computed from filtered bookings ─────────────────────
  const topServices = useMemo(() => {
    const map = {};
    filteredBookings.forEach(b => {
      b.items?.forEach(item => {
        if (!item.inventory) return;
        const id   = item.inventory._id || item.inventory;
        const name = item.inventory.name || 'Service';
        const type = item.inventory.type || 'other';
        if (!map[id]) map[id] = { name, type, bookings: 0, revenue: 0 };
        map[id].bookings++;
        map[id].revenue += item.priceAtBooking || 0;
      });
    });
    return Object.values(map).sort((a, b) => topBy === 'revenue' ? b.revenue - a.revenue : b.bookings - a.bookings).slice(0, 8);
  }, [filteredBookings, topBy]);

  // ── service type breakdown ─────────────────────────────────────────────
  const typeBreakdown = useMemo(() => {
    const map = {};
    filteredBookings.forEach(b => {
      b.items?.forEach(item => {
        const t = item.inventory?.type || 'other';
        map[t] = (map[t] || 0) + 1;
      });
    });
    const total = Object.values(map).reduce((s, n) => s + n, 0) || 1;
    return Object.entries(map).map(([type, count], i) => ({
      type: TYPE_LABELS[type] || type,
      percentage: Math.round((count / total) * 100),
      count,
      color: COLORS[i % COLORS.length],
    })).sort((a, b) => b.count - a.count);
  }, [filteredBookings]);

  // ── export ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [['Booking ID','Date','Service','Customer','Amount (LKR)','Commission (LKR)','Net Payout (LKR)','Status','Payment']];
    filteredBookings.forEach(b => {
      const svc = b.items?.map(i => i.inventory?.name||'').filter(Boolean).join(', ') || b.destination || '—';
      const commission = Math.round(b.totalCost * COMMISSION_RATE);
      rows.push([b._id.slice(-10).toUpperCase(), fmtDate(b.createdAt), svc, b.user?.name||'—', b.totalCost, commission, b.totalCost - commission, b.status, b.paymentStatus]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const printReport = () => {
    const html = `<!DOCTYPE html><html><head><title>Revenue Report</title><style>
      body{font-family:sans-serif;padding:24px} h1{font-size:20px;margin-bottom:8px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{padding:6px 10px;text-align:left;border:1px solid #ddd}
      th{background:#f0f0f0;font-weight:600} .green{color:#16a34a} .orange{color:#d97706}
      .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}
      .card{border:1px solid #e5e7eb;border-radius:8px;padding:12px}
      .card-num{font-size:20px;font-weight:700;margin-top:4px}
    </style></head><body>
    <h1>Revenue & Analytics Report</h1>
    <p style="color:#666;font-size:12px">Generated: ${new Date().toLocaleString()} | Period: ${dateRange === 'all' ? 'All Time' : dateRange === 'custom' ? `${customFrom} to ${customTo}` : `Last ${dateRange} days`}</p>
    <div class="summary">
      <div class="card"><div>Total Revenue</div><div class="card-num">LKR ${metrics.revenue.toLocaleString()}</div></div>
      <div class="card"><div>Total Bookings</div><div class="card-num">${metrics.totalBookings}</div></div>
      <div class="card"><div>Avg Booking Value</div><div class="card-num">LKR ${metrics.avg.toLocaleString()}</div></div>
      <div class="card"><div>Response Rate</div><div class="card-num">${metrics.respRate}%</div></div>
    </div>
    <table><thead><tr><th>Booking ID</th><th>Date</th><th>Service</th><th>Customer</th><th>Amount</th><th>Commission</th><th>Net Payout</th><th>Status</th></tr></thead><tbody>
    ${filteredBookings.map(b => {
      const svc = b.items?.map(i => i.inventory?.name||'').filter(Boolean).join(', ') || b.destination || '—';
      const comm = Math.round(b.totalCost * COMMISSION_RATE);
      return `<tr><td>${b._id.slice(-10).toUpperCase()}</td><td>${fmtDate(b.createdAt)}</td><td>${svc}</td><td>${b.user?.name||'—'}</td><td>LKR ${b.totalCost.toLocaleString()}</td><td>LKR ${comm.toLocaleString()}</td><td class="green">LKR ${(b.totalCost-comm).toLocaleString()}</td><td>${b.status}</td></tr>`;
    }).join('')}
    </tbody></table></body></html>`;
    const w = window.open('','_blank'); w.document.write(html); w.document.close(); w.print();
  };

  // ─────────────────────── render ─────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#BFBD31] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400">Loading analytics…</p>
      </div>
    </div>
  );

  const maxRev  = Math.max(...revenueTrendData.map(d => d.revenue), 1);
  const maxBk   = Math.max(...bookingsTrendData.flatMap(d => [d.confirmed, d.cancelled, d.pending]), 1);
  const maxTop  = Math.max(...topServices.map(s => topBy === 'revenue' ? s.revenue : s.bookings), 1);

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        select, input { background: #0f172a; color: #cbd5e1; }
        select option { background: #0f172a; }
      `}</style>

      {/* Header */}
      <div className="bg-slate-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Revenue & Analytics</h1>
              <p className="text-slate-400 mt-1">Financial reporting and business intelligence</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={fetchAll} className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Refresh
              </button>
              <button onClick={exportCSV} className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Export CSV
              </button>
              <button onClick={printReport} className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Print Report
              </button>
              <button onClick={() => setShowScheduleModal(true)} className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg hover:bg-[#a8a628] flex items-center gap-2 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Schedule Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Date Range Filter */}
        <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
          <div className="flex flex-wrap items-center gap-3">
            {[['all','All Time'],['30','Last 30 Days'],['90','Last 90 Days'],['365','This Year'],['custom','Custom']].map(([v, lbl]) => (
              <button key={v} onClick={() => setDateRange(v)}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${dateRange === v ? 'bg-[#BFBD31] text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                {lbl}
              </button>
            ))}
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="px-3 py-2 border border-white/20 rounded-lg text-sm" />
                <span className="text-slate-400 text-sm">to</span>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="px-3 py-2 border border-white/20 rounded-lg text-sm" />
              </div>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-2">{filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} in selected period</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Revenue',     value: fmtMoney(metrics.revenue),        sub: 'confirmed + completed', accent: 'text-white' },
            { label: 'Total Bookings',    value: metrics.totalBookings,             sub: 'all statuses',          accent: 'text-white' },
            { label: 'Confirmed',         value: metrics.confirmed,                 sub: 'bookings',              accent: 'text-green-400' },
            { label: 'Avg Booking Value', value: fmtMoney(metrics.avg),             sub: 'per confirmed booking', accent: 'text-white' },
            { label: 'Response Rate',     value: `${metrics.respRate}%`,            sub: 'response rate',         accent: 'text-[#BFBD31]' },
            { label: 'Unique Customers',  value: metrics.uniqueCustomers,           sub: 'distinct customers',    accent: 'text-white' },
          ].map((m, i) => (
            <div key={i} className="bg-slate-900 border border-white/10 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-400 mb-2">{m.label}</p>
              <p className={`text-2xl font-bold ${m.accent}`}>{m.value}</p>
              <p className="text-xs text-slate-500 mt-1">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue payout summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
            <p className="text-sm text-slate-400 mb-1">Gross Revenue</p>
            <p className="text-3xl font-bold text-white">{fmtMoney(metrics.revenue)}</p>
            <p className="text-xs text-slate-500 mt-1">confirmed + completed</p>
          </div>
          <div className="bg-slate-900 border border-orange-500/30 rounded-xl p-5">
            <p className="text-sm text-slate-400 mb-1">Platform Commission (10%)</p>
            <p className="text-3xl font-bold text-orange-400">{fmtMoney(Math.round(metrics.revenue * COMMISSION_RATE))}</p>
            <p className="text-xs text-slate-500 mt-1">deducted from gross</p>
          </div>
          <div className="bg-slate-900 border border-green-500/30 rounded-xl p-5">
            <p className="text-sm text-slate-400 mb-1">Your Net Payout</p>
            <p className="text-3xl font-bold text-green-400">{fmtMoney(Math.round(metrics.revenue * (1 - COMMISSION_RATE)))}</p>
            <p className="text-xs text-slate-500 mt-1">after commission</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
              <span className="text-xs text-slate-500">{revenueTrendData.length} period{revenueTrendData.length !== 1 ? 's' : ''}</span>
            </div>
            {revenueTrendData.length === 0
              ? <p className="text-slate-500 text-center py-16 text-sm">No revenue data for selected period</p>
              : <div className="flex items-end gap-2 h-48">
                  {revenueTrendData.map((d, i) => <Bar key={i} value={d.revenue} max={maxRev} label={d.month} color="#667eea" />)}
                </div>
            }
          </div>

          {/* Bookings by Status Over Time */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Bookings Timeline</h3>
            </div>
            {bookingsTrendData.length === 0
              ? <p className="text-slate-500 text-center py-16 text-sm">No bookings in selected period</p>
              : <>
                <div className="flex items-end gap-3 h-40">
                  {bookingsTrendData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-0.5 items-end h-36">
                        <div className="flex-1 rounded-t-sm bg-green-500 transition-all" style={{ height: `${maxBk>0?(d.confirmed/maxBk)*100:0}%` }} title={`${d.confirmed} confirmed`} />
                        <div className="flex-1 rounded-t-sm bg-red-500 transition-all"  style={{ height: `${maxBk>0?(d.cancelled/maxBk)*100:0}%` }} title={`${d.cancelled} cancelled`} />
                        <div className="flex-1 rounded-t-sm bg-yellow-500 transition-all" style={{ height: `${maxBk>0?(d.pending/maxBk)*100:0}%` }} title={`${d.pending} pending`} />
                      </div>
                      <span className="text-[10px] text-slate-400 text-center">{d.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block"/>Confirmed</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block"/>Cancelled</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-500 inline-block"/>Pending</span>
                </div>
              </>
            }
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Services */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Top Services</h3>
              <div className="flex gap-1">
                {['revenue','bookings'].map(v => (
                  <button key={v} onClick={() => setTopBy(v)}
                    className={`px-3 py-1 text-xs rounded font-medium ${topBy===v?'bg-[#BFBD31] text-slate-950':'bg-slate-800 text-slate-300'}`}>
                    {v.charAt(0).toUpperCase()+v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {topServices.length === 0
              ? <p className="text-slate-500 text-center py-12 text-sm">No service data for this period</p>
              : <div className="space-y-3">
                  {topServices.map((s, i) => {
                    const val = topBy === 'revenue' ? s.revenue : s.bookings;
                    return (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-300 truncate mr-2">{s.name}</span>
                          <span className="text-sm font-semibold text-white shrink-0">
                            {topBy === 'revenue' ? fmtMoney(val) : `${val} bkg${val!==1?'s':''}`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-[#BFBD31] h-2 rounded-full transition-all" style={{ width: `${(val/maxTop)*100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>

          {/* Service Type Breakdown */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Service Type Breakdown</h3>
            {typeBreakdown.length === 0
              ? <p className="text-slate-500 text-center py-12 text-sm">No booking data for this period</p>
              : <Donut data={typeBreakdown} />
            }
          </div>
        </div>

        {/* Detailed Revenue Report Table */}
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h3 className="text-lg font-bold text-white">Detailed Revenue Report</h3>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="px-4 py-2 text-sm border border-white/20 text-slate-300 rounded-lg hover:bg-slate-800">Export CSV</button>
              <button onClick={printReport} className="px-4 py-2 text-sm border border-white/20 text-slate-300 rounded-lg hover:bg-slate-800">Print PDF</button>
            </div>
          </div>
          {filteredBookings.length === 0
            ? <p className="text-slate-500 text-center py-12 text-sm">No bookings in selected period</p>
            : <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800 text-slate-400 text-left">
                      <th className="px-4 py-3">Booking ID</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Commission</th>
                      <th className="px-4 py-3">Net Payout</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredBookings].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).map(b => {
                      const svc = b.items?.map(i => i.inventory?.name||'').filter(Boolean).join(', ') || b.destination || '—';
                      const commission = Math.round(b.totalCost * COMMISSION_RATE);
                      const payout     = b.totalCost - commission;
                      const statusColors = { confirmed:'bg-green-100 text-green-700', completed:'bg-blue-100 text-blue-700', pending:'bg-yellow-100 text-yellow-700', rejected:'bg-red-100 text-red-700', cancelled:'bg-slate-700 text-slate-300' };
                      return (
                        <tr key={b._id} className="border-t border-white/10 hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-mono text-xs text-slate-400">{b._id.slice(-10).toUpperCase()}</td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{fmtDate(b.createdAt)}</td>
                          <td className="px-4 py-3 text-slate-300 max-w-[180px] truncate">{svc}</td>
                          <td className="px-4 py-3 text-slate-200">{b.user?.name || '—'}</td>
                          <td className="px-4 py-3 text-white font-semibold">LKR {b.totalCost.toLocaleString()}</td>
                          <td className="px-4 py-3 text-orange-400">LKR {commission.toLocaleString()}</td>
                          <td className="px-4 py-3 text-green-400 font-semibold">LKR {payout.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[b.status] || 'bg-slate-700 text-slate-300'}`}>{b.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${b.paymentStatus==='paid'?'bg-green-100 text-green-700':'bg-orange-100 text-orange-700'}`}>{b.paymentStatus || 'pending'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-800 font-semibold text-sm">
                      <td colSpan={4} className="px-4 py-3 text-slate-300">Totals ({filteredBookings.length} bookings)</td>
                      <td className="px-4 py-3 text-white">LKR {filteredBookings.reduce((s,b)=>s+b.totalCost,0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-orange-400">LKR {Math.round(filteredBookings.reduce((s,b)=>s+b.totalCost,0)*COMMISSION_RATE).toLocaleString()}</td>
                      <td className="px-4 py-3 text-green-400">LKR {Math.round(filteredBookings.reduce((s,b)=>s+b.totalCost,0)*(1-COMMISSION_RATE)).toLocaleString()}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
          }
        </div>

        {/* Service Performance */}
        {topServices.length > 0 && (
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Service Performance</h3>
              <button onClick={exportCSV} className="px-4 py-2 text-sm border border-white/20 text-slate-300 rounded-lg hover:bg-slate-800">Export</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 text-slate-400 text-left">
                    <th className="px-4 py-3">Service Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Bookings</th>
                    <th className="px-4 py-3">Gross Revenue</th>
                    <th className="px-4 py-3">Net Payout</th>
                    <th className="px-4 py-3">Avg per Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {[...topServices].sort((a,b)=>b.revenue-a.revenue).map((s, i) => (
                    <tr key={i} className="border-t border-white/10 hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-[#BFBD31]/15 text-[#BFBD31] text-xs font-semibold rounded capitalize">{s.type}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{s.bookings}</td>
                      <td className="px-4 py-3 text-white font-semibold">{fmtMoney(s.revenue)}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">{fmtMoney(Math.round(s.revenue*(1-COMMISSION_RATE)))}</td>
                      <td className="px-4 py-3 text-slate-300">{s.bookings > 0 ? fmtMoney(Math.round(s.revenue/s.bookings)) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <h2 className="text-xl font-bold text-white mb-1">Schedule Automated Reports</h2>
            <p className="text-slate-400 text-sm mb-6">Set up recurring CSV report delivery</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Frequency</label>
                <select className="w-full px-4 py-2 border border-white/20 rounded-lg text-sm">
                  <option>Daily</option><option>Weekly</option><option>Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Report Type</label>
                <select className="w-full px-4 py-2 border border-white/20 rounded-lg text-sm">
                  <option>Full Analytics Report</option><option>Revenue Summary</option><option>Bookings Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email Recipients</label>
                <input type="email" placeholder="email@example.com" className="w-full px-4 py-2 border border-white/20 rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowScheduleModal(false)} className="flex-1 px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-800">Cancel</button>
              <button onClick={() => { toast.success('Schedule saved!'); setShowScheduleModal(false); }}
                className="flex-1 px-4 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#a8a628]">
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
