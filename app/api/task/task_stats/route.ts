import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../utils/tokenManger";
import connectDb from "../../../database/connectdb";
import Column from "../../../database/schema/task";

export async function GET(req: NextRequest) {
  try {
    const { _id } = await verifyToken(
      cookies().get(process.env.COOKIE_NAME as string)?.value ||
        headers().get("Authorization")?.split("Bearear ")[1] ||
        ""
    );

    if (!_id) throw new Error("UnAuthorize User!");
    await connectDb();

    const columns = await Column.find({
      createdBy: _id,
    });

    const completedTaskLength = columns
      .filter((column) => column.id === "completed")
      .reduce((acc, column) => {
        return (
          acc +
          //@ts-ignore
          column.tasks.reduce((taskAcc, task) => {
            return taskAcc + 1; // Or add a condition if you only want to count completed tasks
          }, 0)
        );
      }, 0);

    const allTaskLength = columns.reduce((acc, column) => {
      return acc + column.tasks.length;
    },0);

    return NextResponse.json({
      success: true,
      completedTaskLength,
      allTaskLength
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
