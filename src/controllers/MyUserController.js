import User from "../models/user.js";

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


export default {
    getCurrentUser,
    createCurrentUser,
    updateCurrentUser,
};
