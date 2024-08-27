import { NextRequest, NextResponse } from "next/server";
import connectDb from "../../../database/connectdb";
import userModel from "../../../database/schema/user";
import OTP from "../../../database/schema/otp";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_GMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  try {
    if (!email) throw new Error("Email Is Required!");

    await connectDb();

    const user = await userModel.findOne({ email });

    if (user) throw new Error("User already registered with this email!");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.create({ email, otp });

    await transporter.sendMail({
      from: `"Task Manager" <${process.env.AUTH_GMAIL}>`,
      to: email,
      subject: "Your OTP for Email Verification",
      text: `Your OTP is ${otp}. It will expire in 2 minutes.`,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f7f7f7; border-radius: 10px; border: 1px solid #ddd;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="/logo" alt="Task Manager" style="max-width: 150px; margin-bottom: 10px;">
                  </div>
                  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #333333; text-align: center; font-size: 24px; margin-bottom: 20px;">Email Verification</h2>
                    <p style="color: #555555; font-size: 16px; line-height: 1.5; text-align: center;">Welcome to Task Manager! Please verify your email address by using the OTP below. This OTP will expire in 2 minutes.</p>
                    <div style="text-align: center; margin: 20px 0;">
                      <span style="display: inline-block; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 5px; background-color: #4CAF50; color: #ffffff;">${otp}</span>
                    </div>
                    <p style="color: #555555; font-size: 14px; line-height: 1.5; text-align: center;">If you did not sign up for a Task Manager account, please ignore this email or contact support.</p>
                  </div>
                  <div style="text-align: center; margin-top: 20px;">
                    <p style="color: #999999; font-size: 12px;">Task Manager © 2024. All rights reserved.</p>
                  </div>
                </div>
              `,
    });

    return NextResponse.json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      success: true,
    });
  }
}
