import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/user.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  //console.log('controller: '+name);
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    get logged in user
// @route   POST /api/auth/user
// @access  Public
export const getUser = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};


// @desc    Google login or register user
// @route   POST /api/auth/google
// @access  Public
const google = asyncHandler(async (req, res) => {
  try {
    const { email, name, photo } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      generateToken(res, user._id);
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } 

    // If user does not exist, create a new user
    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    user = await User.create({
      name: name.split(' ').join('').toLowerCase(),
      email: email,
      password: generatedPassword,
      profilePicture: photo,
    });

    if (user) {
      generateToken(res, user._id);
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
});

// @desc    Guest login & get token
// @route   POST /api/auth/guest-login
// @access  Public
const guestLoginUser = asyncHandler(async (req, res) => {
  try {
    // Find the guest user in the database
    const guestEmail = process.env.GUEST_EMAIL || 'guest@email.com';
    const guestUser = await User.findOne({ email: guestEmail });

    if (!guestUser) {
      return res.status(404).json({ message: 'Guest account not found' });
    }

    // Generate a JWT token for the guest user
    generateToken(res, guestUser._id);

    res.json({
      _id: guestUser._id,
      name: guestUser.name,
      email: guestUser.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export {
  loginUser,
  registerUser,
  logoutUser,
  google,
  guestLoginUser,
};