import React, { useCallback, useRef, useState } from "react";
import { useGlobalDispatch, useGlobalState, userType } from "../store/store";
import { FiX, FiSearch, FiUserPlus, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import toast from "react-hot-toast";
import Spinner from "./Spinner";
import { FaTimes, FaUserPlus } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";

function WorkSpaceMembers({ _id }: { _id: string }) {
  const { workSpaces } = useGlobalState();
  const filterdWorkSpace = workSpaces.find(
    (workSpace) => workSpace._id === _id
  );

  const [showModal, setShowModal] = useState<boolean>(false);

  if (!filterdWorkSpace) {
    return;
  }

  return (
    <div>
      <MembersModal
        workSpaceId={_id}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        workspaceMembers={filterdWorkSpace.members}
      />
      {filterdWorkSpace.members.length < 1 && (
        <button
          onClick={() => setShowModal((prev) => (prev ? false : true))}
          className="text-white lg:flex md:flex  hidden gap-1 items-center py-2 px-3 bg-teal-600 rounded"
        >
          <FiUserPlus /> Add Members
        </button>
      )}
      <button
        className="lg:hidden md:hidden flex items-center"
        onClick={() => setShowModal(true)}
      >
        <BsThreeDots size={20} />
      </button>
      <div
        className="cursor-pointer lg:flex md:flex hidden "
        onClick={() => setShowModal((prev) => (prev ? false : true))}
      >
        {filterdWorkSpace.members.length > 6
          ? filterdWorkSpace.members.slice(0, 6).map((user, index) => (
              <Image
                key={user._id} // Add a key to avoid React warnings
                src={user.avatar}
                alt={user._id}
                className="rounded-full w-10 h-10"
                style={{
                  zIndex: index + 1,
                  transform:
                    index !== 0 ? `translateX(-${index * 8}px)` : "none",
                }}
                width={300}
                height={300}
              />
            ))
          : filterdWorkSpace?.members.map((user, index) => (
              <Image
                key={user._id} // Add a key to avoid React warnings
                src={user.avatar}
                alt={user._id}
                className="rounded-full w-10 h-10"
                style={{
                  zIndex: index + 1,
                  transform:
                    index !== 0 ? `translateX(-${index * 8}px)` : "none",
                }}
                width={300}
                height={300}
              />
            ))}
      </div>
    </div>
  );
}

const MembersModal = ({
  isOpen,
  onClose,
  workspaceMembers,
  workSpaceId,
}: {
  isOpen: boolean;
  onClose: () => void;
  workspaceMembers: userType[];
  workSpaceId: string;
}) => {
  const dispatch = useGlobalDispatch();
  const { workSpaces } = useGlobalState();
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [searchResults, setSearchResults] = useState<userType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<userType[]>([]);
  const [error, setError] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const searchUsers = useCallback(
    async (email: string): Promise<userType[]> => {
      // Abort the previous request if it's still ongoing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new AbortController for the current request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch("/api/search_user?query=" + email, {
          signal: abortController.signal,
        });

        const { success, user } = await response.json();

        if (success) {
          return user as userType[];
        } else {
          throw new Error();
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Request aborted");
        }
        return [];
      }
    },
    []
  );

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setSearchEmail(email);
    if (email.length > 2) {
      const results = await searchUsers(email);
      setSearchResults(
        results.filter((result) => {
          const isUserSelected = selectedUsers.some(
            (user) => user._id === result._id
          );
          const isUserInWorkspace = workSpaces
            .find((workspace) => workspace._id === workSpaceId)
            ?.members.some((member) => member._id === result._id);

          // Return the result if the user is not selected and not in the workspace
          return !isUserSelected && !isUserInWorkspace;
        })
      );
    } else {
      setSearchResults([]);
    }
  };

  const addUser = useCallback(
    (user: userType) => {
      if (!selectedUsers.find((u) => u._id === user._id)) {
        setSelectedUsers((prev) => [...prev, user]);
      }
      setSearchEmail("");
      setSearchResults([]);
      setError("");
    },
    [selectedUsers]
  );

  const [isAddingMembers, setIsAddingMembers] = useState<boolean>(false);
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (!selectedUsers) {
          setError("Add atleat one user.");
          return;
        }

        if (!Array.isArray(selectedUsers)) {
          setError("Invalid selected users");
          return;
        }
        setIsAddingMembers(true);
        const response = await fetch("/api/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workSpaceId,
            users: selectedUsers.map((user) => user._id),
          }),
        });
        const data = await response.json();
        if (data.success) {
          toast.success("Workspace updated successfully");
          dispatch({
            type: "ADD_WOKSPACE_MEMBERS",
            payload: { id: workSpaceId, users: selectedUsers },
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setSelectedUsers([]);
        setIsAddingMembers(false);
      }
    },
    [selectedUsers, dispatch, workSpaceId]
  );

  const deleteSelected = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
  };

  const [removeLoading, setRemoveLoading] = useState<string>("");

  const onRemoveMember = async (userId: string) => {
    try {
      setRemoveLoading(userId);
      const response = await fetch(`/api/workspace/${workSpaceId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId: userId }),
      });
      const data = await response.json();
      if (data.success) {
        dispatch({
          type: "DELETE_WORKSPACE_MEMBERS",
          payload: { id: workSpaceId, userIds: [userId] },
        });
        toast.success(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setRemoveLoading("");
    }
  };

  return (
    <div
      className={`${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } transition-opacity fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 cursor-auto z-50`}
    >
      <div
        className={`bg-white ${
          isOpen ? "scale-100" : "scale-95"
        } transition-transform rounded-lg shadow-xl w-full max-w-md`}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-teal-600">
            Workspace Members
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchEmail}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:border-teal-500"
              />
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
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
                      <FaUserPlus className="text-teal-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full mt-2">
              {selectedUsers.length > 0 && (
                <div className="flex gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full flex items-center text-sm"
                    >
                      <span>{user.name}</span>
                      <FaTimes
                        className="ml-2 cursor-pointer"
                        onClick={() => deleteSelected(user._id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isAddingMembers}
            className="w-full bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isAddingMembers ? (
              <Spinner />
            ) : (
              <>
                <FiUserPlus className="mr-2" size={20} />
                Add Member
              </>
            )}
          </button>

          <div className="mt-6">
            <h3 className="text-lg text-teal-600 font-semibold mb-2">
              Current Members
            </h3>
            <div className="flex flex-col justify-center gap-2 items-starts ">
              {workspaceMembers.map((member) => (
                <li
                  key={member._id}
                  className="flex items-center bg-gray-100 p-2 rounded"
                >
                  <Image
                    src={member.avatar}
                    width={200}
                    height={200}
                    className="rounded-full w-10 h-10 mx-2"
                    alt={member._id}
                  />
                  <span className="flex-1">{member.name}</span>
                  <button
                    disabled={removeLoading === member._id}
                    onClick={() => onRemoveMember(member._id)}
                    className="text-red-500 mx-auto hover:text-red-700 focus:outline-none"
                  >
                    {removeLoading === member._id ? (
                      <Spinner />
                    ) : (
                      <FiTrash2 size={20} />
                    )}
                  </button>
                </li>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkSpaceMembers;
