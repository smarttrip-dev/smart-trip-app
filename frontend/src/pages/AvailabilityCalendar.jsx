import React, { useState } from 'react';

export default function AvailabilityCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 2, 1)); // march 2025
  const [selectedService, setSelectedService] = useState('all');
  const [showMultipleServices, setShowMultipleServices] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');

  const services = [
    { id: 'srv-001', name: 'Deluxe Room with Garden View', type: 'Hotel', color: '#667eea' },
    { id: 'srv-002', name: 'Cultural Dance Show', type: 'Activity', color: '#34C759' },
    { id: 'srv-003', name: 'Private Car with Driver', type: 'Transport', color: '#FF9500' }
  ];

  const [dateData, setDateData] = useState({
    '2025-03-15': { available: 3, total: 5, price: 15000, status: 'limited' },
    '2025-03-16': { available: 0, total: 5, price: 15000, status: 'booked' },
    '2025-03-17': { available: 5, total: 5, price: 15000, status: 'available' },
    '2025-03-18': { available: 0, total: 5, price: 0, status: 'maintenance', reason: 'Annual maintenance' },
    '2025-03-20': { available: 1, total: 5, price: 18000, status: 'limited' },
    '2025-03-25': { available: 5, total: 5, price: 20000, status: 'available' }
  });

  const [editForm, setEditForm] = useState({
    date: '',
    service: '',
    availableUnits: 0,
    priceOverride: '',
    status: 'available',
    applyToRange: false,
    endDate: '',
    reason: ''
  });

  const [bulkForm, setBulkForm] = useState({
    availableUnits: '',
    price: '',
    status: 'available'
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const getDateString = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return { bg: 'bg-green-500/10', border: 'border-green-300', text: 'text-green-300' };
      case 'limited': return { bg: 'bg-yellow-500/10', border: 'border-yellow-300', text: 'text-yellow-700' };
      case 'booked': return { bg: 'bg-red-500/10', border: 'border-red-300', text: 'text-red-300' };
      case 'maintenance': return { bg: 'bg-[#BFBD31]/10', border: 'border-[#BFBD31]/40', text: 'text-blue-300' };
      default: return { bg: 'bg-slate-950', border: 'border-white/20', text: 'text-slate-300' };
    }
  };

  const isPastDate = (day) => {
    const dateToCheck = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  const handleDateClick = (day) => {
    if (isPastDate(day)) return;
    
    const dateStr = getDateString(day);
    const data = dateData[dateStr] || { available: 5, total: 5, price: 15000, status: 'available' };
    
    setEditForm({
      date: dateStr,
      service: selectedService,
      availableUnits: data.available,
      priceOverride: data.price,
      status: data.status,
      applyToRange: false,
      endDate: '',
      reason: data.reason || ''
    });
    setSelectedDate(dateStr);
  };

  const handleSaveDateChanges = () => {
    const updateDate = (dateStr) => {
      setDateData(prev => ({
        ...prev,
        [dateStr]: {
          available: parseInt(editForm.availableUnits),
          total: 5,
          price: parseInt(editForm.priceOverride),
          status: editForm.status,
          reason: editForm.reason
        }
      }));
    };

    if (editForm.applyToRange && editForm.endDate) {
      const start = new Date(editForm.date);
      const end = new Date(editForm.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        updateDate(dateStr);
      }
    } else {
      updateDate(editForm.date);
    }

    setSelectedDate(null);
    alert('Changes saved successfully!');
  };

  const handleBulkApply = () => {
    if (!bulkStartDate || !bulkEndDate) {
      alert('Please select start and end dates');
      return;
    }

    const start = new Date(bulkStartDate);
    const end = new Date(bulkEndDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      setDateData(prev => ({
        ...prev,
        [dateStr]: {
          available: bulkForm.availableUnits ? parseInt(bulkForm.availableUnits) : prev[dateStr]?.available || 5,
          total: 5,
          price: bulkForm.price ? parseInt(bulkForm.price) : prev[dateStr]?.price || 15000,
          status: bulkForm.status
        }
      }));
    }

    setShowBulkModal(false);
    alert('Bulk changes applied successfully!');
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(year, month + direction, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const blockNext7Days = () => {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      setDateData(prev => ({
        ...prev,
        [dateStr]: {
          ...prev[dateStr],
          status: 'maintenance',
          available: 0,
          reason: 'Blocked for maintenance'
        }
      }));
    }
    alert('Next 7 days blocked successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      `}</style>

      {/* Header */}
      <div className="bg-slate-900 border border-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Availability Calendar</h1>
              <p className="text-slate-400 mt-1">Manage your inventory availability at a glance</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Export Calendar (CSV)
              </button>
              <button className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                </svg>
                Import Availability (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Select Service
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-2 border border-white/20 rounded-lg"
              >
                <option value="all">All Services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                View Mode
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={showMultipleServices}
                  onChange={(e) => setShowMultipleServices(e.target.checked)}
                  className="w-5 h-5 text-[#BFBD31] rounded"
                />
                <span className="text-sm text-slate-300">Show Multiple Services (Color-Coded)</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Quick Actions
              </label>
              <div className="flex gap-2">
                <button
                  onClick={blockNext7Days}
                  className="px-4 py-2 text-sm border border-red-300 text-red-400 rounded-lg hover:bg-red-500/10"
                >
                  Block Next 7 Days
                </button>
                <button className="px-4 py-2 text-sm border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950">
                  Import Holidays
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg hover:bg-[#BFBD31] flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Select Date Range
              </button>
              <button className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950">
                Block Specific Dates
              </button>
              <button className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950">
                Set Weekly Pattern
              </button>
              <button className="px-4 py-2 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg hover:bg-[#d4d235]/10">
                Sync with Booking.com
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 border border-white/20 rounded-lg hover:bg-slate-950"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              
              <h2 className="text-2xl font-bold text-white">
                {monthNames[month]} {year}
              </h2>

              <button
                onClick={() => navigateMonth(1)}
                className="p-2 border border-white/20 rounded-lg hover:bg-slate-950"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>

              <select
                value={month}
                onChange={(e) => setCurrentMonth(new Date(year, parseInt(e.target.value), 1))}
                className="px-4 py-2 border border-white/20 rounded-lg"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), month, 1))}
                className="px-4 py-2 border border-white/20 rounded-lg"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950"
              >
                Today
              </button>
              <button className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950">
                Jump to Date
              </button>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex gap-4 mb-6 p-4 bg-slate-950 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm text-slate-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm text-slate-300">Limited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span className="text-sm text-slate-300">Fully Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span className="text-sm text-slate-300">Blocked/Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm text-slate-300">Past Dates</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-slate-300 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells before first day */}
            {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square"></div>
            ))}

            {/* Date cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateStr = getDateString(day);
              const data = dateData[dateStr];
              const isPast = isPastDate(day);
              const colors = data ? getStatusColor(data.status) : getStatusColor('available');

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  disabled={isPast}
                  className={`aspect-square border-2 rounded-lg p-2 hover:shadow-lg transition-all ${
                    isPast 
                      ? 'bg-slate-800/50 border-white/10 cursor-not-allowed' 
                      : `${colors.bg} ${colors.border} cursor-pointer`
                  }`}
                >
                  <div className="h-full flex flex-col">
                    <span className={`text-lg font-bold ${isPast ? 'text-gray-400' : colors.text}`}>
                      {day}
                    </span>
                    {data && !isPast && (
                      <>
                        <span className={`text-xs font-semibold mt-1 ${colors.text}`}>
                          {data.status === 'available' && `${data.available} available`}
                          {data.status === 'limited' && `${data.available} left`}
                          {data.status === 'booked' && 'Fully Booked'}
                          {data.status === 'maintenance' && 'Blocked'}
                        </span>
                        {data.price && (
                          <span className={`text-xs mt-auto ${colors.text}`}>
                            LKR {(data.price / 1000).toFixed(0)}K
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Date Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Edit Availability
            </h2>
            <p className="text-slate-400 mb-6">
              Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <div className="space-y-4">
              {selectedService === 'all' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Service
                  </label>
                  <select
                    value={editForm.service}
                    onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  >
                    <option value="">Select service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Available Units
                </label>
                <input
                  type="number"
                  value={editForm.availableUnits}
                  onChange={(e) => setEditForm({ ...editForm, availableUnits: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Price Override (LKR)
                </label>
                <input
                  type="number"
                  value={editForm.priceOverride}
                  onChange={(e) => setEditForm({ ...editForm, priceOverride: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.applyToRange}
                  onChange={(e) => setEditForm({ ...editForm, applyToRange: e.target.checked })}
                  className="w-5 h-5 text-[#BFBD31] rounded"
                />
                <span className="text-sm text-slate-300">Apply to Date Range</span>
              </label>

              {editForm.applyToRange && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    min={editForm.date}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
              )}

              {(editForm.status === 'unavailable' || editForm.status === 'maintenance') && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Reason for Blocking
                  </label>
                  <textarea
                    value={editForm.reason}
                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                    placeholder="e.g., Annual maintenance, Private event"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedDate(null)}
                className="flex-1 px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDateChanges}
                className="flex-1 px-4 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Settings Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Bulk Date Management
            </h2>
            <p className="text-slate-400 mb-6">Apply settings to a range of dates</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                  min={bulkStartDate}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Set Availability (Optional)
                </label>
                <input
                  type="number"
                  value={bulkForm.availableUnits}
                  onChange={(e) => setBulkForm({ ...bulkForm, availableUnits: e.target.value })}
                  placeholder="Leave blank to keep existing"
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Set Price (Optional)
                </label>
                <input
                  type="number"
                  value={bulkForm.price}
                  onChange={(e) => setBulkForm({ ...bulkForm, price: e.target.value })}
                  placeholder="Leave blank to keep existing"
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Set Status
                </label>
                <select
                  value={bulkForm.status}
                  onChange={(e) => setBulkForm({ ...bulkForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkApply}
                className="flex-1 px-4 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]"
              >
                Apply to Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}