import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { useGlobalDispatch } from "../store/store";
import { useRouter } from "next/navigation";
import Spinner from "./Spinner";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddWorkSpaceModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");

  const dispatch = useGlobalDispatch();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddingWorkSpace = async () => {
    try {
      if (!name) {
        setError("Name is Required!");
        return;
      }
      setIsLoading(true);
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
        setName("");
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
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
        } transition-transform p-6 bg-white rounded-xl shadow-lg max-w-md w-[95%] mx-auto`}
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
          {setName(e.target.value);setError('')}
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
            disabled={isLoading}
            className="px-4 py-2 rounded-sm text-white text-sm bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 transition duration-200 ease-in-out flex items-center"
            onClick={handleAddingWorkSpace}
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                <FaPlus className="mr-2" /> Add
              </>
            )}
          </button>
        </div>
        {error&&<p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default AddWorkSpaceModal;
