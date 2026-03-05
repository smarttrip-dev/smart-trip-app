/**
 * Seed script — populates MongoDB with sample data for all collections.
 * Run: node src/seed.js
 * Add --fresh flag to wipe existing data first: node src/seed.js --fresh
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

import User from './models/User.js';
import Vendor from './models/Vendor.js';
import Trip from './models/Trip.js';
import SavedTrip from './models/SavedTrip.js';
import InventoryItem from './models/InventoryItem.js';
import ConfigCity from './models/ConfigCity.js';
import ConfigProvince from './models/ConfigProvince.js';
import ConfigService from './models/ConfigService.js';
import ConfigDestination from './models/ConfigDestination.js';
import ConfigPreference from './models/ConfigPreference.js';
import ConfigBank from './models/ConfigBank.js';
import ConfigWorkflow from './models/ConfigWorkflow.js';
import ConfigItineraryItem from './models/ConfigItineraryItem.js';

const FRESH = process.argv.includes('--fresh');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  if (FRESH) {
    await Promise.all([
      User.deleteMany({}),
      Vendor.deleteMany({}),
      Trip.deleteMany({}),
      SavedTrip.deleteMany({}),
      InventoryItem.deleteMany({}),
      ConfigCity.deleteMany({}),
      ConfigProvince.deleteMany({}),
      ConfigService.deleteMany({}),
      ConfigDestination.deleteMany({}),
      ConfigPreference.deleteMany({}),
      ConfigBank.deleteMany({}),
      ConfigWorkflow.deleteMany({}),
      ConfigItineraryItem.deleteMany({}),
    ]);
    console.log('🗑  Cleared all collections');
  }

  // ─── CONFIG: PROVINCES ────────────────────────────────────────────────────
  const provinces = await ConfigProvince.insertMany([
    { name: 'Western', code: 'WR' },
    { name: 'Central', code: 'CP' },
    { name: 'Southern', code: 'SR' },
    { name: 'Northern', code: 'NR' },
    { name: 'Eastern', code: 'ER' },
    { name: 'North Western', code: 'NWR' },
    { name: 'North Central', code: 'NCR' },
    { name: 'Uva', code: 'UV' },
    { name: 'Sabaragamuwa', code: 'SB' },
  ]);
  console.log('📍 Created 9 provinces');

  // ─── CONFIG: CITIES ────────────────────────────────────────────────────────
  const cities = await ConfigCity.insertMany([
    { name: 'Colombo', province: 'Western', region: 'City' },
    { name: 'Kandy', province: 'Central', region: 'Hill Country' },
    { name: 'Galle', province: 'Southern', region: 'Coastal' },
    { name: 'Jaffna', province: 'Northern', region: 'Beach' },
    { name: 'Negombo', province: 'Western', region: 'Coastal' },
    { name: 'Anuradhapura', province: 'North Central', region: 'Heritage' },
    { name: 'Trincomalee', province: 'Eastern', region: 'Beach' },
    { name: 'Batticaloa', province: 'Eastern', region: 'Beach' },
    { name: 'Nuwara Eliya', province: 'Central', region: 'Hill Country' },
    { name: 'Ella', province: 'Uva', region: 'Hill Country' },
    { name: 'Sigiriya', province: 'Central', region: 'Heritage' },
    { name: 'Yala', province: 'Southern', region: 'Wildlife' },
    { name: 'Mirissa', province: 'Southern', region: 'Beach' },
    { name: 'Dambulla', province: 'Central', region: 'Heritage' },
    { name: 'Hikkaduwa', province: 'Southern', region: 'Beach' },
    { name: 'Bentota', province: 'Southern', region: 'Beach' },
  ]);
  console.log('🏙️  Created 16 cities');

  // ─── CONFIG: SERVICES ─────────────────────────────────────────────────────
  const services = await ConfigService.insertMany([
    { name: 'Accommodation (Hotels/Guest Houses)', category: 'accommodation' },
    { name: 'Accommodation with Breakfast', category: 'accommodation' },
    { name: 'Accommodation with Full Board', category: 'accommodation' },
    { name: 'Vehicle Rental', category: 'transport' },
    { name: 'Tour Guide Services', category: 'activity' },
    { name: 'Activity/Experience Packages', category: 'activity' },
    { name: 'Restaurant Services', category: 'meal' },
    { name: 'Transport Services', category: 'transport' },
    { name: 'Travel Packages', category: 'package' },
  ]);
  console.log('🛎️  Created 9 services');

  // ─── CONFIG: DESTINATIONS ─────────────────────────────────────────────────
  const destinations = await ConfigDestination.insertMany([
    { name: 'Kandy', tag: 'Cultural', emoji: '🛕', defaultDays: 3, defaultPrice: 45000, region: 'Kandy', description: 'Ancient temples & scenic hills', image: '/images/destinations/kandy.jpg', attractions: ['Temple of the Tooth', 'Kandy Lake', 'Royal Palace', 'Botanical Gardens'] },
    { name: 'Galle', tag: 'Coastal', emoji: '🏰', defaultDays: 4, defaultPrice: 55000, region: 'Galle', description: 'Dutch fort & pristine beaches', image: '/images/destinations/galle.jpg', attractions: ['Galle Fort', 'Unawatuna Beach', 'Japanese Peace Pagoda', 'Lighthouse Point'] },
    { name: 'Ella', tag: 'Hill Country', emoji: '🌿', defaultDays: 3, defaultPrice: 40000, region: 'Ella', description: 'Tea country & breathtaking views', image: '/images/destinations/ella.jpg', attractions: ['Ella Rock', 'Nine Arch Bridge', 'Tea Plantations', 'Ravana Falls'] },
    { name: 'Sigiriya', tag: 'Heritage', emoji: '🏯', defaultDays: 2, defaultPrice: 50000, region: 'Sigiriya', description: 'Ancient rock fortress wonder', image: '/images/destinations/sigiriya.jpg', attractions: ['Lion Rock', 'Ancient Paintings', 'Mirror Wall', 'Royal Gardens'] },
    { name: 'Yala', tag: 'Wildlife', emoji: '🐘', defaultDays: 2, defaultPrice: 60000, region: 'Yala', description: 'Premier safari experience', image: '/images/destinations/yala.png', attractions: ['Safari Tours', 'Leopard Spotting', 'Crocodile Ponds', 'Bird Watching'] },
    { name: 'Nuwara Eliya', tag: 'Nature', emoji: '🍃', defaultDays: 3, defaultPrice: 48000, region: 'Nuwara Eliya', description: 'Cool climate & tea estates', image: '/images/destinations/nuwaraeliya.jpg', attractions: ['Gregory Lake', 'Horton Plains', 'Tea Factory Visit', 'Post Office Hill'] },
    { name: 'Mirissa', tag: 'Beach', emoji: '🐋', defaultDays: 3, defaultPrice: 42000, region: 'Mirissa', description: 'Whale watching & golden sands', image: '', attractions: ['Whale Watching Tours', 'Mirissa Beach', 'Parrot Rock', 'Sunset Boat Rides'] },
    { name: 'Trincomalee', tag: 'Beach', emoji: '🌊', defaultDays: 4, defaultPrice: 52000, region: 'Trincomalee', description: 'Crystal waters & diving spots', image: '', attractions: ['Pigeon Island', 'Fort Frederick', 'Arugambe Beach', 'Scuba Diving'] },
    { name: 'Anuradhapura', tag: 'Heritage', emoji: '🕌', defaultDays: 2, defaultPrice: 38000, region: 'Anuradhapura', description: 'Sacred city & ancient ruins', image: '', attractions: ['Sacred Bodhi Tree', 'Jetavana Stupa', 'Abhayagiri Stupa', 'Ancient Monasteries'] },
    { name: 'Colombo', tag: 'City', emoji: '🌆', defaultDays: 2, defaultPrice: 35000, region: 'Colombo', description: 'Vibrant capital & street food', image: '', attractions: ['Old Parliament', 'Galle Face Hotel', 'National Museum', 'Beach Boulevard'] },
    { name: 'Dambulla', tag: 'Heritage', emoji: '🏛️', defaultDays: 2, defaultPrice: 36000, region: 'Dambulla', description: 'Cave temples & rock paintings', image: '', attractions: ['Golden Temple', 'Dambulla Cave Temples', 'Rock Carvings', 'Spice Gardens'] },
    { name: 'Hikkaduwa', tag: 'Beach', emoji: '🤿', defaultDays: 3, defaultPrice: 44000, region: 'Hikkaduwa', description: 'Coral reefs & surf breaks', image: '', attractions: ['Coral Sanctuary', 'Turtle Hatchery', 'Hikkaduwa Beach', 'Surfing Spots'] },
  ]);
  console.log('🌍 Created 12 destinations');

  // ─── CONFIG: PREFERENCES ──────────────────────────────────────────────────
  const preferences = await ConfigPreference.insertMany([
    // Travel Styles
    { category: 'travelStyle', value: 'adventure', label: 'Adventure' },
    { category: 'travelStyle', value: 'family', label: 'Family' },
    { category: 'travelStyle', value: 'luxury', label: 'Luxury' },
    { category: 'travelStyle', value: 'budget', label: 'Budget' },
    { category: 'travelStyle', value: 'relaxation', label: 'Relaxation' },
    // Accommodation Types
    { category: 'accommodationType', value: 'hotel', label: 'Hotel' },
    { category: 'accommodationType', value: 'villa', label: 'Villa' },
    { category: 'accommodationType', value: 'resort', label: 'Resort' },
    { category: 'accommodationType', value: 'boutique', label: 'Boutique Hotel' },
    { category: 'accommodationType', value: 'guesthouse', label: 'Guest House' },
    { category: 'accommodationType', value: 'airbnb', label: 'AirBnB' },
    // Meal Plans
    { category: 'mealPlan', value: 'breakfast', label: 'Breakfast' },
    { category: 'mealPlan', value: 'half-board', label: 'Half Board' },
    { category: 'mealPlan', value: 'full-board', label: 'Full Board' },
    { category: 'mealPlan', value: 'all-inclusive', label: 'All Inclusive' },
    // Activity Interests
    { category: 'activityInterest', value: 'hiking', label: 'Hiking' },
    { category: 'activityInterest', value: 'wildlife', label: 'Wildlife' },
    { category: 'activityInterest', value: 'photography', label: 'Photography' },
    { category: 'activityInterest', value: 'snorkeling', label: 'Snorkeling' },
    { category: 'activityInterest', value: 'spa', label: 'Spa' },
    { category: 'activityInterest', value: 'sunset-cruise', label: 'Sunset Cruises' },
    // Travel Interests
    { category: 'travelInterest', value: 'nature', label: 'Nature' },
    { category: 'travelInterest', value: 'adventure', label: 'Adventure' },
    { category: 'travelInterest', value: 'cultural', label: 'Cultural' },
    { category: 'travelInterest', value: 'beach', label: 'Beach' },
    { category: 'travelInterest', value: 'food', label: 'Food' },
    { category: 'travelInterest', value: 'relaxation', label: 'Relaxation' },
    // Languages
    { category: 'language', value: 'english', label: 'English' },
    { category: 'language', value: 'sinhala', label: 'Sinhala' },
    { category: 'language', value: 'tamil', label: 'Tamil' },
    // Dietary Restrictions
    { category: 'dietaryRestriction', value: 'vegetarian', label: 'Vegetarian' },
    { category: 'dietaryRestriction', value: 'vegan', label: 'Vegan' },
    { category: 'dietaryRestriction', value: 'halal', label: 'Halal' },
    { category: 'dietaryRestriction', value: 'kosher', label: 'Kosher' },
    { category: 'dietaryRestriction', value: 'gluten-free', label: 'Gluten Free' },
    // Accessibility
    { category: 'accessibility', value: 'wheelchair', label: 'Wheelchair Accessible' },
    { category: 'accessibility', value: 'mobility', label: 'Mobility Assistance' },
    { category: 'accessibility', value: 'hearing', label: 'Hearing Accessibility' },
    { category: 'accessibility', value: 'visual', label: 'Visual Accessibility' },
  ]);
  console.log('⚙️  Created 38 preferences');

  // ─── CONFIG: BANKS ────────────────────────────────────────────────────────
  const banks = await ConfigBank.insertMany([
    { name: 'Bank of Ceylon', code: 'BOC' },
    { name: 'Commercial Bank', code: 'COMB' },
    { name: "People's Bank", code: 'PB' },
    { name: 'Sampath Bank', code: 'SMTH' },
    { name: 'Hatton National Bank', code: 'HNB' },
    { name: 'NDB Bank', code: 'NDB' },
    { name: 'DFCC Bank', code: 'DFCC' },
    { name: 'Nations Trust Bank', code: 'NTB' },
    { name: 'BOC Digital', code: 'BOCD' },
    { name: 'Seylan Bank', code: 'SEYLAN' },
  ]);
  console.log('🏦 Created 10 banks');

  // ─── CONFIG: WORKFLOW ─────────────────────────────────────────────────────
  const workflows = await ConfigWorkflow.insertMany([
    { step: 1, name: 'Booking Submitted', description: 'User submits booking request', status: 'completed', order: 1 },
    { step: 2, name: 'Vendor Approval', description: 'Vendor reviews and approves booking', status: 'pending', order: 2 },
    { step: 3, name: 'Confirmed', description: 'Trip is confirmed by vendor', status: 'pending', order: 3 },
    { step: 4, name: 'Trip Completed', description: 'Trip is completed and payment cleared', status: 'pending', order: 4 },
  ]);
  console.log('📋 Created 4 workflow steps');

  // ─── USERS ────────────────────────────────────────────────────────────────
  const hash = (pw) => bcrypt.hash(pw, 10);

  const [adminUser, user1, user2, vendorUser1, vendorUser2] = await Promise.all([
    User.create({
      name: 'Admin User',
      email: 'admin@smarttrip.lk',
      password: await hash('Admin@123'),
      role: 'admin',
      phone: '+94 77 000 0001',
      location: 'Colombo, Sri Lanka',
      bio: 'Platform administrator for SmartTrip.',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin',
    }),
    User.create({
      name: 'Thisara Perera',
      email: 'thisara@example.com',
      password: await hash('User@123'),
      role: 'user',
      phone: '+94 71 234 5678',
      dateOfBirth: '1995-06-15',
      location: 'Kandy, Sri Lanka',
      bio: 'Passionate traveller who loves exploring hill country routes.',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Thisara',
      travelInterests: ['Nature', 'Adventure', 'Cultural'],
      travelPreferences: {
        accommodationType: ['Hotel', 'Villa'],
        mealPlan: 'all-inclusive',
        budgetRange: 75,
        travelStyle: 'adventure',
        activityInterests: ['Hiking', 'Wildlife', 'Photography'],
        dietaryRestrictions: [],
        accessibilityNeeds: [],
        petTraveler: false,
      },
    }),
    User.create({
      name: 'Nimasha Silva',
      email: 'nimasha@example.com',
      password: await hash('User@123'),
      role: 'user',
      phone: '+94 76 987 6543',
      dateOfBirth: '1998-03-22',
      location: 'Galle, Sri Lanka',
      bio: 'Beach lover and food enthusiast.',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Nimasha',
      travelInterests: ['Beach', 'Food', 'Relaxation'],
      travelPreferences: {
        accommodationType: ['Resort', 'Boutique Hotel'],
        mealPlan: 'breakfast',
        budgetRange: 60,
        travelStyle: 'luxury',
        activityInterests: ['Snorkeling', 'Spa', 'Sunset Cruises'],
      },
    }),
    User.create({
      name: 'Roshan De Silva',
      email: 'roshan.vendor@example.com',
      password: await hash('Vendor@123'),
      role: 'vendor',
      phone: '+94 72 111 2222',
      location: 'Colombo, Sri Lanka',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Roshan',
    }),
    User.create({
      name: 'Amaya Tours',
      email: 'amaya.vendor@example.com',
      password: await hash('Vendor@123'),
      role: 'vendor',
      phone: '+94 77 333 4444',
      location: 'Negombo, Sri Lanka',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Amaya',
    }),
  ]);
  console.log('👤 Created 5 users');

  // ─── CREATE MORE VENDOR USERS ─────────────────────────────────────────────
  const moreVendorUsers = await Promise.all([
    User.create({
      name: 'Earl\'s Regency Hotels',
      email: 'hotels.earls@example.com',
      password: await hash('Vendor@123'),
      role: 'vendor',
      phone: '+94 81 223 3344',
      location: 'Kandy, Sri Lanka',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Earls',
    }),
    User.create({
      name: 'Safari Jeep Rentals',
      email: 'safari.rentals@example.com',
      password: await hash('Vendor@123'),
      role: 'vendor',
      phone: '+94 23 555 6666',
      location: 'Yala, Sri Lanka',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Safari',
    }),
    User.create({
      name: 'Local Guide Services',
      email: 'guides.local@example.com',
      password: await hash('Vendor@123'),
      role: 'vendor',
      phone: '+94 36 777 8888',
      location: 'Ella, Sri Lanka',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Guides',
    }),
    User.create({
      name: 'Adventure Extreme Sports',
      email: 'adventure.extreme@example.com',
      password: await hash('Vendor@123'),
      role: 'vendor',
      phone: '+94 91 999 0000',
      location: 'Colombo, Sri Lanka',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Adventure',
    }),
    User.create({
      name: 'The Spice Trail Restaurant',
      email: 'spice.trail@example.com',
      password: await hash('Vendor@123'),
      role: 'vendor',
      phone: '+94 11 222 3333',
      location: 'Colombo, Sri Lanka',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=SpiceTrail',
    }),
    User.create({
      name: 'Luxury Villas Galle',
      email: 'villas.galle@example.com',
      password: await hash('Vendor@123'),
      role: 'vendor',
      phone: '+94 91 234 5678',
      location: 'Galle, Sri Lanka',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=VillasGalle',
    }),
    User.create({
      name: 'TravelMax Tours',
      email: 'travelmax@example.com',
      password: await hash('Vendor@123'),
      role: 'vendor',
      phone: '+94 11 456 7890',
      location: 'Colombo, Sri Lanka',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=TravelMax',
    }),
    User.create({
      name: 'Beachside Cabanas',
      email: 'beachside.cabanas@example.com',
      password: await hash('Vendor@123'),
      role: 'vendor',
      phone: '+94 32 111 2222',
      location: 'Mirissa, Sri Lanka',
      photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Beachside',
    }),
  ]);
  console.log('👤 Created 8 additional vendor users');

  // ─── VENDORS ──────────────────────────────────────────────────────────────
  const [vendor1, vendor2, vendor3, vendor4, vendor5, vendor6, vendor7, vendor8, vendor9, vendor10] = await Promise.all([
    Vendor.create({
      user: vendorUser1._id,
      businessName: 'Ceylon Journeys Pvt Ltd',
      businessType: 'Tour Operator',
      registrationNumber: 'BP/12345/2018',
      taxId: 'TAX-567890',
      yearEstablished: 2018,
      businessEmail: 'info@ceylanjourneys.lk',
      businessPhone: '+94 11 234 5678',
      website: 'https://ceylanjourneys.lk',
      socialMedia: { facebook: 'fb.com/ceylanjourneys', instagram: '@ceylanjourneys' },
      address: {
        addressLine1: '45, Galle Road',
        addressLine2: 'Level 2',
        city: 'Colombo',
        province: 'Western',
        postalCode: '00300',
        country: 'Sri Lanka',
      },
      primaryContact: {
        name: 'Roshan De Silva',
        designation: 'Managing Director',
        phone: '+94 72 111 2222',
        email: 'roshan@ceylanjourneys.lk',
      },
      services: ['Tour Packages', 'Hotel Bookings', 'Transport', 'Guide Services'],
      bankDetails: {
        bankName: 'Commercial Bank of Ceylon',
        branch: 'Colombo Branch',
        accountName: 'Ceylon Journeys Pvt Ltd',
        accountNumber: '1234567890',
        accountType: 'Current',
      },
      status: 'approved',
    }),
    Vendor.create({
      user: vendorUser2._id,
      businessName: 'Amaya Coastal Tours',
      businessType: 'Travel Agency',
      registrationNumber: 'BP/78901/2020',
      yearEstablished: 2020,
      businessEmail: 'hello@amayacoastal.lk',
      businessPhone: '+94 31 456 7890',
      website: 'https://amayacoastal.lk',
      socialMedia: { instagram: '@amayacoastal' },
      address: {
        addressLine1: '12, Beach Road',
        city: 'Negombo',
        province: 'Western',
        postalCode: '11500',
        country: 'Sri Lanka',
      },
      primaryContact: {
        name: 'Amaya Gunawardena',
        designation: 'Director',
        phone: '+94 77 333 4444',
        email: 'amaya@amayacoastal.lk',
      },
      services: ['Beach Tours', 'Water Sports', 'Day Trips', 'Airport Transfers'],
      bankDetails: {
        bankName: 'People\'s Bank',
        branch: 'Negombo Branch',
        accountName: 'Amaya Coastal Tours',
        accountNumber: '9876543210',
        accountType: 'Current',
      },
      status: 'approved',
    }),
    Vendor.create({
      user: moreVendorUsers[0]._id,
      businessName: "Earl's Regency Hotel",
      businessType: 'Hotel/Guest House',
      registrationNumber: 'BP/56789/2015',
      taxId: 'TAX-111111',
      yearEstablished: 2015,
      businessEmail: 'info@earlskandy.lk',
      businessPhone: '+94 81 223 3344',
      website: 'https://earlskandy.lk',
      socialMedia: { facebook: 'fb.com/earlsregency', instagram: '@earlsregency' },
      address: {
        addressLine1: '45 Peradeniya Road',
        city: 'Kandy',
        province: 'Central',
        postalCode: '20800',
        country: 'Sri Lanka',
      },
      primaryContact: {
        name: 'Samantha Fernandez',
        designation: 'Hotel Manager',
        phone: '+94 81 223 3344',
        email: 'manager@earlskandy.lk',
      },
      services: ['Hotel Accommodation', 'Restaurant & Bar', 'Spa Services', 'Event Hosting'],
      bankDetails: {
        bankName: 'Sampath Bank',
        branch: 'Kandy Branch',
        accountName: "Earl's Regency Hotel",
        accountNumber: '5555666677',
        accountType: 'Current',
      },
      status: 'approved',
    }),
    Vendor.create({
      user: moreVendorUsers[1]._id,
      businessName: 'Safari Jeep Rentals',
      businessType: 'Transport Provider',
      registrationNumber: 'BP/98765/2019',
      taxId: 'TAX-222222',
      yearEstablished: 2019,
      businessEmail: 'bookings@safarijeeps.lk',
      businessPhone: '+94 23 555 6666',
      website: 'https://safarijeeps.lk',
      socialMedia: { instagram: '@safarijeepssk' },
      address: {
        addressLine1: '123 Main Street',
        city: 'Yala',
        province: 'Southern',
        postalCode: '82100',
        country: 'Sri Lanka',
      },
      primaryContact: {
        name: 'Dilshan Jayasinghe',
        designation: 'Owner',
        phone: '+94 23 555 6666',
        email: 'dilshan@safarijeeps.lk',
      },
      services: ['Vehicle Rental', 'Safari Tours', 'Driver Services', 'Airport Transfers'],
      bankDetails: {
        bankName: 'NDB Bank',
        branch: 'Matara Branch',
        accountName: 'Safari Jeep Rentals',
        accountNumber: '7777888899',
        accountType: 'Current',
      },
      status: 'approved',
    }),
    Vendor.create({
      user: moreVendorUsers[2]._id,
      businessName: 'Local Guide Services',
      businessType: 'Tour Guide',
      registrationNumber: 'BP/34567/2017',
      taxId: 'TAX-333333',
      yearEstablished: 2017,
      businessEmail: 'guides@localservices.lk',
      businessPhone: '+94 36 777 8888',
      website: 'https://localguideservices.lk',
      socialMedia: { facebook: 'fb.com/localguides' },
      address: {
        addressLine1: '5 Cliff Lane',
        city: 'Ella',
        province: 'Uva',
        postalCode: '90090',
        country: 'Sri Lanka',
      },
      primaryContact: {
        name: 'Kumar Dissanayake',
        designation: 'Head Guide',
        phone: '+94 36 777 8888',
        email: 'kumar@localguideservices.lk',
      },
      services: ['Hiking Guides', 'Cultural Tours', 'Photography Guides', 'Adventure Tours'],
      bankDetails: {
        bankName: 'Hatton National Bank',
        branch: 'Badulla Branch',
        accountName: 'Local Guide Services',
        accountNumber: '9999000011',
        accountType: 'Current',
      },
      status: 'approved',
    }),
    Vendor.create({
      user: moreVendorUsers[3]._id,
      businessName: 'Adventure Extreme Sports',
      businessType: 'Activity Provider',
      registrationNumber: 'BP/45678/2020',
      taxId: 'TAX-444444',
      yearEstablished: 2020,
      businessEmail: 'bookings@adventureextreme.lk',
      businessPhone: '+94 91 999 0000',
      website: 'https://adventureextreme.lk',
      socialMedia: { instagram: '@adventureextremeSK', facebook: 'fb.com/adventureextreme' },
      address: {
        addressLine1: '890 Mt. Lavinia Road',
        city: 'Colombo',
        province: 'Western',
        postalCode: '00600',
        country: 'Sri Lanka',
      },
      primaryContact: {
        name: 'Arjun Rathnayake',
        designation: 'CEO',
        phone: '+94 91 999 0000',
        email: 'arjun@adventureextreme.lk',
      },
      services: ['Rock Climbing', 'Paragliding', 'White Water Rafting', 'Zip-lining'],
      bankDetails: {
        bankName: 'Bank of Ceylon',
        branch: 'Mt. Lavinia Branch',
        accountName: 'Adventure Extreme Sports',
        accountNumber: '1111222233',
        accountType: 'Current',
      },
      status: 'approved',
    }),
    Vendor.create({
      user: moreVendorUsers[4]._id,
      businessName: 'The Spice Trail Restaurant',
      businessType: 'Restaurant/Cafe',
      registrationNumber: 'BP/67890/2018',
      taxId: 'TAX-555555',
      yearEstablished: 2018,
      businessEmail: 'bookings@spicetrail.lk',
      businessPhone: '+94 11 222 3333',
      website: 'https://spicetrail.lk',
      socialMedia: { instagram: '@spicetrailsk' },
      address: {
        addressLine1: '234 Regent Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '00700',
        country: 'Sri Lanka',
      },
      primaryContact: {
        name: 'Priya Wijesinghe',
        designation: 'Chef & Owner',
        phone: '+94 11 222 3333',
        email: 'priya@spicetrail.lk',
      },
      services: ['Restaurant Services', 'Catering', 'Cooking Classes', 'Food Tours'],
      bankDetails: {
        bankName: 'Seylan Bank',
        branch: 'Colombo Branch',
        accountName: 'The Spice Trail Restaurant',
        accountNumber: '3333444455',
        accountType: 'Current',
      },
      status: 'approved',
    }),
    Vendor.create({
      user: moreVendorUsers[5]._id,
      businessName: 'Luxury Villas Galle',
      businessType: 'Hotel/Guest House',
      registrationNumber: 'BP/23456/2016',
      taxId: 'TAX-666666',
      yearEstablished: 2016,
      businessEmail: 'reservations@luxuryvillas.lk',
      businessPhone: '+94 91 234 5678',
      website: 'https://luxuryvillas-galle.lk',
      socialMedia: { instagram: '@luxuryvillasgalle' },
      address: {
        addressLine1: '78 Fort Road',
        city: 'Galle',
        province: 'Southern',
        postalCode: '80000',
        country: 'Sri Lanka',
      },
      primaryContact: {
        name: 'Nadira Perera',
        designation: 'Operations Manager',
        phone: '+94 91 234 5678',
        email: 'nadira@luxuryvillas.lk',
      },
      services: ['Luxury Accommodation', 'Wedding Services', 'Spa & Wellness', 'Fine Dining'],
      bankDetails: {
        bankName: 'Nations Trust Bank',
        branch: 'Galle Branch',
        accountName: 'Luxury Villas Galle',
        accountNumber: '5555666677',
        accountType: 'Current',
      },
      status: 'approved',
    }),
    Vendor.create({
      user: moreVendorUsers[6]._id,
      businessName: 'TravelMax Tours',
      businessType: 'Tour Operator',
      registrationNumber: 'BP/89012/2019',
      taxId: 'TAX-777777',
      yearEstablished: 2019,
      businessEmail: 'info@travelmax.lk',
      businessPhone: '+94 11 456 7890',
      website: 'https://travelmax.lk',
      socialMedia: { facebook: 'fb.com/travelmaxsk', instagram: '@travelmaxsk' },
      address: {
        addressLine1: '100 Colombo Street',
        city: 'Colombo',
        province: 'Western',
        postalCode: '00100',
        country: 'Sri Lanka',
      },
      primaryContact: {
        name: 'Sanjaya Mendis',
        designation: 'Director',
        phone: '+94 11 456 7890',
        email: 'sanjaya@travelmax.lk',
      },
      services: ['Tour Packages', 'Flight Booking', 'Visa Assistance', 'Travel Insurance'],
      bankDetails: {
        bankName: 'Commercial Bank',
        branch: 'Fort Branch',
        accountName: 'TravelMax Tours',
        accountNumber: '7777888899',
        accountType: 'Current',
      },
      status: 'approved',
    }),
    Vendor.create({
      user: moreVendorUsers[7]._id,
      businessName: 'Beachside Cabanas',
      businessType: 'Hotel/Guest House',
      registrationNumber: 'BP/01234/2017',
      taxId: 'TAX-888888',
      yearEstablished: 2017,
      businessEmail: 'info@beachsidecabanas.lk',
      businessPhone: '+94 32 111 2222',
      website: 'https://beachsidecabanas.lk',
      socialMedia: { instagram: '@beachsidecabanas' },
      address: {
        addressLine1: '456 Mirissa Beach',
        city: 'Mirissa',
        province: 'Southern',
        postalCode: '81400',
        country: 'Sri Lanka',
      },
      primaryContact: {
        name: 'Sunith Jayante',
        designation: 'Resort Manager',
        phone: '+94 32 111 2222',
        email: 'sunith@beachsidecabanas.lk',
      },
      services: ['Beachfront Accommodation', 'Water Sports', 'Beach Dining', 'Whale Watching Tours'],
      bankDetails: {
        bankName: 'DFCC Bank',
        branch: 'Matara Branch',
        accountName: 'Beachside Cabanas',
        accountNumber: '9999000011',
        accountType: 'Current',
      },
      status: 'approved',
    }),
  ]);
  console.log('🏢 Created 10 vendors with different service types');

  // ─── INVENTORY ITEMS ──────────────────────────────────────────────────────
  const inventoryData = [
    // Vendor 1: Ceylon Journeys (Tour Operator)
    { vendor: vendor1._id, name: 'Sigiriya Rock Fortress Day Tour', type: 'activity', description: 'Full-day guided tour to the iconic Sigiriya Rock Fortress with lunch.', price: 12500, capacity: 20, availableCount: 18, location: 'Sigiriya, Central Province', amenities: ['Lunch included', 'English guide', 'Transport', 'Entry tickets'], images: ['https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800'] },
    { vendor: vendor1._id, name: 'Kandy Cultural Triangle Tour (3D/2N)', type: 'package', description: 'Explore Kandy, Dambulla and Polonnaruwa in a 3-day cultural package.', price: 45000, capacity: 10, availableCount: 8, location: 'Kandy & Central Province', amenities: ['Hotel stay', 'All meals', 'Guide', 'AC transport', 'Entry tickets'], images: ['https://images.unsplash.com/photo-1616128417859-3a984dd35f02?w=800'] },
    { vendor: vendor1._id, name: 'Ella Hill Country Train & Hike (2D/1N)', type: 'package', description: 'Scenic train ride from Kandy to Ella + hike to Little Adam\'s Peak.', price: 32000, capacity: 15, availableCount: 12, location: 'Ella, Uva Province', amenities: ['Train ticket', 'Guesthouse stay', 'Breakfast', 'Hiking guide'], images: ['https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800'] },
    
    // Vendor 2: Amaya Coastal Tours (Travel Agency)
    { vendor: vendor2._id, name: 'Mirissa Whale Watching Cruise', type: 'activity', description: 'Morning whale watching cruise off the south coast with breakfast on board.', price: 8500, capacity: 30, availableCount: 25, location: 'Mirissa Harbour, Southern Province', amenities: ['Breakfast', 'Life jackets', 'Marine biologist guide', 'Photos'], images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'] },
    { vendor: vendor2._id, name: 'Galle Fort & South Coast Day Tour', type: 'activity', description: 'Explore historic Galle Fort, sea turtle hatchery, and Unawatuna beach.', price: 11000, capacity: 12, availableCount: 10, location: 'Galle, Southern Province', amenities: ['Lunch', 'Guide', 'AC transport', 'Entrance fees'], images: ['https://images.unsplash.com/photo-1593553584634-b7a2b24d1f2c?w=800'] },
    
    // Vendor 3: Earl's Regency Hotel
    { vendor: vendor3._id, name: 'Earl\'s Regency Hotel Room (Deluxe)', type: 'accommodation', description: 'Spacious deluxe room with mountain view overlooking Kandy city.', price: 16250, capacity: 2, availableCount: 5, location: 'Kandy, Central Province', amenities: ['Free WiFi', 'Breakfast', 'Pool', 'Restaurant', 'Spa'], images: ['https://images.unsplash.com/photo-1631049307038-da0ec89d4b0c?w=800'] },
    { vendor: vendor3._id, name: 'Earl\'s Regency Hotel Room (Suite)', type: 'accommodation', description: 'Luxury suite with private balcony and premium amenities.', price: 32500, capacity: 4, availableCount: 2, location: 'Kandy, Central Province', amenities: ['Free WiFi', 'Breakfast', 'Pool', 'Restaurant', 'Spa', 'Butler service'], images: [] },
    
    // Vendor 4: Safari Jeep Rentals
    { vendor: vendor4._id, name: 'Jeep Safari at Yala National Park (Full Day)', type: 'activity', description: 'Full-day safari tour with experienced driver and wildlife expert.', price: 15000, capacity: 4, availableCount: 3, location: 'Yala National Park, Southern Province', amenities: ['Expert guide', 'Breakfast & lunch', 'Binoculars', 'Photography assist'], images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'] },
    { vendor: vendor4._id, name: 'AC Jeep Rental (4WD per day)', type: 'transport', description: 'Comfortable 4WD AC jeep rental with fuel included for island-wide travel.', price: 12000, capacity: 5, availableCount: 4, location: 'Island-wide', amenities: ['AC', 'GPS', 'Fuel included', 'Insurance', 'Experienced driver'], images: [] },
    
    // Vendor 5: Local Guide Services
    { vendor: vendor5._id, name: 'Ella Rock Hiking Tour with Local Guide', type: 'activity', description: 'Guided hike to Ella Rock with stunning tea plantation views and breakfast.', price: 5000, capacity: 15, availableCount: 12, location: 'Ella, Uva Province', amenities: ['Expert guide', 'Breakfast', 'Water & snacks', 'Photos'], images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'] },
    { vendor: vendor5._id, name: 'Cultural Heritage Walking Tour (Dambulla)', type: 'activity', description: 'Full-day tour exploring cave temples and ancient heritage sites.', price: 8000, capacity: 12, availableCount: 10, location: 'Dambulla, Central Province', amenities: ['Licensed guide', 'Lunch', 'Temple entry', 'Historical insights'], images: [] },
    
    // Vendor 6: Adventure Extreme Sports
    { vendor: vendor6._id, name: 'White Water Rafting (Grade III-IV)', type: 'activity', description: 'Thrilling rafting adventure on Kelani River with safety equipment.', price: 6500, capacity: 8, availableCount: 6, location: 'Kelani Valley, Western Province', amenities: ['Guide', 'Safety gear', 'Lunch', 'Photos', 'Insurance'], images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'] },
    { vendor: vendor6._id, name: 'Paragliding Experience (30 mins)', type: 'activity', description: 'Thrilling tandem paragliding with experienced pilot over scenic landscape.', price: 9500, capacity: 6, availableCount: 4, location: 'Sigiriya, Central Province', amenities: ['Pilot', 'Safety gear', 'GoPro video', 'Certificate'], images: [] },
    
    // Vendor 7: The Spice Trail Restaurant
    { vendor: vendor7._id, name: 'Fine Dining Multi-Course Meal (per person)', type: 'meal', description: 'Chef\'s special 5-course Sri Lankan fusion dinner with wine pairing.', price: 4500, capacity: 50, availableCount: 30, location: 'Colombo, Western Province', amenities: ['Wine pairing', 'Vegan options', 'Special dietary', 'Ambiance lighting'], images: [] },
    { vendor: vendor7._id, name: 'Cooking Class with Chef Priya (3 hours)', type: 'activity', description: 'Learn to cook authentic Sri Lankan curry and rice dishes.', price: 8500, capacity: 12, availableCount: 8, location: 'Colombo, Western Province', amenities: ['All ingredients', 'Equipment provided', 'Recipe booklet', 'Lunch included'], images: [] },
    
    // Vendor 8: Luxury Villas Galle
    { vendor: vendor8._id, name: 'Beachfront Villa with Pool (per night)', type: 'accommodation', description: 'Luxury 2-bedroom villa with private pool overlooking Galle Fort.', price: 35000, capacity: 6, availableCount: 3, location: 'Galle, Southern Province', amenities: ['Private pool', 'Beachfront', 'Chef service', 'WiFi', 'Spa'], images: ['https://images.unsplash.com/photo-1566073771259-6a8506edf56f?w=800'] },
    { vendor: vendor8._id, name: 'Spa & Wellness Package (3 hours)', type: 'activity', description: 'Traditional Ayurvedic massage and wellness treatments at luxury spa.', price: 12000, capacity: 4, availableCount: 6, location: 'Galle, Southern Province', amenities: ['Ayurvedic massage', 'Herbal treatments', 'Steam room', 'Refreshments'], images: [] },
    
    // Vendor 9: TravelMax Tours
    { vendor: vendor9._id, name: 'Complete Sri Lanka Tour (7D/6N)', type: 'package', description: 'Round-island comprehensive tour covering beaches, mountains, and heritage sites.', price: 125000, capacity: 8, availableCount: 5, location: 'Island-wide', amenities: ['Accommodation', 'All meals', 'Transport', 'Guide', 'Entry tickets'], images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'] },
    { vendor: vendor9._id, name: 'Flight Booking Assistant (per booking)', type: 'package', description: 'Expert assistance with international and domestic flight bookings.', price: 2500, capacity: 20, availableCount: 20, location: 'Colombo', amenities: ['Best price search', 'Visa advice', 'Travel insurance', '24/7 support'], images: [] },
    
    // Vendor 10: Beachside Cabanas
    { vendor: vendor10._id, name: 'Beachfront Room (per night)', type: 'accommodation', description: 'Comfortable beachfront room with ocean view and direct beach access.', price: 14000, capacity: 2, availableCount: 8, location: 'Mirissa, Southern Province', amenities: ['Beach access', 'Breakfast', 'WiFi', 'Restaurant', 'Water sports'], images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'] },
    { vendor: vendor10._id, name: 'Whale Watching & Whale Shark Tour', type: 'activity', description: 'Combined tour with morning whale watching and afternoon whale shark encounter.', price: 14500, capacity: 20, availableCount: 15, location: 'Mirissa, Southern Province', amenities: ['Expert guide', 'Breakfast & lunch', 'Life jacket', 'Photos'], images: [] },
  ];
  await InventoryItem.insertMany(inventoryData);
  console.log('📦 Created 28 inventory items from 10 vendors');

  // ─── TRIPS (for user1 — Thisara) ──────────────────────────────────────────
  const now = new Date();
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const isoDate = (d) => d.toISOString().split('T')[0];

  const future1 = new Date(now); future1.setDate(now.getDate() + 14);
  const future2 = new Date(now); future2.setDate(now.getDate() + 18);
  const future3 = new Date(now); future3.setDate(now.getDate() + 35);
  const future4 = new Date(now); future4.setDate(now.getDate() + 38);
  const past1s  = new Date(now); past1s.setDate(now.getDate() - 60);
  const past1e  = new Date(now); past1e.setDate(now.getDate() - 57);
  const past2s  = new Date(now); past2s.setDate(now.getDate() - 30);
  const past2e  = new Date(now); past2e.setDate(now.getDate() - 27);
  const pend3s  = new Date(now); pend3s.setDate(now.getDate() + 50);
  const pend3e  = new Date(now); pend3e.setDate(now.getDate() + 55);
  const u2future = new Date(now); u2future.setDate(now.getDate() + 10);
  const u2futEnd = new Date(now); u2futEnd.setDate(now.getDate() + 13);
  const u2past   = new Date(now); u2past.setDate(now.getDate() - 45);
  const u2pastE  = new Date(now); u2pastE.setDate(now.getDate() - 42);

  const tripDefs = [
    // 1. Confirmed upcoming
    {
      user: user1._id,
      destination: 'Sigiriya & Cultural Triangle',
      location: 'Sigiriya',
      status: 'confirmed',
      dates: { from: isoDate(future1), to: isoDate(future2) },
      totalCost: 45000,
      paymentStatus: 'paid',
      travelers: { adults: 2, children: 1 },
      travelerDetails: [
        { name: 'Thisara Perera', email: 'thisara@example.com', phone: '+94711234567', type: 'Adult' },
        { name: 'Priya Perera', email: '', phone: '', type: 'Adult' },
        { name: 'Sahan Perera', email: '', phone: '', type: 'Child' },
      ],
      bookingDate: fmt(new Date(now.getTime() - 7 * 86400000)),
      image: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800',
      duration: '4 Days / 3 Nights',
      vendor: 'Ceylon Journeys Pvt Ltd',
      specialRequests: 'We need a child-friendly guide and vegetarian meals.',
      reviewStatus: 'none',
      timeline: [
        { step: 'Booking Submitted', status: 'completed', date: fmt(new Date(now.getTime() - 7 * 86400000)) },
        { step: 'Vendor Approval', status: 'completed', date: fmt(new Date(now.getTime() - 5 * 86400000)) },
        { step: 'Confirmed', status: 'completed', date: fmt(new Date(now.getTime() - 5 * 86400000)) },
        { step: 'Trip Completed', status: 'pending', date: null },
      ],
      itinerary: [
        { day: 1, date: isoDate(future1), sections: [{ time: 'Morning', items: [{ type: 'transport', name: 'Pickup from Kandy', details: { note: 'AC minivan from hotel' } }] }, { time: 'Afternoon', items: [{ type: 'activity', name: 'Dambulla Cave Temple', details: { duration: '2h' } }] }, { time: 'Evening', items: [{ type: 'hotel', name: 'Sigiriya Village Hotel', details: { checkIn: '18:00' } }] }] },
        { day: 2, date: isoDate(future2), sections: [{ time: 'Morning', items: [{ type: 'activity', name: 'Sigiriya Rock Fortress Climb', details: { difficulty: 'Moderate' } }, { type: 'meal', name: 'Breakfast at hotel', details: {} }] }] },
      ],
    },
    // 2. Pending approval
    {
      user: user1._id,
      destination: 'Ella Hill Country Escape',
      location: 'Ella',
      status: 'pending',
      dates: { from: isoDate(future3), to: isoDate(future4) },
      totalCost: 32000,
      paymentStatus: 'pending',
      travelers: { adults: 2, children: 0 },
      travelerDetails: [
        { name: 'Thisara Perera', email: 'thisara@example.com', phone: '+94711234567', type: 'Adult' },
        { name: 'Priya Perera', email: '', phone: '', type: 'Adult' },
      ],
      bookingDate: fmt(new Date(now.getTime() - 2 * 86400000)),
      image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
      duration: '3 Days / 2 Nights',
      vendor: 'Ceylon Journeys Pvt Ltd',
      specialRequests: '',
      reviewStatus: 'none',
      timeline: [
        { step: 'Booking Submitted', status: 'completed', date: fmt(new Date(now.getTime() - 2 * 86400000)) },
        { step: 'Vendor Approval', status: 'pending', date: null },
        { step: 'Confirmed', status: 'pending', date: null },
        { step: 'Trip Completed', status: 'pending', date: null },
      ],
    },
    // 3. Completed (with review pending)
    {
      user: user1._id,
      destination: 'Mirissa Whale Watching & Beach',
      location: 'Mirissa',
      status: 'completed',
      dates: { from: isoDate(past1s), to: isoDate(past1e) },
      totalCost: 28500,
      paymentStatus: 'paid',
      travelers: { adults: 2, children: 0 },
      bookingDate: fmt(new Date(past1s.getTime() - 10 * 86400000)),
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      duration: '3 Days / 2 Nights',
      vendor: 'Amaya Coastal Tours',
      specialRequests: '',
      reviewStatus: 'pending',
      timeline: [
        { step: 'Booking Submitted', status: 'completed', date: fmt(new Date(past1s.getTime() - 10 * 86400000)) },
        { step: 'Vendor Approval', status: 'completed', date: fmt(new Date(past1s.getTime() - 8 * 86400000)) },
        { step: 'Confirmed', status: 'completed', date: fmt(new Date(past1s.getTime() - 8 * 86400000)) },
        { step: 'Trip Completed', status: 'completed', date: fmt(past1e) },
      ],
    },
    // 4. Cancelled
    {
      user: user1._id,
      destination: 'Yala Safari Adventure',
      location: 'Yala',
      status: 'cancelled',
      dates: { from: isoDate(past2s), to: isoDate(past2e) },
      totalCost: 38000,
      paymentStatus: 'refunded',
      travelers: { adults: 3, children: 0 },
      bookingDate: fmt(new Date(past2s.getTime() - 14 * 86400000)),
      image: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800',
      duration: '3 Days / 2 Nights',
      vendor: 'Ceylon Journeys Pvt Ltd',
      specialRequests: 'Safari jeep from sunrise.',
      reviewStatus: 'none',
      timeline: [
        { step: 'Booking Submitted', status: 'completed', date: fmt(new Date(past2s.getTime() - 14 * 86400000)) },
        { step: 'Vendor Approval', status: 'pending', date: null },
        { step: 'Confirmed', status: 'pending', date: null },
        { step: 'Trip Completed', status: 'pending', date: null },
      ],
    },
    // 5. Another pending (further future)
    {
      user: user1._id,
      destination: 'Negombo Beach Resort Weekend',
      location: 'Negombo',
      status: 'pending',
      dates: { from: isoDate(pend3s), to: isoDate(pend3e) },
      totalCost: 55000,
      paymentStatus: 'pending',
      travelers: { adults: 2, children: 2 },
      bookingDate: fmt(now),
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
      duration: '5 Days / 4 Nights',
      vendor: 'Amaya Coastal Tours',
      specialRequests: 'Kids club activities needed.',
      reviewStatus: 'none',
      timeline: [
        { step: 'Booking Submitted', status: 'completed', date: fmt(now) },
        { step: 'Vendor Approval', status: 'pending', date: null },
        { step: 'Confirmed', status: 'pending', date: null },
        { step: 'Trip Completed', status: 'pending', date: null },
      ],
    },
    // user2 trips
    {
      user: user2._id,
      destination: 'Galle Fort & Southern Coast',
      location: 'Galle',
      status: 'confirmed',
      dates: { from: isoDate(u2future), to: isoDate(u2futEnd) },
      totalCost: 33000,
      paymentStatus: 'paid',
      travelers: { adults: 2, children: 0 },
      bookingDate: fmt(new Date(now.getTime() - 4 * 86400000)),
      image: 'https://images.unsplash.com/photo-1593553584634-b7a2b24d1f2c?w=800',
      duration: '3 Days / 2 Nights',
      vendor: 'Amaya Coastal Tours',
      reviewStatus: 'none',
      timeline: [
        { step: 'Booking Submitted', status: 'completed', date: fmt(new Date(now.getTime() - 4 * 86400000)) },
        { step: 'Vendor Approval', status: 'completed', date: fmt(new Date(now.getTime() - 3 * 86400000)) },
        { step: 'Confirmed', status: 'completed', date: fmt(new Date(now.getTime() - 3 * 86400000)) },
        { step: 'Trip Completed', status: 'pending', date: null },
      ],
    },
    {
      user: user2._id,
      destination: 'Bentota Water Sports Weekend',
      location: 'Bentota',
      status: 'completed',
      dates: { from: isoDate(u2past), to: isoDate(u2pastE) },
      totalCost: 22500,
      paymentStatus: 'paid',
      travelers: { adults: 1, children: 0 },
      bookingDate: fmt(new Date(u2past.getTime() - 7 * 86400000)),
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      duration: '3 Days / 2 Nights',
      vendor: 'Amaya Coastal Tours',
      reviewStatus: 'completed',
      timeline: [
        { step: 'Booking Submitted', status: 'completed', date: fmt(new Date(u2past.getTime() - 7 * 86400000)) },
        { step: 'Vendor Approval', status: 'completed', date: fmt(new Date(u2past.getTime() - 6 * 86400000)) },
        { step: 'Confirmed', status: 'completed', date: fmt(new Date(u2past.getTime() - 6 * 86400000)) },
        { step: 'Trip Completed', status: 'completed', date: fmt(u2pastE) },
      ],
    },
  ];

  // Save one-by-one so Mongoose pre-save hook generates tripId
  for (const def of tripDefs) {
    await new Trip(def).save();
  }
  console.log(`✈️  Created ${tripDefs.length} trips`);

  // ─── ITINERARY ITEMS ──────────────────────────────────────────────────────
  await ConfigItineraryItem.insertMany([
    // HOTELS
    { type: 'hotel', name: "Earl's Regency Hotel", location: 'Kandy', price: 15000, rating: 4.5, amenities: ['WiFi', 'Pool', 'Breakfast'], category: 'Accommodation' },
    { type: 'hotel', name: 'Thilanka Hotel', location: 'Kandy', price: 12000, rating: 4.2, amenities: ['WiFi', 'Restaurant'], category: 'Accommodation' },
    { type: 'hotel', name: 'Cinnamon Citadel', location: 'Kandy', price: 18000, rating: 4.7, amenities: ['WiFi', 'Pool', 'Spa', 'Breakfast', 'Gym'], category: 'Accommodation' },
    { type: 'hotel', name: 'OZO Kandy', location: 'Kandy', price: 13000, rating: 4.3, amenities: ['WiFi', 'Breakfast', 'Restaurant'], category: 'Accommodation' },
    { type: 'hotel', name: 'Swiss Residence', location: 'Kandy', price: 10000, rating: 4.0, amenities: ['WiFi', 'Restaurant'], category: 'Accommodation' },
    
    // TRANSPORT
    { type: 'transport', name: 'Private Car', price: 8000, duration: '3.5 hours', comfort: 'High', category: 'Transport' },
    { type: 'transport', name: 'Shared Van', price: 5000, duration: '4 hours', comfort: 'Medium', category: 'Transport' },
    { type: 'transport', name: 'Public Bus', price: 1500, duration: '5 hours', comfort: 'Basic', category: 'Transport' },
    { type: 'transport', name: 'Train', price: 2000, duration: '4.5 hours', comfort: 'Medium', category: 'Transport' },
    
    // ACTIVITIES
    { type: 'activity', name: 'Temple of the Tooth Visit', category: 'Cultural', price: 2000, duration: '2 hours', available: true },
    { type: 'activity', name: 'Kandy Lake Walk', category: 'Nature', price: 0, duration: '1 hour', available: true },
    { type: 'activity', name: 'Royal Botanical Gardens', category: 'Nature', price: 1500, duration: '3 hours', available: true },
    { type: 'activity', name: 'Cultural Dance Show', category: 'Cultural', price: 3000, duration: '1.5 hours', available: true },
    { type: 'activity', name: 'Tea Plantation Tour', category: 'Nature', price: 4000, duration: '4 hours', available: true },
    { type: 'activity', name: 'Spice Garden Tour', category: 'Cultural', price: 2500, duration: '2 hours', available: true },
    { type: 'activity', name: 'Gem Museum Visit', category: 'Cultural', price: 1000, duration: '1 hour', available: true },
    { type: 'activity', name: 'Elephant Orphanage', category: 'Nature', price: 5000, duration: '3 hours', available: true },
    { type: 'activity', name: 'Cooking Class', category: 'Food', price: 4500, duration: '3 hours', available: true },
    { type: 'activity', name: 'Batik Workshop', category: 'Cultural', price: 3000, duration: '2 hours', available: false },
    { type: 'activity', name: 'White Water Rafting', category: 'Adventure', price: 6000, duration: '4 hours', available: true },
    
    // MEALS
    { type: 'meal', name: 'Breakfast Package (per day)', category: 'Food', price: 1500, frequency: 'per_day', icon: 'fork' },
    { type: 'meal', name: 'Lunch Package (per day)', category: 'Food', price: 2000, frequency: 'per_day', icon: 'fork' },
    { type: 'meal', name: 'Dinner Package (per day)', category: 'Food', price: 2500, frequency: 'per_day', icon: 'fork' },
    { type: 'meal', name: 'Vegetarian Meal Option', category: 'Food', price: 500, frequency: 'per_day', icon: 'leaf' },
    
    // SERVICES
    { type: 'service', name: 'Professional Tour Guide (full day)', category: 'Guide', price: 5000, icon: 'user', frequency: 'per_day' },
    { type: 'service', name: 'Photography Package', price: 8000, icon: 'camera', frequency: 'one_time' },
    { type: 'service', name: 'Airport Pickup', category: 'Transport', price: 4000, icon: 'plane', frequency: 'one_time' },
    { type: 'service', name: 'Airport Drop-off', category: 'Transport', price: 4000, icon: 'plane', frequency: 'one_time' },
    { type: 'service', name: 'Travel Insurance', category: 'Insurance', price: 3000, icon: 'shield', frequency: 'one_time' },
    
    // ROOM UPGRADES
    { type: 'room_upgrade', name: 'Deluxe Room Upgrade', category: 'Room', price: 3000, icon: 'star', frequency: 'per_day' },
    { type: 'room_upgrade', name: 'Sea View Room', category: 'Room', price: 4000, icon: 'eye', frequency: 'per_day' },
    { type: 'room_upgrade', name: 'Extra Bed', category: 'Room', price: 2000, icon: 'bed', frequency: 'one_time' },
    { type: 'room_upgrade', name: 'Early Check-in', category: 'Room', price: 1500, icon: 'clock', frequency: 'one_time' },
    { type: 'room_upgrade', name: 'Late Checkout', category: 'Room', price: 1500, icon: 'clock', frequency: 'one_time' },
  ]);
  console.log('🏨 Created 38 itinerary items (hotels, transport, activities, meals, services, upgrades)');

  // ─── SAVED TRIPS ──────────────────────────────────────────────────────────
  await SavedTrip.insertMany([
    {
      user: user1._id,
      destination: 'Nuwara Eliya Tea Country',
      location: 'Nuwara Eliya',
      estimatedCost: 25000,
      duration: '3 Days / 2 Nights',
      thumbnail: 'https://images.unsplash.com/photo-1523906921802-b5d2d899e93b?w=800',
      highlights: ['Tea factory visit', 'Gregory Lake boat ride', 'Horton Plains hike', 'Waterfall tour'],
      accommodationType: 'Colonial Hotel',
      travelers: '2 Adults',
      notes: 'Best visited April–June for cooler weather.',
    },
    {
      user: user1._id,
      destination: 'Arugam Bay Surf Holiday',
      location: 'Arugam Bay',
      estimatedCost: 35000,
      duration: '5 Days / 4 Nights',
      thumbnail: 'https://images.unsplash.com/photo-1505459668311-8dfac7952bf0?w=800',
      highlights: ['Surfing lessons', 'Kumana bird sanctuary', 'Lahugala elephant park', 'Seafood dining'],
      accommodationType: 'Beach Bungalow',
      travelers: '2 Adults',
      notes: 'Surf season May–September.',
    },
    {
      user: user1._id,
      destination: 'Adams Peak Pilgrimage Trek',
      location: 'Adam\'s Peak',
      estimatedCost: 8500,
      duration: '2 Days / 1 Night',
      thumbnail: 'https://images.unsplash.com/photo-1606131731446-5568d87113aa?w=800',
      highlights: ['Night trek', 'Sunrise summit view', 'Sri Pada footprint shrine', 'Waterfalls'],
      accommodationType: 'Guesthouse',
      travelers: '3 Adults',
      notes: 'Season: December–May. Start climb at 2 AM for sunrise.',
    },
    {
      user: user2._id,
      destination: 'Trincomalee Beach Week',
      location: 'Trincomalee',
      estimatedCost: 42000,
      duration: '6 Days / 5 Nights',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      highlights: ['Pigeon Island snorkeling', 'Marble Beach', 'Whale watching', 'Fort Frederick'],
      accommodationType: 'Beach Resort',
      travelers: '2 Adults',
      notes: 'Best April–September.',
    },
  ]);
  console.log('💾 Created 4 saved trips');

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete! Login credentials:');
  console.log('   Admin  : admin@smarttrip.lk        / Admin@123');
  console.log('   User 1 : thisara@example.com        / User@123  (5 trips, 3 saved)');
  console.log('   User 2 : nimasha@example.com        / User@123  (2 trips, 1 saved)');
  console.log('   Vendor1: roshan.vendor@example.com  / Vendor@123 (Ceylon Journeys)');
  console.log('   Vendor2: amaya.vendor@example.com   / Vendor@123 (Amaya Coastal Tours)');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
