import Restaurant from "../models/restaurant.js";
import Order from "../models/order.js";
import User from "../models/user.js";

const getMyOrders = async (req, res) => {
    try {
        //console.log('get my orders');
        //console.log(req.user);
        const { sort = 'latest', status } = req.query;
        const filter = { user: req.user._id };
        
        // Add status filter if specified
        if (status) {
            if (status === 'pending') {
                filter.status = { $ne: 'delivered' };
            } else if (status === 'delivered') {
                filter.status = 'delivered';
            }
        }

        // Set sorting criteria
        let sortCriteria;
        if (sort === 'rating') {
            sortCriteria = { 'reviews.rating': -1 }; // Sort by rating descending
        } else {
            sortCriteria = { createdAt: -1 }; // Sort by date descending (latest first)
        }

        const orders = await Order.find(filter)
            .populate("restaurant")
            .populate("user")
            .sort(sortCriteria);
        //console.log(orders);
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

const createOrder = async (req, res) => {
    try {
        const checkoutSessionRequest = req.body;
        //console.log("Create Order: ");
        //console.log(checkoutSessionRequest);
        const restaurant = await Restaurant.findById(
            checkoutSessionRequest.restaurantId
        );

        if (!restaurant) {
            throw new Error("Restaurant not found");
        }

        const newOrder = new Order({
            restaurant: restaurant,
            user: req.user._id,
            status: "paid", // Assuming payment is done
            deliveryDetails: checkoutSessionRequest.deliveryDetails,
            cartItems: checkoutSessionRequest.cartItems,
            createdAt: new Date(),
            totalAmount: calculateTotalAmount(checkoutSessionRequest.cartItems, restaurant.menuItems, restaurant.deliveryPrice)
        });

        await newOrder.save();
        // Emit the new order to the relevant room
        const io = req.app.get('io'); // Get the io instance from the express app
        io.emit('orderUpdate', newOrder);
        //console.log('Emitting orderUpdate event for new order:', newOrder);
        res.json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const calculateTotalAmount = (cartItems, menuItems, deliveryPrice) => {
    //console.log(cartItems);
    //console.log(menuItems);
    const itemsTotal = cartItems.reduce((total, cartItem) => {
        const menuItem = menuItems.find(
            (item) => item._id.toString() === cartItem.menuItemId.toString()
        );

        if (!menuItem) {
            throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
        }

        return total + menuItem.price * parseInt(cartItem.quantity);
    }, 0);

    return itemsTotal + deliveryPrice;
};

const reviewOrder = async (req, res) => {
    const { orderId, rating, comment } = req.body;
    // console.log('order review');
    // console.log(orderId);
    // console.log(rating);
    // console.log(comment);
    try {
        // Find the order by ID
        const order = await Order.findById(orderId).populate("restaurant").populate("user");

        // Check if the order exists
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if the order status is "delivered"
        if (order.status !== "delivered") {
            return res.status(400).json({ message: "Only delivered order can be reviewed." });
        }

        // Ensure that the user posting the review is not the owner of the restaurant
        const restaurantOwner = await User.findById(order.restaurant.user);
        if (restaurantOwner._id.equals(req.user._id)) {
            return res.status(403).json({ message: "You cannot review your own restaurant." });
        }

        // Add the review to the order
        const review = {
            rating: Number(rating),
            comment: comment || "",
            user: req.user._id
        };
        //console.log('Review: ' + review.rating + ' ' + review.comment + ' ' + review.user);
        order.reviews.push(review);
        await order.save();

        // Update the restaurant's review/rating
        const restaurant = order.restaurant;
        restaurant.reviews.push(review);
        // Recalculate the restaurant's average rating
        const totalReviews = restaurant.reviews.length;
        const totalRating = restaurant.reviews.reduce((acc, review) => acc + review.rating, 0);
        restaurant.rating = totalRating / totalReviews;

        await restaurant.save();

        // Emit the review update to the restaurant owner
        const io = req.app.get('io'); // Get the io instance from the express app
        io.emit('reviewUpdate', { orderId, review });
        //console.log('Emitting reviewUpdate event for order:', orderId);
        res.json({ message: "Review added successfully", review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while submitting the review." });
    }
};



export default {
    createOrder,
    getMyOrders,
    reviewOrder,
};