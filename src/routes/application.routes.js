import express from "express";
import {
  registerApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  approveApplication,
} from "../controllers/application.controller.js";

const router = express.Router();

// Routes
router.post("/register", registerApplication);
router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);
router.put("/:id/approve", approveApplication);

export default router;
