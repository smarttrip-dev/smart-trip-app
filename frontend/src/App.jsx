import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LandingPageAlt from './pages/LandingPageAlt.jsx';
import VendorLogin from './pages/VendorLogin.jsx';
import VendorRegistration from './pages/VendorRegistration.jsx';
// dashboards
import AdminDashboard from './pages/AdminDashboard.jsx';
import VendorDashboard from './pages/VendorDashboard.jsx';
import InventoryManagement from './pages/InventoryManagement.jsx';
import AvailabilityCalendar from './pages/AvailabilityCalendar.jsx';
import BookingReview from './pages/BookingReview.jsx';
import BulkDataUpload from './pages/BulkDataUpload.jsx';
import ExpenseTracking from './pages/ExpenseTracking.jsx';
import HelpSupport from './pages/HelpSupport.jsx';
import ItineraryCustomization from './pages/ItineraryCustomization.jsx';
import TripPlanner from './pages/TripPlanner.jsx';
import MyTrips from './pages/MyTrips.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import PricingManagement from './pages/PricingManagement.jsx';
import ReservationManager from './pages/ReservationManager.jsx';
import RevenueAnalytics from './pages/RevenueAnalytics.jsx';
import ReviewsRatings from './pages/ReviewsRatings.jsx';
import VendorReviews from './pages/VendorReviews.jsx';
import SavedTrips from './pages/SavedTrips.jsx';
import TripDetails from './pages/TripDetails.jsx';
import UserProfile from './pages/UserProfile.jsx';
import VendorProfile from './pages/VendorProfile.jsx';

// TODO: add a proper 404 route at some point
function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Main */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home-alt" element={<LandingPageAlt />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Vendor auth */}
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-register" element={<VendorRegistration />} />

        {/* User pages */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/saved-trips" element={<SavedTrips />} />
        <Route path="/trip/:id" element={<TripDetails />} />
        <Route path="/itinerary" element={<ItineraryCustomization />} />
        <Route path="/plan-trip" element={<TripPlanner />} />
        <Route path="/booking-review" element={<BookingReview />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/help" element={<HelpSupport />} />

        {/* Vendor pages */}
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/inventory" element={<InventoryManagement />} />
        <Route path="/vendor/availability" element={<AvailabilityCalendar />} />
        <Route path="/vendor/bulk-upload" element={<BulkDataUpload />} />
        <Route path="/vendor/reservations" element={<ReservationManager />} />
        <Route path="/vendor/pricing" element={<PricingManagement />} />
        <Route path="/vendor/revenue" element={<RevenueAnalytics />} />
        <Route path="/vendor/expenses" element={<ExpenseTracking />} />
        <Route path="/vendor/reviews" element={<VendorReviews />} />
        <Route path="/vendor/profile" element={<VendorProfile />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;