"use client";

import Image from "next/image";
import React, { useState, useCallback } from "react";
import { FaUserPlus, FaTimes, FaSearch, FaUndo } from "react-icons/fa";
import { useGlobalDispatch, useGlobalState } from "../../store/store";
import toast from "react-hot-toast";
import { LiaUndoAltSolid } from "react-icons/lia";

interface User {
  _id: string;
  email: string;
  name: string;
  avatar: string;
}

interface Workspace {
  id: string;
  name: string;
}

const CollaboratorForm: React.FC = () => {
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const { workSpaces } = useGlobalState();
  const dispatch = useGlobalDispatch();
  // Mock function to search users - replace with actual API call
  const searchUsers = useCallback(async (email: string): Promise<User[]> => {
    try {
      const response = await fetch("/api/search_user?query=" + email);
      const { success, user } = await response.json();
      if (success) {
        return user as User[];
      } else {
        throw new Error();
      }
    } catch (error) {
      return [];
    }
  }, []);

  const handleSearch = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const email = e.target.value;
      setSearchEmail(email);
      if (email.length > 2) {
        const results = await searchUsers(email);
        setSearchResults(
          results.filter(
            (result) => !selectedUsers.some((user) => user._id === result._id)
          )
        );
      } else {
        setSearchResults([]);
      }
    },
    [searchUsers, selectedUsers]
  );

  const addUser = useCallback(
    (user: User) => {
      if (!selectedUsers.find((u) => u._id === user._id)) {
        setSelectedUsers((prev) => [...prev, user]);
      }
      setSearchEmail("");
      setSearchResults([]);
      setError("");
    },
    [selectedUsers]
  );

  const removeUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user._id !== userId));
  }, []);

  const [error, setError] = useState<string>("");
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (!selectedWorkspace) {
          setError("Please select a workspace");
          return;
        }
        if (!selectedUsers) {
          setError("Add atleat one user.");
          return;
        }

        if (!Array.isArray(selectedUsers)) {
          setError("Invalid selected users");
          return;
        }
        const response = await fetch("/api/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workSpaceId: selectedWorkspace,
            users: selectedUsers.map((user) => user._id),
          }),
        });
        const data = await response.json();
        if (data.success) {
          toast.success("Workspace updated successfully");
          dispatch({
            type: "ADD_WOKSPACE_MEMBERS",
            payload: { id: selectedWorkspace, users: selectedUsers },
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      }
      setSelectedUsers([]);
      setSelectedWorkspace("");
    },
    [selectedUsers, selectedWorkspace, dispatch]
  );

  return (
    <div className="bg-white rounded-lg lg:p-6 md:p-4 p-2">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
        <FaUserPlus className="mr-3 text-purple-600" /> Add Collaborators
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-lg p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Workspace Selection */}
          <div className="col-span-1">
            <label
              htmlFor="workspace"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Workspace
            </label>
            <div className="relative">
              <select
                id="workspace"
                value={selectedWorkspace}
                onChange={(e) => {
                  setError("");
                  setSelectedWorkspace(e.target.value);
                }}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                <option value="">Select a workspace</option>
                {workSpaces.map((workspace) => (
                  <option key={workspace._id} value={workspace._id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Search */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search User
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={searchEmail}
                onChange={handleSearch}
                placeholder="Search collaborators by email"
                className="block border w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white shadow-sm rounded-md overflow-hidden absolute z-10 w-full max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    onClick={() => addUser(user)}
                  >
                    <span className="flex items-center gap-2">
                      <Image
                        src={user.avatar}
                        alt={user._id}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm">
                        {user.name} ({user.email})
                      </span>
                    </span>
                    <FaUserPlus className="text-purple-600" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="col-span-1 flex gap-2 lg:items-end md:items-end items-center">
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-300 flex items-center justify-center"
            >
              <FaUserPlus className="mr-2" />
              Add
            </button>
            <button
              type="button"
              onClick={()=>{setSelectedUsers([]);setSelectedWorkspace('')}}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none transition duration-300 flex items-center justify-center"
            >
              <FaUndo className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Users
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center text-sm"
                >
                  <span>{user.name}</span>
                  <button
                    type="button"
                    onClick={() => removeUser(user._id)}
                    className="ml-2 focus:outline-none"
                  >
                    <FaTimes className="text-purple-600 hover:text-purple-800" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CollaboratorForm;
