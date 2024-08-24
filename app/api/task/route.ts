import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../utils/tokenManger";
import { cookies } from "next/headers";
import connectDb from "../../database/connectdb";
import Column from "../../database/schema/task";

export async function POST(req: NextRequest) {
  const {
    columnId,
    task,
  }: {
    columnId: string;
    task: {
      id: string;
      content: string;
    };
  } = await req.json();

  try {
    const { _id } = await verifyToken(
      cookies().get(process.env.COOKIE_NAME as string)?.value || ""
    );

    if (!_id) throw new Error("Unauthorized User!");

    if (typeof task.content !== "string" || !task.content || !task.id)
      throw new Error("Bad Request");

    if (!columnId) throw new Error("Column Field Is Missing!");

    await connectDb();

    const column = await Column.findOne({ id: columnId });

    if (column) {
      column.tasks.push(task); // Directly push the task into the tasks array

      await column.save(); // Save the document with the new task
      return NextResponse.json({
        success: true,
        message: "Task Created Successfully",
      });
    }

    return NextResponse.json({
      success: false,
      message: "Column Not Found!",
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { _id } = await verifyToken(
      cookies().get(process.env.COOKIE_NAME as string)?.value || ""
    );

    if (!_id) throw new Error("UnAuthorize User!");
    await connectDb();

    const column = await Column.find({ createdBy: _id });

    return NextResponse.json({ success: true, column });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function DELETE(req: NextRequest) {
  const { columnId, taskId } = await req.json();

  try {
    const { _id } = await verifyToken(
      cookies().get(process.env.COOKIE_NAME as string)?.value || ""
    );

    if (!_id) throw new Error("UnAuthorize User!");
    await connectDb();
    if (!columnId) throw new Error("Column id is required!");
    if (!taskId) throw new Error("Task id is Required!");

    const column = await Column.findOne({ id: columnId });

    if (!column) throw new Error("Column not found with given id");

    const index = column.tasks.findIndex((task: { id: any; }) => task.id === taskId);
    if (index !== -1) {
      column.tasks.splice(index, 1);
    }

    await column.save();
    return NextResponse.json({
      success: true,
      message: "Task Deleted Successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
