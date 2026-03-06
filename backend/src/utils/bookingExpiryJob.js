import Booking from '../models/Booking.js';
import { createNotification } from '../controllers/notificationController.js';

/**
 * ⭐ MAJOR FIX #10: Booking expiry job
 * Runs every 5 minutes to check for expired pending bookings (24h+)
 * Auto-expires bookings and notifies users
 */
export const expireOldBookings = async () => {
  try {
    const now = new Date();
    
    // Find all pending bookings that have expired (past expiryDate)
    const expiredBookings = await Booking.find({
      status: 'pending',
      expiryDate: { $lt: now },
    });

    if (expiredBookings.length === 0) {
      console.log(`[Booking Expiry] No expired bookings found at ${now.toISOString()}`);
      return;
    }

    console.log(`[Booking Expiry] Found ${expiredBookings.length} expired bookings, processing...`);

    for (const booking of expiredBookings) {
      try {
        // Update booking status to expired
        booking.status = 'expired';
        await booking.save();

        // Restore inventory stock
        for (const item of booking.items) {
          await Booking.collection.updateOne(
            { _id: booking._id },
            { $inc: { 'availableCount': +1 } }
          );
        }

        // Notify user
        const destination = booking.destination || 'your trip';
        await createNotification({
          userId: booking.user,
          type: 'booking_expired',
          title: '⏰ Booking Expired',
          message: `Your booking for "${destination}" has expired and is no longer available. Please create a new booking if you're still interested.`,
          bookingId: booking._id,
        });

        console.log(`[Booking Expiry] Expired booking ${booking._id} and notified user`);
      } catch (err) {
        console.error(`[Booking Expiry] Error expiring booking ${booking._id}:`, err.message);
      }
    }

    console.log(`[Booking Expiry] Completed: ${expiredBookings.length} bookings expired`);
  } catch (err) {
    console.error('[Booking Expiry] Job error:', err);
  }
};

/**
 * Schedule the booking expiry job to run every 5 minutes
 */
export const scheduleBookingExpiryJob = () => {
  const INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Run immediately on startup
  expireOldBookings();

  // Then run every 5 minutes
  setInterval(expireOldBookings, INTERVAL);

  console.log('[Booking Expiry] Job scheduled to run every 5 minutes');
};
