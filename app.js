import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import connectDB from "./db/db.js";
import { errorMiddleware } from "./utils/ApiError.js";

//routers
import messageRouter from "./routes/message.route.js";
import userRouter from "./routes/user.route.js";
import timelineRouter from "./routes/timeline.route.js";
import softwareRouter from "./routes/softwareuse.route.js";
import skillRouter from "./routes/skill.route.js";
import projectRouter from "./routes/project.route.js";

const app = express();
dotenv.config({ path: "./.env" });

app.use(
  cors({
    origin: [process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
); // middleware to connect frontend to backend

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/software", softwareRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/project", projectRouter);

connectDB();

app.use(errorMiddleware);

export default app;
