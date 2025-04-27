import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  deleteTimeline,
  getAllTimeline,
  postTimeline,
} from "../controllers/timeline.controller.js";

const router = Router();

router.post("/add", isAuthenticated, postTimeline);
router.get("/getall", getAllTimeline);
router.delete("/delete/:id", isAuthenticated, deleteTimeline);

export default router;
