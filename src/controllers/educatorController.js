import * as bcrypt from 'bcrypt';
import { educatorLoginValidator, educatorRegDataValidation } from '../validators/joiValidators.js';
import { educatorModel } from '../models/educatorModel.js';
import { config } from '../config/index.js';
import { generateEducatorToken } from '../utils/jwt.js';
import { sendError } from '../customError/error.js';
import { createRandomBytes, generateEmail, generateOTP, generatePasswordReset, mailTransport, passwordResetConfirm, } from '../utils/sendEmail.js';
import { tokenVerificationModel } from '../models/tokenVerificationmodel.js';
import { resetTokenModel } from '../models/resetTokenModel.js';

export const createAccount = async (req, res) => {

  try {
    // Validate user registration data (joi validation)
    const { error, value } = educatorRegDataValidation(req.body);
    if (error) {
      return res.status(400).json({
        status: "Failed",
        message: error.details[0].message
      });
    }

    // destructure the data in the req.body
    const { firstName, lastName, companyEmail, track, password, confirmPassword } = req.body;

    // check if the email already exists
    const emailExists = await educatorModel.findOne({ companyEmail });
    if (emailExists) {
      return res.status(400).json({
        status: "Failed",
        message: 'Email already exists, please login instead'
      });
    }

    // hash password before saving to database
    const saltPass = +config.bcrypt_password_salt_round
    const hashedPassword = bcrypt.hashSync(password, saltPass);
    const hashedConfirmPassword = bcrypt.hashSync(confirmPassword, saltPass);

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "Failed",
        message: 'please ensure your password match'
      });
    }

    // save data into the database
    const educatorCreated = await educatorModel.create({ firstName, lastName, companyEmail,track, password: hashedPassword, confirmPassword: hashedConfirmPassword });

    // returned response
    res.status(200).json({
      status: 'Success',
      message: 'Your Account Has Been Created Successfully',
      userData: educatorCreated,
    })

  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message
    })
  }

}



export const emailLogin = async (req, res) => {

  try {
    // Validate user registration data (joi validation)
    const { error, value } = educatorLoginValidator(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    // destructure the data in the req.body
    const { companyEmail, password } = req.body;

    // check if the user exists by email
    const userExists = await educatorModel.findOne({ companyEmail });
    if (!userExists) return sendError(res, 400, 'Email does not exist, please signup');

    // check if the password matches database
    const passwordExist = await bcrypt.compare(password, userExists.password);
    if (!passwordExist) return sendError(res, 400, 'invalid credentials')

    
    // generate an otp for user
    const OTP = generateOTP();

    // hash otp
    const saltOTP = +config.bcrypt_OTP_salt_round
    const hashedOTP = bcrypt.hashSync(OTP, saltOTP);

   // save hashed token generated into the verification-tokens collections, token is valid for 1 hour
   const tokenVerification = await tokenVerificationModel.create({ owner: userExists._id,token: hashedOTP })

    // send OTP mail
    mailTransport().sendMail({
      from: "abbier547@gmail.com",
      to: userExists.companyEmail,
      subject: "Get the Access Key",
      html: generateEmail(OTP, userExists.firstName)
    })

    // if user already has a token and token valid, do not generate new token

    // generate token
    const token = generateEducatorToken(userExists);

    let oldTokens = userExists.tokens || [];
    if (oldTokens.length) {
      oldTokens = oldTokens.filter(t => {
        const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000
        if (timeDiff < 86400) {
          console.log(t);
          return t;
        } else {
          return {};
        }
      })
    }

    await educatorModel.findByIdAndUpdate(userExists._id, { tokens: [...oldTokens, { token, signedAt: Date.now().toString() }] }, { runValidators: true })

    // when everything is checked successfully
    res.status(200).header('auth_token', token).json({
      status: 'Success',
      message: 'Educator logged in successfully confirm your Email for an OTP',
      access_token: token,
      verificationToken: tokenVerification
    })

  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message
    })
  }

}



export const forgotPassword = async (req, res) => {
  try {

    const { companyEmail } = req.body;
    if (!companyEmail) return sendError(res, 400, "Please provide a valid email");

    // find a user with the email provided
    const user = await educatorModel.findOne({ companyEmail });
    if (!user) return sendError(res, 400, "User not found, invalid request");

    // check if the resetToken document exists
    const token = await resetTokenModel.findOne({ owner: user._id })
    if (token) return sendError(res, 400, "try again after 1 hour");

    // generate a random token from crypto
    const genToken = await createRandomBytes()

    // hash token generated
    const tokenSalt = +config.bcrypt_forgot_password_salt_round
    const hashedToken = bcrypt.hashSync(genToken, tokenSalt);

    // create the reset-token document in the database
    const resetToken = await resetTokenModel.create({ owner: user._id, token: hashedToken })

    // send mail
    mailTransport().sendMail({
      from: "abbier547@gmail.com",
      to: user.companyEmail,
      subject: "Password Reset",
      html: generatePasswordReset(user.firstName, `http://localhost:3000/reset-password?token=${genToken}&id=${user._id}`)
    })

    // response
    res.status(200).json({
      status: "success",
      message: "Password reset link is sent to your email",
      data: resetToken
    })

  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message
    })
  }

}

export const resetPassword = async (req, res) => {

  try {

    const { password } = req.body;
    const user = await educatorModel.findById(req.user._id)
    if (!user) return sendError(res, 400, "user not found!");

    // check if it is same password as old password
    const isSamePassword = await bcrypt.compare(password, user.password)
    if (isSamePassword) return sendError(res, 400, "Cannot have the same password as the old one.");

    // check the length of the password
    if (password.trim().length < 8 || password.trim().length > 20) return sendError(res, 400, "Password must be 8 to 20 characters long!");

    // hash password
    const saltPass = +config.bcrypt_password_salt_round;
    const hashedPassword = bcrypt.hashSync(password.trim(), saltPass);

    // update the new password
    user.password = hashedPassword;

    // save the new updated user object
    const updatedResetPassword = await educatorModel.create(user);

    // delete reset token document from database
    await resetTokenModel.findOneAndDelete({ owner: user._id });

    // send mail
    mailTransport().sendMail({
      from: "abbier547@gmail.com",
      to: user.companyEmail,
      subject: "Password Reset",
      html: passwordResetConfirm(user.firstName)
    })

    // response
    res.status(200).json({
      status: "success",
      message: "Password reset successful",
      data: updatedResetPassword
    })

  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message
    })
  }

}