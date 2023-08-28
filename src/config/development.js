import dotenv from "dotenv";
dotenv.config();

export const development = {
  mongodb_connection_url: process.env.DEV_MONGODB_CONNECTION_URL,
  port: +process.env.DEV_PORT,
  bcrypt_password_salt_round: process.env.DEV_PASSWORD_BCRYPT_SALT_ROUND,
  bcrypt_OTP_salt_round: process.env.DEV_OTP_BCRYPT_SALT_ROUND,
  jwt_web_token: process.env.DEV_JWT_SECRET,
  mail_trap_username: process.env.DEV_MAIL_TRAP_USERNAME,
  mail_trap_password: process.env.DEV_MAIL_TRAP_PASSWORD,
  bcrypt_forgot_password_salt_round: process.env.DEV_FORGOT_PASSWORD_SALT_ROUND,
};
