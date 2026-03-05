import SavedTrip from '../models/SavedTrip.js';

// @desc  Get all saved trips for the logged-in user
// @route GET /api/saved-trips
// @access Private
export const getSavedTrips = async (req, res) => {
  try {
    const savedTrips = await SavedTrip.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(savedTrips);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Save a trip to the list
// @route POST /api/saved-trips
// @access Private
export const saveTrip = async (req, res) => {
  try {
    const { destination, location, estimatedCost, duration, thumbnail, highlights, accommodationType, travelers, notes } = req.body;

    const saved = await SavedTrip.create({
      user: req.user._id,
      destination,
      location,
      estimatedCost,
      duration,
      thumbnail: thumbnail || '#667eea',
      highlights: highlights || [],
      accommodationType,
      travelers,
      notes,
    });

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to save trip', error: error.message });
  }
};

// @desc  Remove a saved trip
// @route DELETE /api/saved-trips/:id
// @access Private
export const removeSavedTrip = async (req, res) => {
  try {
    const trip = await SavedTrip.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!trip) {
      return res.status(404).json({ message: 'Saved trip not found' });
    }
    res.json({ message: 'Trip removed from saved list' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Remove multiple saved trips
// @route DELETE /api/saved-trips
// @access Private
export const removeMultipleSavedTrips = async (req, res) => {
  try {
    const { ids } = req.body;
    await SavedTrip.deleteMany({ _id: { $in: ids }, user: req.user._id });
    res.json({ message: 'Trips removed from saved list' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
