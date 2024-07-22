import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

const expiry_duration = process.env.COOKIE_EXPIRY_DURATION;
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: `${expiry_duration}d`,
  });

  // Set JWT as an HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.ENV === 'production', // Use secure cookies in production
    sameSite: 'None', // Prevent CSRF attacks
    maxAge: expiry_duration * 24 * 60 * 60 * 1000, // 1 day in milliseconds
    //domain: process.env.COOKIE_DOMAIN,
  });
};

export default generateToken;