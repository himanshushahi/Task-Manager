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

      <div className={`fixed inset-0 top-0 left-0 w-full flex items-center justify-center ${showModal?'':'pointer-events-none'}`}>
      <div
        className={`transition-opacity duration-300 ${
          showModal ? "opacity-100" : "opacity-0 pointer-events-none"
        } bg-white rounded-lg shadow-lg p-6 w-72 max-w-full`}
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
        <p className="text-sm overflow-auto text-gray-700 break-words">
          State: <pre>
          {JSON.stringify(state, null, 2)}
          </pre>
        </p>
      </div>
      </div>
    </>
  );
}

export default StoreModal;
