import jwt from "jsonwebtoken";
import errorHandler from "../utils/errorHandler.js";
import asyncHandler from "express-async-handler";
import userModel from "../model/userModel.js";

const verifyUserMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization;
  console.log(token);

  if (!token) {
    return next(errorHandler("Unauthorized Access, Token not found!", 401));
  }
  const verifyUser = jwt.verify(token, process.env.JWT_TOKEN);
  const user = await userModel.findById(verifyUser.id).select("-password");
  if (!user) {
    return next(errorHandler("User not found", 404));
  }
  req.user = user;
  next();
});

export default verifyUserMiddleware;
