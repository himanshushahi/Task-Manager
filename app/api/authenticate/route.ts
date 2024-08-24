import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../utils/tokenManger";

export async function GET(req: NextRequest) {
  const token =
    headers().get("Authorization")?.split("bearear ")[0] ||
    cookies().get(process.env.COOKIE_NAME as string)?.value;

  try {
    if (!token) throw new Error("UnAuthorize User");
    const { _id } = await verifyToken(token);
    if (_id) {
      return NextResponse.json({
        success: true,
        message: "Authorize",
      });
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
