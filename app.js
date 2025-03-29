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
  "https://dashboard-xfpn.onrender.com",
  // "http://localhost:5000",
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

// Serve public frontend static assets under "/frontend"
app.use(
  "/frontend",
  express.static(path.join(__dirname, "client", "frontend"))
);

app.use("/admin", express.static(path.join(__dirname, "client", "admin")));

// "/" route serves the public index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "frontend", "index.html"));
});

// Dynamic Unprotected Public Pages Route
app.get("/:page", (req, res, next) => {
  const page = req.params.page;
  if (["api", "admin", "frontend"].includes(page)) {
    return next();
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(page)) {
    return res.status(400).send("Invalid page request");
  }
  const filePath = path.join(
    __dirname,
    "client",
    "frontend",
    "pages",
    `${page}.html`
  );
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`Error serving file: ${filePath}`, err);
      res.status(404).send("Page not found");
    }
  });
});

// Unprotected Unauthorized Page Route
app.get("/admin/unauthorized", (req, res) => {
  const filePath = path.join(
    __dirname,
    "client",
    "admin",
    "pages",
    "unauthorized.html"
  );
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`Error serving unauthorized page: ${filePath}`, err);
      res.status(404).send("Page not found");
    }
  });
});

// Dynamic Protected Admin Pages Route
app.get("/admin/:page", authenticate, checkAdmin, (req, res) => {
  const page = req.params.page;
  if (!/^[a-zA-Z0-9_-]+$/.test(page)) {
    return res.status(400).send("Invalid admin page request");
  }
  const filePath = path.join(
    __dirname,
    "client",
    "admin",
    "pages",
    `${page}.html`
  );
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`Error serving admin file: ${filePath}`, err);
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
    `Admin static files are protected and served only via the secure route.`
  );
});
