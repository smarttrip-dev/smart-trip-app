import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true, // ⭐ MODERATE FIX #5: Store email in lowercase
            validate: {
                validator: function (value) {
                    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    return emailRegex.test(value);
                },
                message: 'Invalid email format',
            },
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['user', 'vendor', 'admin'],
            default: 'user',
        },
        // Extended profile fields
        phone: { type: String, default: '' },
        dateOfBirth: { type: String, default: '' },
        location: { type: String, default: '' },
        preferredLanguage: { 
            type: String, 
            default: 'English' 
        },
        bio: { type: String, default: '' },
        photo: { type: String, default: '' },
        travelInterests: { type: [String], default: [] },
        // Travel preferences (set on profile page)
        travelPreferences: {
            accommodationType: { type: [String], default: [] },
            mealPlan: { 
                type: String, 
                enum: ['breakfast', 'half-board', 'full-board', 'all-inclusive'],
                default: 'breakfast' 
            },
            budgetRange: {
              type: Number,
              default: 50,
              // ⭐ MODERATE FIX #5: Type coercion and validation for numeric fields
              validate: {
                validator: function (value) {
                  return !isNaN(value) && Number(value) >= 0;
                },
                message: 'budgetRange must be a non-negative number',
              },
              get: (value) => value ? Number(value) : 0, // Coerce to number on read
            },
            travelStyle: { 
                type: String, 
                enum: ['adventure', 'family', 'luxury', 'budget', 'relaxation'],
                default: 'family' 
            },
            activityInterests: { type: [String], default: [] },
            dietaryRestrictions: { type: [String], default: [] },
            accessibilityNeeds: { type: [String], default: [] },
            petTraveler: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true,
    }
);

// ⭐ MODERATE FIX #5: Ensure email is lowercase before saving
userSchema.pre('save', function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
