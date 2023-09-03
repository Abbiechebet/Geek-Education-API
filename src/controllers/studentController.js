import * as bcrypt from 'bcrypt';
import { studentLoginValidator, studentRegDataValidation } from '../validators/joiValidators.js';
import { studentModel } from '../models/studentModel.js';
import { config } from '../config/index.js';
import { generateToken } from '../utils/jwt.js';
import { sendError } from '../customError/error.js';
import { createRandomBytes, generateEmail, generateOTP, generatePasswordReset, mailTransport, passwordResetConfirm, } from '../utils/sendEmail.js';
import { tokenVerificationModel } from '../models/tokenVerificationmodel.js';
import { resetTokenModel } from '../models/resetTokenModel.js';

export const createAccount = async (req, res) => {

  try {
    // Validate user registration data (joi validation)
    const { error, value } = studentRegDataValidation(req.body);
    if (error) {
      return res.status(400).json({
        status: "Failed",
        message: error.details[0].message
      });
    }

    // destructure the data in the req.body
    const { firstName, lastName, email, learningTrack, password, confirmPassword } = req.body;

    // check if the email already exists
    const emailExists = await studentModel.findOne({ email });
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
    const studentCreated = await studentModel.create({ firstName, lastName, email, learningTrack, password: hashedPassword, confirmPassword: hashedConfirmPassword });

    // returned response
    res.status(200).json({
      status: 'Success',
      message: 'Your Account Has Been Created Successfully',
      userData: studentCreated,
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
    const { error, value } = studentLoginValidator(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // destructure the data in the req.body
    const { email, password } = req.body;

    // check if the user exists by email
    const userExists = await studentModel.findOne({ email });
    if (!userExists) return sendError(res, 400, 'Email does not exist, please signup');

    // check if the password matches database
    const passwordExist = await bcrypt.compare(password, userExists.password);
    if (!passwordExist) return sendError(res, 400, 'Invalid credentials');

    // Generate a new OTP
    const OTP = generateOTP();

    // Hash the OTP
    const saltOTP = +config.bcrypt_OTP_salt_round;
    const hashedOTP = bcrypt.hashSync(OTP, saltOTP);

    // Store the hashed OTP in the user's data
    await studentModel.findOneAndUpdate(
      { email },
      { otp: hashedOTP }, // Store the OTP in the user's data
      { runValidators: false }
    );

    // Send OTP mail
    mailTransport().sendMail({
      from: "abbier547@gmail.com",
      to: userExists.email,
      subject: "Get the Access Key",
      html: generateEmail(OTP, userExists.firstName),
    });

    // If user already has a token and token is valid, do not generate a new token

    // Generate a new token
    const token = generateToken(userExists);

    let oldTokens = userExists.tokens || [];
    if (oldTokens.length) {
      oldTokens = oldTokens.filter(t => {
        const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
        if (timeDiff < 86400) {
          console.log(t);
          return t;
        } else {
          return {};
        }
      });
    }

    await studentModel.findByIdAndUpdate(userExists._id, { tokens: [...oldTokens, { token, signedAt: Date.now().toString() }] }, { runValidators: true });

    // When everything is checked successfully
    res.status(200).header('auth_token', token).json({
      status: 'Success',
      message: 'Student logged in successfully. Confirm your Email for an OTP',
      auth_token: token,
    });

  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};



export const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;
    if (!email) return sendError(res, 400, "Please provide a valid email");

    // find a user with the email provided
    const user = await studentModel.findOne({ email });
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
      to: user.email,
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
    const user = await studentModel.findById(req.user._id)
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
    const updatedResetPassword = await studentModel.create(user);

    // delete reset token document from database
    await resetTokenModel.findOneAndDelete({ owner: user._id });

    // send mail
    mailTransport().sendMail({
      from: "abbier547@gmail.com",
      to: user.email,
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
export const resendOTP = async (req, res) => {
  try {
    // Get the authenticated user's email
    const { email } = req.user;

    // Retrieve the user data
    const userExists = await studentModel.findOne({ email });

    if (!userExists) {
      return sendError(res, 400, 'User not found');
    }

    // Generate a new OTP
    const newOTP = generateOTP();

    // Hash the new OTP
    const saltOTP = +config.bcrypt_OTP_salt_round;
    const hashedNewOTP = bcrypt.hashSync(newOTP, saltOTP);

    // Invalidate the existing OTP (if it exists)
    await studentModel.findOneAndUpdate(
      { email },
      { $unset: { otp: 1 } }, 
      { runValidators: false }
    );

    // Save the new OTP into the user's data
    await studentModel.findOneAndUpdate({ email }, { otp: hashedNewOTP });

    // Send OTP mail with the newOTP value inserted into the HTML template
    mailTransport().sendMail({
      from: 'abbier547@gmail.com',
      to: email,
      subject: 'Reset OTP',
      html: generateEmail(newOTP, userExists.firstName), 
    });

    res.status(200).json({
      status: 'Success',
      message: 'A new OTP has been sent to your email, you can proceed to log in to your account',
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    // Get the authenticated user's email
    const { email } = req.user;

    // Get the OTP sent in the request body
    const { otp } = req.body;

    // Find the user in the database
    const user = await studentModel.findOne({ email });

    // Check if the user exists
    if (!user) return sendError(res, 400, 'User not found');

    // Check if the user has an OTP
    if (!user.otp) return sendError(res, 400, 'No OTP found for the user');

    // Compare the provided OTP with the hashed OTP stored in the database
    const isOTPValid = await bcrypt.compare(otp, user.otp);

    if (isOTPValid) {
      // If OTP is valid, you can clear the OTP field in the user's data
      await studentModel.findOneAndUpdate(
        { email },
        { $unset: { otp: 1 } },
        { runValidators: false }
      );

      // You can also perform other actions, like setting the user as verified

      return res.status(200).json({
        status: 'Success',
        message: 'OTP verified successfully. Welcome to Geek Educational App.',
      });
    } else {
      return sendError(res, 400, 'Invalid OTP');
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};
