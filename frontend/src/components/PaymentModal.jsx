import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function PaymentModal({ trip, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState('method'); // method | details | processing | success
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  // Card Details
  const [cardDetails, setCardDetails] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // Bank Transfer
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    bank: '',
    accountNumber: '',
    branch: '',
  });

  // Mobile Payment
  const [mobilePayment, setMobilePayment] = useState({
    provider: 'dialog',
    phoneNumber: '',
    otp: '',
  });

  const handleCardChange = (field, value) => {
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    // Format expiry date
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length > 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
    }
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitPayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Validate payment details based on method
    if (paymentMethod === 'card') {
      if (!cardDetails.cardholderName || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast.error('Please fill all card details');
        return;
      }
    } else if (paymentMethod === 'bank') {
      if (!bankDetails.accountHolder || !bankDetails.bank || !bankDetails.accountNumber) {
        toast.error('Please fill all bank details');
        return;
      }
    } else if (paymentMethod === 'mobile') {
      if (!mobilePayment.phoneNumber) {
        toast.error('Please enter phone number');
        return;
      }
    }

    setStep('processing');
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      
      // Call payment endpoint
      const { data } = await axios.patch(`/api/bookings/${trip.id}/pay`, {
        method: paymentMethod,
        details: {
          card: paymentMethod === 'card' ? cardDetails : null,
          bank: paymentMethod === 'bank' ? bankDetails : null,
          mobile: paymentMethod === 'mobile' ? mobilePayment : null,
        },
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      setStep('success');
      setTimeout(() => {
        toast.success('Payment successful! Your trip is confirmed. 🎉');
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setStep('details');
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">💳 Complete Payment</h2>
            <p className="text-slate-400 text-sm mt-1">{trip.destination}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success State */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h3>
              <p className="text-slate-400">Your booking is now confirmed</p>
            </div>
          )}

          {/* Processing State */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 border-4 border-[#BFBD31]/30 border-t-[#BFBD31] rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-2">Processing Payment</h3>
              <p className="text-slate-400">Please wait while we process your payment...</p>
            </div>
          )}

          {/* Method Selection */}
          {step === 'method' && (
            <div className="space-y-3">
              <p className="text-slate-300 font-semibold mb-4">Select Payment Method</p>
              
              {/* Credit Card */}
              <button
                onClick={() => {
                  setPaymentMethod('card');
                  setStep('details');
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'card'
                    ? 'border-[#BFBD31] bg-[#BFBD31]/10'
                    : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                }`}
              >
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v2H3V7m0 6h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Credit/Debit Card</p>
                  <p className="text-slate-400 text-xs">Visa, Mastercard, Amex</p>
                </div>
                <svg className="w-5 h-5 text-[#BFBD31] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </button>

              {/* Bank Transfer */}
              <button
                onClick={() => {
                  setPaymentMethod('bank');
                  setStep('details');
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'bank'
                    ? 'border-[#BFBD31] bg-[#BFBD31]/10'
                    : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                }`}
              >
                <div className="w-12 h-8 bg-gradient-to-r from-green-600 to-emerald-400 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Bank Transfer</p>
                  <p className="text-slate-400 text-xs">All local banks supported</p>
                </div>
                <svg className="w-5 h-5 text-[#BFBD31] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </button>

              {/* Mobile Payment */}
              <button
                onClick={() => {
                  setPaymentMethod('mobile');
                  setStep('details');
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'mobile'
                    ? 'border-[#BFBD31] bg-[#BFBD31]/10'
                    : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                }`}
              >
                <div className="w-12 h-8 bg-gradient-to-r from-orange-600 to-amber-400 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm6 17a1 1 0 100-2 1 1 0 000 2z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Mobile Payment</p>
                  <p className="text-slate-400 text-xs">Dialog, Etisalat, Hutch</p>
                </div>
                <svg className="w-5 h-5 text-[#BFBD31] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </button>

              {/* Amount Summary */}
              <div className="bg-gradient-to-r from-[#BFBD31]/10 to-yellow-500/10 border border-[#BFBD31]/30 rounded-lg p-4 mt-6">
                <p className="text-slate-400 text-sm mb-2">Total Amount Due</p>
                <p className="text-3xl font-bold text-[#BFBD31]">LKR {trip.totalCost.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Card Details Form */}
          {step === 'details' && paymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={cardDetails.cardholderName}
                  onChange={e => handleCardChange('cardholderName', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={e => handleCardChange('cardNumber', e.target.value)}
                  maxLength="19"
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] focus:outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm font-semibold mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={e => handleCardChange('expiryDate', e.target.value)}
                    maxLength="5"
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm font-semibold mb-2">CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={e => handleCardChange('cvv', e.target.value)}
                    maxLength="4"
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Form */}
          {step === 'details' && paymentMethod === 'bank' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300">
                <p className="font-semibold mb-1">📋 Bank Details:</p>
                <p>Account: SmartTrip Pvt Ltd</p>
                <p>Bank: Commercial Bank of Ceylon</p>
                <p>Account No: 12345678901</p>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={bankDetails.accountHolder}
                  onChange={e => setBankDetails(prev => ({ ...prev, accountHolder: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Your Bank</label>
                <select
                  value={bankDetails.bank}
                  onChange={e => setBankDetails(prev => ({ ...prev, bank: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-[#BFBD31] focus:outline-none"
                >
                  <option value="">Select Bank</option>
                  <option value="BOC">Bank of Ceylon</option>
                  <option value="Commercial">Commercial Bank</option>
                  <option value="Hatton">Hatton National Bank</option>
                  <option value="Sampath">Sampath Bank</option>
                  <option value="NDB">NDB Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Account Number</label>
                <input
                  type="text"
                  placeholder="Your Account Number"
                  value={bankDetails.accountNumber}
                  onChange={e => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Branch</label>
                <input
                  type="text"
                  placeholder="Branch Name"
                  value={bankDetails.branch}
                  onChange={e => setBankDetails(prev => ({ ...prev, branch: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Mobile Payment Form */}
          {step === 'details' && paymentMethod === 'mobile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Mobile Provider</label>
                <select
                  value={mobilePayment.provider}
                  onChange={e => setMobilePayment(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-[#BFBD31] focus:outline-none"
                >
                  <option value="dialog">Dialog Axiata</option>
                  <option value="etisalat">Etisalat</option>
                  <option value="hutch">Hutch</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-slate-400">+94</span>
                  <input
                    type="tel"
                    placeholder="712345678"
                    value={mobilePayment.phoneNumber}
                    onChange={e => setMobilePayment(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#BFBD31] focus:outline-none"
                  />
                </div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-sm text-orange-300">
                <p>You'll receive an OTP on your phone after submission</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(step === 'details' || step === 'method') && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
              <button
                onClick={() => step === 'details' ? setStep('method') : onClose()}
                className="flex-1 px-4 py-2 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-white/5 transition-all"
              >
                {step === 'details' ? '← Back' : 'Cancel'}
              </button>
              {step === 'details' && (
                <button
                  onClick={handleSubmitPayment}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#BFBD31] to-yellow-400 text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#BFBD31]/50 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Pay LKR ${trip.totalCost.toLocaleString()}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
