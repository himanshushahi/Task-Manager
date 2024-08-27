import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../utils/tokenManger";
import WorkSpace from "../../database/schema/workspace";
import connectDb from "../../database/connectdb";
import Column from "../../database/schema/task";

export async function GET(req: NextRequest) {
  const token =
    cookies().get(process.env.COOKIE_NAME as string)?.value ||
    headers().get("Authorization")?.split("Bearear ")[1];
  try {
    if (!token) throw new Error("UnAuthorize User");

    const { _id } = await verifyToken(token);
    if (!_id) throw new Error("UnAuthorize User");

    const workSpaces = await WorkSpace.find({ createdBy: _id }).populate('members','name email avatar');

    return NextResponse.json({
      success: true,
      workSpaces,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const token =
    cookies().get(process.env.COOKIE_NAME as string)?.value ||
    headers().get("Authorization")?.split("Bearear ")[1];
  try {
    if (!name) throw new Error("Name Is Required!");
    if (!token) throw new Error("UnAuthorize User");

    const { _id } = await verifyToken(token);
    if (!_id) throw new Error("UnAuthorize User");
    await connectDb();

    const workspace = await WorkSpace.create({
      name,
      createdBy: _id,
    });

    await Column.create({
      id: "todo",
      title: "Todo",
      tasks: [],
      createdBy: _id,
      workSpace: workspace._id,
    });

    await Column.create({
      id: "in_Progress",
      title: "In Progress",
      tasks: [],
      createdBy: _id,
      workSpace: workspace._id,
    });

    await Column.create({
      id: "completed",
      title: "Completed",
      tasks: [],
      createdBy: _id,
      workSpace: workspace._id,
    });

    return NextResponse.json({
      success: true,
      workspace,
      message: "WorkSpace Created Successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  try {
    if (!id) throw new Error("Id is required!");

    const token = cookies().get(process.env.COOKIE_NAME as string)?.value;
    if (!token) throw new Error("UnAuthorize User");

    const { _id } = await verifyToken(token);
    if (!_id) throw new Error("UnAuthorize User");

    await Column.deleteMany({ workSpace: id });

    await WorkSpace.findOneAndDelete({ _id: id, createdBy: _id });

    return NextResponse.json({
      success: true,
      message: "WorkSpace Deleted Successfully",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      message: error.message,
    });
  }
}

export async function PUT(req: NextRequest) {
  const { workSpaceId, users } = await req.json();
  try {
    const token =
      cookies().get(process.env.COOKIE_NAME as string)?.value ||
      headers().get("Authorization")?.split("Bearear ")[1];
    if (!token) throw new Error("UnAuthorize User");

    const { _id } = await verifyToken(token);
    if (!_id) throw new Error("UnAuthorize User");

    if (!users) throw new Error("Users Is Required!");

    if (!Array.isArray(users)) {
      throw new Error("Users Must Be An Array!");
    }

    await connectDb();
    const workSpace = await WorkSpace.findOne({
      _id: workSpaceId,
      createdBy: _id,
    });

    if (!workSpace) throw new Error("Bad Request");

    workSpace.members.push(users);

    await workSpace.save();

    return NextResponse.json({
      success: true,
      message: "New members added to the workspace",
      workSpace,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
