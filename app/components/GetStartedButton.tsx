'use client';
import React from 'react'
import Link from 'next/link'
import { useGlobalState } from '../store/store';

function GetStartedButton() {
    const { authenticated } = useGlobalState();

  return (
    <>
      {!authenticated ? (
        <Link
          href="/login"
          className="bg-white list-none transition-colors text-purple-500 font-semibold py-2 px-4 rounded hover:bg-gray-200 hover:text-purple-500"
        >
          Get Started
        </Link>
      ) : (
        <Link
          href="/dashboard/tasks"
          className="bg-white list-none transition-colors text-purple-500 font-semibold py-2 px-4 rounded hover:bg-gray-200 hover:text-purple-500"
        >
          Dashboard
        </Link>
      )}
    </>
  )
}

export default GetStartedButton