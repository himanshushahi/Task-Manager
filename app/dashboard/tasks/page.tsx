"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { FaPlus, FaTrash } from "react-icons/fa";
import RichTextEditor from "../../components/RichTextEditor";
import { MdCancel } from "react-icons/md";
import highlightJs from "highlight.js";
import { BiTrashAlt } from "react-icons/bi";
import toast from "react-hot-toast";

interface Task {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [newColumnTitle, setNewColumnTitle] = useState<string>("");
  const [columnAddMode, setColumnAddMode] = useState<boolean>(false);

  const [text, setText] = useState<string>("");
  const [addMode, setAddMode] = useState<string>("");

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns.find(
        (column) => column.id === source.droppableId
      );
      if (!sourceColumn) return;
      const destColumn = columns.find(
        (column) => column.id === destination.droppableId
      );
      if (!destColumn) return;

      const sourceItems = [...sourceColumn.tasks];
      const destItems = [...destColumn.tasks];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns((prevColumns) =>
        prevColumns.map((column) => {
          if (column.id === source.droppableId) {
            return { ...column, tasks: sourceItems };
          } else if (column.id === destination.droppableId) {
            return { ...column, tasks: destItems };
          } else {
            return column;
          }
        })
      );
    } else {
      const sourceColumn = columns.find(
        (column) => column.id === source.droppableId
      );
      if (!sourceColumn) return;

      const copiedItems = [...sourceColumn.tasks];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns((prevColumns) =>
        prevColumns.map((column) =>
          column.id === source.droppableId
            ? { ...column, tasks: copiedItems }
            : column
        )
      );
    }

    try {
      const response = await fetch("/api/column", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: source.droppableId,
          destinationId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
          isSameColumn: source.droppableId === destination.droppableId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const addTask = async (columnId: string) => {
    const newTask: Task = { id: Date.now().toString(), content: text };
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === columnId
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      )
    );

    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: {},
        body: JSON.stringify({ columnId, task: newTask }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setText("");
    setAddMode("");
  };

  const addColumn = async () => {
    if (newColumnTitle.trim() === "") return;
    const newColumnId = newColumnTitle.toLowerCase().replace(/\s+/g, "");
    const column = {
      id: newColumnId,
      title: newColumnTitle,
      tasks: [],
    };
    setColumns((prev) => [...prev, column]);
    setNewColumnTitle("");
    setColumnAddMode(false);

    try {
      const response = await fetch("/api/column", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: newColumnId, title: newColumnTitle }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteTask = async (columnId: string, taskId: string) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== taskId),
            }
          : column
      )
    );

    try {
      const response = await fetch(`/api/task`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ columnId, taskId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteColumn = async (columnId: string) => {
    setColumns((prevColumns) =>
      prevColumns.filter((column) => column.id !== columnId)
    );

    try {
      const response = await fetch(`/api/column/${columnId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleHighlight = () => {
    document.querySelectorAll(".codeblock").forEach((el) => {
      const codeblock = el.querySelector("code");
      if (!codeblock) return;
      const content = codeblock.innerHTML;
      if (!content) return;
      const result = highlightJs.highlightAuto(content).value;
      codeblock.innerHTML = result;
    });
  };

  useEffect(() => {
    // Run once on mount
    handleHighlight();

    // Optional: Re-run on window resize if needed
    window.addEventListener("resize", handleHighlight);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleHighlight);
    };
  }, []);

  useEffect(() => {
    const getInitialColumn = async () => {
      const response = await fetch("/api/task", { credentials: "include" });
      const data = await response.json();
      if (data.success) {
        setColumns(data.column);
      }
    };
    getInitialColumn();
  }, []);

  return (
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-wrap -mx-2">
          {columns.map((column) => (
            <div
              key={column.id}
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4"
            >
              <div className="bg-white rounded shadow-md overflow-hidden">
                <div className="flex justify-between bg-purple-500 text-white p-3">
                  <h2 className="text-lg font-semibold ">{column.title}</h2>
                  <button
                    onClick={() => deleteColumn(column.id)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <BiTrashAlt size={20} />
                  </button>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="p-3 min-h-[200px]"
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-100 p-3 mb-2 rounded shadow-sm flex justify-center flex-col items-start"
                            >
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: task.content,
                                }}
                                className="mb-4"
                              ></span>
                              <button
                                onClick={() => deleteTask(column.id, task.id)}
                                className="text-white w-full rounded bg-red-500 flex items-center gap-2 border justify-center p-1 hover:bg-red-600"
                              >
                                Delete <FaTrash />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {addMode !== column.id && (
                        <button
                          onClick={() => setAddMode(column.id)}
                          className="w-full bg-purple-500 text-white p-2 hover:bg-purple-600 rounded transition duration-200 flex items-center justify-center"
                        >
                          <FaPlus className="mr-2" /> Add Task
                        </button>
                      )}

                      {/* modal */}
                      <div
                        className={`bg-black ${
                          addMode === column.id
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                        } fixed top-0 transition-all left-0 z-10 w-screen h-screen flex justify-center items-center bg-opacity-50`}
                      >
                        <div
                          className={`bg-white w-1/2 py-4 transition-transform rounded px-4 ${
                            addMode === column.id
                              ? "scale-100"
                              : "scale-95"
                          }`}
                        >
                          <h2 className="text-center text-2xl font-semibold text-purple-600">
                            Write
                          </h2>
                          <RichTextEditor
                            onChange={(content) => setText(content)}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              className="flex p-2 gap-1 bg-red-500 hover:bg-red-700 transition-colors hover:text-gray-100 items-center text-sm rounded-sm text-white"
                              onClick={() => setAddMode("")}
                            >
                              <MdCancel /> Cancel
                            </button>
                            <button
                              className="flex p-2 gap-1 bg-purple-500 hover:bg-purple-700 transition-colors hover:text-gray-100 items-center text-sm rounded-sm text-white"
                              onClick={() => addTask(column.id)}
                            >
                              <FaPlus /> Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4">
            <div className="bg-white rounded shadow-md overflow-hidden">
              {!columnAddMode && (
                <button
                  onClick={() => setColumnAddMode(true)}
                  className="w-full gap-1 bg-purple-500 text-white p-2 hover:bg-purple-600 rounded transition duration-200 flex items-center justify-center"
                >
                  <FaPlus /> Add Column
                </button>
              )}
              {columnAddMode && (
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <h2 className="text-xl font-serif text-purple-600 text-center font-semibold mb-4">
                    Add Column
                  </h2>
                  <input
                    type="text"
                    name="column"
                    className="outline-none border border-gray-300 rounded p-2 w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-300 transition duration-200"
                    placeholder="Enter Column Title..."
                    value={newColumnTitle}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewColumnTitle(e.target.value)
                    }
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      className="flex p-2 gap-2 bg-red-500 hover:bg-red-600 items-center rounded text-white transition duration-200"
                      onClick={() => {
                        setColumnAddMode(false);
                        setNewColumnTitle("");
                      }}
                    >
                      <MdCancel size={20} /> Cancel
                    </button>
                    <button
                      className="flex p-2 gap-2 bg-purple-500 hover:bg-purple-600 items-center rounded text-white transition duration-200"
                      onClick={() => addColumn()}
                    >
                      <FaPlus size={18} /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
