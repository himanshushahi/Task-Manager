import { NextRequest, NextResponse } from "next/server";
import connectDb from "../../database/connectdb";
import userModel from "../../database/schema/user";

export async function PUT(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    if (!email) throw new Error("Email Is Required!");

    if (!password) throw new Error("Passowrd Is Required!");

    if (password.length < 8)
      throw new Error("Password must be at least 8 characters long");

    if (!/^(?=.*[A-Z])/.test(password))
      throw new Error("Password must contain at least one uppercase letter");

    await connectDb();

    const user = await userModel.findOne({ email });

    if (!user) throw new Error("User not found with this email!");

    await userModel.findOneAndUpdate({ email }, { password });  
    return NextResponse.json({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
