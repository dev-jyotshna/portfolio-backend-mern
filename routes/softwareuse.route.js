import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  addNewApplication,
  deleteApplication,
  getAllApplications,
} from "../controllers/softwareuse.controller.js";

const router = Router();

router.post("/add", isAuthenticated, addNewApplication);
router.get("/getall", getAllApplications);
router.delete("/delete/:id", isAuthenticated, deleteApplication);

export default router;
