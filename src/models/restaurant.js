import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId(), },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    cuisine: { type: String, required: true },
    isVeg: { type: Boolean, required: true },
    itemRating: { type: Number, default: 0 }, 
    numberOfRatings: { type: Number, default: 0 }, 
    
});

const reviewSchema = new mongoose.Schema(
    {
        rating: { type: Number, required: true },
        comment: { type: String, required: false },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const restaurantSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, //reference current user
    restaurantName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    //country: { type: String, required: true },
    deliveryPrice: { type: Number, required: true },
    estimatedDeliveryTime: { type: Number, required: true },
    cuisines: [{ type: String, required: true }],
    menuItems: [menuItemSchema],
    imageUrl: { type: String, required: true }, //store image url from cloudinary 
    reviews: [reviewSchema], // Array of reviews
    rating: {
        type: Number,
        default: 0,
        required: true,
    }, // Overall rating based on the average of all ratings
    lastUpdated: { type: Date, required: true },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;