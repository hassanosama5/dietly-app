const express = require('express');
const router = express.Router();

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', (req, res) => {
  res.status(200).json({ success: true, message: 'Register route' });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', (req, res) => {
  res.status(200).json({ success: true, message: 'Login route' });
});

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
router.get('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logout route' });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', (req, res) => {
  res.status(200).json({ success: true, message: 'Get me route' });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
router.put('/updatedetails', (req, res) => {
  res.status(200).json({ success: true, message: 'Update details route' });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
router.put('/updatepassword', (req, res) => {
  res.status(200).json({ success: true, message: 'Update password route' });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
router.post('/forgotpassword', (req, res) => {
  res.status(200).json({ success: true, message: 'Forgot password route' });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:token
// @access  Public
router.put('/resetpassword/:token', (req, res) => {
  res.status(200).json({ success: true, message: 'Reset password route' });
});

module.exports = router;