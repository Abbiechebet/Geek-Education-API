import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  userType: { type: String, enum: ['student', 'educator'], required: true },
  organizationName: { type: String, required: true },
  lastName: { type: String, required: true },
  companyEmail: { type: String, required: true },
  learningTrack: { type: String }, 
  track: { type: String }, 
});

export default model('User', userSchema);

/*first-name, last-name, email address, learning track,
password and confirm password

my first name, last name, company email address, track,
password and confirm password*/