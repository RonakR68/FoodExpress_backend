import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import OrderController from "../controllers/OrderController.js";

const router = express.Router();

router.post(
    "/checkout/create-checkout-session",
    protect,
    OrderController.createOrder
);

router.get("/", protect, OrderController.getMyOrders);

router.post("/review", protect, OrderController.reviewOrder);

export default router;