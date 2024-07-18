import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import myUserRoute from "./routes/myUserRoute.js";
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const port = process.env.PORT || 7000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to mongodb"));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:7000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.get("/status", async (req, res) => {
  res.send({ message: "status OK!" });
});

app.use('/api/auth', authRoutes);
//forward request to myUserRoute
app.use("/api/my/user", myUserRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`server started on localhost: ${port}`);
});