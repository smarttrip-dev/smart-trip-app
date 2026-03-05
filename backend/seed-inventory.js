import mongoose from 'mongoose';
import InventoryItem from './src/models/InventoryItem.js';
import Vendor from './src/models/Vendor.js';
import User from './src/models/User.js';

async function seedInventory() {
  try {
    await mongoose.connect('mongodb://localhost/smarttrip');
    console.log('Connected to MongoDB');

    // Create or get test user
    let user = await User.findOne({ email: 'vendor@test.com' });
    if (!user) {
      console.log('Creating test user...');
      user = await User.create({
        name: 'Test Vendor',
        email: 'vendor@test.com',
        password: 'password123',
        role: 'vendor'
      });
      console.log('Created user:', user.name);
    }

    // Get or create a test vendor
    let vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      console.log('Creating test vendor...');
      vendor = await Vendor.create({
        user: user._id,
        businessName: 'SmartTrip Test Activities',
        businessType: 'Activity Provider',
        businessEmail: 'vendor@test.com',
        businessPhone: '0701234567',
        primaryContact: {
          name: 'Test Vendor',
          phone: '0701234567',
          email: 'vendor@test.com'
        },
        address: {
          addressLine1: '123 Main Street',
          city: 'Colombo',
          province: 'Western',
          country: 'Sri Lanka'
        },
        isVerified: true
      });
      console.log('Created vendor:', vendor.businessName);
    }

    // Clear existing inventory items
    await InventoryItem.deleteMany({ vendor: vendor._id });
    console.log('Cleared existing inventory');

    // Add sample activities
    const activities = [
      {
        vendor: vendor._id,
        name: 'Kandy City Tour',
        type: 'activity',
        description: 'Explore the historic city of Kandy with a professional guide',
        price: 5000,
        currency: 'LKR',
        capacity: 20,
        availableCount: 20,
        location: 'Kandy',
        amenities: ['Guide', 'Transportation', 'Lunch'],
        isActive: true
      },
      {
        vendor: vendor._id,
        name: 'Temple of Tooth Visit',
        type: 'activity',
        description: 'Visit the sacred Temple of Tooth Relic in Kandy',
        price: 3000,
        currency: 'LKR',
        capacity: 50,
        availableCount: 50,
        location: 'Kandy',
        amenities: ['Entry Ticket', 'Guide', 'Water'],
        isActive: true
      },
      {
        vendor: vendor._id,
        name: 'Galle Fort Heritage Walk',
        type: 'activity',
        description: 'Discover the colonial history of Galle Fort',
        price: 4500,
        currency: 'LKR',
        capacity: 25,
        availableCount: 25,
        location: 'Galle',
        amenities: ['Professional Guide', 'History Tour'],
        isActive: true
      },
      {
        vendor: vendor._id,
        name: 'Nine Arch Bridge Trek',
        type: 'activity',
        description: 'Scenic trek to the historic Nine Arch Bridge in Ella',
        price: 2500,
        currency: 'LKR',
        capacity: 15,
        availableCount: 15,
        location: 'Ella',
        amenities: ['Hiking Guide', 'Photos'],
        isActive: true
      },
      {
        vendor: vendor._id,
        name: 'Sigiriya Rock Climb',
        type: 'activity',
        description: 'Climb the ancient Sigiriya Rock Fortress',
        price: 6000,
        currency: 'LKR',
        capacity: 30,
        availableCount: 30,
        location: 'Sigiriya',
        amenities: ['Entry Fee', 'Guide', 'Water', 'Snacks'],
        isActive: true
      },
      {
        vendor: vendor._id,
        name: 'Nuwara Eliya Tea Plantation Tour',
        type: 'activity',
        description: 'Experience tea picking and factory tour',
        price: 3500,
        currency: 'LKR',
        capacity: 20,
        availableCount: 20,
        location: 'Nuwara Eliya',
        amenities: ['Tea Tasting', 'Factory Tour', 'Lunch'],
        isActive: true
      },
      {
        vendor: vendor._id,
        name: 'Beach Sunset Experience',
        type: 'activity',
        description: 'Enjoy a beautiful sunset at the beach',
        price: 2000,
        currency: 'LKR',
        capacity: 40,
        availableCount: 40,
        location: 'Galle',
        amenities: ['Refreshments', 'Photos'],
        isActive: true
      },
      {
        vendor: vendor._id,
        name: 'Cultural Dance Show',
        type: 'activity',
        description: 'Traditional Sri Lankan dance performance',
        price: 4000,
        currency: 'LKR',
        capacity: 100,
        availableCount: 100,
        location: 'Kandy',
        amenities: ['Seating', 'Performance', 'Refreshments'],
        isActive: true
      }
    ];

    const created = await InventoryItem.insertMany(activities);
    console.log(`✅ Added ${created.length} sample activities`);
    
    console.log('\nSample activities created:');
    created.forEach(item => {
      console.log(`  - ${item.name} (${item.location}) - LKR ${item.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedInventory();
