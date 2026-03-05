import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SavedTrips() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false); // TODO: limit to 3 trips max

  const [savedTrips, setSavedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedTrips = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      if (!userInfo?.token) {
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        const { data } = await axios.get('/api/saved-trips', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setSavedTrips(data.map(t => ({ ...t, id: t._id })));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load saved trips');
      } finally {
        setLoading(false);
      }
    };
    fetchSavedTrips();
  }, [navigate]);

  const toggleTripSelection = (tripId) => {
    if (selectedTrips.includes(tripId)) {
      setSelectedTrips(selectedTrips.filter(id => id !== tripId));
    } else {
      if (selectedTrips.length < 3) {
        setSelectedTrips([...selectedTrips, tripId]);
      } else {
        alert('You can only compare up to 3 trips at a time');
      }
    }
  };

  const selectAllTrips = () => {
    if (selectedTrips.length === savedTrips.length) {
      setSelectedTrips([]);
    } else {
      setSelectedTrips(savedTrips.map(t => t.id));
    }
  };

  const removeSelected = async () => {
    if (confirm(`Remove ${selectedTrips.length} trip(s) from saved?`)) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      try {
        await axios.delete('/api/saved-trips', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          data: { ids: selectedTrips },
        });
        setSavedTrips(savedTrips.filter(t => !selectedTrips.includes(t.id)));
        setSelectedTrips([]);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove trips');
      }
    }
  };

  const removeTrip = async (tripId) => {
    if (confirm('Remove this trip from saved?')) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      try {
        await axios.delete(`/api/saved-trips/${tripId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setSavedTrips(savedTrips.filter(t => t.id !== tripId));
        setSelectedTrips(selectedTrips.filter(id => id !== tripId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove trip');
      }
    }
  };

  const handleShare = (trip) => {
    alert(`Sharing ${trip.destination}...`);
  };

  const handleBookNow = (trip) => {
    navigate('/itinerary');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .trip-card { transition: transform 0.2s, box-shadow 0.2s; }
        .trip-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
      `}</style>

      {/* Top Navigation */}
      <nav className="bg-slate-900 border border-white/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800/50 rounded-lg">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-200">Saved Trips</h1>
                <p className="text-sm text-slate-400">{savedTrips.length} saved itineraries</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#BFBD31]/15 text-[#BFBD31]' : 'text-slate-400 hover:bg-slate-800/50'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#BFBD31]/15 text-[#BFBD31]' : 'text-slate-400 hover:bg-slate-800/50'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BFBD31] mx-auto mb-4"></div>
              <p className="text-slate-400">Loading saved trips...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg">
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
        <>
        {/* Bulk Actions */}
        {savedTrips.length > 0 && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTrips.length === savedTrips.length && savedTrips.length > 0}
                    onChange={selectAllTrips}
                    className="w-5 h-5 text-[#BFBD31] rounded"
                  />
                  <span className="text-sm font-medium text-slate-300">
                    Select All ({savedTrips.length})
                  </span>
                </label>
                {selectedTrips.length > 0 && (
                  <span className="text-sm text-[#BFBD31] font-medium">
                    {selectedTrips.length} selected
                  </span>
                )}
              </div>
              {selectedTrips.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCompareModal(true)}
                    disabled={selectedTrips.length < 2 || selectedTrips.length > 3}
                    className="px-4 py-2 text-sm font-medium text-[#BFBD31] border border-[#BFBD31]/40 rounded-lg hover:bg-[#BFBD31]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Compare Selected ({selectedTrips.length}/3)
                  </button>
                  <button
                    onClick={removeSelected}
                    className="px-4 py-2 text-sm font-medium text-red-400 border border-red-300 rounded-lg hover:bg-red-500/10"
                  >
                    Remove Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trips Grid/List */}
        {savedTrips.length === 0 ? (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
            <h3 className="text-xl font-bold text-slate-200 mb-2">No saved trips yet</h3>
            <p className="text-slate-400 mb-6">Start exploring destinations and save trips for later!</p>
            <button className="px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]">
              Explore Destinations
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {savedTrips.map(trip => {
              const isSelected = selectedTrips.includes(trip.id);
              
              return (
                <div
                  key={trip.id}
                  className={`trip-card bg-slate-900 border border-white/10 rounded-xl shadow-md overflow-hidden ${
                    isSelected ? 'ring-2 ring-lime-500' : ''
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-48" style={{ background: trip.thumbnail }}>
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      <span className="px-3 py-1 bg-slate-900 border border-white/10/90 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-200">
                        {trip.duration}
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTripSelection(trip.id)}
                        className="w-5 h-5 text-[#BFBD31] rounded bg-slate-900 border border-white/10"
                      />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-1">
                        {trip.destination}
                      </h3>
                      <p className="text-white/90 text-sm drop-shadow-lg">{trip.location}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Estimated Cost</p>
                        <p className="text-2xl font-bold text-[#BFBD31]">
                          LKR {trip.estimatedCost.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Saved On</p>
                        <p className="text-sm font-semibold text-slate-200">{trip.dateSaved}</p>
                      </div>
                    </div>

                    {/* Quick Preview */}
                    <div className="mb-4 p-3 bg-slate-950 rounded-lg">
                      <p className="text-xs font-semibold text-slate-400 mb-2">Highlights</p>
                      <ul className="space-y-1">
                        {trip.highlights.slice(0, 3).map((highlight, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-[#BFBD31]">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                      </svg>
                      <span>{trip.accommodationType}</span>
                      <span className="text-gray-400">•</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      <span>{trip.travelers}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleBookNow(trip)}
                        className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31] text-sm"
                      >
                        Book Now
                      </button>
                      <button
                        className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg font-medium hover:bg-slate-950 text-sm"
                      >
                        View Details
                      </button>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleShare(trip)}
                        className="flex-1 px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                        </svg>
                        Share
                      </button>
                      <button
                        onClick={() => removeTrip(trip.id)}
                        className="px-4 py-2 border border-red-300 text-red-400 rounded-lg hover:bg-red-500/10 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>
        )}
      </div>

      {/* Compare Modal */}
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Compare Trips</h2>
              <button 
                onClick={() => setShowCompareModal(false)}
                className="p-2 hover:bg-slate-800/50 rounded-lg"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Feature</th>
                    {savedTrips.filter(t => selectedTrips.includes(t.id)).map(trip => (
                      <th key={trip.id} className="px-4 py-3 text-left">
                        <div className="font-bold text-white">{trip.destination}</div>
                        <div className="text-xs text-slate-400 font-normal">{trip.location}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm font-medium text-slate-300">Cost</td>
                    {savedTrips.filter(t => selectedTrips.includes(t.id)).map(trip => (
                      <td key={trip.id} className="px-4 py-3 text-sm text-[#BFBD31] font-semibold">
                        LKR {trip.estimatedCost.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm font-medium text-slate-300">Duration</td>
                    {savedTrips.filter(t => selectedTrips.includes(t.id)).map(trip => (
                      <td key={trip.id} className="px-4 py-3 text-sm text-white">{trip.duration}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm font-medium text-slate-300">Accommodation</td>
                    {savedTrips.filter(t => selectedTrips.includes(t.id)).map(trip => (
                      <td key={trip.id} className="px-4 py-3 text-sm text-white">{trip.accommodationType}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm font-medium text-slate-300">Travelers</td>
                    {savedTrips.filter(t => selectedTrips.includes(t.id)).map(trip => (
                      <td key={trip.id} className="px-4 py-3 text-sm text-white">{trip.travelers}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-slate-300">Highlights</td>
                    {savedTrips.filter(t => selectedTrips.includes(t.id)).map(trip => (
                      <td key={trip.id} className="px-4 py-3">
                        <ul className="space-y-1">
                          {trip.highlights.map((h, idx) => (
                            <li key={idx} className="text-sm text-slate-300">• {h}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-6 py-2 border border-white/20 text-slate-300 rounded-lg font-medium hover:bg-slate-950"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}