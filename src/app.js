import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import memberRoutes from "./routes/member.routes.js";
import { errorHandler } from "./utils/errorHandler.js";

dotenv.config();

const app = express();

// Enable CORS
app.use(
  cors({
    origin: "http://127.0.0.1:5501", // frontend URL
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/members", memberRoutes);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
