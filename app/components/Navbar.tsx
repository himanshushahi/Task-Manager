"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

 function Navbar() {
  const [authenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const response = await fetch(
          `/api/authenticate`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();
        setIsAuthenticated(data.success);
      } catch (error: any) {
        setIsAuthenticated(false);
      }
    };
    authenticateUser();
  }, []);

  return (
    <nav className="bg-purple-500 text-white py-4 z-10 sticky top-0">
      <div className="lg:px-8 px-2 h-[7vh] flex justify-between items-center">
        <Image src={'/logo.jpeg'} width={200} height={200} className="rounded-full w-14 h-14" alt="logo"/>
        <div className="flex space-x-4 items-center">
          {!authenticated && (
              <Link
                href={"/login"}
                className="bg-white list-none transition-colors text-purple-500 font-semibold py-2 px-4 rounded hover:bg-gray-200 hover:text-purple-500"
              >
                Get Started
              </Link>
          )}
          {authenticated && (
              <Link
                href={"/dashboard/tasks"}
                className="bg-white list-none transition-colors text-purple-500 font-semibold py-2 px-4 rounded hover:bg-gray-200 hover:text-purple-500"
              >
                Dashboard
              </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
