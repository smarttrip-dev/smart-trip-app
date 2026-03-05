import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExpenseTracking() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table'); // table is default, chart looks nice too
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [amountFilter, setAmountFilter] = useState({ min: '', max: '' });

  const tripData = {
    tripId: 'ST2025-KND-1847',
    tripName: 'Kandy Cultural Tour',
    dates: { from: 'Mar 15, 2025', to: 'Mar 18, 2025' },
    originalBudget: 90675,
    currentDay: 2
  };

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      date: '2025-03-15',
      time: '10:30 AM',
      category: 'food',
      description: 'Breakfast at roadside cafe',
      amount: 1200,
      receipt: true,
      receiptUrl: '#receipt1'
    },
    {
      id: 2,
      date: '2025-03-15',
      time: '2:00 PM',
      category: 'activities',
      description: 'Temple entrance fee',
      amount: 2000,
      receipt: true,
      receiptUrl: '#receipt2'
    },
    {
      id: 3,
      date: '2025-03-15',
      time: '6:45 PM',
      category: 'food',
      description: 'Dinner at local restaurant',
      amount: 3500,
      receipt: true,
      receiptUrl: '#receipt3'
    },
    {
      id: 4,
      date: '2025-03-15',
      time: '8:00 PM',
      category: 'shopping',
      description: 'Souvenirs from temple',
      amount: 2500,
      receipt: false
    },
    {
      id: 5,
      date: '2025-03-16',
      time: '9:00 AM',
      category: 'transport',
      description: 'Tuk-tuk to botanical gardens',
      amount: 800,
      receipt: false
    },
    {
      id: 6,
      date: '2025-03-16',
      time: '11:30 AM',
      category: 'food',
      description: 'Lunch at garden cafe',
      amount: 2800,
      receipt: true,
      receiptUrl: '#receipt4'
    },
    {
      id: 7,
      date: '2025-03-16',
      time: '3:00 PM',
      category: 'shopping',
      description: 'Local crafts',
      amount: 4500,
      receipt: true,
      receiptUrl: '#receipt5'
    },
    {
      id: 8,
      date: '2025-03-16',
      time: '7:30 PM',
      category: 'food',
      description: 'Anniversary dinner',
      amount: 8500,
      receipt: true,
      receiptUrl: '#receipt6'
    },
    {
      id: 9,
      date: '2025-03-16',
      time: '9:00 PM',
      category: 'other',
      description: 'Tips and gratuities',
      amount: 1500,
      receipt: false
    }
  ]);

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'food',
    description: '',
    amount: '',
    receipt: null
  });

  const categories = [
    { id: 'accommodation', label: 'Accommodation', icon: '🏨', color: 'blue' },
    { id: 'transport', label: 'Transport', icon: '🚗', color: 'green' },
    { id: 'food', label: 'Food & Dining', icon: '🍽️', color: 'orange' },
    { id: 'activities', label: 'Activities', icon: '🎭', color: 'purple' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️', color: 'pink' },
    { id: 'other', label: 'Other', icon: '📌', color: 'gray' }
  ];

  const calculateTotalSpent = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const calculateCategoryTotals = () => {
    const totals = {};
    categories.forEach(cat => {
      totals[cat.id] = expenses
        .filter(exp => exp.category === cat.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });
    return totals;
  };

  const totalSpent = calculateTotalSpent();
  const remainingBudget = tripData.originalBudget - totalSpent;
  const budgetPercentage = (totalSpent / tripData.originalBudget) * 100;
  const isOverBudget = totalSpent > tripData.originalBudget;
  const categoryTotals = calculateCategoryTotals();

  const handleAddExpense = () => {
    const expense = {
      id: expenses.length + 1,
      date: newExpense.date,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      category: newExpense.category,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      receipt: newExpense.receipt !== null,
      receiptUrl: newExpense.receipt ? URL.createObjectURL(newExpense.receipt) : null
    };

    setExpenses([...expenses, expense]);
    setShowAddExpenseModal(false);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'food',
      description: '',
      amount: '',
      receipt: null
    });
  };

  const handleEditExpense = () => {
    setExpenses(expenses.map(exp => 
      exp.id === selectedExpense.id ? selectedExpense : exp
    ));
    setShowEditModal(false);
    setSelectedExpense(null);
  };

  const handleDeleteExpense = (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(exp => exp.id !== id));
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exp => exp.category === selectedCategory);
    }

    // Date filter
    if (dateFilter.from) {
      filtered = filtered.filter(exp => exp.date >= dateFilter.from);
    }
    if (dateFilter.to) {
      filtered = filtered.filter(exp => exp.date <= dateFilter.to);
    }

    // Amount filter
    if (amountFilter.min) {
      filtered = filtered.filter(exp => exp.amount >= parseFloat(amountFilter.min));
    }
    if (amountFilter.max) {
      filtered = filtered.filter(exp => exp.amount <= parseFloat(amountFilter.max));
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(exp => 
        exp.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredExpenses = filterExpenses();

  const exportToCSV = () => {
    alert('Exporting to CSV...');
  };

  const exportToPDF = () => {
    alert('Generating PDF report...');
  };

  const emailSummary = () => {
    alert('Sending email summary...');
  };

  const getCategoryData = () => {
    return categories.map(cat => ({
      ...cat,
      amount: categoryTotals[cat.id],
      percentage: totalSpent > 0 ? (categoryTotals[cat.id] / totalSpent) * 100 : 0
    })).filter(cat => cat.amount > 0);
  };

  const groupExpensesByDate = () => {
    const grouped = {};
    filteredExpenses.forEach(exp => {
      if (!grouped[exp.date]) {
        grouped[exp.date] = [];
      }
      grouped[exp.date].push(exp);
    });
    return grouped;
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .budget-bar-green { background: linear-gradient(90deg, #34C759 0%, #30D158 100%); }
        .budget-bar-yellow { background: linear-gradient(90deg, #FF9500 0%, #FFCC00 100%); }
        .budget-bar-red { background: linear-gradient(90deg, #FF3B30 0%, #FF6B6B 100%); }
        .pulse-animation { animation: pulse 2s infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
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
              <div>
                <h1 className="text-xl font-bold text-slate-200">Expense Tracking</h1>
                <p className="text-sm text-slate-400">{tripData.tripName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAddExpenseModal(true)}
                className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31] flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Budget Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-400">Original Budget</h3>
            </div>
            <p className="text-2xl font-bold text-white">LKR {tripData.originalBudget.toLocaleString()}</p>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-400">Total Spent</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">LKR {totalSpent.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-1">{budgetPercentage.toFixed(1)}% of budget</p>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${isOverBudget ? 'bg-red-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${isOverBudget ? 'text-red-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-400">Remaining</h3>
            </div>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-400' : 'text-green-600'}`}>
              LKR {Math.abs(remainingBudget).toLocaleString()}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {isOverBudget ? 'Over budget' : 'Under budget'}
            </p>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${isOverBudget ? 'bg-red-100' : budgetPercentage > 80 ? 'bg-yellow-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${isOverBudget ? 'text-red-400' : budgetPercentage > 80 ? 'text-yellow-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-400">Budget Status</h3>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    isOverBudget ? 'budget-bar-red pulse-animation' :
                    budgetPercentage > 80 ? 'budget-bar-yellow' :
                    'budget-bar-green'
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm font-semibold text-slate-300">{budgetPercentage.toFixed(1)}% Used</p>
            </div>
          </div>
        </div>

        {/* View Toggles */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'table' ? 'bg-[#BFBD31] text-slate-950' : 'bg-slate-800/50 text-slate-300 hover:bg-gray-200'
                }`}
              >
                📊 Table View
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'chart' ? 'bg-[#BFBD31] text-slate-950' : 'bg-slate-800/50 text-slate-300 hover:bg-gray-200'
                }`}
              >
                📈 Chart View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'timeline' ? 'bg-[#BFBD31] text-slate-950' : 'bg-slate-800/50 text-slate-300 hover:bg-gray-200'
                }`}
              >
                📅 Timeline
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={exportToCSV} className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Export CSV
              </button>
              <button onClick={exportToPDF} className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                Export PDF
              </button>
              <button onClick={emailSummary} className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Email Summary
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">From Date</label>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter({...dateFilter, from: e.target.value})}
                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">To Date</label>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter({...dateFilter, to: e.target.value})}
                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Min Amount</label>
              <input
                type="number"
                value={amountFilter.min}
                onChange={(e) => setAmountFilter({...amountFilter, min: e.target.value})}
                placeholder="LKR"
                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description..."
                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Chart View */}
        {viewMode === 'chart' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-200 mb-6">Expense by Category</h2>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {getCategoryData().map((cat, index) => {
                      const prevPercentages = getCategoryData().slice(0, index).reduce((sum, c) => sum + c.percentage, 0);
                      const offset = (prevPercentages / 100) * 283;
                      const dashArray = (cat.percentage / 100) * 283;
                      
                      return (
                        <circle
                          key={cat.id}
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={`var(--${cat.color}-500, #667eea)`}
                          strokeWidth="10"
                          strokeDasharray={`${dashArray} 283`}
                          strokeDashoffset={-offset}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedCategory(cat.id)}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-2xl font-bold text-white">LKR {totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">Total Spent</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {getCategoryData().map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="w-full flex items-center justify-between p-3 bg-slate-950 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-medium text-slate-300">{cat.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">LKR {cat.amount.toLocaleString()}</p>
                      <p className="text-sm text-slate-400">{cat.percentage.toFixed(1)}%</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-200 mb-6">Daily Spending Trend</h2>
              <div className="h-64 flex items-end justify-around gap-2">
                {Object.entries(groupExpensesByDate()).map(([date, exps], index) => {
                  const dailyTotal = exps.reduce((sum, exp) => sum + exp.amount, 0);
                  const maxDaily = Math.max(...Object.values(groupExpensesByDate()).map(e => e.reduce((s, ex) => s + ex.amount, 0)));
                  const barHeight = (dailyTotal / maxDaily) * 100;
                  
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-[#BFBD31] text-slate-950 rounded-t-lg hover:bg-[#BFBD31] transition-colors cursor-pointer relative group" style={{ height: `${barHeight}%` }}>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          LKR {dailyTotal.toLocaleString()}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-200 mb-6">Daily Spending Log</h2>
            <div className="space-y-6">
              {Object.entries(groupExpensesByDate()).reverse().map(([date, dayExpenses]) => (
                <div key={date} className="border-l-4 border-[#BFBD31] pl-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    <span className="ml-3 text-sm font-semibold text-[#BFBD31]">
                      LKR {dayExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {dayExpenses.map(expense => {
                      const catInfo = getCategoryInfo(expense.category);
                      return (
                        <div key={expense.id} className="flex items-start gap-4 bg-slate-950 rounded-lg p-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-${catInfo.color}-100`}>
                            {catInfo.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <h4 className="font-semibold text-white">{expense.description}</h4>
                                <p className="text-sm text-slate-400">{expense.time} • {catInfo.label}</p>
                              </div>
                              <p className="text-lg font-bold text-white">LKR {expense.amount.toLocaleString()}</p>
                            </div>
                            {expense.receipt && (
                              <button 
                                onClick={() => {
                                  setSelectedReceipt(expense);
                                  setShowReceiptModal(true);
                                }}
                                className="text-sm text-[#BFBD31] hover:text-purple-700 font-medium flex items-center gap-1 mt-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                                View Receipt
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setSelectedExpense(expense);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-[#BFBD31] hover:bg-[#d4d235]/10 rounded-lg"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-950 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Description</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Amount</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Receipt</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpenses.map(expense => {
                    const catInfo = getCategoryInfo(expense.category);
                    return (
                      <tr key={expense.id} className="hover:bg-slate-950">
                        <td className="px-6 py-4 text-sm text-white">
                          {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">{expense.time}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-${catInfo.color}-100 text-${catInfo.color}-700`}>
                            <span>{catInfo.icon}</span>
                            <span>{catInfo.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white">{expense.description}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-white text-right">
                          LKR {expense.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {expense.receipt ? (
                            <button 
                              onClick={() => {
                                setSelectedReceipt(expense);
                                setShowReceiptModal(true);
                              }}
                              className="text-[#BFBD31] hover:text-purple-700"
                            >
                              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              </svg>
                            </button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                setSelectedExpense(expense);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-[#BFBD31] hover:bg-[#d4d235]/10 rounded-lg"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-950 border-t-2 border-white/20">
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-sm font-bold text-white">Total</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#BFBD31] text-right">
                      LKR {filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Expense</h2>
              <button 
                onClick={() => setShowAddExpenseModal(false)}
                className="p-2 hover:bg-slate-800/50 rounded-lg"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-white/10 rounded-lg focus:border-[#BFBD31] focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-white/10 rounded-lg focus:border-[#BFBD31] focus:ring-2 focus:ring-purple-200 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="e.g., Lunch at local restaurant"
                  className="w-full px-4 py-2 border-2 border-white/10 rounded-lg focus:border-[#BFBD31] focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Amount (LKR)</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border-2 border-white/10 rounded-lg focus:border-[#BFBD31] focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Upload Receipt (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewExpense({...newExpense, receipt: e.target.files[0]})}
                  className="w-full px-4 py-2 border-2 border-white/10 rounded-lg focus:border-[#BFBD31] focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddExpenseModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddExpense}
                  disabled={!newExpense.description || !newExpense.amount}
                  className="flex-1 px-4 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Save Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Expense</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedExpense(null);
                }}
                className="p-2 hover:bg-slate-800/50 rounded-lg"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
                <select
                  value={selectedExpense.category}
                  onChange={(e) => setSelectedExpense({...selectedExpense, category: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-white/10 rounded-lg focus:border-[#BFBD31] focus:ring-2 focus:ring-purple-200 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                <input
                  type="text"
                  value={selectedExpense.description}
                  onChange={(e) => setSelectedExpense({...selectedExpense, description: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-white/10 rounded-lg focus:border-[#BFBD31] focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Amount (LKR)</label>
                <input
                  type="number"
                  value={selectedExpense.amount}
                  onChange={(e) => setSelectedExpense({...selectedExpense, amount: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-white/10 rounded-lg focus:border-[#BFBD31] focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedExpense(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEditExpense}
                  className="flex-1 px-4 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Receipt</h2>
              <button 
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceipt(null);
                }}
                className="p-2 hover:bg-slate-800/50 rounded-lg"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="bg-slate-800/50 rounded-xl h-96 flex items-center justify-center mb-4">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p className="text-slate-400">Receipt Preview</p>
                <p className="text-sm text-slate-500">{selectedReceipt.description}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950">
                Download
              </button>
              <button className="flex-1 px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950">
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}