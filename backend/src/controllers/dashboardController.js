import Trip from '../models/Trip.js';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Booking from '../models/Booking.js';
import InventoryItem from '../models/InventoryItem.js';

// @desc  Get user dashboard stats (booking counts, spend summary)
// @route GET /api/dashboard
// @access Private
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const [trips, user] = await Promise.all([
      Trip.find({ user: userId }),
      User.findById(userId).select('-password'),
    ]);

    const totalTrips     = trips.length;
    const upcoming       = trips.filter(t => t.status === 'confirmed').length;
    const pending        = trips.filter(t => t.status === 'pending').length;
    const completed      = trips.filter(t => t.status === 'completed').length;
    const cancelled      = trips.filter(t => t.status === 'cancelled').length;
    const totalSpend     = trips.filter(t => t.status !== 'cancelled').reduce((sum, t) => sum + (t.totalCost || 0), 0);
    const recentTrips    = trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
      },
      stats: { totalTrips, upcoming, pending, completed, cancelled, totalSpend },
      recentTrips: recentTrips.map(t => ({ ...t.toObject(), id: t.tripId || t._id.toString() })),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Get vendor dashboard stats
// @route GET /api/dashboard/vendor
// @access Private (vendor)
const getVendorDashboardData = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const vendorId = vendor._id;
    const now = new Date();

    // Fetch all inventory items for this vendor
    const inventoryItems = await InventoryItem.find({ vendor: vendorId });
    const inventoryIds = inventoryItems.map(i => i._id);

    // Fetch all bookings that include at least one of this vendor's inventory items
    const allBookings = await Booking.find({ 'items.inventory': { $in: inventoryIds } })
      .populate('user', 'name email')
      .populate('items.inventory', 'name type price');

    // ── Core metrics ────────────────────────────────────────────────────────
    const totalBookings   = allBookings.length;
    const pendingRequests = allBookings.filter(b => b.status === 'pending').length;
    const activeListings  = inventoryItems.filter(i => i.isActive).length;

    const revenueBookings   = allBookings.filter(b => ['confirmed', 'completed'].includes(b.status));
    const totalRevenue      = revenueBookings.reduce((s, b) => s + (b.totalCost || 0), 0);
    const startOfMonth      = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueThisMonth  = revenueBookings
      .filter(b => new Date(b.createdAt) >= startOfMonth)
      .reduce((s, b) => s + (b.totalCost || 0), 0);

    // Response rate: (confirmed + rejected + completed) / total * 100
    const responded    = allBookings.filter(b => ['confirmed', 'rejected', 'completed'].includes(b.status)).length;
    const responseRate = totalBookings > 0 ? Math.round((responded / totalBookings) * 100) : 0;

    // Last inventory upload date
    const sortedItems  = [...inventoryItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const lastUploadDate = sortedItems[0]
      ? sortedItems[0].createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : 'N/A';

    // ── Monthly revenue & bookings (last 6 months) ───────────────────────
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        month: d.toLocaleString('en-US', { month: 'short' }),
        start: d,
        end:   new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
      };
    });

    const revenueData = months.map(m => ({
      month:   m.month,
      revenue: revenueBookings
        .filter(b => { const d = new Date(b.createdAt); return d >= m.start && d <= m.end; })
        .reduce((s, b) => s + (b.totalCost || 0), 0),
    }));

    const bookingsData = months.map(m => ({
      month:    m.month,
      bookings: allBookings.filter(b => {
        const d = new Date(b.createdAt); return d >= m.start && d <= m.end;
      }).length,
    }));

    // ── Top services by booking count ───────────────────────────────────────
    const serviceMap = {};
    allBookings.forEach(b => {
      b.items.forEach(item => {
        if (!item.inventory) return;
        const id   = item.inventory._id?.toString();
        const name = item.inventory.name || 'Unknown Service';
        if (!serviceMap[id]) serviceMap[id] = { name, bookings: 0, revenue: 0 };
        serviceMap[id].bookings += 1;
        serviceMap[id].revenue  += item.priceAtBooking || 0;
      });
    });
    const topServices = Object.values(serviceMap)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    // ── Service type breakdown ──────────────────────────────────────────────
    const typeCount = { accommodation: 0, transport: 0, activity: 0, meal: 0, package: 0, other: 0 };
    inventoryItems.forEach(i => { typeCount[i.type] = (typeCount[i.type] || 0) + 1; });
    const totalItems = inventoryItems.length || 1;
    const serviceBreakdown = [
      { type: 'Accommodation',    percentage: Math.round((typeCount.accommodation / totalItems) * 100), color: '#667eea' },
      { type: 'Tours & Activities', percentage: Math.round(((typeCount.activity + typeCount.package) / totalItems) * 100), color: '#34C759' },
      { type: 'Transport',        percentage: Math.round((typeCount.transport / totalItems) * 100), color: '#FF9500' },
      { type: 'Other Services',   percentage: Math.round(((typeCount.meal + typeCount.other) / totalItems) * 100), color: '#764ba2' },
    ].filter(s => s.percentage > 0);

    // ── Recent activity (from bookings) ─────────────────────────────────────
    const activityMeta = {
      pending:   { type: 'booking_request', icon: '📋', color: 'blue' },
      confirmed: { type: 'confirmation',    icon: '✅', color: 'green' },
      rejected:  { type: 'rejection',       icon: '❌', color: 'red' },
      cancelled: { type: 'rejection',       icon: '❌', color: 'red' },
      completed: { type: 'confirmation',    icon: '✅', color: 'green' },
    };

    const recentActivity = [...allBookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((b, idx) => {
        const meta         = activityMeta[b.status] || activityMeta.pending;
        const customerName = b.user?.name || 'A customer';
        const diffMin      = Math.floor((now - new Date(b.createdAt)) / 60000);
        const timeStr      = diffMin < 1    ? 'Just now'
          : diffMin < 60   ? `${diffMin} minutes ago`
          : diffMin < 1440 ? `${Math.floor(diffMin / 60)} hours ago`
          :                  `${Math.floor(diffMin / 1440)} days ago`;
        const desc = b.destination
          || b.items?.[0]?.inventory?.name
          || 'Trip booking';
        return {
          id:          idx + 1,
          type:        meta.type,
          title:       b.status === 'pending'    ? `New booking request from ${customerName}`
                     : b.status === 'confirmed'  ? `Booking confirmed`
                     : b.status === 'rejected'   ? `Booking declined`
                     : `Booking ${b.status} — ${customerName}`,
          description: desc,
          time:        timeStr,
          icon:        meta.icon,
          color:       meta.color,
        };
      });

    // ── Notifications ────────────────────────────────────────────────────────
    const notifications = [];
    if (pendingRequests > 0) {
      notifications.push({
        id: 1, unread: true,
        title:   'New booking request',
        message: `You have ${pendingRequests} pending booking request${pendingRequests > 1 ? 's' : ''}`,
        time:    'Just now',
      });
    }
    const lowStock = inventoryItems.filter(i => i.isActive && i.availableCount <= 2);
    if (lowStock.length > 0) {
      notifications.push({
        id: 2, unread: true,
        title:   'Inventory alert',
        message: `${lowStock.length} item${lowStock.length > 1 ? 's' : ''} low on availability`,
        time:    'Recently',
      });
    }

    res.json({
      vendor: { businessName: vendor.businessName, status: vendor.status },
      metrics: {
        totalBookings,
        pendingRequests,
        revenueThisMonth,
        totalRevenue,
        activeListings,
        averageRating: 0,   // no review model yet
        responseRate,
        lastUploadDate,
      },
      recentActivity,
      notifications,
      topServices,
      revenueData,
      bookingsData,
      serviceBreakdown,
    });
  } catch (error) {
    console.error('Vendor dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Get admin dashboard stats
// @route GET /api/dashboard/admin
// @access Private (admin)
const getAdminDashboardData = async (req, res) => {
  try {
    const now = new Date();

    // ── counts ────────────────────────────────────────────────────────────
    const [
      totalUsers,
      totalVendors,
      activeVendors,
      pendingVendorCount,
      suspendedVendors,
      totalBookings,
      pendingBookings,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Vendor.countDocuments(),
      Vendor.countDocuments({ status: 'approved' }),
      Vendor.countDocuments({ status: 'pending_review' }),
      Vendor.countDocuments({ status: 'suspended' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalCost' } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const platformCommission = Math.round(totalRevenue * 0.1);

    // run remaining independent queries in parallel
    const [bookingDocs, vendorDocs] = await Promise.all([
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email')
        .populate('items.inventory', 'name type'),
      Vendor.find()
        .sort({ createdAt: -1 })
        .populate('user', 'name email')
        .select('businessName businessType address businessEmail businessPhone status createdAt user services'),
    ]);

    const recentBookings = bookingDocs.map(b => ({
      id: b._id.toString(),
      customer: b.user?.name || 'Unknown',
      email: b.user?.email || '',
      service: b.destination || b.items.map(i => i.inventory?.name || '').filter(Boolean).join(', ') || '—',
      amount: b.totalCost,
      status: b.status,
      paymentStatus: b.paymentStatus,
      date: b.createdAt?.toISOString().split('T')[0],
      commission: Math.round((b.totalCost || 0) * 0.1),
      pax: b.pax,
      duration: b.duration,
      location: b.location,
    }));

    const allVendors = vendorDocs.map(v => ({
      id: v._id.toString(),
      businessName: v.businessName,
      type: v.businessType,
      location: v.address?.city || '—',
      appliedDate: v.createdAt?.toISOString().split('T')[0],
      email: v.businessEmail,
      phone: v.businessPhone,
      status: v.status,
      ownerName: v.user?.name || '—',
      ownerEmail: v.user?.email || '—',
      services: v.services || [],
    }));

    // ── ALL users + per-user booking counts in one aggregation ────────────
    const userDocs = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .select('name email role createdAt');

    const bookingCountAgg = await Booking.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    const bookingCountMap = {};
    bookingCountAgg.forEach(({ _id, count }) => { bookingCountMap[_id.toString()] = count; });

    const allUsers = userDocs.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      joined: u.createdAt?.toISOString().split('T')[0],
      bookings: bookingCountMap[u._id.toString()] || 0,
    }));

    // ── monthly revenue – last 7 months (parallel) ────────────────────────
    const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthRanges = Array.from({ length: 7 }, (_, i) => {
      const d     = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return { label: monthLabels[d.getMonth()], start, end };
    });

    const monthlyAggs = await Promise.all(
      monthRanges.map(({ start, end }) =>
        Booking.aggregate([
          { $match: { status: { $in: ['confirmed','completed'] }, createdAt: { $gte: start, $lt: end } } },
          { $group: { _id: null, total: { $sum: '$totalCost' } } },
        ])
      )
    );

    const monthlyRevenue = monthRanges.map(({ label }, i) => {
      const rev = monthlyAggs[i][0]?.total || 0;
      return { month: label, revenue: rev, commission: Math.round(rev * 0.1) };
    });

    res.json({
      stats: {
        totalUsers,
        totalVendors,
        activeVendors,
        pendingVendors: pendingVendorCount,
        suspendedVendors,
        totalBookings,
        pendingApprovals: pendingVendorCount,
        totalRevenue,
        platformCommission,
        pendingPayouts: Math.round(totalRevenue * 0.05),
        activeLiveChats: 0,
        pendingTickets: pendingBookings,
      },
      recentBookings,
      allVendors,
      allUsers,
      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getDashboardData, getVendorDashboardData, getAdminDashboardData };
