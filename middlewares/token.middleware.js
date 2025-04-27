export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateRefreshToken();

  res
    .status(statusCode)
    .cookie("token", token, {
      expiresIn: process.env.COOKIE_EXPIRY,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message,
      token,
      user,
    });
};
