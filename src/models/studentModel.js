import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    immutable: true,
    validators: {
      match: [/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, "Please add a valid email string to the email path."]
    }
  },
  learningTrack: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true,
    validators: {
      match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.']
    }
  },

  confirmPassword: {
    type: String,
    required: true,
    validators: {
      match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.']
    }
  },
   
  otp: {
    type: String,
  },
})

export const studentModel = mongoose.model('Student', StudentSchema);