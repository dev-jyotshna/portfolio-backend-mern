import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { v2 as cloudinary } from "cloudinary";
import { Skill } from "../models/skill.model.js";

export const addSkill = asyncHandler(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ApiError("Skill svg is required", 404));
  }
  const { svg } = req.files;
  const { title, proficiency } = req.body;

  if (
    !title ||
    title === "undefined" ||
    !proficiency ||
    proficiency === "undefined"
  ) {
    return next(new ApiError("All fields are required", 400));
  }

  const cloudinaryResponseImage = await cloudinary.uploader.upload(
    svg.tempFilePath,
    {
      folder: "skills",
    }
  );
  if (!cloudinaryResponseImage || cloudinaryResponseImage.error) {
    console.error(
      "Cloudinary Error: ",
      cloudinaryResponseImage.error || "Unknown Cloudinary Error"
    );
  }

  const skill = await Skill.create({
    title,
    proficiency,
    svg: {
      public_id: cloudinaryResponseImage.public_id,
      url: cloudinaryResponseImage.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "Acquired New Skill",
    skill,
  });
});

export const deleteSkill = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const skill = await Skill.findById(id);
  if (!skill) {
    return next(new ApiError("Skill not found", 404));
  }

  const skillSvgId = skill.svg.public_id;
  await cloudinary.uploader.destroy(skillSvgId);
  await skill.deleteOne();
  res.status(200).json({
    success: true,
    message: "Skill Deleted",
  });
});

export const updateSkill = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let skill = await Skill.findById(id);
  if (!skill) {
    return next(new ApiError("Skill not found", 404));
  }
  const { proficiency } = req.body;
  skill = await Skill.findByIdAndUpdate(
    id,
    { proficiency },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Skill Updated",
    skill,
  });
});

export const getAllSkills = asyncHandler(async (req, res, next) => {
  const skills = await Skill.find();
  res.status(200).json({
    success: true,
    skills,
  });
});
