import Restaurant from "../models/restaurant.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// Get restaurant details
const getMyRestaurant = async (req, res) => {
    try {
        //console.log('getMyRestaurant request');
        //console.log(req.user);
        const restaurant = await Restaurant.findOne({ user: req.user._id });
        if (!restaurant) {
            console.log("no restaurant");
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

        const existingRestaurant = await Restaurant.findOne({ user: req.userId });

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
};
