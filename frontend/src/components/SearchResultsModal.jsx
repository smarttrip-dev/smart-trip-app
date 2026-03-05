import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function SearchResultsModal({ 
  isOpen, 
  onClose, 
  searchParams,
  destinations 
}) {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !searchParams) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/trips/search/available', {
          params: {
            destination: searchParams.destination,
            budget: searchParams.budget
          }
        });
        setResults(response.data);
      } catch (err) {
        console.error('Search failed:', err);
        setError(err.response?.data?.message || 'Failed to search trips');
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [isOpen, searchParams]);

  if (!isOpen) return null;

  const handleSelectTrip = (trip) => {
    const selectedDest = destinations.find(d => d.name.toLowerCase() === searchParams.destination.toLowerCase());
    
    navigate('/itinerary', {
      state: {
        destination: searchParams.destination + ' Tour',
        location: searchParams.destination,
        budget: searchParams.budget,
        travelers: searchParams.travelers,
        duration: searchParams.duration,
        dates: searchParams.dates,
        selectedDestination: selectedDest,
      }
    });
    onClose();
  };

  const handleSelectRecommendation = (rec) => {
    const selectedDest = destinations.find(d => d.name.toLowerCase() === searchParams.destination.toLowerCase());
    
    navigate('/itinerary', {
      state: {
        destination: rec.title,
        location: searchParams.destination,
        budget: rec.estimatedPrice,
        travelers: searchParams.travelers,
        duration: rec.duration,
        dates: searchParams.dates,
        selectedDestination: selectedDest,
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full border border-white/10 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Search Results</h2>
            <p className="text-slate-400 text-sm mt-1">
              {searchParams.destination} • Budget: LKR {searchParams.budget.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-200px)] p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block">
                  <svg className="w-12 h-12 text-[#BFBD31] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-slate-300 mt-4">Searching available trips...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300">{error}</p>
            </div>
          ) : (
            <div>
              {/* Confirmed Trips */}
              {results?.trips && results.trips.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-[#BFBD31]">✓</span> Confirmed Trips
                  </h3>
                  <div className="grid gap-4">
                    {results.trips.map((trip) => (
                      <div
                        key={trip.id}
                        className="bg-slate-800/50 border border-white/10 rounded-xl p-5 hover:border-[#BFBD31]/50 transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{trip.destination}</h4>
                            <p className="text-slate-400 text-sm">
                              {trip.duration} • {trip.travelers.adults} adult{trip.travelers.adults !== 1 ? 's' : ''}
                              {trip.travelers.children > 0 && `, ${trip.travelers.children} child${trip.travelers.children !== 1 ? 'ren' : ''}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#BFBD31]">
                              LKR {trip.totalCost.toLocaleString()}
                            </p>
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded inline-block mt-1">
                              Confirmed
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mb-4">
                          <span className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-full">
                            From {trip.dates.from}
                          </span>
                          <span className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-full">
                            To {trip.dates.to}
                          </span>
                        </div>
                        <button
                          onClick={() => handleSelectTrip(trip)}
                          className="w-full bg-[#BFBD31] hover:bg-[#d4d140] text-slate-900 font-semibold py-2 rounded-lg transition"
                        >
                          Proceed with This Trip
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {(results?.recommendations || results?.trips?.length === 0) && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-400">👎</span> Recommended Packages
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {results?.message || 'Customize these popular packages for your trip'}
                  </p>
                  <div className="grid gap-4">
                    {(results?.recommendations || []).map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-5 hover:border-[#BFBD31]/50 transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white">{rec.title}</h4>
                            <p className="text-slate-400 text-sm mt-2">{rec.description}</p>
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {rec.highlights.map((h, idx) => (
                                <span key={idx} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded">
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right md:flex-shrink-0">
                            <p className="text-2xl font-bold text-[#BFBD31]">
                              LKR {rec.estimatedPrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{rec.duration}</p>
                            <div className="flex items-center gap-1 mt-2 justify-end text-yellow-400">
                              <span className="text-sm">⭐ {rec.rating}</span>
                              <span className="text-xs text-slate-400">({rec.reviews})</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectRecommendation(rec)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                        >
                          Customize & Book
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 bg-slate-800/50">
          <button
            onClick={onClose}
            className="w-full text-slate-300 hover:text-white py-2 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
