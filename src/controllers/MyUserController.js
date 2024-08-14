import User from "../models/user.js";
import axios from 'axios';
import Order from '../models/order.js';
import Restaurant from '../models/restaurant.js';
import jwt from 'jsonwebtoken';

const getCurrentUser = async (req, res) => {
    try {
        //console.log('get user: ' + req.user._id);
        const currentUser = await User.findById(req.user._id);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        //console.log(currentUser);
        res.json(currentUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const createCurrentUser = async (req, res) => {
    try {
        const { authId } = req.body;
        const existingUser = await User.findOne({ authId });

        if (existingUser) {
            return res.status(200).json(existingUser);
        }

        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error while creating user" });
    }
};

const updateCurrentUser = async (req, res) => {
    try {
        const { email, name, addresses } = req.body;
        //console.log(addresses);
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!addresses || addresses.length === 0) {
            return res.status(400).json({ message: "At least one address is required" });
        }

        user.email = email || user.email;
        user.name = name || user.name;
        user.addresses = addresses;
        //console.log('address: ' + addresses[0].name);

        await user.save();

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error while updating user profile" });
    }
};

const getRecommendations = async (req, res) => {
    const { userId, pincode } = req.body;
    // console.log('get Recommendations');
    // console.log(userId);
    // console.log(pincode);
    try {
        // Fetch restaurants in the same pincode
        const restaurants = await Restaurant.find({ pincode });

        if (!restaurants.length) {
            return res.status(404).json({ message: 'No restaurants found for this pincode.' });
        }

        const restaurantIds = restaurants.map(r => r._id);

        // Fetch orders from these restaurants
        const orders = await Order.find({
            restaurant: { $in: restaurantIds },
            'reviews.rating': { $exists: true } // Ensure the order has been rated
        }).populate('user restaurant reviews.user');

        if (!orders.length) {
            return res.status(404).json({ message: 'No rated orders found.' });
        }

        // Extract relevant data for collaborative filtering
        const data = orders.map(order => ({
            userId: order.user._id.toString(),
            restaurantId: order.restaurant._id.toString(),
            restaurantRating: order.reviews[0].rating,
            itemReviews: order.reviews[0].itemReviews.map(item => ({
                menuItemId: item.menuItemId.toString(),
                itemRating: item.rating
            }))
        }));

        // Call the Python service to get recommendations
        //console.log('userId: ' + userId);
        //console.log('data')
        //console.log(data);
        
        const recommendedRestaurantIds = await getRecommendationsAPI(userId, data);
        //console.log(recommendedRestaurantIds)

        let recommendedRestaurants = await Restaurant.find({ _id: { $in: recommendedRestaurantIds } });
        if (!recommendedRestaurants.length) {
            return res.status(404).json({ message: 'No recommended restaurants found.' });
        }

        recommendedRestaurants = recommendedRestaurants.filter(restaurant => {
            return restaurant.user.toString() !== userId;
        });

        if (!recommendedRestaurants.length) {
            return res.status(404).json({ message: 'No recommended restaurants found.' });
        }

        // Send recommendations to frontend
        res.json(recommendedRestaurants);
    } catch (error) {
        //console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Function to call the Python API for recommendations
async function getRecommendationsAPI(token, data) {
    try {
        // // Decode the token to extract the userId
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // const userId = decoded.userId;
        // console.log('decoded userid: '+ userId)
        const userId = token
        const response = await axios.post(`${process.env.RECOMMENDATION_API_URL}`, { userId, data });
        return response.data;
    } catch (error) {
        console.error('Error calling Python service:', error);
        throw error;
    }
}

export default {
    getCurrentUser,
    createCurrentUser,
    updateCurrentUser,
    getRecommendations
};
