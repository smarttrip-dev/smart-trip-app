import Review from '../models/Review.js';
import Vendor from '../models/Vendor.js';
import Booking from '../models/Booking.js';
import InventoryItem from '../models/InventoryItem.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reviews
// Customer submits a review for a completed booking's service
// ─────────────────────────────────────────────────────────────────────────────
export const submitReview = async (req, res) => {
  try {
    const { bookingId, inventoryItemId, vendorId, rating, title, body, recommend, subRatings } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    if (!body || body.trim().length < 10)
      return res.status(400).json({ message: 'Review body must be at least 10 characters' });
    if (!vendorId)
      return res.status(400).json({ message: 'vendorId is required' });

    // If a bookingId was provided, verify it belongs to this user
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      if (booking.user.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Not your booking' });

      // Check duplicate (same customer + same booking)
      const exists = await Review.findOne({ booking: bookingId, customer: req.user._id });
      if (exists) return res.status(409).json({ message: 'You already reviewed this booking' });
    }

    const review = await Review.create({
      booking:       bookingId   || null,
      inventoryItem: inventoryItemId || null,
      vendor:        vendorId,
      customer:      req.user._id,
      rating,
      title:         title?.trim() || '',
      body:          body.trim(),
      recommend:     recommend !== false,
      subRatings:    subRatings || {},
    });

    await review.populate('customer', 'name');
    res.status(201).json(review);
  } catch (err) {
    console.error('submitReview error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reviews/vendor
// Vendor fetches all reviews for their services
// ─────────────────────────────────────────────────────────────────────────────
export const getVendorReviews = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const reviews = await Review.find({ vendor: vendor._id, isVisible: true })
      .populate('customer', 'name email')
      .populate('inventoryItem', 'name type')
      .populate('booking', 'totalCost createdAt destination')
      .sort({ createdAt: -1 });

    // ── Aggregate stats ──────────────────────────────────────────────────
    const total = reviews.length;
    const avgRating = total > 0
      ? +(reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
      : 0;

    // Distribution: count per star 1–5
    const distribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
      pct:   total > 0 ? Math.round((reviews.filter(r => r.rating === star).length / total) * 100) : 0,
    }));

    // Per-service stats
    const serviceMap = {};
    reviews.forEach(r => {
      const id   = r.inventoryItem?._id?.toString() || 'general';
      const name = r.inventoryItem?.name || 'General Service';
      const type = r.inventoryItem?.type || 'other';
      if (!serviceMap[id]) serviceMap[id] = { id, name, type, total: 0, sum: 0 };
      serviceMap[id].total++;
      serviceMap[id].sum += r.rating;
    });
    const serviceStats = Object.values(serviceMap).map(s => ({
      ...s,
      avg: +(s.sum / s.total).toFixed(1),
    })).sort((a, b) => b.total - a.total);

    const pendingReplies = reviews.filter(r => !r.vendorReply?.text).length;
    const recommendations = reviews.filter(r => r.recommend).length;

    res.json({
      stats: { total, avgRating, pendingReplies, recommendations, distribution, serviceStats },
      reviews,
    });
  } catch (err) {
    console.error('getVendorReviews error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reviews/:id/reply
// Vendor replies to a review
// ─────────────────────────────────────────────────────────────────────────────
export const replyToReview = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Reply text is required' });

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.vendor.toString() !== vendor._id.toString())
      return res.status(403).json({ message: 'Not your review' });

    review.vendorReply = { text: text.trim(), repliedAt: new Date() };
    await review.save();

    await review.populate('customer', 'name email');
    await review.populate('inventoryItem', 'name type');
    res.json(review);
  } catch (err) {
    console.error('replyToReview error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/reviews/:id/reply
// Vendor removes their reply
// ─────────────────────────────────────────────────────────────────────────────
export const deleteReply = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.vendor.toString() !== vendor._id.toString())
      return res.status(403).json({ message: 'Not your review' });

    review.vendorReply = { text: '', repliedAt: null };
    await review.save();
    res.json({ message: 'Reply deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
