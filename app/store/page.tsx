"use client";
import React, { useState } from "react";
import { useGlobalState } from "./store";

function StoreModal() {
  const state = useGlobalState();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={() => setShowModal(true)}
      >
        See State
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[10000]">
          <div
            className={`transition-opacity duration-300 bg-white rounded-lg shadow-lg z-[200] p-6 w-1/2 max-h-[80vh] overflow-auto`}
          >
            <h1 className="flex items-center justify-between mb-4 text-xl font-semibold">
              Store Modal
              <button
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </h1>
            <p className="text-sm text-gray-700 break-words">
              State:{" "}
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(state, null, 2)}
              </pre>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default StoreModal;
