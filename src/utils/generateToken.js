import jwt from 'jsonwebtoken';

const expiry_duration = process.env.TOKEN_EXPIRY_DURATION;
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  // Set JWT as an HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'None', // Prevent CSRF attacks
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    domain: process.env.COOKIE_DOMAIN,
  });
};

export default generateToken;