import Restaurant from "../models/restaurant.js";
import Order from "../models/order.js";

const getMyOrders = async (req, res) => {
    try {
        //console.log(req.user);
        const orders = await Order.find({ user: req.user._id })
            .populate("restaurant")
            .populate("user");
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
        res.json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const calculateTotalAmount = (cartItems, menuItems, deliveryPrice) => {
    console.log(cartItems);
    console.log(menuItems);
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


export default {
    createOrder,
    getMyOrders,
};