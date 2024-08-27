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

  const handleAddingWorkSpace = async (name: string) => {
    try {
      const response = await fetch("/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        dispatch({ type: "ADD_WORKSPACE", payload: data.workspace });
        router.push(`/dashboard/workspace/${data.workspace._id}`);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setConfirmation({ isOpen: false, action: async () => {} });
    }
  };

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
    }
  };

  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

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
            className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${
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
              className={`ml-4 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ${
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
            <Spinner />
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
      <Modal
        isOpen={addMode}
        onClose={() => setAddMode(false)}
        onAdd={function (name: string): void {
          handleAddingWorkSpace(name);
        }}
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
            className={`font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ${
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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState("");

  const handleAdd = () => {
    onAdd(name);
    setName("");
    onClose();
  };

  const handleCancel = () => {
    onClose();
    setName("");
  };

  return (
    <div
      className={`${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } transition-opacity fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50`}
    >
      <div
        className={`${
          isOpen ? "scale-100" : "scale-95"
        } transition-transform p-6 bg-white rounded-xl shadow-lg max-w-md w-full mx-auto`}
      >
        <h2 className="text-xl font-bold font-[math] text-purple-600 text-center mb-6">
          Add WorkSpace
        </h2>
        <input
          type="text"
          name="name"
          className="w-full px-4 py-3 rounded-sm bg-gray-100 border-transparent focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition duration-200 ease-in-out"
          placeholder="Enter Name..."
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="px-4 py-2 rounded-sm text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200 ease-in-out flex items-center"
            onClick={handleCancel}
          >
            <MdCancel className="mr-2" /> Cancel
          </button>
          <button
            className="px-4 py-2 rounded-sm  text-white text-sm bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 transition duration-200 ease-in-out flex items-center"
            onClick={handleAdd}
          >
            <FaPlus className="mr-2" /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
