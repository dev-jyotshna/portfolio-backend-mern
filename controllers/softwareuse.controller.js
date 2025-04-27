import { Software } from "../models/softwareuse.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";

export const addNewApplication = asyncHandler(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ApiError("Software application icon/svg is required", 400));
  }
  const { svg } = req.files;
  const { name } = req.body;

  if (!name) {
    return next(new ApiError("Software name is required", 400));
  }
  const cloudinaryResponseImage = await cloudinary.uploader.upload(
    svg.tempFilePath,
    {
      folder: "softwares",
    }
  );
  if (!cloudinaryResponseImage || cloudinaryResponseImage.error) {
    console.error(
      "Cloudinary Error: ",
      cloudinaryResponseImage.error || "Unknown Cloudinary Error"
    );
  }

  const softwareApplication = Software.create({
    name,
    svg: {
      public_id: cloudinaryResponseImage.public_id,
      url: cloudinaryResponseImage.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "New Software Application Added",
    softwareApplication,
  });
});
export const deleteApplication = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const softwareApplication = await Software.findById(id);
  if (!softwareApplication) {
    return next(new ApiError("Software Application not found", 404));
  }

  const softwareApplicationSvgId = softwareApplication.svg.public_id;
  await cloudinary.uploader.destroy(softwareApplicationSvgId);
  await softwareApplication.deleteOne();
  res.status(200).json({
    success: true,
    message: "Software Application Deleted",
  });
});
export const getAllApplications = asyncHandler(async (req, res, next) => {
  const softwares = await Software.find();
  res.status(200).json({
    success: true,
    softwares,
  });
});
