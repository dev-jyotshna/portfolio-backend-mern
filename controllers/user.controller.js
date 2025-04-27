import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../middlewares/token.middleware.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

export const register = asyncHandler(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ApiError("Avatar and resume are required", 400));
  }

  const { avatar, resume } = req.files;

  const responseAvatar = await cloudinary.uploader.upload(avatar.tempFilePath, {
    folder: "avatars",
  });

  if (!responseAvatar || responseAvatar.error) {
    console.error(
      "Cloudinary Error: ",
      responseAvatar.error || "Unknown cloudinary error"
    );
  }

  const responseResume = await cloudinary.uploader.upload(resume.tempFilePath, {
    folder: "resumes",
  });

  if (!responseResume || responseResume.error) {
    console.error(
      "Cloudinary Error: ",
      responseResume.error || "Unknown cloudinary error"
    );
  }

  const {
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    twitterURL,
    linkedinURL,
    hashnodeURL,
    instagramURL,
    facebookURL,
  } = req.body;

  const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    twitterURL,
    linkedinURL,
    hashnodeURL,
    instagramURL,
    facebookURL,
    avatar: {
      public_id: responseAvatar.public_id,
      url: responseAvatar.secure_url,
    },
    resume: {
      public_id: responseResume.public_id,
      url: responseResume.secure_url,
    },
  });

  generateToken(user, "User Registered", 201, res);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError("Email and password are required"));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ApiError("Invalid email or password"));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ApiError("Invalid email or password"));
  }

  generateToken(user, "Logged In", 200, res);
});

export const logout = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .clearCookie("token", {
      expiresIn: "1s",
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Logged Out",
    });
});

export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    portfolioURL: req.body.portfolioURL,
    githubURL: req.body.githubURL,
    twitterURL: req.body.twitterURL,
    linkedinURL: req.body.linkedinURL,
    hashnodeURL: req.body.hashnodeURL,
    instagramURL: req.body.instagramURL,
    facebookURL: req.body.facebookURL,
  };
  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);

    const profileImageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(profileImageId);
    const cloudinaryresponseAvatar = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      {
        folder: "avatars",
      }
    );
    newUserData.avatar = {
      public_id: cloudinaryresponseAvatar.public_id,
      url: cloudinaryresponseAvatar.secure_url,
    };
  }
  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user.id);

    const resumeId = user.resume.public_id;
    await cloudinary.uploader.destroy(resumeId);
    const cloudinaryresponseResume = await cloudinary.uploader.upload(
      resume.tempFilePath,
      {
        folder: "resumes",
      }
    );
    newUserData.resume = {
      public_id: cloudinaryresponseResume.public_id,
      url: cloudinaryresponseResume.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Profile Updated",
    user,
  });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ApiError("All fields are required", 400));
  }
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(currentPassword);

  if (!isPasswordMatched) {
    return next(new ApiError("Incorrect current password", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(
      new ApiError("New password and confirm password should match", 400)
    );
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Updated",
  });
});

export const getUserForPortfolio = asyncHandler(async (req, res, next) => {
  const id = "67fe154a11825cb977bf9f40";
  const user = await User.findById(id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
  const message = `Your reset password is : \n\n ${resetPasswordUrl} \n\n If you've not requested for this please ignore`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Personal portfolio dashboard Recovery Password",
      message,
    });
    res.status(201).json({
      success: true,
      message: `Email sent successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ApiError(error.message, 500));
  }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ApiError(
        "Reset password token is invalid or it has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ApiError("Password and confirm password should match"));
  }
  user.password = await req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();
  generateToken(user, "Reset password Successfully", 200, res);
});
