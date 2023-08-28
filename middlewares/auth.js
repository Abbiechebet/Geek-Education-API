import { isValidObjectId } from "mongoose";
import { sendError } from "../customError/error.js";
import { verifyToken } from "../utils/jwt.js";
import { studentModel } from "../models/studentModel.js";
import { educatorModel } from "../models/educatorModel.js";

export const resetPasswordValidation = async (req, res, next) => {
  // const { token, _id } = req.query;
  // if (!token || !_id) return sendError(res, 400, "Invalid request");

  const {_id } = req.query;
  if (!_id) return sendError(res, 400, "Invalid request");

  // check if id object is valid or not
  if (!isValidObjectId(_id)) return sendError(res, 400, "Invalid user!");

  // check if the user with id exists
  const user = await studentModel.findById(_id);
  if (!user) return sendError(res, 400, "user not found!");

  // const resetToken = await resetTokenModel.findOne({ owner: user._id });
  // if (!resetToken) return sendError(res, 400, "Reset token not found!");

  // const isValid = await bcrypt.compare(token, resetToken.token)
  // if (!isValid) return sendError(res, 400, "Please provide a valid token!")

  req.user = user;
  next();
}


export const educatorResetPasswordValidation = async (req, res, next) => {

  const {_id } = req.query;
  if (!_id) return sendError(res, 400, "Invalid request");

  // check if id object is valid or not
  if (!isValidObjectId(_id)) return sendError(res, 400, "Invalid user!");

  // check if the user with id exists
  const user = await educatorModel.findById(_id);
  if (!user) return sendError(res, 400, "user not found!");

  req.user = user;
  next();
}