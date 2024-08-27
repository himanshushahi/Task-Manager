import React, { useState, ChangeEvent } from "react";
import { FaPlus } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

const AddColumnModal: React.FC<{onAdd:(value:string)=>void}> = ({onAdd}) => {
  const [columnAddMode, setColumnAddMode] = useState<boolean>(false);
  const [newColumnTitle, setNewColumnTitle] = useState<string>("");

  const addColumn = () => {
    // Add column logic here
    onAdd(newColumnTitle)
    setColumnAddMode(false);
    setNewColumnTitle("");
  };

  return (
    <>
      <button
        className="px-4 py-2 rounded-sm text-white w-full flex items-center justify-center text-sm bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 transition duration-200 ease-in-out"
        onClick={() => setColumnAddMode(true)}
      >
        <FaPlus className="mr-2" /> Add Column
      </button>

      <div className={`${columnAddMode?'opacity-100 pointer-events-auto':'opacity-0 pointer-events-none'} transition-opacity fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50`}>
        <div className={`${columnAddMode?'scale-100':'scale-95'} transition-transform p-6 bg-white rounded-xl shadow-lg max-w-md w-full mx-auto`}>
          <h2 className="text-xl font-bold font-[math] text-purple-600 text-center mb-6">
            Add Column
          </h2>
          <input
            type="text"
            name="column"
            className="w-full px-4 py-3 rounded-sm bg-gray-100 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition duration-200 ease-in-out"
            placeholder="Enter Column Title..."
            value={newColumnTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewColumnTitle(e.target.value)
            }
          />
          <div className="flex justify-end gap-4 mt-6">
            <button
              className="px-4 py-2 rounded-sm text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200 ease-in-out flex items-center"
              onClick={() => {
                setColumnAddMode(false);
                setNewColumnTitle("");
              }}
            >
              <MdCancel className="mr-2" /> Cancel
            </button>
            <button
              className="px-4 py-2 rounded-sm  text-white text-sm bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 transition duration-200 ease-in-out flex items-center"
              onClick={() => addColumn()}
            >
              <FaPlus className="mr-2" /> Add
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddColumnModal;
