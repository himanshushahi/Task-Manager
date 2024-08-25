"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FaList, FaCalendarAlt, FaChartPie } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import { useGlobalDispatch } from "../store/store";
import { RiLogoutBoxLine } from "react-icons/ri";

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useGlobalDispatch();

  const logoutHandler = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/logout");
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        dispatch({ type: "SET_AUTHENTICATE", payload: false });
        router.push("/");
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen  bg-gray-800 transition-all duration-300 ease-in-out ${
        sidebarOpen ? "w-56 lg:static md:static absolute" : "w-16"
      }`}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="text-white p-4 flex items-center gap-4 focus:outline-none"
      >
        <MdDashboard size={24} />
        <span
          className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
            sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
          }`}
        >
          Dashboard
        </span>
      </button>

      {/* Nav Links */}
      <NavLink
        icon={<FaList size={20} />}
        to="/dashboard/tasks"
        open={sidebarOpen}
      >
        Tasks
      </NavLink>
      <NavLink
        icon={<FaCalendarAlt size={20} />}
        to="/dashboard/calendar"
        open={sidebarOpen}
      >
        Calendar
      </NavLink>
      <NavLink
        icon={<FaChartPie size={20} />}
        to="/dashboard/analytics"
        open={sidebarOpen}
      >
        Analytics
      </NavLink>

      {/* Logout Button */}
      <button
        disabled={isLoading}
        onClick={logoutHandler}
        className="flex items-center gap-4 p-4 text-white hover:bg-gray-700 transition-colors duration-300"
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <RiLogoutBoxLine size={23} />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
            >
              Logout
            </span>
          </>
        )}
      </button>
    </div>
  );
}

interface NavLinkProps {
  icon: React.ReactNode;
  to: string;
  children: React.ReactNode;
  open: boolean;
}

function NavLink({ icon, to, children, open }: NavLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={to}
      className={`flex items-center gap-4 p-4 text-white hover:bg-gray-700 transition-colors duration-300 ${
        pathname === to ? "bg-gray-700" : ""
      }`}
    >
      {icon}
      <span
        className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
          open ? "opacity-100 w-auto" : "opacity-0 w-0"
        }`}
      >
        {children}
      </span>
    </Link>
  );
}

export default Sidebar;
