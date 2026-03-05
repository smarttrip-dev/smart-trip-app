import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HelpSupport() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState(null); // one open at a time
  const [searchQuery, setSearchQuery] = useState('');
  const [showSupportForm, setShowSupportForm] = useState(false);

  const [supportForm, setSupportForm] = useState({
    category: '',
    subject: '',
    description: '',
    screenshot: null,
    bookingReference: ''
  });

  const sections = [
    { id: 'faq', label: 'FAQs', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'search', label: 'Knowledge Base', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: 'tutorials', label: 'Video Tutorials', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'contact', label: 'Contact Support', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'Booking',
      question: 'How does SmartTRIP work?',
      answer: 'SmartTRIP uses Smart Planning Engine to create personalized itineraries based on your budget, preferences, and travel dates. Simply enter your requirements, review Smart-generated options, customize as needed, and submit a soft booking request to our partner vendors. You\'ll receive confirmation within 24-48 hours.'
    },
    {
      id: 2,
      category: 'Booking',
      question: 'What is soft-booking?',
      answer: 'Soft-booking means your trip request is sent to vendors for confirmation before payment. This ensures availability and prevents upfront payment for unconfirmed bookings. You only pay once everything is confirmed by our partners.'
    },
    {
      id: 3,
      category: 'Payment',
      question: 'When do I need to pay?',
      answer: 'Payment is required only after your booking is confirmed by all vendors, typically within 24-48 hours. You\'ll receive a payment link via email and have 48 hours to complete the payment to secure your booking.'
    },
    {
      id: 4,
      category: 'Payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and bank transfers. All payments are processed securely through our encrypted payment gateway.'
    },
    {
      id: 5,
      category: 'Cancellation',
      question: 'What is your cancellation policy?',
      answer: 'Free cancellation up to 7 days before check-in. 50% refund for cancellations 3-7 days before check-in. No refund for cancellations within 3 days of check-in. Specific services may have different policies which will be communicated upon booking.'
    },
    {
      id: 6,
      category: 'Cancellation',
      question: 'How do I cancel my booking?',
      answer: 'You can cancel your booking through the "My Trips" page by clicking on the trip and selecting "Cancel Booking". You\'ll receive a confirmation email once the cancellation is processed.'
    },
    {
      id: 7,
      category: 'Modifications',
      question: 'Can I modify my itinerary after booking?',
      answer: 'Yes, before vendor confirmation you can modify freely. After confirmation, modifications are subject to vendor policies and may incur additional charges. Contact our support team for assistance with changes.'
    },
    {
      id: 8,
      category: 'Budget',
      question: 'How accurate is the budget tracking?',
      answer: 'Our budget tracking is highly accurate and updates in real-time. The system shows exact costs from partner vendors, including all taxes and fees, so there are no surprises at checkout.'
    },
    {
      id: 9,
      category: 'Account',
      question: 'How do I update my profile information?',
      answer: 'Go to your profile page, click "Edit Profile", make your changes, and click "Save Changes". You can update your name, email, phone, travel preferences, and other details.'
    },
    {
      id: 10,
      category: 'Technical',
      question: 'The app is not loading properly. What should I do?',
      answer: 'Try refreshing your browser, clearing your cache and cookies, or using a different browser. If the problem persists, contact our support team with details about your device and browser.'
    }
  ];

  const issueCategories = [
    'Booking Issues',
    'Payment Problems',
    'Cancellation Request',
    'Modification Request',
    'Technical Issue',
    'Account Access',
    'Billing Question',
    'General Inquiry',
    'Feedback/Suggestion',
    'Other'
  ];

  const tutorials = [
    {
      id: 1,
      title: 'Getting Started with SmartTRIP',
      duration: '5:32',
      thumbnail: '#667eea',
      description: 'Learn the basics of using SmartTRIP to plan your perfect trip'
    },
    {
      id: 2,
      title: 'How to Customize Your Itinerary',
      duration: '8:15',
      thumbnail: '#1E90FF',
      description: 'Step-by-step guide to personalizing your travel plans'
    },
    {
      id: 3,
      title: 'Understanding Budget Tracking',
      duration: '4:20',
      thumbnail: '#34C759',
      description: 'Master the budget tracking features to stay within your budget'
    },
    {
      id: 4,
      title: 'Managing Your Bookings',
      duration: '6:45',
      thumbnail: '#FF9500',
      description: 'Learn how to view, modify, and manage your trip bookings'
    },
    {
      id: 5,
      title: 'Using Travel Preferences',
      duration: '3:50',
      thumbnail: '#764ba2',
      description: 'Set up your travel preferences for personalized recommendations'
    },
    {
      id: 6,
      title: 'Expense Tracking During Your Trip',
      duration: '7:10',
      thumbnail: '#FF3B30',
      description: 'Track your spending in real-time while traveling'
    }
  ];

  const knowledgeBase = [
    {
      id: 1,
      title: 'How to create your first trip',
      category: 'Getting Started',
      excerpt: 'Step-by-step guide to planning your first trip with SmartTRIP...'
    },
    {
      id: 2,
      title: 'Understanding pricing and fees',
      category: 'Payments',
      excerpt: 'Learn about our transparent pricing structure and what fees apply...'
    },
    {
      id: 3,
      title: 'Modifying confirmed bookings',
      category: 'Bookings',
      excerpt: 'How to request changes to your confirmed trip itinerary...'
    },
    {
      id: 4,
      title: 'Setting up two-factor authentication',
      category: 'Security',
      excerpt: 'Protect your account with enhanced security features...'
    },
    {
      id: 5,
      title: 'Downloading receipts and invoices',
      category: 'Billing',
      excerpt: 'Access and download your payment receipts and tax invoices...'
    }
  ];

  const handleSubmitTicket = () => {
    if (!supportForm.category || !supportForm.subject || !supportForm.description) {
      alert('Please fill in all required fields');
      return;
    }
    alert('Support ticket submitted! We\'ll get back to you within 24 hours.');
    setShowSupportForm(false);
    setSupportForm({
      category: '',
      subject: '',
      description: '',
      screenshot: null,
      bookingReference: ''
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSupportForm({ ...supportForm, screenshot: file });
  };

  const filteredKnowledgeBase = knowledgeBase.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-xl font-bold text-slate-200">Help & Support</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Live Chat
              </button>
              <button className="px-4 py-2 text-sm font-medium text-[#BFBD31] border border-[#BFBD31]/40 rounded-lg hover:bg-[#BFBD31]/10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Call Support
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="gradient-bg rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">How can we help you today?</h2>
          <p className="text-white/90 mb-6">Search our knowledge base or contact support</p>
          <div className="relative max-w-2xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-4 rounded-lg text-white focus:ring-2 focus:ring-white/50 outline-none text-lg"
            />
          </div>
        </div>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setShowSupportForm(true)}
            className="p-6 bg-slate-900 border border-white/10 rounded-xl shadow-md hover:shadow-lg transition-all text-center"
          >
            <div className="w-12 h-12 bg-[#BFBD31]/15 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-white">Submit Ticket</h3>
            <p className="text-sm text-slate-400 mt-1">Get help via email</p>
          </button>

          <button className="p-6 bg-slate-900 border border-white/10 rounded-xl shadow-md hover:shadow-lg transition-all text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-white">Live Chat</h3>
            <p className="text-sm text-slate-400 mt-1">Chat with an agent</p>
          </button>

          <button className="p-6 bg-slate-900 border border-white/10 rounded-xl shadow-md hover:shadow-lg transition-all text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-white">Call Support</h3>
            <p className="text-sm text-slate-400 mt-1">+94 11 234 5678</p>
          </button>

          <button className="p-6 bg-slate-900 border border-white/10 rounded-xl shadow-md hover:shadow-lg transition-all text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-white">Email Support</h3>
            <p className="text-sm text-slate-400 mt-1">support@smarttrip.lk</p>
          </button>
        </div>

        {/* Section Tabs */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-2 mb-6 flex gap-2 overflow-x-auto">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-6 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                activeSection === section.id
                  ? 'bg-[#BFBD31] text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={section.icon}/>
              </svg>
              {section.label}
            </button>
          ))}
        </div>

        {/* FAQs Section */}
        {activeSection === 'faq' && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {(searchQuery ? filteredFaqs : faqs).map(faq => (
                <div key={faq.id} className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-950 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="px-2 py-1 bg-[#BFBD31]/15 text-purple-700 text-xs font-semibold rounded">
                        {faq.category}
                      </span>
                      <span className="font-semibold text-white">{faq.question}</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                        expandedFaq === faq.id ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-6 pb-4">
                      <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Knowledge Base Section */}
        {activeSection === 'search' && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Knowledge Base</h2>
            <div className="space-y-4">
              {filteredKnowledgeBase.map(article => (
                <div key={article.id} className="border border-white/10 rounded-lg p-6 hover:border-[#BFBD31]/40 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#BFBD31]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{article.title}</h3>
                        <span className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs font-medium rounded">
                          {article.category}
                        </span>
                      </div>
                      <p className="text-slate-400">{article.excerpt}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Tutorials Section */}
        {activeSection === 'tutorials' && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Video Tutorials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map(tutorial => (
                <div key={tutorial.id} className="border border-white/10 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                  <div className="relative h-40" style={{ background: tutorial.thumbnail }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-slate-900 border border-white/10/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#BFBD31]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {tutorial.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2">{tutorial.title}</h3>
                    <p className="text-sm text-slate-400">{tutorial.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support Section */}
        {activeSection === 'contact' && !showSupportForm && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Contact Support</h2>
            <div className="space-y-6">
              <div className="p-6 bg-[#BFBD31]/10 border border-[#BFBD31]/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📧 Email Support</h3>
                <p className="text-[#BFBD31] mb-2">support@smarttrip.lk</p>
                <p className="text-sm text-blue-300">Response time: Within 24 hours</p>
              </div>

              <div className="p-6 bg-green-500/10 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">💬 Live Chat</h3>
                <p className="text-green-400 mb-2">Chat with our support team in real-time</p>
                <p className="text-sm text-green-300">Available: Mon-Fri, 9 AM - 6 PM (GMT+5:30)</p>
                <button className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                  Start Chat
                </button>
              </div>

              <div className="p-6 bg-[#BFBD31]/10 border border-[#BFBD31]/30 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">📞 Phone Support</h3>
                <p className="text-purple-800 mb-2">+94 11 234 5678</p>
                <p className="text-sm text-purple-700">Available: Mon-Fri, 9 AM - 6 PM (GMT+5:30)</p>
              </div>

              <button
                onClick={() => setShowSupportForm(true)}
                className="w-full px-6 py-4 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                </svg>
                Submit a Support Ticket
              </button>
            </div>
          </div>
        )}

        {/* Support Form */}
        {showSupportForm && (
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Submit Support Ticket</h2>
              <button
                onClick={() => setShowSupportForm(false)}
                className="p-2 hover:bg-slate-800/50 rounded-lg"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Issue Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={supportForm.category}
                  onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {issueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                  placeholder="Brief summary of your issue"
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={supportForm.description}
                  onChange={(e) => setSupportForm({ ...supportForm, description: e.target.value })}
                  rows={6}
                  placeholder="Please provide detailed information about your issue..."
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Booking Reference (Optional)
                </label>
                <input
                  type="text"
                  value={supportForm.bookingReference}
                  onChange={(e) => setSupportForm({ ...supportForm, bookingReference: e.target.value })}
                  placeholder="e.g., ST2025-KND-1847"
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Upload Screenshot (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#BFBD31] focus:border-transparent"
                />
                {supportForm.screenshot && (
                  <p className="text-sm text-slate-400 mt-2">
                    Selected: {supportForm.screenshot.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmitTicket}
                  className="flex-1 px-6 py-3 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#BFBD31]"
                >
                  Submit Ticket
                </button>
                <button
                  onClick={() => {
                    setShowSupportForm(false);
                    setSupportForm({
                      category: '',
                      subject: '',
                      description: '',
                      screenshot: null,
                      bookingReference: ''
                    });
                  }}
                  className="px-6 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-950"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Resources */}
        <div className="mt-8 bg-slate-900 border border-white/10 rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-white mb-4">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#" className="p-4 border border-white/10 rounded-lg hover:border-[#BFBD31]/40 hover:bg-[#BFBD31]/10 transition-all flex items-center justify-between">
              <span className="font-medium text-white">📄 Terms & Conditions</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#" className="p-4 border border-white/10 rounded-lg hover:border-[#BFBD31]/40 hover:bg-[#BFBD31]/10 transition-all flex items-center justify-between">
              <span className="font-medium text-white">🔒 Privacy Policy</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#" className="p-4 border border-white/10 rounded-lg hover:border-[#BFBD31]/40 hover:bg-[#BFBD31]/10 transition-all flex items-center justify-between">
              <span className="font-medium text-white">🔄 Cancellation Policy</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#" className="p-4 border border-white/10 rounded-lg hover:border-[#BFBD31]/40 hover:bg-[#BFBD31]/10 transition-all flex items-center justify-between">
              <span className="font-medium text-white">📖 How to Use SmartTRIP</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}