import mongoose from 'mongoose';
import Trip from '../models/Trip.js';

// Helper: find a trip by tripId string OR MongoDB _id, scoped to req.user
const findTrip = (idParam, userId) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(idParam);
  return Trip.findOne({
    $or: [
      { tripId: idParam },
      ...(isObjectId ? [{ _id: idParam }] : []),
    ],
    user: userId,
  });
};

// @desc  Get all trips for the logged-in user
// @route GET /api/trips
// @access Private
export const getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(trips.map(t => ({ ...t.toObject(), id: t.tripId || t._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Get single trip by tripId string or MongoDB _id
// @route GET /api/trips/:id
// @access Private
export const getTripById = async (req, res) => {
  try {
    const trip = await findTrip(req.params.id, req.user._id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ ...trip.toObject(), id: trip.tripId || trip._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Create a new trip / booking request
// @route POST /api/trips
// @access Private
export const createTrip = async (req, res) => {
  try {
    const tripData = { ...req.body, user: req.user._id };
    if (!tripData.timeline || tripData.timeline.length === 0) {
      tripData.timeline = [
        { step: 'Booking Submitted', status: 'completed', date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) },
        { step: 'Vendor Approval', status: 'pending', date: null },
        { step: 'Confirmed', status: 'pending', date: null },
        { step: 'Trip Completed', status: 'pending', date: null },
      ];
    }
    const trip = await Trip.create(tripData);
    res.status(201).json({ ...trip.toObject(), id: trip.tripId || trip._id.toString() });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create trip', error: error.message });
  }
};

// @desc  Update a pending trip (modify before vendor approval)
// @route PUT /api/trips/:id
// @access Private
export const updateTrip = async (req, res) => {
  try {
    const trip = await findTrip(req.params.id, req.user._id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending trips can be modified' });
    }
    const allowed = ['destination', 'location', 'dates', 'travelers', 'travelerDetails', 'specialRequests', 'itinerary'];
    allowed.forEach(field => { if (req.body[field] !== undefined) trip[field] = req.body[field]; });
    await trip.save();
    res.json({ ...trip.toObject(), id: trip.tripId || trip._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Cancel a trip (user-initiated)
// @route PATCH /api/trips/:id/cancel
// @access Private
export const cancelTrip = async (req, res) => {
  try {
    const trip = await findTrip(req.params.id, req.user._id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status === 'completed' || trip.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel a ${trip.status} trip` });
    }
    trip.status = 'cancelled';
    await trip.save();
    res.json({ message: 'Trip cancelled successfully', trip: { ...trip.toObject(), id: trip.tripId || trip._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Update trip status (vendor/admin use)
// @route PATCH /api/trips/:id/status
// @access Private
export const updateTripStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${valid.join(', ')}` });
    }
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = {
      $or: [{ tripId: req.params.id }, ...(isObjectId ? [{ _id: req.params.id }] : [])],
    };
    if (req.user.role === 'user') query.user = req.user._id;
    const trip = await Trip.findOne(query);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    trip.status = status;
    // Auto-update timeline steps
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    if (status === 'confirmed') {
      ['Vendor Approval', 'Confirmed'].forEach(name => {
        const s = trip.timeline.find(x => x.step === name);
        if (s) { s.status = 'completed'; s.date = now; }
      });
    } else if (status === 'completed') {
      const s = trip.timeline.find(x => x.step === 'Trip Completed');
      if (s) { s.status = 'completed'; s.date = now; }
    }
    await trip.save();
    res.json({ ...trip.toObject(), id: trip.tripId || trip._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Delete a trip
// @route DELETE /api/trips/:id
// @access Private
export const deleteTrip = async (req, res) => {
  try {
    const trip = await findTrip(req.params.id, req.user._id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    await trip.deleteOne();
    res.json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Search trips by destination and budget
// @route GET /api/trips/search?destination=xxx&budget=xxx
// @access Public
export const searchTrips = async (req, res) => {
  try {
    const { destination, budget } = req.query;
    
    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    const budgetNum = budget ? parseInt(budget) : null;
    const query = {
      destination: { $regex: destination, $options: 'i' },
      status: 'confirmed'
    };

    if (budgetNum) {
      query.totalCost = { $lte: budgetNum };
    }

    const trips = await Trip.find(query)
      .populate('user', 'name email')
      .sort({ totalCost: 1, createdAt: -1 })
      .limit(10);

    // Format response
    const formattedTrips = trips.map(t => ({
      ...t.toObject(),
      id: t.tripId || t._id.toString()
    }));

    // If no confirmed trips, generate recommendations based on destination
    if (formattedTrips.length === 0) {
      return res.json({
        message: 'No confirmed trips found. Here are recommendations:',
        recommendations: generateRecommendations(destination, budgetNum),
        trips: []
      });
    }

    res.json({
      count: formattedTrips.length,
      trips: formattedTrips
    });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

// Helper function to generate recommendations
const generateRecommendations = (destination, budget) => {
  const recommendations = [
    {
      id: 'rec1',
      title: `3-Day ${destination} Tour`,
      description: `Explore the best of ${destination} with guided tours, accommodation, and meals included.`,
      duration: '3 Days',
      estimatedPrice: budget ? Math.floor(budget * 0.8) : 150000,
      highlights: ['Guided City Tour', 'Local Cuisine', '4-Star Hotel', 'Transportation'],
      rating: 4.5,
      reviews: 24,
      image: '#667eea'
    },
    {
      id: 'rec2',
      title: `5-Day ${destination} Experience`,
      description: `Extended tour with adventure activities, cultural experiences, and luxury accommodation.`,
      duration: '5 Days',
      estimatedPrice: budget ? Math.floor(budget * 0.9) : 200000,
      highlights: ['Adventure Activities', 'Cultural Shows', 'Spa & Wellness', '5-Star Hotel'],
      rating: 4.8,
      reviews: 45,
      image: '#764ba2'
    },
    {
      id: 'rec3',
      title: `${destination} Adventure Package`,
      description: `Perfect for adventure seekers with hiking, water sports, and nature exploration.`,
      duration: '4 Days',
      estimatedPrice: budget ? Math.floor(budget * 0.75) : 120000,
      highlights: ['Hiking Trails', 'Water Sports', 'Nature Photography', 'Budget Hotel'],
      rating: 4.3,
      reviews: 18,
      image: '#f093fb'
    }
  ];

  return recommendations;
};
