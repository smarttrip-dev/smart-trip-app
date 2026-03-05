import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  // Load real user data from localStorage (set at login/register)
  const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const [profileData, setProfileData] = useState({
    photo: storedUser.photo || null,
    fullName: storedUser.name || '',
    email: storedUser.email || '',
    phone: storedUser.phone || '',
    dateOfBirth: storedUser.dateOfBirth || '',
    location: storedUser.location || '',
    preferredLanguage: storedUser.preferredLanguage || 'English',
    bio: storedUser.bio || '',
  });

  const [travelPreferences, setTravelPreferences] = useState({
    accommodationType: storedUser.travelPreferences?.accommodationType || [],
    mealPlan: storedUser.travelPreferences?.mealPlan || 'breakfast',
    budgetRange: storedUser.travelPreferences?.budgetRange || 50,
    travelStyle: storedUser.travelPreferences?.travelStyle || 'family',
    activityInterests: storedUser.travelPreferences?.activityInterests || [],
    dietaryRestrictions: storedUser.travelPreferences?.dietaryRestrictions || [],
    accessibilityNeeds: [],
    petTraveler: false
  });

  const [notifications, setNotifications] = useState({
    email: {
      bookingConfirmations: true,
      statusUpdates: true,
      promotions: false,
      tripReminders: true,
      reviewRequests: true
    },
    sms: {
      bookingConfirmations: true,
      urgentUpdates: true
    },
    inApp: 'all' // 'all' or 'important'
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: 2,
      type: 'mastercard',
      last4: '8888',
      expiry: '09/26',
      isDefault: false
    }
  ]);

  const [activeSessions] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'Colombo, LK', lastActive: '5 minutes ago', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'Galle, LK', lastActive: '2 hours ago', current: false },
    { id: 3, device: 'Firefox on MacOS', location: 'Kandy, LK', lastActive: '1 day ago', current: false }
  ]);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'preferences', label: 'Travel Preferences', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'payment', label: 'Payment Methods', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'privacy', label: 'Privacy & Data', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
  ];

  const accommodationTypes = [
    { id: 'hotel', label: 'Hotels' },
    { id: 'resort', label: 'Resorts' },
    { id: 'guesthouse', label: 'Guest Houses' },
    { id: 'hostel', label: 'Hostels' },
    { id: 'villa', label: 'Villas' },
    { id: 'apartment', label: 'Apartments' }
  ];

  const activityInterests = [
    { id: 'cultural', label: '🏛️ Cultural Sites' },
    { id: 'nature', label: '🌿 Nature & Wildlife' },
    { id: 'adventure', label: '🏔️ Adventure Sports' },
    { id: 'beach', label: '🏖️ Beach Activities' },
    { id: 'food', label: '🍽️ Food & Culinary' },
    { id: 'shopping', label: '🛍️ Shopping' },
    { id: 'wellness', label: '🧘 Wellness & Spa' },
    { id: 'photography', label: '📸 Photography' }
  ];

  const dietaryOptions = [
    { id: 'none', label: 'No restrictions' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'gluten-free', label: 'Gluten-free' },
    { id: 'lactose-free', label: 'Lactose-free' }
  ];

  const accessibilityOptions = [
    { id: 'wheelchair', label: 'Wheelchair accessible' },
    { id: 'hearing', label: 'Hearing assistance' },
    { id: 'visual', label: 'Visual assistance' },
    { id: 'mobility', label: 'Limited mobility support' }
  ];

  const handleSaveProfile = () => {
    // Persist updated profile fields back to localStorage
    const updated = {
      ...storedUser,
      name: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,
      dateOfBirth: profileData.dateOfBirth,
      location: profileData.location,
      preferredLanguage: profileData.preferredLanguage,
      bio: profileData.bio,
      photo: profileData.photo,
    };
    localStorage.setItem('userInfo', JSON.stringify(updated));
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    setShowPasswordChange(false);
    setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: 'gray' };
    if (password.length < 6) return { strength: 25, label: 'Weak', color: 'red' };
    if (password.length < 10) return { strength: 50, label: 'Fair', color: 'yellow' };
    if (password.length < 14) return { strength: 75, label: 'Good', color: 'blue' };
    return { strength: 100, label: 'Strong', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(security.newPassword);

  const handleDeleteAccount = () => {
    alert('Account deletion initiated. You will receive a confirmation email.');
    setShowDeleteConfirm(false);
  };

  const togglePreference = (category, item) => {
    if (Array.isArray(travelPreferences[category])) {
      const updated = travelPreferences[category].includes(item)
        ? travelPreferences[category].filter(i => i !== item)
        : [...travelPreferences[category], item];
      setTravelPreferences({ ...travelPreferences, [category]: updated });
    } else {
      setTravelPreferences({ ...travelPreferences, [category]: item });
    }
  };

  const toggleNotification = (category, item) => {
    if (category === 'inApp') {
      setNotifications({ ...notifications, inApp: item });
    } else {
      setNotifications({
        ...notifications,
        [category]: { ...notifications[category], [item]: !notifications[category][item] }
      });
    }
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
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800/50 rounded-lg">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <h1 className="text-xl font-bold text-slate-200">My Profile</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/my-trips')} className="px-3 py-1.5 text-sm text-slate-400 hover:text-[#BFBD31] transition-colors">My Trips</button>
              <button
                onClick={() => { localStorage.removeItem('userInfo'); navigate('/'); }}
                className="px-3 py-1.5 text-sm text-red-400 border border-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-4 space-y-2 sticky top-24">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#BFBD31] text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}/>
                  </svg>
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31]"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg font-medium hover:bg-slate-950"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31]"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Photo */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
                  <div className="relative">
                    {profileData.photo ? (
                      <img src={profileData.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-[#BFBD31] text-slate-950 flex items-center justify-center text-white text-3xl font-bold">
                        {profileData.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#BFBD31] text-slate-950 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#BFBD31]">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{profileData.fullName}</h3>
                    <p className="text-slate-400">{profileData.email}</p>
                    {isEditing && (
                      <div className="flex gap-2 mt-2">
                        <label className="px-3 py-1.5 text-sm border border-[#BFBD31] text-[#BFBD31] rounded-lg cursor-pointer hover:bg-[#BFBD31]/10">
                          Upload Photo
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                        {profileData.photo && (
                          <button
                            onClick={() => setProfileData({ ...profileData, photo: null })}
                            className="px-3 py-1.5 text-sm border border-red-300 text-red-400 rounded-lg hover:bg-red-500/10"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent disabled:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent disabled:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent disabled:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent disabled:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Location/City</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent disabled:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Preferred Language</label>
                    <select
                      value={profileData.preferredLanguage}
                      onChange={(e) => setProfileData({ ...profileData, preferredLanguage: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent disabled:bg-slate-950"
                    >
                      <option value="English">English</option>
                      <option value="Sinhala">Sinhala</option>
                      <option value="Tamil">Tamil</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Bio/About Me</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent disabled:bg-slate-950"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Travel Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Travel Preferences</h2>

                <div className="space-y-8">
                  {/* Accommodation Type */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Preferred Accommodation Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {accommodationTypes.map(type => (
                        <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={travelPreferences.accommodationType.includes(type.id)}
                            onChange={() => togglePreference('accommodationType', type.id)}
                            className="w-5 h-5 text-[#BFBD31] rounded"
                          />
                          <span className="text-slate-300">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Meal Plan */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Meal Plan Preference</h3>
                    <div className="space-y-2">
                      {['none', 'breakfast', 'half-board', 'full-board', 'all-inclusive'].map(plan => (
                        <label key={plan} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="mealPlan"
                            checked={travelPreferences.mealPlan === plan}
                            onChange={() => togglePreference('mealPlan', plan)}
                            className="w-5 h-5 text-[#BFBD31]"
                          />
                          <span className="text-slate-300 capitalize">{plan.replace('-', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Budget Range Comfort</h3>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={travelPreferences.budgetRange}
                        onChange={(e) => setTravelPreferences({ ...travelPreferences, budgetRange: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>Budget</span>
                        <span className="font-semibold text-[#BFBD31]">{travelPreferences.budgetRange}%</span>
                        <span>Luxury</span>
                      </div>
                    </div>
                  </div>

                  {/* Travel Style */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Preferred Travel Style</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['solo', 'couple', 'family', 'group'].map(style => (
                        <button
                          key={style}
                          onClick={() => togglePreference('travelStyle', style)}
                          className={`px-4 py-3 rounded-lg font-medium transition-all ${
                            travelPreferences.travelStyle === style
                              ? 'bg-[#BFBD31] text-slate-950'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-gray-200'
                          }`}
                        >
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Interests */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Activity Interests</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {activityInterests.map(activity => (
                        <label key={activity.id} className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          travelPreferences.activityInterests.includes(activity.id)
                            ? 'border-[#BFBD31] bg-[#BFBD31]/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}>
                          <input
                            type="checkbox"
                            checked={travelPreferences.activityInterests.includes(activity.id)}
                            onChange={() => togglePreference('activityInterests', activity.id)}
                            className="w-5 h-5 text-[#BFBD31] rounded"
                          />
                          <span className="text-sm text-slate-300">{activity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Dietary Restrictions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {dietaryOptions.map(option => (
                        <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={travelPreferences.dietaryRestrictions.includes(option.id)}
                            onChange={() => togglePreference('dietaryRestrictions', option.id)}
                            className="w-5 h-5 text-[#BFBD31] rounded"
                          />
                          <span className="text-slate-300">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Accessibility Needs */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Accessibility Needs</h3>
                    <div className="space-y-2">
                      {accessibilityOptions.map(option => (
                        <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={travelPreferences.accessibilityNeeds.includes(option.id)}
                            onChange={() => togglePreference('accessibilityNeeds', option.id)}
                            className="w-5 h-5 text-[#BFBD31] rounded"
                          />
                          <span className="text-slate-300">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Pet Traveler */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Pet Traveler</h3>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={travelPreferences.petTraveler === true}
                          onChange={() => setTravelPreferences({ ...travelPreferences, petTraveler: true })}
                          className="w-5 h-5 text-[#BFBD31]"
                        />
                        <span className="text-slate-300">Yes, I travel with pets</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={travelPreferences.petTraveler === false}
                          onChange={() => setTravelPreferences({ ...travelPreferences, petTraveler: false })}
                          className="w-5 h-5 text-[#BFBD31]"
                        />
                        <span className="text-slate-300">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={() => alert('Preferences updated!')}
                    className="px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]"
                  >
                    Update Preferences
                  </button>
                  <button
                    onClick={() => alert('Reset to defaults')}
                    className="px-6 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Change Password</h2>
                    {!showPasswordChange && (
                      <button
                        onClick={() => setShowPasswordChange(true)}
                        className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31]"
                      >
                        Change Password
                      </button>
                    )}
                  </div>

                  {showPasswordChange && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Current Password</label>
                        <input
                          type="password"
                          value={security.currentPassword}
                          onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
                        <input
                          type="password"
                          value={security.newPassword}
                          onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                        />
                        {security.newPassword && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-400">Password Strength:</span>
                              <span className={`text-xs font-semibold text-${passwordStrength.color}-600`}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full bg-${passwordStrength.color}-500 transition-all`}
                                style={{ width: `${passwordStrength.strength}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={security.confirmPassword}
                          onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setShowPasswordChange(false)}
                          className="px-4 py-2 border border-white/20 text-slate-300 rounded-lg font-medium hover:bg-slate-950"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handlePasswordChange}
                          className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31]"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Two-Factor Authentication</h2>
                  <p className="text-slate-400 mb-6">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-200">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-400">
                        {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled });
                        if (!security.twoFactorEnabled) setShow2FASetup(true);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        security.twoFactorEnabled
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-[#BFBD31] text-slate-950 hover:bg-[#BFBD31]'
                      }`}
                    >
                      {security.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                    </button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Active Sessions</h2>
                    <button className="px-4 py-2 border border-red-300 text-red-400 rounded-lg font-medium hover:bg-red-500/10">
                      Logout All Devices
                    </button>
                  </div>
                  <div className="space-y-3">
                    {activeSessions.map(session => (
                      <div key={session.id} className="flex items-start justify-between p-4 bg-slate-950 rounded-lg">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-[#BFBD31]/15 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">{session.device}</p>
                            <p className="text-sm text-slate-400">{session.location}</p>
                            <p className="text-sm text-slate-500">Last active: {session.lastActive}</p>
                            {session.current && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-300 text-xs font-semibold rounded-full">
                                Current Session
                              </span>
                            )}
                          </div>
                        </div>
                        {!session.current && (
                          <button className="text-red-400 hover:text-red-300 font-medium text-sm">
                            Logout
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 text-[#BFBD31] hover:text-purple-700 font-medium text-sm">
                    View Login History
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>

                <div className="space-y-8">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      {Object.entries(notifications.email).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg">
                          <span className="text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={() => toggleNotification('email', key)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#BFBD31]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-900 border border-white/10 after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BFBD31] text-slate-950"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">SMS Notifications</h3>
                    <div className="space-y-3">
                      {Object.entries(notifications.sms).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg">
                          <span className="text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={() => toggleNotification('sms', key)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#BFBD31]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-900 border border-white/10 after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BFBD31] text-slate-950"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* In-App Notifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">In-App Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={notifications.inApp === 'all'}
                          onChange={() => toggleNotification('inApp', 'all')}
                          className="w-5 h-5 text-[#BFBD31]"
                        />
                        <span className="text-slate-300">All updates</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={notifications.inApp === 'important'}
                          onChange={() => toggleNotification('inApp', 'important')}
                          className="w-5 h-5 text-[#BFBD31]"
                        />
                        <span className="text-slate-300">Important only</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={() => alert('Notification settings saved!')}
                    className="px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]"
                  >
                    Save Notification Settings
                  </button>
                  <button
                    onClick={() => alert('Test email sent!')}
                    className="px-6 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
                  >
                    Test Email Notification
                  </button>
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
                  <button className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31]">
                    Add New Card
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {paymentMethods.map(card => (
                    <div key={card.id} className="flex items-center justify-between p-4 border-2 border-white/10 rounded-lg hover:border-[#BFBD31]/40 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800/50 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 capitalize">{card.type} •••• {card.last4}</p>
                          <p className="text-sm text-slate-400">Expires {card.expiry}</p>
                          {card.isDefault && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-[#BFBD31]/15 text-purple-700 text-xs font-semibold rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!card.isDefault && (
                          <button className="px-3 py-1.5 text-sm text-[#BFBD31] hover:bg-[#BFBD31]/10 rounded-lg font-medium">
                            Set as Default
                          </button>
                        )}
                        <button className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg font-medium">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="text-[#BFBD31] hover:text-purple-700 font-medium">
                  Edit Billing Address
                </button>
              </div>
            )}

            {/* Privacy & Data Tab */}
            {activeTab === 'privacy' && (
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Privacy & Data</h2>

                <div className="space-y-6">
                  <div className="p-4 bg-[#BFBD31]/10 border border-[#BFBD31]/20 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Download Your Data (GDPR Compliance)</h3>
                    <p className="text-sm text-[#BFBD31] mb-4">
                      Request a copy of all your personal data stored in our system.
                    </p>
                    <button className="px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31]">
                      Download My Data
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-lg">
                    <h3 className="font-semibold text-slate-200 mb-2">Privacy Settings</h3>
                    <div className="space-y-3 mt-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-slate-300">Allow SmartTRIP to use my data for personalized recommendations</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-[#BFBD31] rounded" />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-slate-300">Share anonymized travel data for research purposes</span>
                        <input type="checkbox" className="w-5 h-5 text-[#BFBD31] rounded" />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-slate-300">Allow third-party vendors to contact me</span>
                        <input type="checkbox" className="w-5 h-5 text-[#BFBD31] rounded" />
                      </label>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-medium hover:bg-[#BFBD31]">
                      Update Privacy Settings
                    </button>
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-400 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Delete Account?</h2>
            <p className="text-slate-400 text-center mb-6">
              This will permanently delete your account and all your data. This action cannot be undone.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Type 'DELETE' to confirm"
                className="w-full px-4 py-2 border-2 border-white/20 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 border-2 border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Setup Two-Factor Authentication</h2>
            <p className="text-slate-400 mb-6">
              Scan this QR code with your authenticator app to enable 2FA.
            </p>
            <div className="bg-slate-800/50 rounded-xl h-64 flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="w-48 h-48 bg-slate-900 border border-white/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-32 h-32 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm15 0h3v3h-3v-3zm0 5h3v3h-3v-3z"/>
                  </svg>
                </div>
                <p className="text-sm text-slate-400">QR Code Placeholder</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShow2FASetup(false)}
                className="flex-1 px-4 py-3 border-2 border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShow2FASetup(false);
                  alert('2FA enabled successfully!');
                }}
                className="flex-1 px-4 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]"
              >
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}