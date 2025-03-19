const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/auth.routes.js");
const applicationRoutes = require("./routes/application.routes.js");
const notificationRoutes = require("./routes/notification.routes");
const memberRoutes = require("./routes/member.routes.js");
const errorHandler = require("./utils/errorHandler.js");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    credentials: true,
  },
});

// Enable CORS
app.use(cors());

// Middleware
app.use(express.json());

// Database connection
connectDB();

// Listen for socket connections
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Attach io to app for global access
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
