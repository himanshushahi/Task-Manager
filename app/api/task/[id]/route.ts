import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../utils/tokenManger";
import { cookies, headers } from "next/headers";
import connectDb from "../../../database/connectdb";
import Column from "../../../database/schema/task";
import WorkSpace from "../../../database/schema/workspace";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { _id } = await verifyToken(
      cookies().get(process.env.COOKIE_NAME as string)?.value ||
        headers().get("Authorization")?.split("Bearear ")[1] ||
        ""
    );

    if (!_id) throw new Error("UnAuthorize User!");
    await connectDb();

    const workSpace = await WorkSpace.findOne({
      $or: [{ createdBy: _id }, { members: _id }],
      _id: params.id,
    }).select("name");

    const columns = await Column.find({ workSpace: params.id });

    return NextResponse.json({
      success: true,
      columns: columns,
      name: workSpace.name,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
