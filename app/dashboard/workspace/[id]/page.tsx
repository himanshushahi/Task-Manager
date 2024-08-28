import React, { Suspense } from "react";
import WorkSpace from "../WorkSpace";
import { cookies } from "next/headers";
import Spinner from "../../../components/Spinner";

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
    console.log(error)
    return {columns:[],name:""}
  }
};

type paramsType = {
  id: string;
};

async function Page({params}:{params:paramsType}) {
  const token = cookies().get(process.env.COOKIE_NAME as string)?.value;
  const {columns,name} = await getInitialColumn(params.id, token);
  return <Suspense fallback={<div className="h-screen flex items-center w-full justify-center bg-gray-100"><Spinner/></div>}><WorkSpace name={name} workSpaceId={params.id} _columns={columns} /></Suspense>;
}

export default Page;
