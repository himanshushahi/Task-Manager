import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../utils/tokenManger";
import { cookies } from "next/headers";
import connectDb from "../../../database/connectdb";
import Column from "../../../database/schema/task";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { workSpaceId } = await req.json();
  try {
    if (!workSpaceId) throw new Error("WorkSpace Id is required");
    const token = cookies().get(process.env.COOKIE_NAME as string)?.value;
    if (!token) throw new Error("UnAuthorize User");
    const { _id } = await verifyToken(token);
    if (!_id) throw new Error("UnAuthorize User");

    await connectDb();

    await Column.findOneAndDelete({ _id: params.id, workSpace: workSpaceId });

    return NextResponse.json({
      success: true,
      message: "Column Deleted Successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
