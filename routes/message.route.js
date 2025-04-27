import { Router } from "express";
import {
  deleteMessage,
  getAllMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/send", sendMessage);
router.get("/get-all", getAllMessages);
router.delete("/delete/:id", isAuthenticated, deleteMessage);

export default router;
