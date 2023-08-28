import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const generateToken = (userExists) => {
  const payload = {
    _id: userExists._id,
    email: userExists.email,
    password: userExists.password
  }

  const token = jwt.sign(payload, config.jwt_web_token, { expiresIn: 60 * 60 * 24 });
  return token;
}

export const generateEducatorToken = (userExists) => {
  const payload = {
    _id: userExists._id,
    email: userExists.companyEmail,
    password: userExists.password
  }

  const token = jwt.sign(payload, config.jwt_web_token, { expiresIn: 60 * 60 * 24 });
  return token;
}


export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt_web_token)
}