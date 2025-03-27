const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/auth.routes.js");
const applicationRoutes = require("./routes/application.routes.js");
const notificationRoutes = require("./routes/notification.routes.js");
const memberRoutes = require("./routes/member.routes.js");
const applicationsData = require("./routes/applicationsData.routes.js");
const errorHandler = require("./utils/errorHandler.js");
const initializeSocket = require("./socket.js");
const cookieParser = require("cookie-parser");

// Admin route protection middleware
const {
  authenticate,
  checkAdmin,
} = require("./middlewares/auth.middleware.js");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Enable CORS for Express routes
const allowedOrigins = [
  "https://gym-website-git-norevenue-sayunlopchans-projects.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Connect to the database
connectDB();

// Attach io to app for use in routes if needed
app.set("io", io);

// Define API routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/applicationsdata", applicationsData);

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, "client")));

// dynamic protected routes
app.get("/admin/pages/:page", authenticate, checkAdmin, (req, res) => {
  const page = req.params.page; // gets the page name from the URL
  const filePath = path.join(
    __dirname,
    "client",
    "admin",
    "pages",
    `${page}.html`
  );
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("Page not found");
    }
  });
});

// Error handler middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Admin static files served from: ${path.join(__dirname, "admin")}`
  );
});
