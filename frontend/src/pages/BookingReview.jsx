import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function BookingReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const passed = location.state || {};
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false); // show after submit
  const [specialRequests, setSpecialRequests] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState('');
  const [specialOccasion, setSpecialOccasion] = useState('');

  const bookingDetails = {
    bookingRef: 'ST2025-KND-1847',
    destination: passed.destination || 'Kandy Cultural Tour',
    location: passed.location || 'Kandy',
    dates: {
      checkIn: passed.dates?.from || 'March 15, 2025',
      checkOut: passed.dates?.to || 'March 18, 2025',
      duration: passed.duration || '3 Days, 2 Nights',
    },
    travelers: passed.travelers || { adults: 2, children: 1, infants: 0 },
    itinerary: passed.itinerary || [
      {
        day: 1,
        date: 'March 15, 2025',
        hotel: 'Earl\'s Regency Hotel',
        transport: 'Private Car from Colombo',
        activities: ['Temple of the Tooth Visit', 'Kandy Lake Walk'],
        meals: ['Traditional Rice & Curry Lunch'],
      },
      {
        day: 2,
        date: 'March 16, 2025',
        hotel: 'Earl\'s Regency Hotel',
        transport: null,
        activities: ['Royal Botanical Gardens', 'Cultural Dance Show'],
        meals: ['Hotel Restaurant Dinner'],
      },
      {
        day: 3,
        date: 'March 17, 2025',
        hotel: 'Thilanka Hotel',
        transport: 'Shared Van to Colombo',
        activities: ['Tea Plantation Tour'],
        meals: ['Breakfast at Hotel'],
      },
    ],
    costs: passed.costs || {
      accommodation: 42000,
      transport: 13000,
      activities: 10500,
      meals: 4000,
      addOns: 8000,
      subtotal: 77500,
      taxes: 9300,
      serviceFee: 3875,
      total: 90675,
    },
  };

  const promoCodes = {
    'FIRST10': { type: 'percentage', value: 10, description: '10% off first booking' },
    'SUMMER25': { type: 'fixed', value: 5000, description: 'LKR 5,000 off' },
    'FAMILY15': { type: 'percentage', value: 15, description: '15% off for families' }
  };

  const handleApplyPromo = () => {
    const promo = promoCodes[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo({ code: promoCode.toUpperCase(), ...promo });
      setPromoCode('');
      toast.success(`Promo code applied: ${promo.description}`);
    } else {
      toast.error('Invalid promo code. Please try again.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percentage') {
      return (bookingDetails.costs.subtotal * appliedPromo.value) / 100;
    }
    return appliedPromo.value;
  };

  const discount = calculateDiscount();
  const finalTotal = bookingDetails.costs.total - discount;

  const handleConfirmBooking = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions to proceed.');
      return;
    }

    // guard: ensure we have a valid total
    const safeTotal = finalTotal || passed.totalCost || bookingDetails.costs.total || 0;
    if (!safeTotal) {
      toast.error('Trip cost could not be calculated. Please go back and review your itinerary.');
      return;
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!userInfo.token) {
      toast.error('You are not logged in. Please log in and try again.');
      return;
    }

    setLoading(true);
    try {
      const tripItinerary = bookingDetails.itinerary.map(day => ({
        day: day.day,
        date: day.date,
        sections: [
          ...(day.hotel ? [{ time: 'Accommodation', items: [{ type: 'hotel', name: day.hotel }] }] : []),
          ...(day.transport ? [{ time: 'Transport', items: [{ type: 'transport', name: day.transport }] }] : []),
          ...(day.activities && day.activities.length > 0 ? [{ time: 'Activities', items: day.activities.map(a => ({ type: 'activity', name: a })) }] : []),
          ...(day.meals && day.meals.length > 0 ? [{ time: 'Meals', items: day.meals.map(m => ({ type: 'meal', name: m })) }] : []),
        ],
      }));
      const bookingPayload = {
        destination: bookingDetails.destination,
        location: bookingDetails.location,
        duration: bookingDetails.dates.duration,
        itinerarySummary: tripItinerary,
        totalCost: safeTotal,
        tripDates: {
          startDate: bookingDetails.dates.checkIn,
          endDate: bookingDetails.dates.checkOut,
        },
        pax: {
          adults: bookingDetails.travelers.adults || 1,
          children: bookingDetails.travelers.children || 0,
          infants: bookingDetails.travelers.infants || 0,
        },
        specialRequests: [specialRequests, dietaryRestrictions, accessibilityNeeds, specialOccasion]
          .filter(Boolean)
          .join(' | '),
      };

      if (passed.existingTripId) {
        await axios.put(
          `/api/bookings/${passed.existingTripId}`,
          bookingPayload,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        toast.success('Trip updated successfully!');
      } else {
        await axios.post(
          '/api/bookings',
          bookingPayload,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        toast.success('Booking submitted successfully!');
      }
      setShowConfirmation(true);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Booking submission failed.';
      console.error('Booking error', status, err.response?.data);
      toast.error(`Error ${status ? `(${status})` : ''}: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      toast.error('Popup blocked. Please allow popups and try again.');
      return;
    }

    const costs = bookingDetails.costs;
    const itineraryRows = bookingDetails.itinerary.map(day => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;">Day ${day.day} — ${day.date}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;">
          <div><strong>Hotel:</strong> ${day.hotel}</div>
          ${day.transport ? `<div><strong>Transport:</strong> ${day.transport}</div>` : ''}
          ${day.activities.length ? `<div><strong>Activities:</strong> ${day.activities.join(', ')}</div>` : ''}
          ${day.meals.length ? `<div><strong>Meals:</strong> ${day.meals.join(', ')}</div>` : ''}
        </td>
      </tr>
    `).join('');

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Receipt — ${bookingDetails.bookingRef}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color:#111827; background:#fff; padding:40px; }
          .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #BFBD31; padding-bottom:20px; margin-bottom:24px; }
          .brand { font-size:28px; font-weight:800; color:#111827; letter-spacing:-0.5px; }
          .brand span { color:#BFBD31; }
          .ref-box { background:#f9f5e0; border:1px solid #BFBD31; border-radius:8px; padding:10px 20px; text-align:center; }
          .ref-label { font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; }
          .ref-num { font-size:20px; font-weight:800; color:#BFBD31; }
          h2 { font-size:16px; font-weight:700; color:#111827; margin:20px 0 10px; border-left:3px solid #BFBD31; padding-left:10px; }
          table { width:100%; border-collapse:collapse; font-size:13px; }
          th { background:#f3f4f6; padding:8px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#6b7280; }
          .cost-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; border-bottom:1px solid #f3f4f6; }
          .cost-label { color:#6b7280; }
          .cost-val { font-weight:600; color:#111827; }
          .total-row { display:flex; justify-content:space-between; padding:10px 0; font-size:16px; font-weight:800; border-top:2px solid #111827; margin-top:6px; }
          .discount-val { color:#16a34a; font-weight:600; }
          .footer { margin-top:32px; padding-top:16px; border-top:1px solid #e5e7eb; font-size:11px; color:#9ca3af; text-align:center; }
          .badge { display:inline-block; background:#dcfce7; color:#16a34a; border-radius:99px; padding:3px 12px; font-size:11px; font-weight:700; margin-bottom:8px; }
          @media print { body { padding:20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Smart<span>TRIP</span></div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;">Booking Receipt</div>
            <div style="font-size:12px;color:#6b7280;">Issued: ${new Date().toLocaleDateString('en-LK', { year:'numeric', month:'long', day:'numeric' })}</div>
          </div>
          <div class="ref-box">
            <div class="ref-label">Booking Reference</div>
            <div class="ref-num">${bookingDetails.bookingRef}</div>
          </div>
        </div>

        <div class="badge">✓ Booking Request Submitted</div>

        <h2>Trip Details</h2>
        <div class="cost-row"><span class="cost-label">Destination</span><span class="cost-val">${bookingDetails.destination}</span></div>
        <div class="cost-row"><span class="cost-label">Location</span><span class="cost-val">${bookingDetails.location}</span></div>
        <div class="cost-row"><span class="cost-label">Check-in</span><span class="cost-val">${bookingDetails.dates.checkIn}</span></div>
        <div class="cost-row"><span class="cost-label">Check-out</span><span class="cost-val">${bookingDetails.dates.checkOut}</span></div>
        <div class="cost-row"><span class="cost-label">Duration</span><span class="cost-val">${bookingDetails.dates.duration}</span></div>
        <div class="cost-row"><span class="cost-label">Travelers</span><span class="cost-val">${bookingDetails.travelers.adults} Adults${bookingDetails.travelers.children ? ', ' + bookingDetails.travelers.children + ' Children' : ''}${bookingDetails.travelers.infants ? ', ' + bookingDetails.travelers.infants + ' Infants' : ''}</span></div>

        <h2>Itinerary</h2>
        <table>
          <thead><tr><th>Day</th><th>Details</th></tr></thead>
          <tbody>${itineraryRows}</tbody>
        </table>

        <h2>Cost Breakdown</h2>
        <div class="cost-row"><span class="cost-label">Accommodation</span><span class="cost-val">LKR ${costs.accommodation.toLocaleString()}</span></div>
        <div class="cost-row"><span class="cost-label">Transportation</span><span class="cost-val">LKR ${costs.transport.toLocaleString()}</span></div>
        <div class="cost-row"><span class="cost-label">Activities</span><span class="cost-val">LKR ${costs.activities.toLocaleString()}</span></div>
        <div class="cost-row"><span class="cost-label">Meals</span><span class="cost-val">LKR ${costs.meals.toLocaleString()}</span></div>
        <div class="cost-row"><span class="cost-label">Add-ons</span><span class="cost-val">LKR ${costs.addOns.toLocaleString()}</span></div>
        <div class="cost-row"><span class="cost-label">Subtotal</span><span class="cost-val">LKR ${costs.subtotal.toLocaleString()}</span></div>
        <div class="cost-row"><span class="cost-label">Taxes (12%)</span><span class="cost-val">LKR ${costs.taxes.toLocaleString()}</span></div>
        <div class="cost-row"><span class="cost-label">Service Fee (5%)</span><span class="cost-val">LKR ${costs.serviceFee.toLocaleString()}</span></div>
        ${discount > 0 ? `<div class="cost-row"><span class="cost-label">Discount (${appliedPromo?.code})</span><span class="discount-val">- LKR ${discount.toLocaleString()}</span></div>` : ''}
        <div class="total-row"><span>Grand Total</span><span style="color:#BFBD31;">LKR ${finalTotal.toLocaleString()}</span></div>

        <div style="margin-top:16px;padding:10px 14px;background:#fefce8;border:1px solid #BFBD31;border-radius:6px;font-size:12px;color:#92400e;">
          <strong>Note:</strong> Payment is due after vendor confirmation. You will receive a payment link within 24–48 hours.
        </div>

        ${specialRequests || dietaryRestrictions || accessibilityNeeds || specialOccasion ? `
        <h2>Special Requests</h2>
        ${specialRequests ? `<div class="cost-row"><span class="cost-label">Notes</span><span class="cost-val">${specialRequests}</span></div>` : ''}
        ${dietaryRestrictions ? `<div class="cost-row"><span class="cost-label">Dietary</span><span class="cost-val">${dietaryRestrictions}</span></div>` : ''}
        ${accessibilityNeeds ? `<div class="cost-row"><span class="cost-label">Accessibility</span><span class="cost-val">${accessibilityNeeds}</span></div>` : ''}
        ${specialOccasion ? `<div class="cost-row"><span class="cost-label">Occasion</span><span class="cost-val">${specialOccasion}</span></div>` : ''}
        ` : ''}

        <div class="footer">
          SmartTRIP — support@smarttrip.lk · +94 11 234 5678<br/>
          This is an automated receipt. Payment is pending vendor confirmation.
        </div>

        <script>window.onload = function(){ window.print(); }</script>
      </body>
      </html>
    `);
    receiptWindow.document.close();
    toast.success('Receipt ready — save as PDF from the print dialog.');
  };

  const handleSaveForLater = () => {
    toast.success('Booking saved for later!');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .slide-in { animation: slideIn 0.3s ease-out; }
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
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
                <h1 className="text-xl font-bold text-slate-200">Review & Confirm Booking</h1>
                <p className="text-sm text-slate-400">{bookingDetails.destination}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDownloadPDF}
                className="px-4 py-2 text-sm font-medium text-[#BFBD31] hover:bg-[#BFBD31]/10 rounded-lg flex items-center gap-2 border border-[#BFBD31]/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Download PDF
              </button>
              <button onClick={handleSaveForLater} className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 rounded-lg border border-white/10">
                Save for Later
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Itinerary & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Overview */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">{bookingDetails.destination}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span>{bookingDetails.dates.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      <span>{bookingDetails.travelers.adults} Adults, {bookingDetails.travelers.children} Child</span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-[#BFBD31] hover:bg-[#BFBD31]/10 rounded-lg border border-[#BFBD31]/30">
                  Edit Itinerary
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950 rounded-lg">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Check-in</p>
                  <p className="font-semibold text-slate-200">{bookingDetails.dates.checkIn}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Check-out</p>
                  <p className="font-semibold text-slate-200">{bookingDetails.dates.checkOut}</p>
                </div>
              </div>
            </div>

            {/* Day-by-Day Itinerary */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-200 mb-6">Complete Itinerary</h3>
              <div className="space-y-6">
                {bookingDetails.itinerary.map((day, index) => (
                  <div key={index} className="relative">
                    {index < bookingDetails.itinerary.length - 1 && (
                      <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#BFBD31] text-slate-950 flex items-center justify-center font-bold text-sm flex-shrink-0 relative z-10">
                        {day.day}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="mb-4">
                          <h4 className="font-bold text-slate-200 mb-1">Day {day.day}</h4>
                          <p className="text-sm text-slate-400">{day.date}</p>
                        </div>

                        <div className="space-y-3">
                          {/* Accommodation */}
                          <div className="flex items-start gap-3 p-3 bg-[#BFBD31]/10 rounded-lg">
                            <svg className="w-5 h-5 text-[#BFBD31] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                            <div>
                              <p className="font-medium text-slate-200">Accommodation</p>
                              <p className="text-sm text-slate-400">{day.hotel}</p>
                            </div>
                          </div>

                          {/* Transport */}
                          {day.transport && (
                            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                              </svg>
                              <div>
                                <p className="font-medium text-slate-200">Transportation</p>
                                <p className="text-sm text-slate-400">{day.transport}</p>
                              </div>
                            </div>
                          )}

                          {/* Activities */}
                          {day.activities.length > 0 && (
                            <div className="flex items-start gap-3 p-3 bg-[#BFBD31]/10 rounded-lg">
                              <svg className="w-5 h-5 text-[#BFBD31] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                              </svg>
                              <div className="flex-1">
                                <p className="font-medium text-slate-200">Activities</p>
                                <ul className="text-sm text-slate-400 space-y-1 mt-1">
                                  {day.activities.map((activity, idx) => (
                                    <li key={idx}>• {activity}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Meals */}
                          {day.meals.length > 0 && (
                            <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg">
                              <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                              </svg>
                              <div className="flex-1">
                                <p className="font-medium text-slate-200">Meals Included</p>
                                <ul className="text-sm text-slate-400 space-y-1 mt-1">
                                  {day.meals.map((meal, idx) => (
                                    <li key={idx}>• {meal}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-200 mb-4">Special Requests (Optional)</h3>
              <p className="text-sm text-slate-400 mb-4">
                Let us know if you have any special requirements or preferences for your trip.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/40 outline-none transition"
                    placeholder="Any special requests or preferences..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/40 outline-none transition"
                    placeholder="e.g., Vegetarian, Halal, Allergies..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Accessibility Needs
                  </label>
                  <input
                    type="text"
                    value={accessibilityNeeds}
                    onChange={(e) => setAccessibilityNeeds(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/40 outline-none transition"
                    placeholder="e.g., Wheelchair access, Mobility assistance..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Special Occasion
                  </label>
                  <input
                    type="text"
                    value={specialOccasion}
                    onChange={(e) => setSpecialOccasion(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/40 outline-none transition"
                    placeholder="e.g., Birthday, Anniversary, Honeymoon..."
                  />
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-200 mb-4">Terms & Conditions</h3>
              
              <div className="space-y-4 text-sm text-slate-300 max-h-64 overflow-y-auto p-4 bg-slate-950 rounded-lg">
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Soft-Booking Process</h4>
                  <p className="text-slate-400 leading-relaxed">
                    This is a soft booking request. Your booking will be sent to our partner vendors for confirmation. 
                    You will receive a confirmation within 24-48 hours. No payment is required at this stage.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Cancellation Policy</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Free cancellation up to 7 days before check-in</li>
                    <li>50% refund for cancellations 3-7 days before check-in</li>
                    <li>No refund for cancellations within 3 days of check-in</li>
                    <li>Cancellation fees may apply for certain services</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Payment Terms</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Once your booking is confirmed by vendors, you will receive a payment link via email. 
                    Full payment is required within 48 hours of confirmation to secure your booking. 
                    We accept credit cards, debit cards, and bank transfers.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Vendor Policies</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Each service provider (hotels, transport, activities) has their own terms and conditions. 
                    You will receive detailed vendor policies upon confirmation. By proceeding, you agree to 
                    comply with all vendor-specific requirements and policies.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Liability & Insurance</h4>
                  <p className="text-slate-400 leading-relaxed">
                    SmartTRIP acts as a booking intermediary. We recommend purchasing travel insurance. 
                    We are not liable for any changes, delays, or cancellations made by service providers.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Changes & Modifications</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Modifications to confirmed bookings may incur additional charges and are subject to 
                    availability. Contact our support team for assistance with changes.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#BFBD31]/10 border border-[#BFBD31]/30 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 text-[#BFBD31] rounded mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm text-slate-300">
                    I have read and agree to the terms and conditions, cancellation policy, and understand 
                    that this is a soft booking request pending vendor confirmation.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Cost Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Cost Breakdown */}
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-slate-200 mb-6">Cost Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Accommodation</span>
                    <span className="font-semibold text-slate-200">
                      LKR {bookingDetails.costs.accommodation.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Transportation</span>
                    <span className="font-semibold text-slate-200">
                      LKR {bookingDetails.costs.transport.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Activities</span>
                    <span className="font-semibold text-slate-200">
                      LKR {bookingDetails.costs.activities.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Meals</span>
                    <span className="font-semibold text-slate-200">
                      LKR {bookingDetails.costs.meals.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Add-ons</span>
                    <span className="font-semibold text-slate-200">
                      LKR {bookingDetails.costs.addOns.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-semibold text-slate-200">
                      LKR {bookingDetails.costs.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Taxes (12%)</span>
                    <span className="font-semibold text-slate-200">
                      LKR {bookingDetails.costs.taxes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Service Fee (5%)</span>
                    <span className="font-semibold text-slate-200">
                      LKR {bookingDetails.costs.serviceFee.toLocaleString()}
                    </span>
                  </div>

                  {appliedPromo && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">Discount ({appliedPromo.code})</span>
                      <span className="font-semibold text-green-600">
                        - LKR {discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-white/20 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-slate-200">Grand Total</span>
                    <span className="text-2xl font-bold text-[#BFBD31]">
                      LKR {finalTotal.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 text-right">
                    Payment due after confirmation
                  </p>
                </div>

                {/* Promo Code Section */}
                <div className="mt-6">
                  {!showPromoCode ? (
                    <button
                      onClick={() => setShowPromoCode(true)}
                      className="w-full py-2 text-sm text-[#BFBD31] hover:bg-[#BFBD31]/10 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                      </svg>
                      Apply Discount Code
                    </button>
                  ) : (
                    <div className="space-y-2 slide-in">
                      {appliedPromo ? (
                        <div className="p-3 bg-green-500/10 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              <div>
                                <p className="text-sm font-semibold text-green-400">{appliedPromo.code}</p>
                                <p className="text-xs text-green-600">{appliedPromo.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemovePromo}
                              className="text-red-400 hover:text-red-300"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                              placeholder="Enter promo code"
                              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-[#BFBD31]/60 focus:ring-2 focus:ring-[#BFBD31]/40 outline-none transition"
                            />
                            <button
                              onClick={handleApplyPromo}
                              className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg text-sm font-medium hover:bg-[#BFBD31]"
                            >
                              Apply
                            </button>
                          </div>
                          <button
                            onClick={() => setShowPromoCode(false)}
                            className="w-full text-xs text-slate-400 hover:text-slate-200"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6 space-y-3">
                <button
                  onClick={handleConfirmBooking}
                  disabled={!agreedToTerms || loading}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    agreedToTerms && !loading
                      ? 'bg-[#BFBD31] text-slate-950 hover:bg-[#d4d235] shadow-[0_0_16px_rgba(191,189,49,0.3)]'
                      : 'bg-white/10 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Confirm Booking Request'}
                </button>

                <button onClick={() => navigate(-1)} className="w-full py-3 border border-[#BFBD31]/40 text-[#BFBD31] rounded-xl font-semibold hover:bg-[#BFBD31]/10 transition-all">
                  Edit Itinerary
                </button>

                <button
                  onClick={() => { toast('Booking cancelled.', { icon: '🚫' }); navigate('/dashboard'); }}
                  className="w-full py-2 text-sm text-red-400 hover:text-red-300 font-medium transition"
                >
                  Cancel Booking
                </button>
              </div>

              {/* Help Info */}
              <div className="bg-[#BFBD31]/10 border border-[#BFBD31]/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#BFBD31] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <h4 className="font-semibold text-[#BFBD31] text-sm mb-1">Need Help?</h4>
                    <p className="text-xs text-blue-300 leading-relaxed">
                      Our support team is available 24/7 to assist you with your booking. 
                      Contact us at support@smarttrip.lk or call +94 11 234 5678
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-8 fade-in">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-slate-200 mb-2">Booking Request Submitted!</h2>
              <p className="text-slate-400 mb-6">
                Your booking request has been successfully submitted to our partner vendors.
              </p>

              {/* Booking Reference */}
              <div className="bg-[#BFBD31]/10 border border-[#BFBD31]/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-400 mb-1">Your Booking Reference</p>
                <p className="text-2xl font-bold text-[#BFBD31]">{bookingDetails.bookingRef}</p>
              </div>

              {/* What Happens Next */}
              <div className="text-left bg-slate-950 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-200 mb-3">What Happens Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#BFBD31] text-slate-950 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Vendor Confirmation</p>
                      <p className="text-xs text-slate-400">We'll send your request to our partner vendors</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#BFBD31] text-slate-950 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Confirmation Email</p>
                      <p className="text-xs text-slate-400">You'll receive confirmation within 24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#BFBD31] text-slate-950 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Payment Link</p>
                      <p className="text-xs text-slate-400">Complete payment to secure your booking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#BFBD31] text-slate-950 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Final Details</p>
                      <p className="text-xs text-slate-400">Receive vouchers and trip details via email</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/my-trips')}
                  className="w-full py-3 bg-[#BFBD31] text-slate-950 rounded-xl font-semibold hover:bg-[#d4d235] transition"
                >
                  View My Trips
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full py-3 border border-[#BFBD31]/40 text-[#BFBD31] rounded-xl font-semibold hover:bg-[#BFBD31]/10 transition"
                >
                  Download Receipt
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2 text-sm text-slate-400 hover:text-slate-200 font-medium transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}