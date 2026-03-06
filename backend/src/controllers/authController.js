import bcrypt from 'bcryptjs';
import User from '../models/User.js'; // Assuming you have a User model
import Vendor from '../models/Vendor.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, password, role, phone, dateOfBirth, location, preferredLanguage, bio, travelInterests, vendor: vendorData } = req.body;

    try {
        // ⭐ INPUT VALIDATION (CRITICAL FIX #4)
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email, and password are required' });
        }

        // ⭐ EMAIL VALIDATION (MAJOR FIX #9)
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // ⭐ PASSWORD STRENGTH VALIDATION (MAJOR FIX #8)
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
        }
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
        }
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one number' });
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*...)' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Only allow 'user' or 'vendor' from client; default to 'user'
        const userRole = role === 'vendor' ? 'vendor' : 'user';

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: userRole,
            phone: phone || '',
            dateOfBirth: dateOfBirth || '',
            location: location || '',
            preferredLanguage: preferredLanguage || 'English',
            bio: bio || '',
            travelInterests: travelInterests || [],
        });

        // If registering as vendor, create Vendor profile
        if (userRole === 'vendor' && vendorData) {
            try {
                await Vendor.create({
                    user: user._id,
                    businessName: vendorData.businessName || '',
                    businessType: vendorData.businessType || 'Other',
                    businessEmail: vendorData.businessEmail || email,
                    businessPhone: vendorData.businessPhone || '',
                    registrationNumber: vendorData.registrationNumber || '',
                    website: vendorData.website || '',
                    address: vendorData.address || { addressLine1: '-', city: '-', province: '-' },
                    primaryContact: vendorData.primaryContact || { name, phone: '', email },
                    bankDetails: vendorData.bankDetails || undefined,
                    status: 'pending_review',
                });
            } catch (vendorErr) {
                // Rollback user if vendor creation fails
                await User.findByIdAndDelete(user._id);
                return res.status(400).json({ message: 'Vendor profile creation failed: ' + vendorErr.message });
            }
        }

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                location: user.location,
                preferredLanguage: user.preferredLanguage,
                bio: user.bio,
                photo: user.photo,
                travelInterests: user.travelInterests,
                travelPreferences: user.travelPreferences,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // ⭐ INPUT VALIDATION
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                location: user.location,
                preferredLanguage: user.preferredLanguage,
                bio: user.bio,
                photo: user.photo,
                travelInterests: user.travelInterests,
                travelPreferences: user.travelPreferences,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    // Placeholder function
    res.status(200).json({ message: "Password reset email sent (placeholder)" });
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
    // Placeholder function
    res.status(200).json({ message: "Password reset successful (placeholder)" });
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, phone, dateOfBirth, location, preferredLanguage, bio, photo, travelInterests, travelPreferences, password } = req.body;

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (location !== undefined) user.location = location;
        if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;
        if (bio !== undefined) user.bio = bio;
        if (photo !== undefined) user.photo = photo;
        if (travelInterests !== undefined) user.travelInterests = travelInterests;
        if (travelPreferences !== undefined) user.travelPreferences = { ...user.travelPreferences.toObject(), ...travelPreferences };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updated = await user.save();
        res.json({
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            phone: updated.phone,
            dateOfBirth: updated.dateOfBirth,
            location: updated.location,
            preferredLanguage: updated.preferredLanguage,
            bio: updated.bio,
            photo: updated.photo,
            travelInterests: updated.travelInterests,
            travelPreferences: updated.travelPreferences,
            token: generateToken(updated._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
