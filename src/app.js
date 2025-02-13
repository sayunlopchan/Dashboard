const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/auth.routes.js");
const applicationRoutes = require("./routes/application.routes.js");
const memberRoutes = require("./routes/member.routes.js");
const errorHandler = require("./utils/errorHandler.js");

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
app.use("/api/members", memberRoutes);

// Pass Socket.io instance to routes/controllers that need real-time events
app.use("/api/applications", applicationRoutes(io));

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
