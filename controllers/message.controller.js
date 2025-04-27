import { Message } from "../models/message.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { senderName, subject, message } = req.body;

  if (!senderName || !subject || !message) {
    return next(
      new ApiError(
        "Don't leave us hanging 🧗‍♂️ — please fill all the fields!",
        400
      )
    );
  }

  const data = await Message.create({ senderName, subject, message });

  res.status(200).json({
    success: true,
    message: "Message Sent",
    data,
  });
});

export const getAllMessages = asyncHandler(async (req, res, next) => {
  const messages = await Message.find();
  res.status(200).json({
    success: true,
    messages,
  });
});

export const deleteMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const message = await Message.findById(id);
  if (!message) {
    return next(new ApiError("Message Already Deleted", 400));
  }
  await message.deleteOne();
  res.status(200).json({
    success: true,
    message: "Message Deleted",
  });
});
