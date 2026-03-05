import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function TripDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedDay, setSelectedDay] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      if (!userInfo?.token) {
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/trips/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Normalize & provide fallbacks for optional nested fields
        setTripData({
          ...data,
          id: data.tripId || data._id,
          name: data.destination,
          dates: {
            checkIn: data.dates?.from || '',
            checkOut: data.dates?.to || '',
            duration: data.duration || '',
          },
          costBreakdown: data.costBreakdown || {
            accommodation: 0, transport: 0, activities: 0,
            meals: 0, addOns: 0, subtotal: data.totalCost || 0,
            taxes: 0, serviceFee: 0, total: data.totalCost || 0,
          },
          vendors: data.vendors || {},
          timeline: data.timeline || [],
          itinerary: data.itinerary || [],
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrip();
  }, [id, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'rejected': return 'red';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };

  const getItemIcon = (type) => {
    const icons = {
      hotel: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      transport: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      activity: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
      meal: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      special: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
    };
    return icons[type] || icons.activity;
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadPDF = () => {
    alert('Downloading complete itinerary as PDF...');
  };

  const handleShare = (method) => {
    alert(`Sharing via ${method}...`);
    setShowShareModal(false);
  };

  const handleAddToCalendar = () => {
    alert('Adding trip to calendar...');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BFBD31] mx-auto mb-4"></div>
        <p className="text-slate-400">Loading trip details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => navigate('/my-trips')} className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg">
          Back to My Trips
        </button>
      </div>
    </div>
  );

  if (!tripData) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .timeline-line { position: relative; }
        .timeline-line::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 30px;
          bottom: -20px;
          width: 2px;
          background: linear-gradient(to bottom, #34C759 0%, #34C759 50%, #E5E7EB 50%, #E5E7EB 100%);
        }
        .timeline-line:last-child::before { display: none; }
      `}</style>

      {/* Top Navigation */}
      <nav className="bg-slate-900 border border-white/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/my-trips')} className="p-2 hover:bg-slate-800/50 rounded-lg">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-200">Trip Details</h1>
                <p className="text-sm text-slate-400">{tripData.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDownloadPDF}
                className="px-4 py-2 text-sm font-medium text-[#BFBD31] hover:bg-[#BFBD31]/10 rounded-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Download PDF
              </button>
              <button 
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 rounded-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-white">{tripData.name}</h1>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold bg-${getStatusColor(tripData.status)}-100 text-${getStatusColor(tripData.status)}-700`}>
                  {tripData.status.charAt(0).toUpperCase() + tripData.status.slice(1)}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  <span className="font-medium">Booking ID:</span> {tripData.id}
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="font-medium">{tripData.dates.checkIn} - {tripData.dates.checkOut}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="font-medium">{tripData.dates.duration}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-1">Total Cost</p>
              <p className="text-3xl font-bold text-[#BFBD31]">LKR {tripData.totalCost.toLocaleString()}</p>
              <p className="text-sm text-green-600 font-medium mt-1">✓ Paid</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-sm text-slate-400">
            Last updated: {tripData.lastUpdated}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Status Timeline */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-200 mb-6">Booking Status</h2>
              <div className="space-y-4">
                {tripData.timeline.map((item, index) => (
                  <div key={index} className="timeline-line flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'current' ? 'bg-[#BFBD31] text-slate-950 animate-pulse' :
                      'bg-gray-300'
                    }`}>
                      {item.status === 'completed' ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      ) : item.status === 'current' ? (
                        <div className="w-3 h-3 bg-slate-900 border border-white/10 rounded-full"></div>
                      ) : (
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <h3 className={`font-semibold mb-1 ${
                        item.status === 'completed' || item.status === 'current' ? 'text-white' : 'text-slate-500'
                      }`}>
                        {item.step}
                      </h3>
                      {item.date && (
                        <p className="text-sm text-slate-400">{item.date}</p>
                      )}
                      {item.status === 'current' && (
                        <p className="text-sm text-[#BFBD31] font-medium mt-1">In Progress</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day-by-Day Itinerary */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-200 mb-6">Complete Itinerary</h2>

              {/* Day Selector */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tripData.itinerary.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      selectedDay === day.day
                        ? 'bg-[#BFBD31] text-slate-950'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-gray-200'
                    }`}
                  >
                    Day {day.day}
                    <span className="block text-xs mt-1 opacity-80">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Day Content */}
              {tripData.itinerary.filter(d => d.day === selectedDay).map((day) => (
                <div key={day.day} className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white">{day.date}</h3>
                  </div>

                  {day.sections.map((section, sectionIdx) => (
                    <div key={sectionIdx} className="border-l-4 border-[#BFBD31] pl-6">
                      <h4 className="text-lg font-bold text-[#BFBD31] mb-4">{section.time}</h4>
                      <div className="space-y-4">
                        {section.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="bg-slate-950 rounded-lg p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                item.type === 'hotel' ? 'bg-blue-100' :
                                item.type === 'transport' ? 'bg-green-100' :
                                item.type === 'activity' ? 'bg-[#BFBD31]/15' :
                                item.type === 'meal' ? 'bg-orange-100' :
                                'bg-yellow-100'
                              }`}>
                                <svg className={`w-5 h-5 ${
                                  item.type === 'hotel' ? 'text-[#BFBD31]' :
                                  item.type === 'transport' ? 'text-green-600' :
                                  item.type === 'activity' ? 'text-[#BFBD31]' :
                                  item.type === 'meal' ? 'text-orange-600' :
                                  'text-yellow-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getItemIcon(item.type)}/>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h5 className="font-bold text-white mb-2">{item.name}</h5>
                                
                                {/* Hotel Details */}
                                {item.type === 'hotel' && (
                                  <div className="space-y-2 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <p className="text-slate-400">📍 {item.details.address}</p>
                                        <p className="text-slate-400">📞 {item.details.phone}</p>
                                        <p className="text-slate-400">✉️ {item.details.email}</p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400">🛏️ {item.details.roomType}</p>
                                        <p className="text-slate-400">🍽️ {item.details.mealPlan}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                      <span className="px-2 py-1 bg-green-100 text-green-300 text-xs font-semibold rounded">
                                        ✓ Confirmed
                                      </span>
                                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs font-medium rounded">
                                        Code: {item.details.confirmationCode}
                                      </span>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                      <button className="px-3 py-1.5 bg-[#BFBD31] text-slate-950 text-xs rounded-lg hover:bg-[#BFBD31]">
                                        View on Map
                                      </button>
                                      <button className="px-3 py-1.5 border border-white/20 text-slate-300 text-xs rounded-lg hover:bg-slate-950">
                                        Contact Hotel
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Transport Details */}
                                {item.type === 'transport' && (
                                  <div className="space-y-2 text-sm">
                                    <p className="text-slate-300">🚗 {item.details.vehicleType}</p>
                                    <p className="text-slate-300">🕐 Pickup: {item.details.pickupTime}</p>
                                    <p className="text-slate-300">📍 From: {item.details.pickupLocation}</p>
                                    <p className="text-slate-300">📍 To: {item.details.dropoffLocation}</p>
                                    <p className="text-slate-300">⏱️ Duration: {item.details.duration}</p>
                                    {item.details.driverName && (
                                      <>
                                        <p className="text-slate-300">👤 Driver: {item.details.driverName}</p>
                                        <p className="text-slate-300">📞 {item.details.driverPhone}</p>
                                      </>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                      <span className="px-2 py-1 bg-green-100 text-green-300 text-xs font-semibold rounded">
                                        ✓ Confirmed
                                      </span>
                                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs font-medium rounded">
                                        Code: {item.details.confirmationCode}
                                      </span>
                                    </div>
                                    <button className="px-3 py-1.5 bg-[#BFBD31] text-slate-950 text-xs rounded-lg hover:bg-[#BFBD31]">
                                      View Route
                                    </button>
                                  </div>
                                )}

                                {/* Activity Details */}
                                {item.type === 'activity' && (
                                  <div className="space-y-2 text-sm">
                                    <p className="text-slate-300">🕐 Time: {item.details.time}</p>
                                    <p className="text-slate-300">⏱️ Duration: {item.details.duration}</p>
                                    <p className="text-slate-300">📍 Meeting Point: {item.details.meetingPoint}</p>
                                    {item.details.contactPerson && (
                                      <>
                                        <p className="text-slate-300">👤 Contact: {item.details.contactPerson}</p>
                                        <p className="text-slate-300">📞 {item.details.contactPhone}</p>
                                      </>
                                    )}
                                    <div className="mt-2">
                                      <p className="font-semibold text-slate-200 mb-1">What's Included:</p>
                                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                                        {item.details.whatsIncluded.map((inclusion, i) => (
                                          <li key={i}>{inclusion}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                      <span className="px-2 py-1 bg-green-100 text-green-300 text-xs font-semibold rounded">
                                        ✓ Confirmed
                                      </span>
                                    </div>
                                    <button className="px-3 py-1.5 bg-[#BFBD31] text-slate-950 text-xs rounded-lg hover:bg-[#BFBD31]">
                                      View Activity Details
                                    </button>
                                  </div>
                                )}

                                {/* Meal Details */}
                                {item.type === 'meal' && (
                                  <div className="space-y-2 text-sm">
                                    <p className="text-slate-300">🍽️ {item.details.restaurant}</p>
                                    <p className="text-slate-300">🕐 Time: {item.details.time}</p>
                                    <p className="text-slate-300">📍 {item.details.address}</p>
                                    <p className="text-slate-300">📞 {item.details.phone}</p>
                                    <p className="text-slate-300">🥗 {item.details.mealType}</p>
                                  </div>
                                )}

                                {/* Special Details */}
                                {item.type === 'special' && (
                                  <div className="space-y-2 text-sm">
                                    <p className="text-slate-300">🕐 Time: {item.details.time}</p>
                                    <p className="text-slate-300">📍 Location: {item.details.location}</p>
                                    <p className="text-slate-300">🎉 Arrangements: {item.details.arrangements}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Interactive Map */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-200 mb-4">Trip Route & Locations</h2>
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl h-96 flex items-center justify-center mb-4">
                <div className="text-center">
                  <svg className="w-16 h-16 text-[#BFBD31] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                  <p className="text-slate-300 font-medium">Interactive Map</p>
                  <p className="text-sm text-slate-400">All locations and routes</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31]">
                  Get Directions to Hotel
                </button>
                <button className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg font-medium hover:bg-slate-950">
                  Download Offline Map
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={handleDownloadPDF}
                  className="w-full px-4 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Download Itinerary
                </button>
                <button className="w-full px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-medium hover:bg-slate-950 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  Print Itinerary
                </button>
                <button 
                  onClick={handleAddToCalendar}
                  className="w-full px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-medium hover:bg-slate-950 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Add to Calendar
                </button>

                {tripData.status === 'confirmed' && (
                  <>
                    <button className="w-full px-4 py-3 border border-green-300 text-green-600 rounded-lg font-medium hover:bg-green-500/10 flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Start Expense Tracking
                    </button>
                    <button className="w-full px-4 py-3 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg font-medium hover:bg-[#d4d235]/10 flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      Upload Trip Photos
                    </button>
                  </>
                )}

                {tripData.status === 'pending' && (
                  <button className="w-full px-4 py-3 border border-orange-300 text-orange-600 rounded-lg font-medium hover:bg-orange-50 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Modify Booking
                  </button>
                )}

                <button 
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-4 py-3 border border-red-300 text-red-400 rounded-lg font-medium hover:bg-red-500/10 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Cancel Booking
                </button>

                <button className="w-full px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-medium hover:bg-slate-950 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  Report Issue
                </button>

                <button className="w-full px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-medium hover:bg-slate-950 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  Contact Support
                </button>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Cost Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Accommodation</span>
                  <span className="font-semibold">LKR {tripData.costBreakdown.accommodation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transport</span>
                  <span className="font-semibold">LKR {tripData.costBreakdown.transport.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Activities</span>
                  <span className="font-semibold">LKR {tripData.costBreakdown.activities.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Meals</span>
                  <span className="font-semibold">LKR {tripData.costBreakdown.meals.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Add-ons</span>
                  <span className="font-semibold">LKR {tripData.costBreakdown.addOns.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-semibold">LKR {tripData.costBreakdown.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxes (12%)</span>
                  <span className="font-semibold">LKR {tripData.costBreakdown.taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Service Fee</span>
                  <span className="font-semibold">LKR {tripData.costBreakdown.serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t-2 border-white/20">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-bold text-[#BFBD31] text-lg">LKR {tripData.costBreakdown.total.toLocaleString()}</span>
                </div>
              </div>
              <button className="w-full px-4 py-2 border border-white/20 text-slate-300 rounded-lg font-medium hover:bg-slate-950 text-sm">
                Download Invoice
              </button>
            </div>

            {/* Traveler Information */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Travelers</h3>
              <div className="space-y-3">
                {tripData.travelers.map((traveler, index) => (
                  <div key={index} className="pb-3 border-b border-white/10 last:border-0">
                    <p className="font-semibold text-white">{traveler.name}</p>
                    <p className="text-sm text-slate-400">{traveler.type}</p>
                    {traveler.email && <p className="text-sm text-slate-400">✉️ {traveler.email}</p>}
                    {traveler.phone && <p className="text-sm text-slate-400">📞 {traveler.phone}</p>}
                  </div>
                ))}
              </div>
              {tripData.specialRequests && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm font-semibold text-slate-300 mb-1">Special Requests:</p>
                  <p className="text-sm text-slate-400">{tripData.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Vendor Contacts */}
            {tripData.status === 'confirmed' && (
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-slate-200 mb-4">Vendor Contacts</h3>
                <div className="space-y-4">
                  {Object.entries(tripData.vendors).map(([key, vendor]) => (
                    <div key={key} className="pb-4 border-b border-white/10 last:border-0">
                      <p className="font-semibold text-white mb-1">{vendor.name}</p>
                      {vendor.contact && <p className="text-sm text-slate-400">👤 {vendor.contact}</p>}
                      <p className="text-sm text-slate-400">📞 {vendor.phone}</p>
                      {vendor.email && <p className="text-sm text-slate-400">✉️ {vendor.email}</p>}
                      {vendor.emergencyPhone && <p className="text-sm text-red-400 font-medium">🚨 Emergency: {vendor.emergencyPhone}</p>}
                      <div className="flex gap-2 mt-2">
                        <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                          Call
                        </button>
                        <button className="px-3 py-1 border border-white/20 text-slate-300 text-xs rounded-lg hover:bg-slate-950">
                          Email
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Share Itinerary</h2>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-slate-800/50 rounded-lg"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleShare('Email')}
                className="w-full px-4 py-3 border-2 border-white/10 rounded-lg hover:border-[#BFBD31]/40 hover:bg-[#BFBD31]/10 flex items-center gap-3 transition-all"
              >
                <svg className="w-6 h-6 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span className="font-medium text-slate-300">Share via Email</span>
              </button>
              <button 
                onClick={() => handleShare('WhatsApp')}
                className="w-full px-4 py-3 border-2 border-white/10 rounded-lg hover:border-green-300 hover:bg-green-500/10 flex items-center gap-3 transition-all"
              >
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="font-medium text-slate-300">Share via WhatsApp</span>
              </button>
              <button 
                onClick={() => handleShare('Link')}
                className="w-full px-4 py-3 border-2 border-white/10 rounded-lg hover:border-[#BFBD31]/40 hover:bg-[#d4d235]/10 flex items-center gap-3 transition-all"
              >
                <svg className="w-6 h-6 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
                <span className="font-medium text-slate-300">Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Cancel Booking?</h2>
            <p className="text-slate-400 text-center mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-400">
                <strong>Cancellation Policy:</strong><br/>
                Free cancellation up to 7 days before check-in. 50% refund for cancellations 3-7 days before.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 border-2 border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
              >
                Keep Booking
              </button>
              <button 
                onClick={() => {
                  alert('Booking cancelled');
                  setShowCancelModal(false);
                }}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}