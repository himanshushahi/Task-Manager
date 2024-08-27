import bcrypt from "bcrypt";
import userModel from "../../database/schema/user";
import connectDb from "../../database/connectdb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { name, email, avatar, password } = await req.json();

    if (!name) throw new Error("Name Is Required!");

    if (!email) throw new Error("Email Is Required!");

    const isMathed = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

    if (!isMathed) throw new Error("Email Is Not Valid!");

    if (!password) throw new Error("Password Is Required!");

    const isPasswordMatched = /^(?=.*[A-Z])/.test(password);

    if (!isPasswordMatched)
      throw new Error("Password must contain at least one uppercase letter");

    await connectDb();

    // Check if user already exists
    const existingUser = await userModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered!" },
        { status: 200 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    await userModel.create({
      name,
      email,
      avatar,
      password: hashPassword,
    });

    return NextResponse.json(
      { success: true, message: "User registered successfully!" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
