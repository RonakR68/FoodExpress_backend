import mongoose from "mongoose";

const itemReviewSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'MenuItem' },
  rating: { type: Number, required: true },
  comment: { type: String, required: false },
});

const reviewSchema = mongoose.Schema(
  {
    rating: { type: Number, required: true },
    comment: { type: String, required: false },
    user: {
      type: mongoose.Schema.Types.ObjectId, // User who provided the review
      required: true,
      ref: 'User',
    },
    itemReviews: [itemReviewSchema],
  },
  {
    timestamps: true,
  }
);

const orderSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryDetails: {
    email: { type: String, required: true },
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String,required: true },
    country: { type: String, required: false },
    pincode: { type: String, required: true},
  },
  cartItems: [
    {
      menuItemId: { type: String, required: true },
      quantity: { type: Number, required: true },
      name: { type: String, required: true },
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["placed", "paid", "inProgress", "outForDelivery", "delivered"],
  },
  reviews: [reviewSchema],
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;