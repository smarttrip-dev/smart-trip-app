import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReviewsRatings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending'); // pending reviews that need a response
  const [expandedReview, setExpandedReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(null);

  const [pendingReviews, setPendingReviews] = useState([
    {
      id: 1,
      tripId: 'ST2024-ELL-8932',
      destination: 'Ella Hill Country',
      completedDate: 'Dec 13, 2024',
      thumbnail: '#34C759'
    },
    {
      id: 2,
      tripId: 'ST2024-NUW-7654',
      destination: 'Nuwara Eliya Tea Country',
      completedDate: 'Nov 08, 2024',
      thumbnail: '#764ba2'
    }
  ]);

  const [submittedReviews] = useState([
    {
      id: 1,
      tripId: 'ST2024-KND-5432',
      destination: 'Kandy Cultural Experience',
      completedDate: 'Oct 15, 2024',
      submittedDate: 'Oct 20, 2024',
      thumbnail: '#667eea',
      ratings: {
        overall: 5,
        accommodation: 5,
        transport: 4,
        activities: 5,
        valueForMoney: 5
      },
      title: 'Amazing Cultural Journey!',
      review: 'This was an absolutely wonderful trip! The Temple of the Tooth was breathtaking, and our guide was incredibly knowledgeable. The hotel exceeded expectations with great service and beautiful views. The cultural dance show was a highlight. Would definitely recommend to anyone visiting Sri Lanka!',
      wouldRecommend: true,
      photos: 3
    }
  ]);

  const [reviewForm, setReviewForm] = useState({
    overall: 0,
    accommodation: 0,
    transport: 0,
    activities: 0,
    valueForMoney: 0,
    title: '',
    review: '',
    wouldRecommend: null,
    photos: []
  });

  const [isDraft, setIsDraft] = useState(false);

  const ratingCategories = [
    { id: 'overall', label: 'Overall Experience', icon: '🌟' },
    { id: 'accommodation', label: 'Accommodation', icon: '🏨' },
    { id: 'transport', label: 'Transport', icon: '🚗' },
    { id: 'activities', label: 'Activities', icon: '🎭' },
    { id: 'valueForMoney', label: 'Value for Money', icon: '💰' }
  ];

  const handleStarClick = (category, rating) => {
    setReviewForm({ ...reviewForm, [category]: rating });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setReviewForm({ ...reviewForm, photos: [...reviewForm.photos, ...files] });
  };

  const removePhoto = (index) => {
    setReviewForm({
      ...reviewForm,
      photos: reviewForm.photos.filter((_, i) => i !== index)
    });
  };

  const handleSubmitReview = () => {
    if (reviewForm.overall === 0) {
      alert('Please provide an overall rating');
      return;
    }
    if (reviewForm.review.length < 50) {
      alert('Review must be at least 50 characters long');
      return;
    }
    if (reviewForm.wouldRecommend === null) {
      alert('Please indicate if you would recommend this trip');
      return;
    }

    alert('Review submitted successfully!');
    setShowReviewForm(null);
    setPendingReviews(pendingReviews.filter(r => r.id !== showReviewForm));
    resetForm();
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    alert('Review saved as draft');
  };

  const resetForm = () => {
    setReviewForm({
      overall: 0,
      accommodation: 0,
      transport: 0,
      activities: 0,
      valueForMoney: 0,
      title: '',
      review: '',
      wouldRecommend: null,
      photos: []
    });
  };

  const StarRating = ({ rating, onRate, readonly = false }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRate(star)}
            className={`text-2xl transition-all ${
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const getAverageRating = (ratings) => {
    const sum = ratings.overall + ratings.accommodation + ratings.transport + ratings.activities + ratings.valueForMoney;
    return (sum / 5).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      `}</style>

      {/* Top Navigation */}
      <nav className="bg-slate-900 border border-white/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/vendor/dashboard')} className="p-2 hover:bg-slate-800/50 rounded-lg">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <h1 className="text-xl font-bold text-slate-200">Reviews & Ratings</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-[#BFBD31] text-slate-950'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            Pending Reviews
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'pending'
                ? 'bg-slate-900 border border-white/10/20 text-white'
                : 'bg-gray-200 text-slate-300'
            }`}>
              {pendingReviews.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'submitted'
                ? 'bg-[#BFBD31] text-slate-950'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            Submitted Reviews
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'submitted'
                ? 'bg-slate-900 border border-white/10/20 text-white'
                : 'bg-gray-200 text-slate-300'
            }`}>
              {submittedReviews.length}
            </span>
          </button>
        </div>

        {/* Pending Reviews */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingReviews.length === 0 ? (
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
                <h3 className="text-xl font-bold text-slate-200 mb-2">No pending reviews</h3>
                <p className="text-slate-400">All your completed trips have been reviewed!</p>
              </div>
            ) : (
              pendingReviews.map(trip => (
                <div key={trip.id} className="bg-slate-900 border border-white/10 rounded-xl shadow-md overflow-hidden">
                  <div className="flex items-center gap-6 p-6">
                    <div className="w-32 h-32 rounded-xl flex-shrink-0" style={{ background: trip.thumbnail }}></div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{trip.destination}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                        <span>Trip ID: {trip.tripId}</span>
                        <span>•</span>
                        <span>Completed: {trip.completedDate}</span>
                      </div>
                      <p className="text-slate-300 mb-4">
                        How was your experience? Share your feedback to help other travelers!
                      </p>
                      <button
                        onClick={() => setShowReviewForm(trip.id)}
                        className="px-6 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31]"
                      >
                        Write Review
                      </button>
                    </div>
                  </div>

                  {/* Review Form */}
                  {showReviewForm === trip.id && (
                    <div className="border-t border-white/10 p-6 bg-slate-950">
                      <h4 className="text-lg font-bold text-white mb-6">Share Your Experience</h4>

                      {/* Star Ratings */}
                      <div className="space-y-4 mb-6">
                        {ratingCategories.map(category => (
                          <div key={category.id} className="flex items-center justify-between p-4 bg-slate-900 border border-white/10 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{category.icon}</span>
                              <span className="font-medium text-slate-200">{category.label}</span>
                            </div>
                            <StarRating
                              rating={reviewForm[category.id]}
                              onRate={(rating) => handleStarClick(category.id, rating)}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Review Title */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                          Review Title
                        </label>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          placeholder="e.g., Amazing Cultural Experience!"
                          className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                        />
                      </div>

                      {/* Detailed Review */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                          Detailed Review
                          <span className="text-slate-500 font-normal ml-2">(minimum 50 characters)</span>
                        </label>
                        <textarea
                          value={reviewForm.review}
                          onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                          rows={6}
                          placeholder="Share your experience in detail. What did you enjoy most? Any tips for future travelers?"
                          className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                        />
                        <p className="text-sm text-slate-400 mt-1">
                          {reviewForm.review.length}/50 characters
                        </p>
                      </div>

                      {/* Upload Photos */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                          Upload Photos (Optional)
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {reviewForm.photos.map((photo, index) => (
                            <div key={index} className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <label className="w-24 h-24 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#BFBD31] hover:bg-[#BFBD31]/10 transition-all">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                          </label>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Upload up to 5 photos to share your experience
                        </p>
                      </div>

                      {/* Would Recommend */}
                      <div className="mb-6 p-4 bg-slate-900 border border-white/10 rounded-lg">
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                          Would you recommend this trip to others?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={reviewForm.wouldRecommend === true}
                              onChange={() => setReviewForm({ ...reviewForm, wouldRecommend: true })}
                              className="w-5 h-5 text-[#BFBD31]"
                            />
                            <span className="text-slate-300 font-medium">Yes, definitely!</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={reviewForm.wouldRecommend === false}
                              onChange={() => setReviewForm({ ...reviewForm, wouldRecommend: false })}
                              className="w-5 h-5 text-[#BFBD31]"
                            />
                            <span className="text-slate-300 font-medium">No</span>
                          </label>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleSubmitReview}
                          className="px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]"
                        >
                          Submit Review
                        </button>
                        <button
                          onClick={handleSaveDraft}
                          className="px-6 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
                        >
                          Save as Draft
                        </button>
                        <button
                          onClick={() => {
                            setShowReviewForm(null);
                            resetForm();
                          }}
                          className="px-6 py-3 text-slate-400 hover:text-slate-200 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Submitted Reviews */}
        {activeTab === 'submitted' && (
          <div className="space-y-4">
            {submittedReviews.length === 0 ? (
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3 className="text-xl font-bold text-slate-200 mb-2">No submitted reviews</h3>
                <p className="text-slate-400">Complete a trip and share your experience!</p>
              </div>
            ) : (
              submittedReviews.map(review => (
                <div key={review.id} className="bg-slate-900 border border-white/10 rounded-xl shadow-md overflow-hidden">
                  <div className="flex items-start gap-6 p-6">
                    <div className="w-32 h-32 rounded-xl flex-shrink-0" style={{ background: review.thumbnail }}></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{review.destination}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <StarRating rating={review.ratings.overall} readonly />
                            <span className="text-sm font-semibold text-slate-300">
                              {getAverageRating(review.ratings)} / 5.0
                            </span>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-[#BFBD31] border border-[#BFBD31]/40 rounded-lg hover:bg-[#BFBD31]/10">
                          Edit Review
                        </button>
                      </div>

                      <h4 className="text-lg font-semibold text-white mb-2">{review.title}</h4>
                      
                      <p className={`text-slate-300 leading-relaxed mb-4 ${
                        expandedReview === review.id ? '' : 'line-clamp-3'
                      }`}>
                        {review.review}
                      </p>

                      {review.review.length > 200 && (
                        <button
                          onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                          className="text-sm text-[#BFBD31] hover:text-purple-700 font-medium mb-4"
                        >
                          {expandedReview === review.id ? 'Show Less' : 'Read More'}
                        </button>
                      )}

                      {review.photos > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          <span className="text-sm text-slate-400">{review.photos} photos attached</span>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm text-slate-400">
                        <span>Trip ID: {review.tripId}</span>
                        <span>•</span>
                        <span>Completed: {review.completedDate}</span>
                        <span>•</span>
                        <span>Reviewed: {review.submittedDate}</span>
                        <span>•</span>
                        <span className={review.wouldRecommend ? 'text-green-600 font-medium' : 'text-slate-400'}>
                          {review.wouldRecommend ? '✓ Recommended' : 'Not recommended'}
                        </span>
                      </div>

                      {/* Detailed Ratings */}
                      <button
                        onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                        className="mt-4 text-sm text-[#BFBD31] hover:text-purple-700 font-medium"
                      >
                        {expandedReview === review.id ? 'Hide Details' : 'View Detailed Ratings'}
                      </button>

                      {expandedReview === review.id && (
                        <div className="mt-4 p-4 bg-slate-950 rounded-lg space-y-3">
                          {ratingCategories.slice(1).map(category => (
                            <div key={category.id} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-300">
                                {category.icon} {category.label}
                              </span>
                              <StarRating rating={review.ratings[category.id]} readonly />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}