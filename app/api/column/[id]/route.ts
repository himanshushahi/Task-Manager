import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../utils/tokenManger";
import { cookies } from "next/headers";
import connectDb from "../../../database/connectdb";
import Column from "../../../database/schema/task";
import WorkSpace from "../../../database/schema/workspace";

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

    const workSpace = await WorkSpace.findById(workSpaceId);

    if (
      workSpace.members.includes(_id) ||
      workSpace.createdBy.toString() === _id.toString()
    ) {
      await Column.findOneAndDelete({ _id: params.id, workSpace: workSpaceId });
      return NextResponse.json({
        success: true,
        message: "Column Deleted Successfully",
      });
    }
    throw new Error("UnAuthorize User.");
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
