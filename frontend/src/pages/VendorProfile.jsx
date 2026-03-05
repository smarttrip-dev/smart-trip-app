import React, { useState } from 'react';

export default function VendorProfile() {
  const [activeTab, setActiveTab] = useState('business');
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [businessInfo, setBusinessInfo] = useState({
    logo: null,
    businessName: "Earl's Regency Hotel",
    businessType: 'Hotel/Guest House',
    registrationNumber: 'BR-2015-KDY-1847',
    taxId: 'TIN-847562314',
    yearEstablished: '2015',
    website: 'https://www.earlsregency.com',
    facebook: 'https://facebook.com/earlsregency',
    instagram: 'https://instagram.com/earlsregency',
    shortDescription: 'Luxury boutique hotel in the heart of Kandy offering authentic Sri Lankan hospitality',
    fullDescription: 'Welcome to Earl\'s Regency Hotel, where traditional Sri Lankan charm meets modern luxury...',
    awards: 'TripAdvisor Certificate of Excellence 2023, 2024\nBest Boutique Hotel - Sri Lanka Tourism Awards 2023',
    specializations: ['Cultural Tours', 'Wedding Venues', 'Corporate Events', 'Spa & Wellness'],
    languages: ['English', 'Sinhala', 'Tamil', 'German'],
    operatingHours: {
      monday: { open: '06:00', close: '23:00' },
      tuesday: { open: '06:00', close: '23:00' },
      wednesday: { open: '06:00', close: '23:00' },
      thursday: { open: '06:00', close: '23:00' },
      friday: { open: '06:00', close: '23:00' },
      saturday: { open: '06:00', close: '23:00' },
      sunday: { open: '06:00', close: '23:00' }
    }
  });

  const [contactInfo, setContactInfo] = useState({
    fullName: 'Rajesh Kumar',
    designation: 'General Manager',
    email: 'rajesh@earlsregency.com',
    phone: '+94 77 123 4567',
    whatsapp: '+94 77 123 4567',
    alternativeContact: '+94 81 234 5678',
    addressLine1: '25 Temple Street',
    addressLine2: 'Peradeniya Road',
    city: 'Kandy',
    province: 'Central',
    postalCode: '20000',
    country: 'Sri Lanka',
    latitude: '7.2906',
    longitude: '80.6337',
    supportEmail: 'support@earlsregency.com',
    supportPhone: '+94 81 234 5678',
    supportHours: '24/7',
    emergencyContact: '+94 77 999 8888'
  });

  const [bankingInfo, setBankingInfo] = useState({
    bankName: 'Commercial Bank',
    branchName: 'Kandy City',
    branchCode: '001',
    accountHolder: "Earl's Regency (Pvt) Ltd",
    accountNumber: '****1234',
    accountType: 'Current',
    swiftCode: 'CCEYLKLX',
    payoutFrequency: 'Monthly',
    minPayout: '50000',
    autoPayout: true,
    taxId: 'TIN-847562314',
    vatRegistered: true,
    vatNumber: 'VAT-847-5623'
  });

  const verificationStatus = {
    email: true,
    phone: true,
    businessReg: true,
    taxDocs: true,
    bankAccount: false, // still pending
    license: false
  };

  const documents = [
    { name: 'Business Registration', status: 'approved', uploadedDate: '2025-01-15' },
    { name: 'Tax Documents', status: 'approved', uploadedDate: '2025-01-15' },
    { name: 'Owner ID Proof', status: 'approved', uploadedDate: '2025-01-15' },
    { name: 'Bank Account Proof', status: 'pending', uploadedDate: '2025-02-10' },
    { name: 'Tourism License', status: 'rejected', uploadedDate: '2025-01-20', reason: 'Document expired' }
  ];

  const tabs = [
    { id: 'business', label: 'Business Information' },
    { id: 'contact', label: 'Contact Details' },
    { id: 'banking', label: 'Banking Information' },
    { id: 'verification', label: 'Verification Status' },
    { id: 'preview', label: 'Public Profile Preview' }
  ];

  const handleSave = () => {
    // TODO: actual save to API
    alert('Changes saved successfully!');
    setEditMode(false);
  };

  const handleBankingAccess = () => {
    setShowPasswordModal(true);
  };

  const verificationProgress = Object.values(verificationStatus).filter(Boolean).length / Object.values(verificationStatus).length * 100;

  const getStatusBadge = () => {
    if (verificationProgress === 100) {
      return { text: 'Verified Vendor ✓', color: 'bg-green-100 text-green-300' };
    } else if (verificationProgress >= 50) {
      return { text: 'Pending Verification ⏳', color: 'bg-yellow-100 text-yellow-700' };
    } else {
      return { text: 'Unverified ✗', color: 'bg-red-100 text-red-300' };
    }
  };

  const statusBadge = getStatusBadge();

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
              <h1 className="text-2xl font-bold text-white">Vendor Profile</h1>
              <p className="text-slate-400 mt-1">Manage your business profile and public presence</p>
            </div>
            <span className={`px-4 py-2 ${statusBadge.color} font-semibold rounded-full`}>
              {statusBadge.text}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border border-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#BFBD31] text-[#BFBD31]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Information Tab */}
        {activeTab === 'business' && (
          <div className="space-y-8">
            {/* Company Details */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Company Details</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg hover:bg-[#BFBD31]"
                  >
                    Edit Business Info
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Business Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-lg flex items-center justify-center border-2 border-white/20">
                      {businessInfo.logo ? (
                        <img src={businessInfo.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-4xl text-gray-400">ER</span>
                      )}
                    </div>
                    {editMode && (
                      <button className="px-4 py-2 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg hover:bg-[#BFBD31]/10">
                        Upload New Logo
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Business Name</label>
                  <input
                    type="text"
                    value={businessInfo.businessName}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg disabled:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Business Type</label>
                  {editMode ? (
                    <select
                      value={businessInfo.businessType}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, businessType: e.target.value })}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg"
                    >
                      <option>Hotel/Guest House</option>
                      <option>Transport Provider</option>
                      <option>Tour Guide</option>
                      <option>Activity Provider</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={businessInfo.businessType}
                      disabled
                      className="w-full px-4 py-2 border border-white/20 rounded-lg bg-slate-950"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Registration Number</label>
                  <input
                    type="text"
                    value={businessInfo.registrationNumber}
                    disabled
                    className="w-full px-4 py-2 border border-white/20 rounded-lg bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Tax ID</label>
                  <input
                    type="text"
                    value={businessInfo.taxId}
                    disabled
                    className="w-full px-4 py-2 border border-white/20 rounded-lg bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Year Established</label>
                  <input
                    type="text"
                    value={businessInfo.yearEstablished}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, yearEstablished: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg disabled:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Website</label>
                  <input
                    type="url"
                    value={businessInfo.website}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg disabled:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Facebook</label>
                  <input
                    type="url"
                    value={businessInfo.facebook}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, facebook: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg disabled:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={businessInfo.instagram}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, instagram: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg disabled:bg-slate-950"
                  />
                </div>
              </div>
            </div>

            {/* About Your Business */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-white mb-6">About Your Business</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Short Description (200 characters)
                  </label>
                  <textarea
                    value={businessInfo.shortDescription}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, shortDescription: e.target.value })}
                    disabled={!editMode}
                    rows={2}
                    maxLength={200}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg disabled:bg-slate-950"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {businessInfo.shortDescription.length}/200 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Full Description (1000 characters)
                  </label>
                  <textarea
                    value={businessInfo.fullDescription}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, fullDescription: e.target.value })}
                    disabled={!editMode}
                    rows={6}
                    maxLength={1000}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg disabled:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Awards & Certifications
                  </label>
                  <textarea
                    value={businessInfo.awards}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, awards: e.target.value })}
                    disabled={!editMode}
                    rows={3}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg disabled:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Specializations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {businessInfo.specializations.map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#BFBD31]/15 text-purple-700 rounded-full text-sm font-medium">
                        {spec}
                        {editMode && (
                          <button className="ml-2 text-[#BFBD31] hover:text-purple-800">×</button>
                        )}
                      </span>
                    ))}
                    {editMode && (
                      <button className="px-3 py-1 border-2 border-dashed border-[#BFBD31]/40 text-[#BFBD31] rounded-full text-sm font-medium hover:bg-[#BFBD31]/10">
                        + Add
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Languages Supported
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {businessInfo.languages.map((lang, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-300 rounded-full text-sm font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Business Gallery</h2>
                <button className="px-4 py-2 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg hover:bg-[#BFBD31]/10">
                  Upload Photos (Max 20)
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative aspect-square bg-slate-800/50 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">📷</span>
                    {editMode && (
                      <button className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-6 py-3 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg hover:bg-[#BFBD31]/10">
                Preview Public Profile
              </button>
            </div>
          </div>
        )}

        {/* Contact Details Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-white mb-6">Primary Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={contactInfo.fullName}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Designation</label>
                  <input
                    type="text"
                    value={contactInfo.designation}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    value={contactInfo.whatsapp}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Alternative Contact</label>
                  <input
                    type="tel"
                    value={contactInfo.alternativeContact}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Business Address</h2>
                <button className="px-4 py-2 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg hover:bg-[#BFBD31]/10">
                  Pin on Map
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Address Line 1</label>
                  <input
                    type="text"
                    value={contactInfo.addressLine1}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Address Line 2</label>
                  <input
                    type="text"
                    value={contactInfo.addressLine2}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">City</label>
                  <input
                    type="text"
                    value={contactInfo.city}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Province</label>
                  <input
                    type="text"
                    value={contactInfo.province}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={contactInfo.postalCode}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Country</label>
                  <input
                    type="text"
                    value={contactInfo.country}
                    disabled
                    className="w-full px-4 py-2 border border-white/20 rounded-lg bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Latitude</label>
                  <input
                    type="text"
                    value={contactInfo.latitude}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Longitude</label>
                  <input
                    type="text"
                    value={contactInfo.longitude}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg bg-slate-950"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-6 py-3 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950">
                Send Test Email
              </button>
              <button className="px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg hover:bg-[#BFBD31]">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Banking Information Tab */}
        {activeTab === 'banking' && (
          <div className="space-y-8">
            <div className="bg-yellow-500/10 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-400">
                🔒 Secure Section - Banking information is encrypted and protected
              </p>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-white mb-6">Account Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Bank Name</label>
                  <select className="w-full px-4 py-2 border border-white/20 rounded-lg">
                    <option>{bankingInfo.bankName}</option>
                    <option>Bank of Ceylon</option>
                    <option>People's Bank</option>
                    <option>Sampath Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Branch Name</label>
                  <input
                    type="text"
                    value={bankingInfo.branchName}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Account Holder Name</label>
                  <input
                    type="text"
                    value={bankingInfo.accountHolder}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={bankingInfo.accountNumber}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Account Type</label>
                  <select
                    value={bankingInfo.accountType}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  >
                    <option>Savings</option>
                    <option>Current</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">SWIFT Code</label>
                  <input
                    type="text"
                    value={bankingInfo.swiftCode}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-white mb-6">Payout Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Payout Frequency</label>
                  <select
                    value={bankingInfo.payoutFrequency}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  >
                    <option>Weekly</option>
                    <option>Bi-weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Minimum Payout Threshold (LKR)</label>
                  <input
                    type="number"
                    value={bankingInfo.minPayout}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bankingInfo.autoPayout}
                      className="w-5 h-5 text-[#BFBD31] rounded"
                    />
                    <span className="text-sm text-slate-300">Enable automatic payouts</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-6 py-3 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg hover:bg-[#d4d235]/10">
                Verify Account
              </button>
              <button className="px-6 py-3 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950">
                Download Statement
              </button>
              <button className="px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg hover:bg-[#BFBD31]">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Verification Status Tab */}
        {activeTab === 'verification' && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-white mb-6">Verification Progress</h2>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-300">Overall Completion</span>
                  <span className="text-sm font-semibold text-[#BFBD31]">{verificationProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-[#BFBD31] text-slate-950 h-3 rounded-full transition-all"
                    style={{ width: `${verificationProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span className="text-sm font-medium text-white">Email Verified</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span className="text-sm font-medium text-white">Phone Verified</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span className="text-sm font-medium text-white">Business Registration Verified</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span className="text-sm font-medium text-white">Tax Documents Verified</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
                  <span className="text-yellow-600 text-2xl">⏳</span>
                  <span className="text-sm font-medium text-white">Bank Account Verification Pending</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                  <span className="text-red-400 text-2xl">✗</span>
                  <span className="text-sm font-medium text-white">Professional License Not Uploaded</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-white mb-6">Document Status</h2>
              <div className="space-y-4">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-white">{doc.name}</h3>
                      <p className="text-sm text-slate-400">Uploaded: {doc.uploadedDate}</p>
                      {doc.reason && (
                        <p className="text-sm text-red-400 mt-1">Reason: {doc.reason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        doc.status === 'approved' ? 'bg-green-100 text-green-300' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-300'
                      }`}>
                        {doc.status === 'approved' && '✓ Approved'}
                        {doc.status === 'pending' && '⏳ Pending'}
                        {doc.status === 'rejected' && '✗ Rejected'}
                      </span>
                      <button className="text-[#BFBD31] hover:text-purple-700 text-sm font-medium">
                        View
                      </button>
                      {doc.status === 'rejected' && (
                        <button className="text-[#BFBD31] hover:text-blue-300 text-sm font-medium">
                          Re-upload
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-6 py-3 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-950">
                Contact Verification Team
              </button>
              <button className="px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg hover:bg-[#BFBD31]">
                Upload Missing Documents
              </button>
            </div>
          </div>
        )}

        {/* Public Profile Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">{businessInfo.businessName}</h2>
                <p className="text-slate-400">{businessInfo.shortDescription}</p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className="px-3 py-1 bg-[#BFBD31]/15 text-purple-700 rounded-full text-sm font-semibold">
                    {businessInfo.businessType}
                  </span>
                  <span className="text-yellow-500 font-semibold">★★★★★ 4.8 (156 reviews)</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-white mb-3">About</h3>
                  <p className="text-slate-300 text-sm">{businessInfo.fullDescription}</p>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {businessInfo.specializations.map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-300 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-bold text-white mt-6 mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {businessInfo.languages.map((lang, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-300 rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <h3 className="font-bold text-white mb-4">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <p className="text-slate-300">📍 {contactInfo.addressLine1}, {contactInfo.city}</p>
                  <p className="text-slate-300">📞 {contactInfo.phone}</p>
                  <p className="text-slate-300">✉️ {contactInfo.email}</p>
                  <p className="text-slate-300">🌐 {businessInfo.website}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}