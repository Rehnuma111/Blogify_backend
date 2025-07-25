import userModel from "../model/userModel.js";
import asyncHandler from "express-async-handler";
import errorHandler from "../utils/errorHandler.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import nodemailer from "nodemailer";

// Nodemailer Transport

const transport = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

// GET REQ  : Fetching User :
export const getUser = asyncHandler(async (req, res, next) => {
  try {
    const countUser = await userModel.countDocuments();

    const startIndex = parseInt(req.query.page) || 1;
    const showUserPerPage = parseInt(req.query.user) || 9;
    const sortUser = req.query.sortUser === "asc" ? 1 : -1;
    const skipUser = (startIndex - 1) * showUserPerPage;

    const userInfo = await userModel
      .find()
      .skip(skipUser)
      .sort({ updatedAt: sortUser })
      .limit(showUserPerPage);

    const currentDate = new Date();

    const oneMonthAgo = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      currentDate.getDate()
    );

    const lastMonthUsers = await userModel.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    const userWithoutPassword = userInfo.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });
    return res.status(200).json({
      success: true,
      message: "user has been fetched",
      lastMonthUsers,
      user: userWithoutPassword,
      countUser: countUser,
    });
  } catch (error) {
    return next(errorHandler("An unexpected error occurred", 400));
  }
});

// POST REQ : Registering User :
export const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  const userExist = await userModel.findOne({ email: email });

  const genSalt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, genSalt);

  if (userExist) {
    return next(errorHandler("User is already exist!", 400));
  } else {
    const registerUserInfo = await new userModel({
      username,
      email,
      password: hashedPassword,
    });
    try {
      await registerUserInfo.save();
      const { password, ...rest } = registerUserInfo._doc;
      return res.status(200).json({
        success: true,
        message: "User has been registered successfully",
        user: rest,
      });
    } catch (error) {
      console.log(error);
      return next(
        errorHandler(
          "An unexpected error occurred while registering user!",
          400
        )
      );
    }
  }
});

// POST REQ : Login User :

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const existUser = await userModel.findOne({ email: email });

  if (!existUser) {
    return next(errorHandler("User not found", 401));
  }

  const matchPassword = await bcrypt.compare(password, existUser.password);

  if (!matchPassword) {
    return next(errorHandler("Invalid password", 401));
  }

  const createToken = JWT.sign({ id: existUser.id, isAdmin: existUser.isAdmin }, process.env.JWT_TOKEN, {
    expiresIn: "30d",
  });
  const updateUser = await userModel.findByIdAndUpdate(
    { _id: existUser.id },
    { token: createToken },
    { new: true }
  );

  if (updateUser) {
    const { password, ...rest } = updateUser._doc;
    return res
      .status(200)
      .cookie("accessToken", updateUser.token, { httpOnly: true, secure: true })
      .json({
        status: 200,
        success: true,
        message: "Login successful",
        user: rest,
      });
  }
});

// PUT REQ : Update User :

export const updateUser = asyncHandler(async (req, res, next) => {
  const paramsId = req.params.id;
  const userId = req.user.id;

  if (paramsId !== userId) {
    return next(
      errorHandler("Resources can not be accessed,Unauthorized user!", 401)
    );
  } else {
    let userInfo = {
      username: req.body.username,
      email: req.body.email,
      profilePicture: req.body.profilePicture,
    };

    try {
      if (req.body.password) {
        let genSalt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(req.body.password, genSalt);
        userInfo.password = hashedPassword;
      }

      const updateUserInfo = await userModel.findByIdAndUpdate(
        paramsId,
        {
          $set: userInfo,
        },
        { new: true }
      );

      const { password, ...rest } = updateUserInfo._doc;

      return res.status(200).json({
        message: "User has been updated",
        success: true,
        user: rest,
      });
    } catch (error) {
      return next("An unexpected error occurred while updating data", 500);
    }
  }
});


export const googleOAuth = asyncHandler(async (req, res, next) => {
  const { username, email, profilePicture } = req.body;

  try {
    let user = await userModel.findOne({ email });

    // If user exists, log in
    if (user) {
      const token = JWT.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_TOKEN,
        { expiresIn: "30d" }
      );

      return res
        .status(200)
        .cookie("accessToken", token, { httpOnly: true })
        .json({
          success: true,
          message: "User logged in successfully",
          user,
        });
    }

    // Generate random password
    const tempPassword =
      100 * Math.random().toString().replace(".", "") +
      process.env.JWT_TOKEN.slice(20);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const formattedUsername = username.toLowerCase().replace(/\s/g, "");

    const newUser = new userModel({
      username: formattedUsername,
      email,
      profilePicture,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = JWT.sign({ id: savedUser._id }, process.env.JWT_TOKEN, {
      expiresIn: "30d",
    });

    // Optionally update user token in DB
    savedUser.token = token;
    await savedUser.save();

    const { password, ...userWithoutPassword } = savedUser._doc;

    return res
      .status(200)
      .cookie("accessToken", token, { httpOnly: true })
      .json({
        success: true,
        message: "User registered and logged in via Google OAuth",
        user: userWithoutPassword,
      });
  } catch (error) {
    console.error("Google OAuth error:", error);
    return next(errorHandler("OAuth login failed"));
  }
});

// DELETE Api for deleting user :

export const deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { isAdmin } = req.body.user;

  if (!isAdmin && userId !== id) {
    return next(errorHandler("Unauthorized user!", 401));
  }
  try {
    await userModel.findByIdAndDelete({ _id: id });

    return res.status(200).json({
      success: true,
      message: "User has been deleted",
    });
  } catch (error) {
    return next(
      errorHandler("An unexpected error occurred while deleting user!", 400)
    );
  }
});

// POST req for user SignOut :

export const signOutUser = asyncHandler(async (req, res, next) => {
  try {
    res.clearCookie("accessToken").json({
      success: true,
      message: "User has been signedOut",
    });
  } catch (error) {
    return next(errorHandler(error));
  }
});

// POST req for reset the password of user :

export const userResetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(errorHandler("Email is required", 400));
  }

  try {
    console.log("🔁 Initiating password reset for:", email);

    const user = await userModel.findOne({ email });

    if (!user) {
      return next(errorHandler("Oops, Email not found!", 404));
    }

    // Generate password reset token (expires in 1 hour for security)
    const resetToken = JWT.sign(
      { _id: user._id },
      process.env.JWT_TOKEN,
      { expiresIn: "1h" }
    );

    // Set token and expiry in database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in ms

    await user.save();

    // Mock email send (replace with actual email function)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log(`📧 Password reset email would be sent to ${email}: ${resetUrl}`);

    // Example (Uncomment if you use a mailer utility)
    // await sendEmail({
    //   to: user.email,
    //   subject: "Password Reset Request",
    //   html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    // });

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });

  } catch (error) {
    console.error("❌ Error in userResetPassword:", error);
    return next(errorHandler("Server Error. Please try again later.", 500));
  }
});

// GET API : public route :

export const getComment = asyncHandler(async (req, res, next) => {
  const { commentUserId } = req.params;

  try {
    const comment = await userModel.findById({ _id: commentUserId });

    if (!comment) {
      return next(errorHandler("Comment not found!", 404));
    }
    const { password, ...rest } = comment._doc;
    return res.status(200).json(rest);
  } catch (error) {
    console.log(error);
  }
});
