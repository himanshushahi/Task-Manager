import { NextRequest, NextResponse } from "next/server";
import connectDb from "../../database/connectdb";
import userModel from "../../database/schema/user";
import { createToken } from "../../utils/tokenManger";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  try {
    if (!email) throw new Error("Email Is Required!");

    const isMathed = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

    if (!isMathed) throw new Error("Email Is Not Valid!");

    if (!password) throw new Error("Password Is Required!");

    const isPasswordMatched = /^(?=.*[A-Z])/.test(password);

    if (!isPasswordMatched)
      throw new Error("Password must contain at least one uppercase letter");

    await connectDb();

    const user = await userModel.findOne({ email });

    if (!user) throw new Error("Email Or Password Incorrect!");

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) throw new Error("Email Or Password Incorrect!");

    const token = await createToken(user._id);

    cookies().set(process.env.COOKIE_NAME as string, token, {
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
    });

    return NextResponse.json({
      success: true,
      message: "LoggedIn Successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
