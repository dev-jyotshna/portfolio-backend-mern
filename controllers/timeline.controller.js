import { Timeline } from "../models/timeline.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const postTimeline = asyncHandler(async (req, res, next) => {
  const { title, companyName, link, description, from, to } = req.body;
  const newTimeline = await Timeline.create({
    title,
    where: { companyName, link },
    description,
    timeline: { from, to },
  });

  res.status(200).json({
    success: true,
    message: "Timeline Added",
    newTimeline,
  });
});

export const deleteTimeline = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const timeline = await Timeline.findById(id);
  if (!timeline) {
    return next(new ApiError("Timeline not found", 404));
  }

  await timeline.deleteOne();
  res.status(200).json({
    success: true,
    message: "Timeline Deleted",
  });
});

export const getAllTimeline = asyncHandler(async (req, res, next) => {
  const timelines = await Timeline.find();
  res.status(200).json({
    success: true,
    timelines,
  });
});
