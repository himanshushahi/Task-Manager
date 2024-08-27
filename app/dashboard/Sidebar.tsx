"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { ChangeEvent, memo, SetStateAction, useState } from "react";
import { FaListUl, FaPlus, FaTrash } from "react-icons/fa";
import { MdCancel, MdDashboard, MdSpaceDashboard } from "react-icons/md";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import { useGlobalDispatch, useGlobalState } from "../store/store";
import { RiLogoutBoxLine } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import ConfirmationModal from "../components/ConfirmationModal";
import { IoStatsChart } from "react-icons/io5";
import AddWorkSpaceModal from "../components/AddWorkSpaceModal";

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
        dispatch({ type: "RESET_STATE" });
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

  const [addMode, setAddMode] = useState<boolean>(false);

  

  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    action: async () => {},
  });

  const deleteWorkSpace = async (id: string) => {
    try {
      const response = await fetch("/api/workspace", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        dispatch({ type: "DELETE_WORKSPACE", payload: id });
        if (pathname === `/dashboard/workspace/${id}`) {
          router.push("/dashboard/overview");
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }finally{
      setConfirmation({isOpen:false,action:async()=>{}})
    }
  };

  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
        <div
          className={`fixed ${sidebarOpen?'opacity-100 pointer-events-auto':'opacity-0 pointer-events-auto'} transition-opacity inset-0 bg-black bg-opacity-50 z-40 lg:hidden`}
          onClick={() => setSidebarOpen(false)}
        ></div>

      {/* Sidebar */}
      <aside
        onMouseOver={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className={`fixed top-0 left-0 lg:z-[2] md:z-[2] z-50 flex flex-col lg:h-auto h-full bg-gray-800 transition-all duration-300 ease-in-out 
          ${sidebarOpen ? "w-64" : "w-14"} 
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-4 flex items-center justify-start w-full focus:outline-none"
        >
          <span className="text-xl">
            <MdSpaceDashboard size={24} />
          </span>
          <span
            className={`ml-4 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ${
              sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            Dashboard
          </span>
        </button>

        <Link
          href="/dashboard/overview"
          className={`group mb-2 rounded-lg overflow-hidden  transition-all duration-300  ${
            pathname === "/dashboard/overview" ? "bg-purple-600" : ""
          }`}
        >
          <div className="flex items-center w-full p-4 text-white group-hover:bg-purple-600 transition-colors duration-300">
            <span className="text-xl">
              <IoStatsChart />
            </span>
            <span
              className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
            >
              Overview
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav>
          <NavLink
            icon={<FaListUl size={22} />}
            open={sidebarOpen}
            addMode={addMode}
            setAddMode={setAddMode}
            onDelete={(value) => {
              setConfirmation({
                isOpen: true,
                action: async () => {
                  await deleteWorkSpace(value);
                },
              });
            }}
          >
            Tasks
          </NavLink>
          {/* Add more NavLinks here */}
        </nav>

        {/* Logout Button */}
        <button
          disabled={isLoading}
          onClick={logoutHandler}
          className="flex items-center gap-4 p-4 hover:bg-purple-600 rounded-lg transition-colors duration-300 text-white"
        >
          {isLoading ? (
            <button className="flex w-full justify-center items-center"><Spinner /></button>
          ) : (
            <>
              <span className="text-xl">
                <RiLogoutBoxLine size={24} />
              </span>
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
      </aside>
      <AddWorkSpaceModal
        isOpen={addMode}
        onClose={() => setAddMode(false)}
      />
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          confirmation.action();
          setConfirmation((prev) => ({ ...prev, isOpen: false }));
        }}
        message={"Are Sure Want To Delete?"}
      />
      {/* Toggle button for mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-4 right-4 z-50 p-2 bg-gray-800 text-white rounded-full lg:hidden"
      >
        <MdDashboard size={24} />
      </button>
    </>
  );
}

interface NavLinkProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  addMode: boolean;
  setAddMode: (value: SetStateAction<boolean>) => void;
  onDelete: (value: string) => void;
}

const NavLink = memo(function ({
  icon,
  children,
  open,
  addMode,
  setAddMode,
  onDelete,
}: NavLinkProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { workSpaces } = useGlobalState();

  return (
    <div className="mb-2 group rounded-lg overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full ${
          isOpen ? "bg-purple-600" : ""
        } flex items-center justify-between p-4 group-hover:bg-purple-600 transition-colors duration-300 text-white`}
      >
        <div className="flex items-center w-full gap-4">
          <span className="text-xl">{icon}</span>
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
              open ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            {children}
          </span>
        </div>
        <IoIosArrowDown
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          } ${!open && "hidden"}`}
        />
      </button>
      <div
        className={`bg-white w-full overflow-hidden duration-300 transition-all ${
          open && isOpen ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        {workSpaces.map((item, index) => (
          <Link
            key={item._id}
            href={`/dashboard/workspace/${item._id}`}
            className="flex items-center justify-between text-sm py-3 px-6 text-gray-700 hover:bg-purple-50 transition-colors duration-200"
          >
            <span className="font-medium">{item.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onDelete(item._id);
              }}
              className="text-red-500 hover:text-red-600 transition-colors duration-200"
            >
              <FaTrash />
            </button>
          </Link>
        ))}
        {!addMode && (
          <button
            onClick={() => setAddMode(true)}
            className="py-3 px-6 text-purple-600 text-sm font-medium hover:bg-purple-50 flex items-center w-full gap-2 transition-colors duration-200"
          >
            <FaPlus /> Add WorkSpace
          </button>
        )}
      </div>
    </div>
  );
});

NavLink.displayName = 'NavLink'

export default Sidebar;
