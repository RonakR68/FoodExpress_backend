import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import myUserRoute from "./routes/myUserRoute.js";
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { v2 as cloudinary } from "cloudinary";
import myRestaurantRoute from "./routes/MyRestaurantRoute.js";
import restaurantRoute from "./routes/RestaurantRoute.js";

const port = process.env.PORT || 7000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to mongodb"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
//app.options('/api/my/restaurant', cors()); // Enable pre-flight request for this route

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/status", async (req, res) => {
  res.send({ message: "status OK!" });
});

//auth route
app.use('/api/auth', authRoutes);

//forward request to myUserRoute
app.use("/api/my/user", myUserRoute);

//my restaurant route
app.use("/api/my/restaurant", myRestaurantRoute);

//restaurant route
app.use("/api/restaurant", restaurantRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`server started on localhost: ${port}`);
});