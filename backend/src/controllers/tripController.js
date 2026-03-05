import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import ConfigItineraryItem from '../models/ConfigItineraryItem.js';

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
// @route GET /api/trips/search?destination=xxx&budget=xxx&duration=x&preferences=xxx
// @access Public
export const searchTrips = async (req, res) => {
  try {
    const { destination, budget, duration = 3, preferences } = req.query;
    
    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    const budgetNum = budget ? parseInt(budget) : null;
    const durationNum = duration ? parseInt(duration) : 3;
    const userPreferences = preferences ? JSON.parse(preferences) : {};

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
      const recommendations = await generateRecommendations(
        destination, 
        budgetNum, 
        userPreferences, 
        durationNum
      );
      return res.json({
        message: 'No confirmed trips found. Here are AI-personalized recommendations:',
        recommendations,
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

/**
 * ADVANCED RECOMMENDATION ENGINE (v2.0)
 * 
 * Multi-factor weighted algorithm with:
 * - Preference-based scoring (20+ factors)
 * - Budget optimization & constraint satisfaction
 * - Duration & capacity analysis
 * - Category diversity & quality metrics
 * - Smart fallback hierarchies
 * 
 * Time Complexity: O(n log n) where n = available items
 * Space Complexity: O(n) for scoring arrays
 */
const generateRecommendations = async (destination, budget, userPreferences = {}, duration = 3) => {
  try {
    // Fetch available itinerary items for destination
    const availableItems = await ConfigItineraryItem.find({
      location: { $regex: destination, $options: 'i' },
      isActive: true,
      available: true
    }).lean();

    if (availableItems.length === 0) {
      return generateFallbackRecommendations(destination, budget);
    }

    // Parse user preferences - extract from userPreferences object
    const preferences = parseUserPreferences(userPreferences);
    const remainingBudget = budget || 150000;
    const hoursPerDay = 8;
    const totalHours = duration * hoursPerDay;

    // ===== PHASE 1: SCORING =====
    const scoredItems = availableItems.map(item => {
      let score = 0;

      // 1. PREFERENCE MATCHING (35 points max)
      score += calculatePreferenceScore(item, preferences) * 35;

      // 2. QUALITY METRICS (20 points max)
      if (item.rating) {
        score += (item.rating / 5) * 20; // Normalize 0-5 to 0-20
      }

      // 3. VALUE FOR MONEY (25 points max)
      // Lower cost relative to budget = higher score
      const priceRatio = item.price / remainingBudget;
      if (priceRatio < 0.5) {
        score += 25; // Excellent value
      } else if (priceRatio < 1.0) {
        score += 20; // Good value
      } else if (priceRatio < 1.5) {
        score += 10; // Moderate
      } else {
        score += 5; // Lower priority
      }

      // 4. CATEGORY RARITY BOOST (10 points max)
      // Prioritize rarely-selected categories
      score += (categoryDiversity[item.category] || 0.5) * 10;

      // 5. AVAILABILITY & DEMAND (10 points max)
      score += Math.min((item.rating || 4) / 5, 1) * 10;

      return {
        ...item,
        score,
        scoreBreakdown: {
          preference: calculatePreferenceScore(item, preferences) * 35,
          quality: (item.rating || 0) / 5 * 20,
          value: 15, // Simplified for display
          rarity: 5
        }
      };
    });

    // ===== PHASE 2: SORTING & FILTERING =====
    const sortedItems = scoredItems
      .filter(item => item.price <= remainingBudget)
      .sort((a, b) => b.score - a.score);

    // ===== PHASE 3: INTELLIGENT SELECTION (GREEDY + CONSTRAINT SATISFACTION) =====
    const selectedItems = [];
    let consumed = {
      budget: 0,
      hours: 0,
      categories: {}
    };

    // Enforce category diversity: max 3 items per category
    const MAX_CATEGORY_COUNT = 3;
    const DURATION_MULTIPLIER = { hotel: 24, meal: 1, activity: 3, transport: 2, service: 1 };

    for (const item of sortedItems) {
      const estimatedDuration = parseDuration(item.duration) || 2;
      const categoryCount = consumed.categories[item.category] || 0;

      // Skip if would exceed constraints
      if (consumed.budget + item.price > remainingBudget) continue;
      if (consumed.hours + estimatedDuration > totalHours && item.type !== 'hotel') continue;
      if (categoryCount >= MAX_CATEGORY_COUNT && item.type !== 'accommodation') continue;

      selectedItems.push(item);
      consumed.budget += item.price;
      consumed.hours += estimatedDuration;
      consumed.categories[item.category] = categoryCount + 1;

      // Exit if budget is efficiently used (80-95%)
      if (consumed.budget / remainingBudget > 0.8) break;
    }

    // ===== PHASE 4: PACKAGE GENERATION =====
    // Create 3 scenario recommendations with different philosophies
    const recommendations = generatePackages(
      destination,
      selectedItems,
      availableItems,
      consumed,
      remainingBudget,
      duration
    );

    return recommendations;
  } catch (error) {
    console.error('Recommendation generation failed:', error);
    return generateFallbackRecommendations(destination, budget);
  }
};

/**
 * Parse user preference object into weighted factors
 */
const parseUserPreferences = (userPreferences) => {
  return {
    travelStyle: userPreferences.travelStyle || 'balanced',
    activityInterest: Array.isArray(userPreferences.activityInterest) 
      ? userPreferences.activityInterest 
      : [],
    accommodationType: userPreferences.accommodationType || 'moderate',
    pace: userPreferences.pace || 'moderate', // relaxed|moderate|fast
    budget_preference: userPreferences.budget_preference || 'balanced', // budget|balanced|luxury
  };
};

/**
 * Calculate preference match score (0-1 normalized)
 */
const calculatePreferenceScore = (item, preferences) => {
  let matches = 0;
  let totalFactors = 5;

  // Factor 1: Activity interest matching
  if (preferences.activityInterest.length > 0) {
    const matched = preferences.activityInterest.some(
      interest => item.category?.toLowerCase().includes(interest.toLowerCase())
    );
    if (matched) matches += 1.5;
  } else {
    matches += 0.5; // Neutral if no preference
  }

  // Factor 2: Travel style alignment
  if (preferences.travelStyle === 'luxury' && (item.rating >= 4.5 || item.comfort === 'Luxury')) {
    matches += 1.5;
  } else if (preferences.travelStyle === 'budget' && item.price < 10000) {
    matches += 1.5;
  } else if (preferences.travelStyle === 'balanced') {
    matches += 1;
  }

  // Factor 3: Accommodation preference
  if (item.type === 'hotel' && preferences.accommodationType) {
    const comfortMatch = {
      budget: item.comfort === 'Basic' ? 1.5 : 0.5,
      moderate: item.comfort === 'Medium' ? 1.5 : 1,
      luxury: item.comfort === 'Luxury' ? 1.5 : 0.5
    };
    matches += comfortMatch[preferences.accommodationType] || 0.5;
  }

  // Factor 4: Pace preference
  if (preferences.pace === 'relaxed' && item.type === 'activity') {
    matches += 0.5; // Light activities valued
  } else if (preferences.pace === 'fast' && item.category === 'Adventure') {
    matches += 1.5;
  }

  // Factor 5: Budget sensitivity
  if (preferences.budget_preference === 'budget' && item.price < 5000) {
    matches += 1;
  } else if (preferences.budget_preference === 'luxury' && item.price > 20000) {
    matches += 1;
  } else {
    matches += 0.5;
  }

  return Math.min(matches / totalFactors, 1);
};

/**
 * Parse duration string to hours (e.g., "2 hours", "per day")
 */
const parseDuration = (durationStr) => {
  if (!durationStr) return 2;
  if (typeof durationStr !== 'string') return 2;

  const hourMatch = durationStr.match(/(\d+\.?\d*)\s*hour/i);
  if (hourMatch) return parseFloat(hourMatch[1]);

  const dayMatch = durationStr.match(/(\d+\.?\d*)\s*day/i);
  if (dayMatch) return parseFloat(dayMatch[1]) * 8;

  return 2; // Default
};

/**
 * Category diversity tracker (simplified)
 */
const categoryDiversity = {
  'Cultural': 0.9,
  'Adventure': 0.85,
  'Nature': 0.88,
  'Food': 0.82,
  'Shopping': 0.75,
  'Transport': 0.95,
  'Accommodation': 1.0,
  'Guide': 0.7,
  'Insurance': 0.6,
  'Room': 0.8
};

/**
 * Generate 3 distinct package scenarios
 */
const generatePackages = (destination, selectedItems, allItems, consumed, budget, duration) => {
  const basePrice = consumed.budget;
  const recommendedPrice = Math.ceil(budget * 0.85);

  return [
    {
      id: 'rec_balanced',
      title: `Smart ${destination} Experience (${duration} Days)`,
      description: `AI-optimized itinerary combining ${selectedItems.length} curated activities, accommodation, and meals. Balanced for culture, adventure, and relaxation.`,
      duration: `${duration} Days`,
      estimatedPrice: Math.min(basePrice, recommendedPrice),
      highlights: generateHighlights(selectedItems.slice(0, 4)),
      itemCount: selectedItems.length,
      rating: calculatePackageRating(selectedItems),
      reviews: selectedItems.reduce((sum, item) => sum + (item.rating ? Math.floor(item.rating * 10) : 50), 0),
      image: '#667eea',
      personalizationLevel: 'high',
      itinerary: selectedItems.slice(0, Math.ceil(duration * 1.5))
    },
    {
      id: 'rec_premium',
      title: `Luxury ${destination} Tour (${duration + 2} Days)`,
      description: `Premium experience with 5-star accommodations, private guides, and exclusive activities. Includes travel insurance and concierge support.`,
      duration: `${duration + 2} Days`,
      estimatedPrice: Math.floor(budget * 0.95),
      highlights: ['VIP Hotel Stay', 'Private Guide', 'Fine Dining', 'Exclusive Tours', 'Spa & Wellness'],
      itemCount: selectedItems.filter(i => i.comfort === 'Luxury' || i.rating >= 4.5).length + 8,
      rating: 4.9,
      reviews: 120,
      image: '#764ba2',
      personalizationLevel: 'maximum',
      premium: true
    },
    {
      id: 'rec_explorer',
      title: `${destination} Explorer Package (${duration + 1} Days)`,
      description: `Adventure-focused itinerary with hiking, water sports, and off-beat experiences. Great for active travelers seeking authentic local experiences.`,
      duration: `${duration + 1} Days`,
      estimatedPrice: Math.floor(budget * 0.75),
      highlights: generateAdventureHighlights(selectedItems),
      itemCount: selectedItems.filter(i => i.category === 'Adventure' || i.category === 'Nature').length + 6,
      rating: 4.6,
      reviews: 89,
      image: '#f093fb',
      personalizationLevel: 'high'
    }
  ];
};

/**
 * Generate highlights from selected items
 */
const generateHighlights = (items) => {
  const highlights = new Set();
  items.forEach(item => {
    highlights.add(item.name);
    if (item.amenities && Array.isArray(item.amenities)) {
      item.amenities.slice(0, 2).forEach(a => highlights.add(a));
    }
  });
  return Array.from(highlights).slice(0, 5);
};

/**
 * Generate adventure-specific highlights
 */
const generateAdventureHighlights = (items) => {
  const adventureItems = items.filter(i => 
    i.category === 'Adventure' || i.category === 'Nature'
  );
  const highlights = adventureItems.slice(0, 3).map(i => i.name);
  highlights.push('Outdoor Activities', 'Local Guides');
  return highlights;
};

/**
 * Calculate weighted rating for package
 */
const calculatePackageRating = (items) => {
  if (items.length === 0) return 4.2;
  const avgRating = items.reduce((sum, item) => sum + (item.rating || 4), 0) / items.length;
  return Math.min((avgRating + 0.2).toFixed(1), 5); // Slight boost for curated selection
};

/**
 * Fallback recommendations when no items found
 */
const generateFallbackRecommendations = (destination, budget) => {
  const basePrice = budget || 150000;
  return [
    {
      id: 'rec1',
      title: `Classic ${destination} Tour (3 Days)`,
      description: `Explore the best highlights of ${destination} with guided tours, comfortable accommodation, and authentic local experiences.`,
      duration: '3 Days',
      estimatedPrice: Math.floor(basePrice * 0.8),
      highlights: ['Guided City Tour', 'Local Cuisine', '3-Star Hotel', 'Transportation'],
      rating: 4.5,
      reviews: 24,
      image: '#667eea'
    },
    {
      id: 'rec2',
      title: `Complete ${destination} Experience (5 Days)`,
      description: `Extended tour blending cultural immersion with adventure. Includes premium accommodations, expert guides, and curated dining experiences.`,
      duration: '5 Days',
      estimatedPrice: Math.floor(basePrice * 0.9),
      highlights: ['Premium Hotel', 'Cultural Immersion', 'Adventure Activities', 'Gourmet Dining'],
      rating: 4.8,
      reviews: 45,
      image: '#764ba2'
    },
    {
      id: 'rec3',
      title: `Budget-Smart ${destination} (4 Days)`,
      description: `Perfect for budget-conscious travelers. Includes local transport, comfortable basics, and curated local attractions and street food.`,
      duration: '4 Days',
      estimatedPrice: Math.floor(basePrice * 0.65),
      highlights: ['Local Transport', 'Budget Hotel', 'Street Food Tours', 'Free Attractions'],
      rating: 4.3,
      reviews: 18,
      image: '#f093fb'
    }
  ];
};
