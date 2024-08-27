import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import connectDb from "../../database/connectdb";
import userModel from "../../database/schema/user";
import { verifyToken } from "../../utils/tokenManger";

export async function GET(req: NextRequest) {
  const url = new URL(req.nextUrl);
  const query = url.searchParams.get("query");
  try {
    const token =
      cookies().get(process.env.COOKIE_NAME as string)?.value ||
      headers().get("Authorization")?.split("Bearear ")[1];
    if (!token) throw new Error("UnAuthorize User");
    const { _id } = await verifyToken(token);
    if (!_id) throw new Error("UnAuthorize User");
    if (!query) throw new Error("Query is Required");
    await connectDb();
    const user = await userModel
      .find({
        _id: { $ne: _id }, // Use $ne instead of $not
        email: { $regex: new RegExp(query, "i") },
      })
      .select("name email avatar");

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
