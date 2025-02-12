import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http"; // Importing http to use with socket.io
import socketIo from "socket.io"; // Import socket.io
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import memberRoutes from "./routes/member.routes.js";
import { errorHandler } from "./utils/errorHandler.js";

dotenv.config();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create a Socket.IO instance attached to the server
const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:5501", // Frontend URL
    credentials: true,
  },
});

// Enable CORS
app.use(
  cors({
    origin: "http://127.0.0.1:5501", // Frontend URL
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

// Socket.IO event for real-time communication
io.on("connection", (socket) => {
  console.log("New client connected");

  // Example of sending an event to the client
  socket.emit("welcome", { message: "Welcome to the server!" });

  // Handling disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
