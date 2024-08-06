import Restaurant from "../models/restaurant.js";

const getRestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "restaurant not found" });
        }

        res.json(restaurant);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

const searchRestaurant = async (req, res) => {
    try {
        const cityOrPincode = req.params.city;

        const searchQuery = (req.query.searchQuery) || "";
        const selectedCuisines = (req.query.selectedCuisines) || "";
        const sortOption = (req.query.sortOption) || "lastUpdated";
        const page = parseInt(req.query.page) || 1;

        let query = {};

        // Check if the cityOrPincode is a 6-digit pincode or a city name
        if (/^\d{6}$/.test(cityOrPincode)) {
            query["pincode"] = cityOrPincode;
        } else {
            query["city"] = new RegExp(cityOrPincode, "i"); // ignore case
        }

        const cityCheck = await Restaurant.countDocuments(query);
        if (cityCheck === 0) {
            return res.status(404).json({
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1,
                },
            });
        }

        if (selectedCuisines) {
            const cuisinesArray = selectedCuisines
                .split(",")
                .map((cuisine) => new RegExp(cuisine, "i"));

            query["cuisines"] = { $all: cuisinesArray };
        }

        if (searchQuery) {
            const searchRegex = new RegExp(searchQuery, "i");
            query["$or"] = [
                { restaurantName: searchRegex },
                { cuisines: { $in: [searchRegex] } },
            ];
        }

        const pageSize = Number(process.env.PAGINATION_LIMIT); //10 results per page
        const skip = (page - 1) * pageSize;

        let sortOrder = 1; // Default to ascending
        if (sortOption === "rating") {
            sortOrder = -1; // Descending for rating
        }

        // sortOption = "lastUpdated"
        const restaurants = await Restaurant.find(query)
            .sort({ [sortOption]: sortOrder })
            .skip(skip)
            .limit(pageSize)
            .lean(); //removes mongoose metadata

        const total = await Restaurant.countDocuments(query);

        const response = {
            data: restaurants,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / pageSize),
            },
        };

        res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const getTopRatedRestaurants = async (req, res) => {
    try {
        //console.log('get top restaurants');
        //console.log(req);
        const limit = parseInt(req.query.limit) || 3;

        // Fetch the top-rated restaurants
        const topRatedRestaurants = await Restaurant.find()
            .sort({ rating: -1 }) 
            .limit(limit)         
            .lean();   // Convert to plain JS object

        res.json(topRatedRestaurants);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export default {
    getRestaurant,
    searchRestaurant,
    getTopRatedRestaurants,
};