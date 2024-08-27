import React from "react";
import WorkSpace from "../WorkSpace";
import { cookies } from "next/headers";

const getInitialColumn = async (
  workSpaceId: string,
  token: string | undefined
) => {
  try {
    const response = await fetch(
      `${process.env.ORIGIN_URL}/api/task/${workSpaceId}`,
      {
        credentials: "include",
        headers: { 'Authorization': "Bearear " + token },
      }
    );
    const data = await response.json();
    if (data.success) {
      return {columns:data.columns,name:data.name}
    }else{
      throw new Error(data.message)
    }
  } catch (error:any) {
    console.log(error.message)
    return {columns:[],name:""}
  }
};

type paramsType = {
  id: string;
};

async function Page({params}:{params:paramsType}) {
  const token = cookies().get(process.env.COOKIE_NAME as string)?.value;
  const {columns,name} = await getInitialColumn(params.id, token);
  return <WorkSpace name={name} workSpaceId={params.id} _columns={columns} />;
}

export default Page;
