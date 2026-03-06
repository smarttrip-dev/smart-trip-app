import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function VendorRegistration() {
  const navigate = useNavigate();
  
  // State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [applicationId, setApplicationId] = useState(''); // set after successful submit

  const [formData, setFormData] = useState({
    businessName: '', businessType: '', registrationNumber: '', taxId: '', yearEstablished: '',
    businessEmail: '', businessPhone: '', website: '', facebookUrl: '', instagramUrl: '',
    addressLine1: '', addressLine2: '', city: '', province: '', postalCode: '', country: 'Sri Lanka',
    contactName: '', contactDesignation: '', contactPhone: '', contactEmail: '',
    services: [], otherServices: '',
    businessCertificate: null, taxDocuments: null, ownerIdProof: null, bankAccountProof: null, professionalLicenses: null,
    bankName: '', bankBranch: '', accountName: '', accountNumber: '', accountType: '', swiftCode: '',
    username: '', email: '', password: '', confirmPassword: '',
    agreeToTerms: false, agreeToVendorAgreement: false, consentToDataProcessing: false
  });

  // Constants
  const steps = [
    { id: 1, name: 'Business Info', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 2, name: 'Contact & Address', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 3, name: 'Services', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 4, name: 'Documents', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 5, name: 'Bank Details', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 6, name: 'Account Setup', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  const businessTypes = ['Hotel/Guest House', 'Transport Provider', 'Tour Guide', 'Activity Provider', 'Restaurant/Cafe'];
  const cities = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura', 'Trincomalee', 'Batticaloa', 'Nuwara Eliya', 'Ella', 'Sigiriya', 'Yala'];
  const provinces = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'];
  const servicesOptions = ['Accommodation (Hotels/Guest Houses)', 'Accommodation with Breakfast', 'Accommodation with Full Board', 'Vehicle Rental', 'Tour Guide Services', 'Activity/Experience Packages', 'Restaurant Services', 'Other'];
  const banks = ['Bank of Ceylon', 'Commercial Bank', 'People\'s Bank', 'Sampath Bank', 'Hatton National Bank', 'NDB Bank', 'DFCC Bank', 'Nations Trust Bank'];

  // Handlers
  const handleInputChange = (field, value) => setFormData({ ...formData, [field]: value });
  const handleFileUpload = (field, file) => setFormData({ ...formData, [field]: file });
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
      case 1: return formData.businessName && formData.businessType && formData.businessEmail && formData.businessPhone;
      case 2: return formData.addressLine1 && formData.city && formData.province && formData.contactName && formData.contactPhone && formData.contactEmail;
      case 3: return formData.services.length > 0;
      case 4: return formData.businessCertificate && formData.taxDocuments && formData.ownerIdProof && formData.bankAccountProof;
      case 5: return formData.bankName && formData.accountName && formData.accountNumber;
      case 6: return formData.username && formData.email && formData.password && formData.password === formData.confirmPassword && formData.agreeToTerms && formData.agreeToVendorAgreement && formData.consentToDataProcessing;
      default: return true;
    }
  };

  const handleNext = () => validateStep(currentStep) ? setCurrentStep(currentStep + 1) : alert('Please fill in all required fields');
  const handleBack = () => setCurrentStep(currentStep - 1);
  const handleSaveDraft = () => alert('Application saved as draft');
  
  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear the entire form?')) {
      setFormData({
        businessName: '', businessType: '', registrationNumber: '', taxId: '', yearEstablished: '',
        businessEmail: '', businessPhone: '', website: '', facebookUrl: '', instagramUrl: '',
        addressLine1: '', addressLine2: '', city: '', province: '', postalCode: '', country: 'Sri Lanka',
        contactName: '', contactDesignation: '', contactPhone: '', contactEmail: '',
        services: [], otherServices: '',
        businessCertificate: null, taxDocuments: null, ownerIdProof: null, bankAccountProof: null, professionalLicenses: null,
        bankName: '', bankBranch: '', accountName: '', accountNumber: '', accountType: '', swiftCode: '',
        username: '', email: '', password: '', confirmPassword: '',
        agreeToTerms: false, agreeToVendorAgreement: false, consentToDataProcessing: false
      });
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return toast.error('Please complete all required fields and agree to the terms');

    try {
      // Step 1: Create user account first
      const userPayload = {
        name: formData.contactName || formData.username,
        email: formData.email,
        password: formData.password,
      };

      let userToken;
      try {
        const userRes = await axios.post('/api/auth/register', userPayload);
        userToken = userRes.data.token;
        localStorage.setItem('userInfo', JSON.stringify(userRes.data));
        toast.success('User account created successfully!');
      } catch (authErr) {
        // If user already exists, try to login instead
        if (authErr.response?.status === 400 && authErr.response?.data?.message?.includes('already')) {
          const loginRes = await axios.post('/api/auth/login', {
            email: formData.email,
            password: formData.password,
          });
          userToken = loginRes.data.token;
          localStorage.setItem('userInfo', JSON.stringify(loginRes.data));
          toast.success('Account login successful!');
        } else {
          throw authErr;
        }
      }

      // Step 2: Register vendor profile
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` } };
      
      const { businessCertificate, taxDocuments, ownerIdProof, bankAccountProof, professionalLicenses, confirmPassword, username, password, ...vendorData } = formData;

      const payload = {
        businessName: vendorData.businessName,
        businessType: vendorData.businessType,
        registrationNumber: vendorData.registrationNumber,
        taxId: vendorData.taxId,
        yearEstablished: vendorData.yearEstablished,
        businessEmail: vendorData.businessEmail,
        businessPhone: vendorData.businessPhone,
        website: vendorData.website,
        socialMedia: { facebook: vendorData.facebookUrl, instagram: vendorData.instagramUrl },
        address: { addressLine1: vendorData.addressLine1, addressLine2: vendorData.addressLine2, city: vendorData.city, province: vendorData.province, postalCode: vendorData.postalCode },
        primaryContact: { name: vendorData.contactName, designation: vendorData.contactDesignation, phone: vendorData.contactPhone, email: vendorData.contactEmail },
        services: vendorData.services,
        otherServices: vendorData.otherServices,
        bankDetails: { bankName: vendorData.bankName, branch: vendorData.bankBranch, accountName: vendorData.accountName, accountNumber: vendorData.accountNumber, accountType: vendorData.accountType, swiftCode: vendorData.swiftCode }
      };
      
      const { data } = await axios.post('/api/vendors/register', payload, config);
      setApplicationId(data._id || 'APP-123456');
      setShowSuccessModal(true);
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
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
            <a href="#" className="text-sm text-[#BFBD31] hover:text-purple-700 font-medium">
              Already have an account? Login
            </a>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="bg-slate-900 border border-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1 py-4">
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
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Business Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} placeholder="Enter your business name" className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Business Type <span className="text-red-500">*</span></label>
                    <select value={formData.businessType} onChange={(e) => handleInputChange('businessType', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]">
                      <option value="">Select business type</option>
                      {businessTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Year Established</label>
                    <input type="number" value={formData.yearEstablished} onChange={(e) => handleInputChange('yearEstablished', e.target.value)} placeholder="e.g., 2015" className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Registration Number</label>
                    <input type="text" value={formData.registrationNumber} onChange={(e) => handleInputChange('registrationNumber', e.target.value)} placeholder="Enter registration number" className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Tax ID Number</label>
                    <input type="text" value={formData.taxId} onChange={(e) => handleInputChange('taxId', e.target.value)} placeholder="Enter TIN" className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Business Email <span className="text-red-500">*</span></label>
                    <input type="email" value={formData.businessEmail} onChange={(e) => handleInputChange('businessEmail', e.target.value)} placeholder="business@example.com" className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Business Phone <span className="text-red-500">*</span></label>
                    <input type="tel" value={formData.businessPhone} onChange={(e) => handleInputChange('businessPhone', e.target.value)} placeholder="+94 XX XXX XXXX" className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
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
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Address Line 1 <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.addressLine1} onChange={(e) => handleInputChange('addressLine1', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">City <span className="text-red-500">*</span></label>
                    <select value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]">
                      <option value="">Select city</option>
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Province <span className="text-red-500">*</span></label>
                    <select value={formData.province} onChange={(e) => handleInputChange('province', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]">
                      <option value="">Select province</option>
                      {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-slate-200 mb-4">Primary Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.contactName} onChange={(e) => handleInputChange('contactName', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Contact Phone <span className="text-red-500">*</span></label>
                  <input type="tel" value={formData.contactPhone} onChange={(e) => handleInputChange('contactPhone', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Contact Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.contactEmail} onChange={(e) => handleInputChange('contactEmail', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Services Offered</h2>
              <div className="space-y-3">
                {servicesOptions.map(service => (
                  <label key={service} className="flex items-start gap-3 p-4 border-2 border-white/10 rounded-lg hover:border-[#BFBD31]/40 cursor-pointer transition-all">
                    <input type="checkbox" checked={formData.services.includes(service)} onChange={() => handleServiceToggle(service)} className="w-5 h-5 text-[#BFBD31] rounded mt-0.5" />
                    <span className="text-slate-300 font-medium">{service}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Verification Documents</h2>
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Business Certificate <span className="text-red-500">*</span></label>
                  <input type="file" onChange={(e) => handleFileUpload('businessCertificate', e.target.files[0])} className="w-full" />
                </div>
                <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Tax Documents <span className="text-red-500">*</span></label>
                  <input type="file" onChange={(e) => handleFileUpload('taxDocuments', e.target.files[0])} className="w-full" />
                </div>
                <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Owner ID <span className="text-red-500">*</span></label>
                  <input type="file" onChange={(e) => handleFileUpload('ownerIdProof', e.target.files[0])} className="w-full" />
                </div>
                <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Bank Proof <span className="text-red-500">*</span></label>
                  <input type="file" onChange={(e) => handleFileUpload('bankAccountProof', e.target.files[0])} className="w-full" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Bank Details */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Bank Account Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Bank Name <span className="text-red-500">*</span></label>
                  <select value={formData.bankName} onChange={(e) => handleInputChange('bankName', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]">
                    <option value="">Select bank</option>
                    {banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Account Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.accountName} onChange={(e) => handleInputChange('accountName', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Account Number <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.accountNumber} onChange={(e) => handleInputChange('accountNumber', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Account Setup */}
          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Account Setup</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Username <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Password <span className="text-red-500">*</span></label>
                  <input type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                  <input type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31]" />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.agreeToTerms} onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)} className="w-5 h-5 text-[#BFBD31] rounded" />
                  <span className="text-sm text-slate-300">I agree to the Terms of Service <span className="text-red-500">*</span></span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.agreeToVendorAgreement} onChange={(e) => handleInputChange('agreeToVendorAgreement', e.target.checked)} className="w-5 h-5 text-[#BFBD31] rounded" />
                  <span className="text-sm text-slate-300">I agree to the Vendor Agreement <span className="text-red-500">*</span></span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.consentToDataProcessing} onChange={(e) => handleInputChange('consentToDataProcessing', e.target.checked)} className="w-5 h-5 text-[#BFBD31] rounded" />
                  <span className="text-sm text-slate-300">I consent to data processing <span className="text-red-500">*</span></span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/10">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button onClick={handleBack} className="px-6 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950">Back</button>
              )}
            </div>
            <div className="flex gap-3">
              {currentStep < 6 ? (
                <button onClick={handleNext} className="px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]">Next Step</button>
              ) : (
                <button onClick={handleSubmit} className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Submit for Approval</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
            <div className="bg-[#BFBD31]/10 border border-[#BFBD31]/30 rounded-lg p-4 mb-6 mt-4">
              <p className="text-sm text-slate-300 mb-1">Application ID</p>
              <p className="text-2xl font-bold text-[#BFBD31]">{applicationId}</p>
            </div>
            <button onClick={() => navigate('/login')} className="w-full px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]">
              Return to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}