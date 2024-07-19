import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', protect, (req, res) => {
    res.json({ isAuthenticated: true, user: req.user });
    //console.log(res);
});

export default router;