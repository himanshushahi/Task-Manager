import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  cookies().set(process.env.COOKIE_NAME as string, "", {
    expires: Date.now(),
  });
  return NextResponse.json({
    success: true,
    message: "Logout Successfully",
  });
}
