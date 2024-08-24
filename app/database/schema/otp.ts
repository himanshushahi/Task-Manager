import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, expires: "2m", default: Date.now },
});


const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);

export default OTP;
