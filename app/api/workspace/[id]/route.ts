import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../utils/tokenManger";
import WorkSpace from "../../../database/schema/workspace";
import connectDb from "../../../database/connectdb";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const { memberId } = await req.json();

  try {
    const token =
      cookies().get(process.env.COOKIE_NAME as string)?.value ||
      headers().get("Authorization")?.split("Bearear ")[1];
    if (!token) throw new Error("UnAuthorize User");

    const { _id } = await verifyToken(token);
    if (!_id) throw new Error("UnAuthorize User");
    if (!memberId) throw new Error("Member Id Required");
    await connectDb();
    const workSpace = await WorkSpace.findOne({ _id: id, createdBy: _id });

    if (!workSpace) {
      throw new Error("User Not Authorized");
    }
    // Remove the member by filtering out the member with memberId
    workSpace.members = workSpace.members.filter(
      (member: any) => member.toString() !== memberId.toString()
    );

    await workSpace.save();

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
