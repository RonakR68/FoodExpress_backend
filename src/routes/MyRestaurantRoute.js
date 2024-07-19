import express from "express";
import multer from "multer";
import MyRestaurantController from "../controllers/MyRestaurantController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateMyRestaurantRequest } from "../middleware/validation.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 8 * 1024 * 1024, // 8MB
    },
});

router.get("/", protect, MyRestaurantController.getMyRestaurant);

// /api/my/restaurant
// checks for image in incoming request and save it to multer memory
router.post(
    "/",
    upload.single("imageFile"),
    validateMyRestaurantRequest,
    protect,
    MyRestaurantController.createMyRestaurant
);

router.put(
    "/",
    upload.single("imageFile"),
    validateMyRestaurantRequest,
    protect,
    MyRestaurantController.updateMyRestaurant
);

export default router;
