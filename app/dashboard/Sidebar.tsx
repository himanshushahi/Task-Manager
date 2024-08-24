"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaList, FaCalendarAlt, FaChartPie } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { SlLogout } from "react-icons/sl";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isLoading,setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const logoutHanler = async()=>{
    try {
      setIsLoading(true);

      const response = await fetch('/api/logout');
      const data = await response.json();
      if(data.success){
        router.push('/')
        toast.success(data.message)
      }else{
        throw new Error(data.message)
      }
    } catch (error:any) {
      toast.error(error.message)
    }
  }

  return (
    <div
      className={`flex ${
        sidebarOpen ? "w-64" : "w-20"
      } transition-all duration-300 bg-gray-800 min-h-screen`}
    >
      <div className="flex flex-col h-full w-full">
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="text-white p-4 flex items-center gap-4 focus:outline-none"
        >
          <MdDashboard size={24} /> Dashboard
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
        <button disabled={isLoading} onClick={logoutHanler} className="flex items-center gap-4 p-4 text-white hover:bg-gray-700 transition-colors duration-300">{isLoading?<Spinner/>:<><SlLogout size={20}/> Logout</>} </button>
      </div>
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
      {open && <span className="text-base">{children}</span>}
    </Link>
  );
}

export default Sidebar;
