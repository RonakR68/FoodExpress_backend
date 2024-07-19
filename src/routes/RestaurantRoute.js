import express from "express";
import { param } from "express-validator";
import RestaurantController from "../controllers/RestaurantController.js";

const router = express.Router();

router.get(
    "/search/:city",
    param("city")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("City must be a valid string"),
    RestaurantController.searchRestaurant //forward request to Restaurant Controller
);

export default router;