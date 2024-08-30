import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../utils/tokenManger";
import { cookies } from "next/headers";
import connectDb from "../../database/connectdb";
import Column from "../../database/schema/task";

export async function POST(req: NextRequest) {
  const {title, workSpaceId } = await req.json();

  try {
    const { _id } = await verifyToken(
      cookies().get(process.env.COOKIE_NAME as string)?.value || ""
    );

    if (!_id) throw new Error("UnAuthorize User!");

    if (!title || !workSpaceId) {
      throw new Error("Bad Request");
    }

    await connectDb();

    const column = await Column.create({
      title: title,
      task: [],
      createdBy: _id,
      workSpace: workSpaceId,
    });

    return NextResponse.json({
      success: true,
      column,
      message: "Column Created Successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function PUT(req: NextRequest) {
  const {
    sourceId,
    destinationId,
    sourceIndex,
    destinationIndex,
    isSameColumn,
    workSpaceId,
  } = await req.json();

  try {
    const token = cookies().get(process.env.COOKIE_NAME as string)?.value;

    if (!token) throw new Error("UnAuthorize User");

    const { _id } = await verifyToken(token);

    if (!_id) throw new Error("UnAuthorize User");

    await connectDb()
    // Find the source column
    const sourceColumn = await Column.findOne({
      _id: sourceId,
      workSpace: workSpaceId,
    });
    if (!sourceColumn) throw new Error("Source column not found");

    //if not same column;
    if (!isSameColumn) {
      // Find the destination column
      const destColumn = await Column.findOne({
        _id: destinationId,
        workSpace: workSpaceId,
      });
      if (!destColumn) throw new Error("Destination column not found");

      // Get the task to be moved
      const [movedTask] = sourceColumn.tasks.splice(sourceIndex, 1);

      // Insert the task in the destination column at the correct position
      destColumn.tasks.splice(destinationIndex, 0, movedTask);

      // Save the updated columns back to the database
      await sourceColumn.save();
      await destColumn.save();

      return NextResponse.json({
        message: "Tasks updated successfully",
        success: true,
      });
    } else {
      const [removed] = sourceColumn.tasks.splice(sourceIndex, 1);
      sourceColumn.tasks.splice(destinationIndex, 0, removed);
      await sourceColumn.save();

      return NextResponse.json({
        message: "Tasks updated successfully",
        success: true,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message, success: false });
  }
}
