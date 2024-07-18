import express from "express";
import MyUserController from "../controllers/MyUserController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateMyUserRequest } from "../middleware/validation.js";

const router = express.Router();

// /api/my/user
// Forwards the request to appropriate user controller function depending on request type

// Get current user
router.get("/", protect, MyUserController.getCurrentUser);

// Create new user
router.post("/", protect, MyUserController.createCurrentUser);

// Update current user
router.put("/", protect, validateMyUserRequest, MyUserController.updateCurrentUser);

export default router;
