"use client";
import {
  FaExternalLinkAlt,
  FaEnvelope,
  FaUsers,
} from "react-icons/fa";
import { FaFolder, FaTasks, FaChartLine, FaCheckCircle } from "react-icons/fa";
import { useGlobalState } from "../../store/store";
import CollaboratorForm from "./CollaboratorForm";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AddWorkSpaceModal from "../../components/AddWorkSpaceModal";

export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const { workSpaces, user } = useGlobalState(); // Assuming user information is available in global state

  const [completedTasksLength, setCompletedTasksLength] = useState<number>(0);
  const [allTaskLength, setAllTaskLength] = useState<number>(0);
  const [addMode, setAddMode] = useState<boolean>(false);

  const [collaborationWorkSpaces, setCollaborationWorkSpaces] = useState<
    { name: string; _id: string; members: string[]; taskLength: number }[]
  >([]);

  useEffect(() => {
    const getAllCollaboration = async () => {
      try {
        const response = await fetch("/api/collaboration_workspace", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setCollaborationWorkSpaces(data.workSpaces);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAllCollaboration();
  }, []);
  
  useEffect(() => {
    const getCompletedTasks = async () => {
      const response = await fetch("/api/task/task_stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
  
      setCompletedTasksLength(data.completedTaskLength);
      setAllTaskLength(data.allTaskLength);
    };
    getCompletedTasks();
  }, []);
  
  return (
    <div className="lg:p-6 p-4">
      <h1 className="text-2xl lg:text-start md:text-start text-center font-bold mb-6 text-teal-600">
        Overview
      </h1>
      {/* User Information */}
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 shadow-lg rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center">
          <div className="relative w-20 h-20 mb-4 sm:mb-0">
            <Image
              width={300}
              height={300}
              src={user?.avatar || "/dummy-avatar.jpeg"}
              alt="User Avatar"
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className="absolute bottom-0 right-0 bg-green-400 rounded-full w-5 h-5 border-2 border-white"></div>
          </div>
          <div className="sm:ml-6 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">
              {user?.name}
            </h2>
            <div className="flex items-center justify-center sm:justify-start text-teal-200">
              <FaEnvelope className="mr-2" />
              <p className="text-sm sm:text-base break-all">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Statistics */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white text-sm font-medium uppercase">
                Workspaces
              </p>
              <p className="text-white text-3xl font-bold mt-2">
                {workSpaces.length}
              </p>
            </div>
            <div className="bg-teal-300 bg-opacity-30 rounded-full p-3">
              <FaFolder className="text-white text-xl" />
            </div>
          </div>
          <div className="mt-4 text-teal-200 text-sm font-medium flex items-center">
            <FaChartLine className="mr-1" />
            <span>4% increase</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-400 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white text-sm font-medium uppercase">
                Total Tasks
              </p>
              <p className="text-white text-3xl font-bold mt-2">
                {allTaskLength}
              </p>
            </div>
            <div className="bg-teal-300 bg-opacity-30 rounded-full p-3">
              <FaTasks className="text-white text-xl" />
            </div>
          </div>
          <div className="mt-4 text-teal-200 text-sm font-medium flex items-center">
            <FaChartLine className="mr-1" />
            <span>12% increase</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-400 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white text-sm font-medium uppercase">
                Completed Tasks
              </p>
              <p className="text-white text-3xl font-bold mt-2">
                {completedTasksLength}
              </p>
            </div>
            <div className="bg-green-300 bg-opacity-30 rounded-full p-3">
              <FaCheckCircle className="text-white text-xl" />
            </div>
          </div>
          <div className="mt-4 text-green-200 text-sm font-medium flex items-center">
            <FaChartLine className="mr-1" />
            <span>8% increase</span>
          </div>
        </div>
      </div>
      {/* Workspaces List */}
      <div className="bg-white rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <FaFolder className="mr-3 text-teal-500" /> Your Workspaces
        </h2>
        <div className="flex flex-col gap-2">
          {workSpaces.map((workspace) => (
            <div key={workspace._id} className="bg-white border rounded-lg p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xl font-bold text-gray-800">
                  {workspace.name}
                </span>
                <Link
                  href={`/dashboard/workspace/${workspace._id}`}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-colors duration-200"
                >
                  Open <FaExternalLinkAlt className="ml-2" />
                </Link>
              </div>

              <div className="flex items-center text-gray-600 text-sm mb-3">
                <div className="flex items-center mr-6">
                  <FaUsers className="mr-2 text-teal-500" />
                  <span>{workspace?.members.length || 0} members</span>
                </div>
              </div>

              <div className="relative h-2 bg-gray-200 rounded-full">
                <div
                  className="absolute top-0 left-0 h-full bg-teal-600 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${
                      (completedTasksLength / allTaskLength) * 100 || 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setAddMode(true)}
          className="mt-6 w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300 ease-in-out flex items-center justify-center"
        >
          <FaFolder className="mr-2" /> Create New Workspace
        </button>
        <AddWorkSpaceModal isOpen={addMode} onClose={() => setAddMode(false)} />
      </div>

      {collaborationWorkSpaces.length > 0 && (
        <div className="bg-white rounded-xl lg:p-6 md:p-4 p-2 mb-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <FaUsers className="mr-3 text-teal-500" /> Your Collaborations
          </h1>
          <div className="flex flex-col gap-2">
            {collaborationWorkSpaces.map((workspace) => (
              <div
                key={workspace._id}
                className="bg-white border rounded-lg overflow-hidden"
              >
                <div className="p-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {workspace.name}
                    </h2>
                    <div className="flex flex-col text-gray-700 mb-4">
                      <div className="flex items-center">
                        <FaUsers className="mr-2 text-teal-500" />
                        <span>{workspace.members.length+1} members</span>
                      </div>
                      <div className="flex items-center">
                        <FaTasks className="mr-2 text-green-500" />
                        <span>{workspace.taskLength} tasks</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/workspace/${workspace._id}`}
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-colors duration-200"
                  >
                    Open
                    <FaExternalLinkAlt className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Collaborator Section */}
      <CollaboratorForm />
    </div>
  );
}
