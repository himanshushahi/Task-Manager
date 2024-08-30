import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../utils/tokenManger";
import userModel from "../../database/schema/user";
import connectDb from "../../database/connectdb";

export async function GET(req: NextRequest) {
  const token =
    headers().get("Authorization")?.split("bearear ")[0] ||
    cookies().get(process.env.COOKIE_NAME as string)?.value;

  try {
    if (!token) throw new Error("UnAuthorize User");
    const { _id } = await verifyToken(token);
    if (_id) {
      await connectDb();
      const user = await userModel.findById(_id);
      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
        });
      } else {
        throw new Error("UnAuthorize User");
      }
    } else {
      throw new Error("UnAuthorize User");
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
