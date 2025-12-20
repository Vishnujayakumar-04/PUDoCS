const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (for demo - in production, restrict to admin)
const register = async (req, res) => {
    try {
        const { email, password, role, profileData } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create profile based on role
        let profileId;
        if (role === 'Student') {
            const student = await Student.create(profileData);
            profileId = student._id;
        } else if (role === 'Staff') {
            const staff = await Staff.create(profileData);
            profileId = staff._id;
        }

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            role,
            profileId,
        });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check for user
        const user = await User.findOne({ email, role });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is inactive' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Get profile data
        let profile;
        if (user.role === 'Student') {
            profile = await Student.findById(user.profileId);
        } else if (user.role === 'Staff') {
            profile = await Staff.findById(user.profileId);
        }

        res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            profile,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
    try {
        // Get profile data
        let profile;
        if (req.user.role === 'Student') {
            profile = await Student.findById(req.user.profileId);
        } else if (req.user.role === 'Staff') {
            profile = await Staff.findById(req.user.profileId);
        }

        res.json({
            _id: req.user._id,
            email: req.user.email,
            role: req.user.role,
            profile,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    verifyToken,
};
