import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./app/utils/tokenManger";
import { cookies } from "next/headers";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const token = cookies().get(process.env.COOKIE_NAME as string)?.value || "";

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const { _id } = await verifyToken(token);
    if (!_id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register")
  ) {
    const { _id } = await verifyToken(token);
    if (_id) {
      return NextResponse.redirect(new URL("/dashboard/tasks", request.url));
    }
  }
}
