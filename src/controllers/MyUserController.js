import User from "../models/user.js";

const getCurrentUser = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(currentUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const createCurrentUser = async (req, res) => {
    try {
        const { auth0Id } = req.body;
        const existingUser = await User.findOne({ auth0Id });

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
        const { name, addressLine1, addressLine2, country, city } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = name || user.name;
        user.addressLine1 = addressLine1 || user.addressLine1;
        user.addressLine2 = addressLine2 || user.addressLine2;
        user.city = city || user.city;
        user.country = country || user.country;

        await user.save();

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error while updating user profile" });
    }
};

export default {
    getCurrentUser,
    createCurrentUser,
    updateCurrentUser,
};
