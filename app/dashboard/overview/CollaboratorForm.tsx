"use client";

import Image from "next/image";
import React, { useState, useCallback } from "react";
import { FaUserPlus, FaTimes, FaSearch } from "react-icons/fa";
import { useGlobalDispatch, useGlobalState } from "../../store/store";
import toast from "react-hot-toast";

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
    [searchUsers,selectedUsers]
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
    [selectedUsers, selectedWorkspace,dispatch]
  );

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
        <FaUserPlus className="mr-3 text-purple-600" /> Add Collaborators
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex lg:flew-row md:flex-row flex-col justify-between items-start gap-4"
      >
        <div className="flex flex-col w-full sm:w-1/4">
          <label
            htmlFor="workspace"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Select Workspace
          </label>
          <select
            id="workspace"
            value={selectedWorkspace}
            onChange={(e) => {
              setError("");
              setSelectedWorkspace(e.target.value);
            }}
            className="w-full p-3 border-b border-gray-300 focus:border-purple-600 focus:outline-none transition duration-300"
          >
            <option value="">Select a workspace</option>
            {workSpaces.map((workspace) => (
              <option key={workspace._id} value={workspace._id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col relative w-full sm:w-1/3">
          <div className="relative">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Search User
            </label>
            <input
              type="email"
              id="email"
              value={searchEmail}
              onChange={handleSearch}
              placeholder="Search collaborators by email"
              className="w-full p-3 pr-10 border-b border-gray-300 focus:border-purple-600 focus:outline-none transition duration-300"
            />
            <FaSearch className="absolute right-3 top-[calc(40%+12px)] text-gray-400" />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white shadow-sm absolute w-full left-0 -top-full rounded-md overflow-hidden">
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
                      width={300}
                      height={300}
                      className="w-10 h-10 rounded-full"
                    />{" "}
                    {user.name} ({user.email})
                  </span>
                  <FaUserPlus className="text-purple-600" />
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 w-full mt-2">
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    <span>{user.name}</span>
                    <FaTimes
                      className="ml-2 cursor-pointer"
                      onClick={() => removeUser(user._id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center h-full justify-center">
          <button
            type="submit"
            className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition duration-300 flex items-center justify-center"
          >
            <FaUserPlus className="mr-2" />
            Add Collaborators
          </button>
        </div>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CollaboratorForm;
