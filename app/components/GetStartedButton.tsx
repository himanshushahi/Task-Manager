"use client";
import React from "react";
import Link from "next/link";
import { useGlobalState } from "../store/store";

function GetStartedButton() {
  const { user } = useGlobalState();
  return (
    <>
      {!user ? (
        <Link
          href="/login"
          className="bg-white list-none transition-colors text-teal-600 font-semibold py-2 px-4 rounded hover:bg-gray-200 hover:text-teal-600"
        >
          Get Started
        </Link>
      ) : (
        <Link
          href={`/dashboard/overview`}
          className="bg-white list-none transition-colors text-teal-600 font-semibold py-2 px-4 rounded hover:bg-gray-200 hover:text-teal-600"
        >
          Dashboard
        </Link>
      )}
    </>
  );
}

export default GetStartedButton;
