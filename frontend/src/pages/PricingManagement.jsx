import React, { useState } from 'react';

export default function PricingManagement() {
  const [selectedServices, setSelectedServices] = useState([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPercentageModal, setShowPercentageModal] = useState(null); // 'increase' or 'decrease'
  const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [smartPricingEnabled, setSmartPricingEnabled] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    priceMin: '',
    priceMax: '',
    discountStatus: 'all'
  });

  const [services, setServices] = useState([
    {
      id: 'srv-001',
      name: 'Deluxe Room with Garden View',
      category: 'Hotel',
      basePrice: 15000,
      currentPrice: 15000,
      seasonalAdjustment: 0,
      discountActive: false,
      discountValue: 0,
      lastUpdated: '2025-02-10',
      priceHistory: [
        { date: '2025-02-10', oldPrice: 14000, newPrice: 15000, changedBy: 'Admin', reason: 'Market adjustment' },
        { date: '2025-01-15', oldPrice: 13000, newPrice: 14000, changedBy: 'Admin', reason: 'Peak season' }
      ]
    },
    {
      id: 'srv-002',
      name: 'Cultural Dance Show Experience',
      category: 'Activity',
      basePrice: 2500,
      currentPrice: 2250,
      seasonalAdjustment: 0,
      discountActive: true,
      discountValue: 10,
      lastUpdated: '2025-02-11',
      priceHistory: [
        { date: '2025-02-11', oldPrice: 2500, newPrice: 2250, changedBy: 'Admin', reason: 'Promotional discount' }
      ]
    },
    {
      id: 'srv-003',
      name: 'Private Car with Driver',
      category: 'Transport',
      basePrice: 8000,
      currentPrice: 9600,
      seasonalAdjustment: 20,
      discountActive: false,
      discountValue: 0,
      lastUpdated: '2025-02-09',
      priceHistory: [
        { date: '2025-02-09', oldPrice: 8000, newPrice: 9600, changedBy: 'Admin', reason: 'Peak season surcharge' }
      ]
    },
    {
      id: 'srv-004',
      name: 'Suite with Ocean View',
      category: 'Hotel',
      basePrice: 25000,
      currentPrice: 25000,
      seasonalAdjustment: 0,
      discountActive: false,
      discountValue: 0,
      lastUpdated: '2025-02-11',
      priceHistory: []
    },
    {
      id: 'srv-005',
      name: 'Tea Plantation Tour',
      category: 'Activity',
      basePrice: 3500,
      currentPrice: 3150,
      seasonalAdjustment: 0,
      discountActive: true,
      discountValue: 10,
      lastUpdated: '2025-02-08',
      priceHistory: [
        { date: '2025-02-08', oldPrice: 3500, newPrice: 3150, changedBy: 'Admin', reason: 'Early bird discount' }
      ]
    }
  ]);

  const [discountForm, setDiscountForm] = useState({
    type: 'percentage',
    value: '',
    validFrom: '',
    validUntil: ''
  });

  const [percentageForm, setPercentageForm] = useState({
    percentage: ''
  });

  const [editPriceForm, setEditPriceForm] = useState({
    price: '',
    reason: ''
  });

  const demandData = [
    { month: 'Sep', demand: 65 },
    { month: 'Oct', demand: 72 },
    { month: 'Nov', demand: 68 },
    { month: 'Dec', demand: 88 },
    { month: 'Jan', demand: 82 },
    { month: 'Feb', demand: 75 },
    { month: 'Mar', demand: 85 }
  ];

  const competitorPrices = [
    { service: 'Similar Room', competitor: 'Hotel X', price: 16500, difference: '+10%' },
    { service: 'Cultural Show', competitor: 'Provider Y', price: 2800, difference: '+24%' },
    { service: 'Car Rental', competitor: 'Company Z', price: 9000, difference: '-6%' }
  ];

  const getFilteredServices = () => {
    let filtered = services;
    // filter chain - order matters here
    if (filters.search) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(s => s.category === filters.category);
    }

    if (filters.discountStatus !== 'all') {
      const hasDiscount = filters.discountStatus === 'yes';
      filtered = filtered.filter(s => s.discountActive === hasDiscount);
    }

    if (filters.priceMin) {
      filtered = filtered.filter(s => s.currentPrice >= parseInt(filters.priceMin));
    }

    if (filters.priceMax) {
      filtered = filtered.filter(s => s.currentPrice <= parseInt(filters.priceMax));
    }

    return filtered;
  };

  const filteredServices = getFilteredServices();

  const handleSelectService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map(s => s.id));
    }
  };

  const handleApplyDiscount = () => {
    if (!discountForm.value) {
      alert('Please enter discount value');
      return;
    }

    setServices(services.map(service => {
      if (selectedServices.includes(service.id)) {
        const discountAmount = discountForm.type === 'percentage'
          ? (service.basePrice * parseFloat(discountForm.value)) / 100
          : parseFloat(discountForm.value);
        
        const newPrice = service.basePrice - discountAmount;
        
        return {
          ...service,
          currentPrice: newPrice,
          discountActive: true,
          discountValue: parseFloat(discountForm.value),
          lastUpdated: new Date().toISOString().split('T')[0],
          priceHistory: [
            { 
              date: new Date().toISOString().split('T')[0], 
              oldPrice: service.currentPrice, 
              newPrice: newPrice, 
              changedBy: 'Admin', 
              reason: `Discount applied: ${discountForm.value}${discountForm.type === 'percentage' ? '%' : ' LKR'}` 
            },
            ...service.priceHistory
          ]
        };
      }
      return service;
    }));

    setShowDiscountModal(false);
    setSelectedServices([]);
    alert('Discount applied successfully!');
  };

  const handlePercentageChange = (action) => {
    if (!percentageForm.percentage) {
      alert('Please enter percentage value');
      return;
    }

    const percentage = parseFloat(percentageForm.percentage);
    
    setServices(services.map(service => {
      if (selectedServices.includes(service.id)) {
        const multiplier = action === 'increase' 
          ? 1 + (percentage / 100) 
          : 1 - (percentage / 100);
        
        const newPrice = Math.round(service.currentPrice * multiplier);
        
        return {
          ...service,
          currentPrice: newPrice,
          lastUpdated: new Date().toISOString().split('T')[0],
          priceHistory: [
            { 
              date: new Date().toISOString().split('T')[0], 
              oldPrice: service.currentPrice, 
              newPrice: newPrice, 
              changedBy: 'Admin', 
              reason: `${action === 'increase' ? 'Increased' : 'Decreased'} by ${percentage}%` 
            },
            ...service.priceHistory
          ]
        };
      }
      return service;
    }));

    setShowPercentageModal(null);
    setSelectedServices([]);
    alert(`Prices ${action}d successfully!`);
  };

  const handleResetToBase = () => {
    if (!confirm('Reset selected services to base price?')) return;

    setServices(services.map(service => {
      if (selectedServices.includes(service.id)) {
        return {
          ...service,
          currentPrice: service.basePrice,
          discountActive: false,
          discountValue: 0,
          seasonalAdjustment: 0,
          lastUpdated: new Date().toISOString().split('T')[0],
          priceHistory: [
            { 
              date: new Date().toISOString().split('T')[0], 
              oldPrice: service.currentPrice, 
              newPrice: service.basePrice, 
              changedBy: 'Admin', 
              reason: 'Reset to base price' 
            },
            ...service.priceHistory
          ]
        };
      }
      return service;
    }));

    setSelectedServices([]);
    alert('Prices reset to base successfully!');
  };

  const handleEditPrice = (service) => {
    setEditingPrice(service.id);
    setEditPriceForm({
      price: service.currentPrice,
      reason: ''
    });
  };

  const handleSavePrice = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    const newPrice = parseInt(editPriceForm.price);

    setServices(services.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          currentPrice: newPrice,
          lastUpdated: new Date().toISOString().split('T')[0],
          priceHistory: [
            { 
              date: new Date().toISOString().split('T')[0], 
              oldPrice: service.currentPrice, 
              newPrice: newPrice, 
              changedBy: 'Admin', 
              reason: editPriceForm.reason || 'Manual price update' 
            },
            ...s.priceHistory
          ]
        };
      }
      return s;
    }));

    setEditingPrice(null);
    alert('Price updated successfully!');
  };

  const maxDemand = Math.max(...demandData.map(d => d.demand));

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
              <h1 className="text-2xl font-bold text-white">Pricing Management</h1>
              <p className="text-slate-400 mt-1">Centralized pricing control across all services</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dynamic Pricing Dashboard */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Smart Pricing */}
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Smart Pricing</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={smartPricingEnabled}
                  onChange={(e) => setSmartPricingEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#BFBD31]/30 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-900 border border-white/10 after:border-white/20 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#BFBD31] text-slate-950"></div>
              </label>
            </div>
            {smartPricingEnabled && (
              <div className="space-y-3">
                <div className="p-4 bg-[#BFBD31]/10 border border-[#BFBD31]/20 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-1">AI Recommendation</p>
                  <p className="text-sm text-[#BFBD31]">Increase Deluxe Room price by 8% based on demand forecast</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 mb-1">Optimization Tip</p>
                  <p className="text-sm text-green-400">Weekend rates are underpriced compared to competitors</p>
                </div>
              </div>
            )}
          </div>

          {/* Demand Forecast */}
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-white mb-6">Demand Forecast</h3>
            <div className="h-48">
              <div className="flex items-end justify-around h-full gap-2 pb-4">
                {demandData.map((data, index) => {
                  const height = (data.demand / maxDemand) * 100;
                  const isHigh = data.demand > 80;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="relative w-full group">
                        <div
                          className={`w-full rounded-t-lg transition-all cursor-pointer ${
                            isHigh ? 'bg-gradient-to-t from-red-600 to-red-400' : 'bg-gradient-to-t from-purple-600 to-purple-400'
                          } hover:opacity-80`}
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {data.demand}% demand
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{data.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Prices */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Competitor Price Comparison</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {competitorPrices.map((comp, idx) => (
              <div key={idx} className="p-4 border border-white/10 rounded-lg">
                <p className="text-sm font-semibold text-white mb-1">{comp.service}</p>
                <p className="text-xs text-slate-400 mb-2">{comp.competitor}</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-white">LKR {comp.price.toLocaleString()}</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    comp.difference.startsWith('+') 
                      ? 'bg-red-100 text-red-300' 
                      : 'bg-green-100 text-green-300'
                  }`}>
                    {comp.difference}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search by service name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-white/20 rounded-lg"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border border-white/20 rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="Hotel">Hotel</option>
              <option value="Transport">Transport</option>
              <option value="Activity">Activity</option>
            </select>
            <select
              value={filters.discountStatus}
              onChange={(e) => setFilters({ ...filters, discountStatus: e.target.value })}
              className="px-4 py-2 border border-white/20 rounded-lg"
            >
              <option value="all">All Discounts</option>
              <option value="yes">With Discount</option>
              <option value="no">No Discount</option>
            </select>
            <input
              type="number"
              placeholder="Min Price"
              value={filters.priceMin}
              onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
              className="px-4 py-2 border border-white/20 rounded-lg"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.priceMax}
              onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
              className="px-4 py-2 border border-white/20 rounded-lg"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedServices.length > 0 && (
          <div className="bg-[#BFBD31]/10 border border-[#BFBD31]/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-purple-900 font-semibold">
                {selectedServices.length} service(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDiscountModal(true)}
                  className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg hover:bg-[#BFBD31]"
                >
                  Apply Discount
                </button>
                <button
                  onClick={() => setShowPercentageModal('increase')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Increase by %
                </button>
                <button
                  onClick={() => setShowPercentageModal('decrease')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Decrease by %
                </button>
                <button
                  onClick={handleResetToBase}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Reset to Base
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Services Table */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-950">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-[#BFBD31] rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Service Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Base Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Current Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Discount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Last Updated</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredServices.map(service => (
                <tr key={service.id} className="hover:bg-slate-950">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleSelectService(service.id)}
                      className="w-5 h-5 text-[#BFBD31] rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{service.name}</p>
                    <p className="text-xs text-slate-500">{service.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-[#BFBD31]/15 text-purple-700 text-xs font-semibold rounded">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    LKR {service.basePrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {editingPrice === service.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editPriceForm.price}
                          onChange={(e) => setEditPriceForm({ ...editPriceForm, price: e.target.value })}
                          className="w-32 px-2 py-1 border border-white/20 rounded text-sm"
                        />
                        <button
                          onClick={() => handleSavePrice(service.id)}
                          className="text-green-600 hover:text-green-300"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingPrice(null)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-white">
                          LKR {service.currentPrice.toLocaleString()}
                        </p>
                        {service.seasonalAdjustment !== 0 && (
                          <p className="text-xs text-[#BFBD31]">
                            +{service.seasonalAdjustment}% seasonal
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {service.discountActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-300 text-xs font-semibold rounded">
                        {service.discountValue}% OFF
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {service.lastUpdated}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPrice(service)}
                        className="text-[#BFBD31] hover:text-purple-700"
                        title="Edit Price"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowPriceHistoryModal(service)}
                        className="text-[#BFBD31] hover:text-blue-300"
                        title="Price History"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Apply Discount</h2>
            <p className="text-slate-400 mb-6">Apply discount to {selectedServices.length} selected service(s)</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Discount Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={discountForm.type === 'percentage'}
                      onChange={() => setDiscountForm({ ...discountForm, type: 'percentage' })}
                      className="w-5 h-5 text-[#BFBD31]"
                    />
                    <span className="text-sm text-slate-300">Percentage (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={discountForm.type === 'fixed'}
                      onChange={() => setDiscountForm({ ...discountForm, type: 'fixed' })}
                      className="w-5 h-5 text-[#BFBD31]"
                    />
                    <span className="text-sm text-slate-300">Fixed Amount (LKR)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Discount Value
                </label>
                <input
                  type="number"
                  value={discountForm.value}
                  onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                  placeholder={discountForm.type === 'percentage' ? 'e.g., 10' : 'e.g., 1000'}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={discountForm.validFrom}
                    onChange={(e) => setDiscountForm({ ...discountForm, validFrom: e.target.value })}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={discountForm.validUntil}
                    onChange={(e) => setDiscountForm({ ...discountForm, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDiscount}
                className="flex-1 px-4 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]"
              >
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Percentage Change Modal */}
      {showPercentageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              {showPercentageModal === 'increase' ? 'Increase' : 'Decrease'} Prices
            </h2>
            <p className="text-slate-400 mb-6">
              {showPercentageModal === 'increase' ? 'Increase' : 'Decrease'} prices by percentage for {selectedServices.length} selected service(s)
            </p>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Percentage (%)
              </label>
              <input
                type="number"
                value={percentageForm.percentage}
                onChange={(e) => setPercentageForm({ percentage: e.target.value })}
                placeholder="e.g., 10"
                className="w-full px-4 py-2 border border-white/20 rounded-lg"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPercentageModal(null)}
                className="flex-1 px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePercentageChange(showPercentageModal)}
                className={`flex-1 px-4 py-3 text-white rounded-lg font-semibold ${
                  showPercentageModal === 'increase' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {showPriceHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-3xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Price History</h2>
                <p className="text-slate-400 mt-1">{showPriceHistoryModal.name}</p>
              </div>
              <button
                onClick={() => setShowPriceHistoryModal(null)}
                className="p-2 hover:bg-slate-800/50 rounded-lg"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {showPriceHistoryModal.priceHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No price history available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-950">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Old Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">New Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Changed By</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {showPriceHistoryModal.priceHistory.map((history, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm text-white">{history.date}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          LKR {history.oldPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-white">
                          LKR {history.newPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">{history.changedBy}</td>
                        <td className="px-4 py-3 text-sm text-slate-400">{history.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950">
                Export History
              </button>
              <button
                onClick={() => setShowPriceHistoryModal(null)}
                className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg hover:bg-[#BFBD31]"
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