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
import orderRoute from "./routes/OrderRoute.js";
import allowCors from './utils/allowCors.js';

const port = process.env.PORT || 7000;
const client_base_url = process.env.CLIENT_BASE_URL;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to mongodb"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const corsOptions = {
  origin: `${client_base_url}`,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  //allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/status", allowCors(async (req, res) => {
  res.send({ message: "status OK!" });
}));

//auth route
app.use('/api/auth', allowCors(authRoutes));

//forward request to myUserRoute
app.use("/api/my/user", allowCors(myUserRoute));

//my restaurant route
app.use("/api/my/restaurant", allowCors(myRestaurantRoute));

//restaurant route
app.use("/api/restaurant", allowCors(restaurantRoute));

//order route
app.use("/api/order", allowCors(orderRoute));

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`server started on localhost: ${port}`);
});