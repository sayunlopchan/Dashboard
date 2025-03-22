// app.js
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
const applicationsData = require("./routes/applicationsData.routes.js");

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // frontend URL
    credentials: true,
  },
});

// Enable CORS for Express routes too
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Connect to the database
connectDB();

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Listen for a "fetchMembers" event from the client.
  socket.on("fetchMembers", async () => {
    try {
      // Import the Member model
      const Member = require("./models/Member.model.js");
      const members = await Member.find({});
      // Send the fetched members back to the client via "membersData" event.
      socket.emit("membersData", { members });
    } catch (error) {
      console.error("Error fetching members via socket:", error);
      socket.emit("membersData", { members: [] });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Attach io to app so routes can use it if needed
app.set("io", io);

// Define API routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/applicationsdata", applicationsData);

// Error handler middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
