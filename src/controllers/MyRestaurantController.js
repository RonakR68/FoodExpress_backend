import Restaurant from "../models/restaurant.js";
import cloudinary from "cloudinary";
import Order from "../models/order.js";

// Get restaurant details
const getMyRestaurant = async (req, res) => {
    try {
        //console.log('getMyRestaurant request');
        //console.log(req.user);
        const restaurant = await Restaurant.findOne({ user: req.user._id });
        if (!restaurant) {
            //console.log("no restaurant");
            return res.status(404).json({ message: "No Restaurant found!" });
        }
        res.json(restaurant);
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error while getting Restaurant details" });
    }
};

// Create one restaurant per account
const createMyRestaurant = async (req, res) => {
    try {
        //console.log('createMyRestaurant request');
        //console.log(req.user);

        if (!req.user._id) {
            return res.status(405).json({ message: "User ID is missing in the request" });
        }

        const existingRestaurant = await Restaurant.findOne({ user: req.user._id });

        if (existingRestaurant) {
            return res
                .status(409)
                .json({ message: "User Restaurant already exists" });
        }

        const imageUrl = await uploadImage(req.file);

        const restaurant = new Restaurant(req.body);
        restaurant.imageUrl = imageUrl;
        restaurant.user = req.user._id;
        restaurant.lastUpdated = new Date();
        await restaurant.save();

        res.status(201).send(restaurant);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Update restaurant details
const updateMyRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({
            user: req.user._id,
        });

        if (!restaurant) {
            return res.status(404).json({ message: "No Restaurant found!" });
        }

        restaurant.restaurantName = req.body.restaurantName;
        restaurant.city = req.body.city;
        //restaurant.country = req.body.country;
        restaurant.deliveryPrice = req.body.deliveryPrice;
        restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
        restaurant.cuisines = req.body.cuisines;
        restaurant.menuItems = req.body.menuItems;
        restaurant.lastUpdated = new Date();

        if (req.file) {
            const imageUrl = await uploadImage(req.file);
            restaurant.imageUrl = imageUrl;
        }

        await restaurant.save();
        res.status(200).send(restaurant);
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const getMyRestaurantOrders = async (req, res) => {
    try {
        //console.log("get my restaurant order");
        //console.log(req.user._id);
        const restaurant = await Restaurant.findOne({ user: req.user._id });
        if (!restaurant) {
            //console.log("get order: no restaurant found");
            return res.status(404).json({ message: "restaurant not found" });
        }

        const orders = await Order.find({ restaurant: restaurant._id })
            .populate("restaurant")
            .populate("user");

        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        //console.log('update order status');
        //console.log(req.params);
        //console.log(req.body);
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        //console.log(order);
        if (!order) {
            return res.status(404).json({ message: "order not found" });
        }

        const restaurant = await Restaurant.findById(order.restaurant);
        //console.log(restaurant);
        //console.log('Restaurant user ID:', restaurant.user._id.toString());
        //console.log('Request user ID:', req.user._id.toString());
        if (!restaurant.user._id.equals(req.user._id)) {
            //console.log('user id not match');
            return res.status(401).send();
        }

        order.status = status;
        await order.save();

        res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "unable to update order status" });
    }
};

const uploadImage = async (file) => {
    const image = file; // Image file from multer memory storage
    const base64Image = Buffer.from(image.buffer).toString("base64"); // Get base64 encoded string of image
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    // Upload image to cloudinary and get URL
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
};

export default {
    getMyRestaurant,
    createMyRestaurant,
    updateMyRestaurant,
    updateOrderStatus,
    getMyRestaurantOrders,
};
