"use client";
import Image from "next/image";
import React from "react";
import GetStartedButton from "./GetStartedButton";
import Link from "next/link";

function Navbar() {
  return (
    <nav className="bg-purple-500 text-white py-4 z-10 sticky top-0">
      <div className="lg:px-8 px-2 h-[7vh] flex justify-between items-center">
        <Link href={"/"}>
          <Image
            src={"/logo.jpeg"}
            width={200}
            height={200}
            className="rounded-full w-14 h-14"
            alt="logo"
          />
        </Link>
        <div className="flex space-x-4 items-center">
          <GetStartedButton />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
