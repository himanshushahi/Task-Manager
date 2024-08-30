import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../utils/tokenManger";
import { cookies } from "next/headers";
import connectDb from "../../database/connectdb";
import Column from "../../database/schema/task";
import WorkSpace from "../../database/schema/workspace";

export async function POST(req: NextRequest) {
  const {
    columnId,
    task,
    workSpaceId,
  }: {
    columnId: string;
    workSpaceId: string;
    task: {
      content: string;
    };
  } = await req.json();

  try {
    const { _id } = await verifyToken(
      cookies().get(process.env.COOKIE_NAME as string)?.value || ""
    );

    if (!_id) throw new Error("Unauthorized User!");

    if (typeof task.content !== "string" || !task.content)
      throw new Error("Bad Request");

    if (!columnId) throw new Error("Column Field Is Missing!");

    if (!workSpaceId) throw new Error("Workspace Id is required!");

    await connectDb();

    const column = await Column.findOne({
      _id: columnId,
      workSpace: workSpaceId,
    });

    if (column) {
      column.tasks.push({ ...task, createdBy: _id }); // Directly push the task into the tasks array

      const newColumn = await column.save(); // Save the document with the new task
      return NextResponse.json({
        success: true,
        task: newColumn.tasks[newColumn.tasks.length - 1], // Access the last added task
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

export async function DELETE(req: NextRequest) {
  const { columnId, taskId, workSpaceId } = await req.json();

  try {
    const { _id } = await verifyToken(
      cookies().get(process.env.COOKIE_NAME as string)?.value || ""
    );

    if (!_id) throw new Error("UnAuthorize User!");
    if (!columnId) throw new Error("Column id is required!");
    if (!taskId) throw new Error("Task id is Required!");
    if (!workSpaceId) throw new Error("Workspace_Id is Required!");
    await connectDb();

    const workSpace = await WorkSpace.findById(workSpaceId);
    if (!workSpace) throw new Error("UnAuthorize User!");

    const column = await Column.findOne({
      _id: columnId,
      workSpace: workSpaceId,
    });

    if (!column) throw new Error("Column not found with given id");

    const index = column.tasks.findIndex(
      (task: { id: any }) => task.id === taskId
    );
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
