import express from 'express';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUser,
  google,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/register').post(registerUser);
router.post('/login', loginUser);
router.post('/google', google);
router.post('/logout', logoutUser);
router.get('/user', protect, getUser);

export default router;