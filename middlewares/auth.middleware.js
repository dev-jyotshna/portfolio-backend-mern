import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ApiError("Unauthorized request", 401));
  }

  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  req.user = await User.findById(decoded.id);

  next();
});
