import { body, validationResult } from "express-validator";

const handleValidationErrors = async (
  req,
  res,
  next
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateMyUserRequest = [
  body("email").isString().notEmpty().withMessage("Email must be valid"),
  body("name").isString().notEmpty().withMessage("Name must be a string"),
  body("addresses")
    .isArray({ min: 1 })
    .withMessage("Addresses must be an array with at least one address"),
  body("addresses.*.addressLine1")
    .isString()
    .notEmpty()
    .withMessage("Address Line 1 must be a string"),
  body("addresses.*.city").isString().notEmpty().withMessage("City must be a string"),
  body("addresses.*.state").isString().notEmpty().withMessage("State must be a string"),
  body("addresses.*.pincode").isString().notEmpty().withMessage("Pincode must be a string"),
  handleValidationErrors,
];

export const validateMyRestaurantRequest = [
  body("restaurantName").notEmpty().withMessage("Restaurant name is required"),
  body("addressLine1").notEmpty().withMessage("Address Line 1 is required"),
  body("state").notEmpty().withMessage("State is required"),
  body("pincode").isLength({ min: 6, max: 6 })
  .withMessage("Pincode must be exactly 6 digits"),
  body("city").notEmpty().withMessage("City is required"),
  body("deliveryPrice")
    .isFloat({ min: 0 })
    .withMessage("Delivery price must be a positive number"),
  body("estimatedDeliveryTime")
    .isInt({ min: 0 })
    .withMessage("Estimated delivery time must be a postivie integar"),
  body("cuisines")
    .isArray()
    .withMessage("Cuisines must be an array")
    .not()
    .isEmpty()
    .withMessage("Cuisines array cannot be empty"),
  body("menuItems").isArray().withMessage("Menu items must be an array"),
  body("menuItems.*.name").notEmpty().withMessage("Menu item name is required"),
  body("menuItems.*.price")
    .isFloat({ min: 0 })
    .withMessage("Menu item price is required and must be a postive number"),
  handleValidationErrors,
];