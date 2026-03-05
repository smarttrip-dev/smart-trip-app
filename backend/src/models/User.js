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
            budgetRange: { type: Number, default: 50 },
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

const User = mongoose.model('User', userSchema);

export default User;
