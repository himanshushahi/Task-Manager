import React from "react";
import { FiAlertCircle } from "react-icons/fi";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}) => {
  return (
    <div
      className={`fixed inset-0 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } bg-gray-600 transition-opacity bg-opacity-50 overflow-y-auto h-full w-full flex items-center z-50 justify-center`}
    >
      <div
        className={`${
          isOpen ? "scale-100" : "scale-95"
        } transition-transform relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full m-4`}
      >
        <div className="mb-6 flex items-center">
          <FiAlertCircle className="text-purple-600 w-10 h-10 mr-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Action
          </h3>
        </div>
        <p className="mb-8 text-gray-600">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
