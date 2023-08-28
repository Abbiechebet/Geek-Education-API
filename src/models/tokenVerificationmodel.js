import mongoose from "mongoose";

const tokenVerificationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student, Educator',
    required: true
  },

  token: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now()
  }

})

export const tokenVerificationModel = mongoose.model('VerificationToken', tokenVerificationSchema);