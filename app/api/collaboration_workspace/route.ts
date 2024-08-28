import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../utils/tokenManger";
import { cookies, headers } from "next/headers";
import WorkSpace from "../../database/schema/workspace";
import Column from "../../database/schema/task";

export async function GET(req: NextRequest) {
  try {
    const { _id } = await verifyToken(
      cookies().get(process.env.COOKIE_NAME as string)?.value ||
        headers().get("Authorization")?.split("Bearear ")[1] ||
        ""
    );

    if (!_id) throw new Error("UnAuthorize User!");
    let workSpaces = await WorkSpace.find({ members: _id });

    if (workSpaces.length > 0) {
      workSpaces = await Promise.all(
        workSpaces.map(async (workSpace) => {
          // Find columns related to the workspace
          const columns = await Column.find({ workspace: workSpace._id });

          // Collect tasks created by the specified user
          const allTasks = columns.flatMap((column) =>
            column.tasks.filter(
              (task:any) => task.createdBy.toString() === _id.toString()
            )
          );

          // Add taskLength property to the workspace object
          return {
            ...workSpace.toObject(), // Convert Mongoose document to plain JS object
            taskLength: allTasks.length,
          };
        })
      );
    }

    return NextResponse.json({ success: true, workSpaces });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
