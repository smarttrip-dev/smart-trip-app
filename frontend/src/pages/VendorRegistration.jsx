import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function VendorRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [applicationId, setApplicationId] = useState(''); // generated on submit

  const [formData, setFormData] = useState({
    // Business Information
    businessName: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    yearEstablished: '',
    businessEmail: '',
    businessPhone: '',
    website: '',
    facebookUrl: '',
    instagramUrl: '',

    // Business Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Sri Lanka',

    // Primary Contact
    contactName: '',
    contactDesignation: '',
    contactPhone: '',
    contactEmail: '',

    // Services Offered
    services: [],
    otherServices: '',

    // Verification Documents
    businessCertificate: null,
    taxDocuments: null,
    ownerIdProof: null,
    bankAccountProof: null,
    professionalLicenses: null,

    // Bank Details
    bankName: '',
    bankBranch: '',
    accountName: '',
    accountNumber: '',
    accountType: '',
    swiftCode: '',

    // Account Credentials
    username: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Agreements
    agreeToTerms: false,
    agreeToVendorAgreement: false,
    consentToDataProcessing: false
  });

  const steps = [
    { id: 1, name: 'Business Info', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 2, name: 'Contact & Address', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 3, name: 'Services', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 4, name: 'Documents', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 5, name: 'Bank Details', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 6, name: 'Account Setup', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  const businessTypes = [
    'Hotel/Guest House',
    'Transport Provider',
    'Tour Guide',
    'Activity Provider',
    'Restaurant/Cafe'
  ];

  const cities = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura',
    'Trincomalee', 'Batticaloa', 'Nuwara Eliya', 'Ella', 'Sigiriya', 'Yala'
  ];

  const provinces = [
    'Western', 'Central', 'Southern', 'Northern', 'Eastern',
    'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
  ];

  const servicesOptions = [
    'Accommodation (Hotels/Guest Houses)',
    'Accommodation with Breakfast',
    'Accommodation with Full Board',
    'Vehicle Rental',
    'Tour Guide Services',
    'Activity/Experience Packages',
    'Restaurant Services',
    'Other'
  ];

  const banks = [
    'Bank of Ceylon', 'Commercial Bank', 'People\'s Bank', 'Sampath Bank',
    'Hatton National Bank', 'NDB Bank', 'DFCC Bank', 'Nations Trust Bank'
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = (field, file) => {
    setFormData({ ...formData, [field]: file });
  };

  const handleServiceToggle = (service) => {
    const services = formData.services.includes(service)
      ? formData.services.filter(s => s !== service)
      : [...formData.services, service];
    setFormData({ ...formData, services });
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: 'gray' };
    if (password.length < 6) return { strength: 25, label: 'Weak', color: 'red' };
    if (password.length < 10) return { strength: 50, label: 'Fair', color: 'yellow' };
    if (password.length < 14) return { strength: 75, label: 'Good', color: 'blue' };
    return { strength: 100, label: 'Strong', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.businessName && formData.businessType && 
               formData.businessEmail && formData.businessPhone;
      case 2:
        return formData.addressLine1 && formData.city && formData.province &&
               formData.contactName && formData.contactPhone && formData.contactEmail;
      case 3:
        return formData.services.length > 0;
      case 4:
        return formData.businessCertificate && formData.taxDocuments &&
               formData.ownerIdProof && formData.bankAccountProof;
      case 5:
        return formData.bankName && formData.accountName && formData.accountNumber;
      case 6:
        return formData.username && formData.email && formData.password &&
               formData.password === formData.confirmPassword &&
               formData.agreeToTerms && formData.agreeToVendorAgreement &&
               formData.consentToDataProcessing;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      return alert('Please complete all required fields and agree to the terms');
    }
    try {
      // step 1: create user account with vendor role
      const authRes = await axios.post('/api/auth/register', {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'vendor',
      });
      const token = authRes.data.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // step 2: register vendor profile
      const payload = {
        businessName: formData.businessName,
        businessType: formData.businessType,
        registrationNumber: formData.registrationNumber,
        taxId: formData.taxId,
        yearEstablished: formData.yearEstablished,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        website: formData.website,
        socialMedia: { facebook: formData.facebookUrl, instagram: formData.instagramUrl },
        address: { addressLine1: formData.addressLine1, addressLine2: formData.addressLine2, city: formData.city, province: formData.province, postalCode: formData.postalCode },
        primaryContact: { name: formData.contactName, designation: formData.contactDesignation, phone: formData.contactPhone, email: formData.contactEmail },
        services: formData.services,
        otherServices: formData.otherServices,
        bankDetails: { bankName: formData.bankName, branch: formData.bankBranch, accountName: formData.accountName, accountNumber: formData.accountNumber, accountType: formData.accountType, swiftCode: formData.swiftCode },
      };
      const vendorRes = await axios.post('/api/vendors/register', payload, config);
      localStorage.setItem('userInfo', JSON.stringify(authRes.data));
      setApplicationId(vendorRes.data._id || authRes.data._id);
      setShowSuccessModal(true);
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      alert(message);
    }
  };

  const handleSaveDraft = () => {
    alert('Application saved as draft');
  };

  const handleClearForm = () => {
    if (confirm('Are you sure you want to clear the entire form?')) {
      setFormData({
        businessName: '',
        businessType: '',
        registrationNumber: '',
        taxId: '',
        yearEstablished: '',
        businessEmail: '',
        businessPhone: '',
        website: '',
        facebookUrl: '',
        instagramUrl: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Sri Lanka',
        contactName: '',
        contactDesignation: '',
        contactPhone: '',
        contactEmail: '',
        services: [],
        otherServices: '',
        businessCertificate: null,
        taxDocuments: null,
        ownerIdProof: null,
        bankAccountProof: null,
        professionalLicenses: null,
        bankName: '',
        bankBranch: '',
        accountName: '',
        accountNumber: '',
        accountType: '',
        swiftCode: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
        agreeToVendorAgreement: false,
        consentToDataProcessing: false
      });
      setCurrentStep(1);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans flex flex-col items-center justify-center p-4 z-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.15),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.05),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      

      {/* Top Navigation */}
      <nav className="bg-slate-900 border border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ST</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-200">SmartTRIP Vendor Portal</h1>
                <p className="text-xs text-slate-400">Partner Registration</p>
              </div>
            </div>
            <a href="/vendor-login" className="text-sm text-[#BFBD31] hover:text-purple-700 font-medium">
              Already have an account? Login
            </a>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="bg-slate-900 border border-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    currentStep > step.id ? 'bg-green-500' :
                    currentStep === step.id ? 'bg-[#BFBD31] text-slate-950' :
                    'bg-gray-300'
                  }`}>
                    {currentStep > step.id ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.icon}/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs font-medium text-center ${
                    currentStep >= step.id ? 'text-white' : 'text-slate-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Business Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Enter your business name"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Business Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Year Established
                    </label>
                    <input
                      type="number"
                      value={formData.yearEstablished}
                      onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                      placeholder="e.g., 2015"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Business Registration Number
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                      placeholder="Enter registration number"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Tax Identification Number
                    </label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      placeholder="Enter TIN"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Business Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                      placeholder="business@example.com"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Business Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                      placeholder="+94 XX XXX XXXX"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Website URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.yourwebsite.com"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Facebook URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.facebookUrl}
                      onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Instagram URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.instagramUrl}
                      onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/yourpage"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Address */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Contact & Address Information</h2>
              
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Business Address</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    placeholder="Street address, building number"
                    className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    placeholder="Apartment, suite, unit, etc."
                    className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    >
                      <option value="">Select city</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    >
                      <option value="">Select province</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="e.g., 10400"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    disabled
                    className="w-full px-4 py-2 border border-white/20 rounded-lg bg-slate-950"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-slate-200 mb-4">Primary Contact Person</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      placeholder="Contact person's full name"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formData.contactDesignation}
                      onChange={(e) => handleInputChange('contactDesignation', e.target.value)}
                      placeholder="e.g., Manager, Owner"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="+94 XX XXX XXXX"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="contact@example.com"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services Offered */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Services Offered</h2>
              <p className="text-slate-400 mb-6">Select all services your business provides</p>
              <div className="space-y-3">
                {servicesOptions.map(service => (
                  <label key={service} className="flex items-start gap-3 p-4 border-2 border-white/10 rounded-lg hover:border-[#BFBD31]/40 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="w-5 h-5 text-[#BFBD31] rounded mt-0.5"
                    />
                    <span className="text-slate-300 font-medium">{service}</span>
                  </label>
                ))}
              </div>

              {formData.services.includes('Other') && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Please specify other services
                  </label>
                  <textarea
                    value={formData.otherServices}
                    onChange={(e) => handleInputChange('otherServices', e.target.value)}
                    rows={3}
                    placeholder="Describe your other services..."
                    className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Verification Documents</h2>
              <p className="text-slate-400 mb-6">Upload clear copies of the following documents (PDF or Image format)</p>
              
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Business Registration Certificate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload('businessCertificate', e.target.files[0])}
                    className="w-full"
                  />
                  {formData.businessCertificate && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.businessCertificate.name}</p>
                  )}
                </div>

                <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Tax Documents <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload('taxDocuments', e.target.files[0])}
                    className="w-full"
                  />
                  {formData.taxDocuments && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.taxDocuments.name}</p>
                  )}
                </div>

                <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Owner ID Proof <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload('ownerIdProof', e.target.files[0])}
                    className="w-full"
                  />
                  {formData.ownerIdProof && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.ownerIdProof.name}</p>
                  )}
                </div>

                <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Bank Account Proof <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload('bankAccountProof', e.target.files[0])}
                    className="w-full"
                  />
                  {formData.bankAccountProof && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.bankAccountProof.name}</p>
                  )}
                </div>

                <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Professional Licenses (if applicable)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload('professionalLicenses', e.target.files[0])}
                    className="w-full"
                  />
                  {formData.professionalLicenses && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.professionalLicenses.name}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Bank Details */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Bank Account Details</h2>
              <p className="text-slate-400 mb-6">Payment settlements will be made to this account</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    >
                      <option value="">Select bank</option>
                      {banks.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={formData.bankBranch}
                      onChange={(e) => handleInputChange('bankBranch', e.target.value)}
                      placeholder="Branch name"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Account Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.accountName}
                      onChange={(e) => handleInputChange('accountName', e.target.value)}
                      placeholder="Account holder name"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="Account number"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Account Type
                    </label>
                    <select
                      value={formData.accountType}
                      onChange={(e) => handleInputChange('accountType', e.target.value)}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      SWIFT Code (for international transfers)
                    </label>
                    <input
                      type="text"
                      value={formData.swiftCode}
                      onChange={(e) => handleInputChange('swiftCode', e.target.value)}
                      placeholder="SWIFT/BIC code"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Account Setup */}
          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Account Setup</h2>
              
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Choose a unique username"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                    {formData.password && (
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
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Agreements</h3>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="w-5 h-5 text-[#BFBD31] rounded mt-0.5"
                    />
                    <span className="text-sm text-slate-300">
                      I agree to the <a href="#" className="text-[#BFBD31] hover:text-purple-700 font-medium">Terms of Service</a> <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeToVendorAgreement}
                      onChange={(e) => handleInputChange('agreeToVendorAgreement', e.target.checked)}
                      className="w-5 h-5 text-[#BFBD31] rounded mt-0.5"
                    />
                    <span className="text-sm text-slate-300">
                      I agree to the <a href="#" className="text-[#BFBD31] hover:text-purple-700 font-medium">Vendor Agreement</a> <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentToDataProcessing}
                      onChange={(e) => handleInputChange('consentToDataProcessing', e.target.checked)}
                      className="w-5 h-5 text-[#BFBD31] rounded mt-0.5"
                    />
                    <span className="text-sm text-slate-300">
                      I consent to data processing and privacy policy <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>

                <div className="mt-4">
                  <a href="#" className="text-sm text-[#BFBD31] hover:text-purple-700 font-medium">
                    📄 Download Vendor Agreement
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/10">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleSaveDraft}
                className="px-6 py-3 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg font-semibold hover:bg-[#BFBD31]/10"
              >
                Save as Draft
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClearForm}
                className="px-6 py-3 text-slate-400 hover:text-slate-200 font-medium"
              >
                Clear Form
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="px-6 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
              >
                Preview
              </button>
              {currentStep < 6 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                >
                  Submit for Approval
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Application Submitted Successfully!</h2>
            <p className="text-slate-400 mb-4">
              Your vendor registration application has been received and is under review.
            </p>
            <div className="bg-[#BFBD31]/10 border border-[#BFBD31]/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-300 mb-1">Application ID</p>
              <p className="text-2xl font-bold text-[#BFBD31]">{applicationId}</p>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              We'll review your application within 2-3 business days and notify you via email.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => alert('Tracking application...')}
                className="flex-1 px-6 py-3 border border-[#BFBD31]/40 text-[#BFBD31] rounded-lg font-semibold hover:bg-[#BFBD31]/10"
              >
                Track Status
              </button>
              <button
                onClick={() => navigate('/vendor-login')}
                className="flex-1 px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}