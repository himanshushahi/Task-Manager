"use client";
import React, {useRef, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { FaEdit, FaEllipsisV, FaPlus, FaTrash } from "react-icons/fa";
import RichTextEditor from "../../components/RichTextEditor";
import { MdCancel } from "react-icons/md";
import { BiTrashAlt } from "react-icons/bi";
import toast from "react-hot-toast";
import Spinner from "../../components/Spinner";
import ConfirmationModal from "../../components/ConfirmationModal";
import AddColumnModal from "../../components/AddColumnModal";
import WorkSpaceMembers from "../../components/WorkSpaceMembers";
import { useGlobalState } from "../../store/store";

interface Task {
  _id: string;
  content: string;
  createdBy: string;
}

interface Column {
  _id: string;
  title: string;
  tasks: Task[];
}

interface workSpaceTypes {
  workSpaceId: string;
  name: string;
  _columns: Column[];
}

const WorkSpace = ({ workSpaceId, name, _columns }: workSpaceTypes) => {
  const { user } = useGlobalState();
  const [columns, setColumns] = useState<Column[]>(_columns || []);
  const [text, setText] = useState<string>("");
  const [addMode, setAddMode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    action: async () => {},
  });

  const editorRef = useRef<any | null>(null);

  const handleReset = () => {
    editorRef.current?.resetContent();
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns.find(
        (column) => column._id === source.droppableId
      );
      if (!sourceColumn) return;
      const destColumn = columns.find(
        (column) => column._id === destination.droppableId
      );
      if (!destColumn) return;

      const sourceItems = [...sourceColumn.tasks];
      const destItems = [...destColumn.tasks];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns((prevColumns) =>
        prevColumns.map((column) => {
          if (column._id === source.droppableId) {
            return { ...column, tasks: sourceItems };
          } else if (column._id === destination.droppableId) {
            return { ...column, tasks: destItems };
          } else {
            return column;
          }
        })
      );
    } else {
      const sourceColumn = columns.find(
        (column) => column._id === source.droppableId
      );
      if (!sourceColumn) return;

      const copiedItems = [...sourceColumn.tasks];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns((prevColumns) =>
        prevColumns.map((column) =>
          column._id === source.droppableId
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
          workSpaceId,
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
    if (!user) return;

    const newTask = {
      content: text,
    };

    try {
      setIsLoading(true);
      const response = await fetch("/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workSpaceId, columnId, task: newTask }),
      });
      const data: { success: string; task: Task; message: string } =
        await response.json();

      if (data.success) {
        toast.success(data.message);
        setColumns((prevColumns) =>
          prevColumns.map((column) =>
            column._id === columnId
              ? { ...column, tasks: [...column.tasks, data.task] }
              : column
          )
        );
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      handleReset();
    }
    setText("");
    setAddMode("");
  };

  const addColumn = async (newColumnTitle: string) => {
    if (newColumnTitle.trim() === "") return;
    const newColumnId = newColumnTitle.toLowerCase().replace(/\s+/g, "");
    const column = {
      title: newColumnTitle,
      tasks: [],
    };
    try {
      const response = await fetch("/api/column", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columnId: newColumnId,
          title: newColumnTitle,
          workSpaceId,
        }),
      });

      const data: { success: boolean; message: string; column: Column } =
        await response.json();

      if (data.success) {
        toast.success(data.message);
        setColumns((prev) => [...prev, data.column]);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteTask = async (columnId: string, taskId: string) => {
    if (!columnId || !taskId) return;
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column._id === columnId
          ? {
              ...column,
              tasks: column.tasks.filter((task) => task._id !== taskId),
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
        body: JSON.stringify({ columnId, taskId, workSpaceId }),
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
      prevColumns.filter((column) => column._id !== columnId)
    );

    try {
      const response = await fetch(`/api/column/${columnId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workSpaceId }),
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

  //   const nodes = Array.from(document.querySelectorAll(".codeblock")).map(
  //     (el) => el.firstChild as HTMLElement | null
  //   );

  //   nodes.forEach((node) => {
  //     if (node) {
  //       highlightJs.highlightElement(node);
  //     }
  //   });
  // };

  // useEffect(()=>{
  //   handleHighlight()
  // },[])

  const [menuOpen, setMenuOpen] = useState<string>("0");
  const menuRef = useRef<HTMLDivElement | null>(null);

  // useEffect(() => {
  //   const handleCloseMenu = (e: Event) => {
  //     if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
  //       setMenuOpen("0");
  //     }
  //   };
  //   window.addEventListener("click", handleCloseMenu);

  //   return () => {
  //     window.removeEventListener("click", handleCloseMenu);
  //   };
  // }, []);

  return (
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto">
      <div className="flex mb-6 ">
        <div className="flex justify-center flex-1 items-center">
          <h2
            id="header"
            className="lg:text-2xl text-xl text-purple-600 text-center "
          >
            {name}
          </h2>
        </div>
        <div className="mx-auto">
          <WorkSpaceMembers _id={workSpaceId} />
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-wrap -mx-2">
          {columns.map((column) => (
            <div
              key={column._id}
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4"
            >
              <div className="bg-white rounded shadow-md overflow-hidden">
                <div className="flex justify-between bg-purple-600 text-white p-3">
                  <h2 className="text-lg font-semibold ">{column.title}</h2>
                  <button
                    onClick={() => {
                      setConfirmation({
                        isOpen: true,
                        action: async () => {
                          await deleteColumn(column._id);
                        },
                      });
                    }}
                    className="hover:text-red-400 transition-colors"
                  >
                    <BiTrashAlt size={20} />
                  </button>
                </div>

                <Droppable droppableId={column._id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="p-3 min-h-[200px]"
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
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
                                className="mb-4 w-full"
                              ></span>

                              <div
                                ref={menuRef}
                                className="relative w-full flex justify-end"
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen((prev) =>
                                      prev === task._id ? "0" : task._id
                                    );
                                  }}
                                  className="text-gray-500 rounded flex items-center gap-2 border justify-center p-1"
                                >
                                  <FaEllipsisV />
                                </button>

                                <div
                                  className={`absolute top-full min-w-28 right-0 mt-1 bg-white border rounded shadow-md transition-all origin-top-right z-10 ${
                                    menuOpen === task._id
                                      ? "scale-100 opacity-100 pointer-events-auto"
                                      : "scale-95 opacity-0 pointer-events-none"
                                  }`}
                                >
                                  <button
                                    // onClick={handleEdit}
                                    className="text-purple-600 w-full flex items-center gap-2 p-2 hover:bg-gray-200"
                                  >
                                    <FaEdit /> Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      setConfirmation({
                                        isOpen: true,
                                        action: async () => {
                                          await deleteTask(
                                            column._id,
                                            task._id
                                          );
                                        },
                                      })
                                    }
                                    className="text-red-500 w-full flex items-center gap-2 p-2 hover:bg-gray-200"
                                  >
                                    <FaTrash /> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {addMode !== column._id && (
                        <button
                          onClick={() => setAddMode(column._id)}
                          className="w-full bg-purple-600 text-white p-2 hover:bg-purple-600 rounded transition duration-200 flex items-center justify-center"
                        >
                          <FaPlus className="mr-2" /> Add Task
                        </button>
                      )}

                      {/* modal */}
                      <div
                        className={`${
                          addMode === column._id
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                        } fixed inset-0 z-10 flex items-center justify-center transition-opacity duration-300 bg-black bg-opacity-50`}
                      >
                        <div
                          className={`bg-white w-full lg:w-1/2 md:w-1/2 py-6 px-6 rounded shadow-lg transform transition-transform duration-300 ${
                            addMode === column._id ? "scale-100" : "scale-95"
                          }`}
                        >
                          <RichTextEditor
                            onChange={(content) => setText(content)}
                            ref={editorRef}
                          />
                          <div className="flex justify-end gap-3 mt-4">
                            <button
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md shadow hover:bg-red-600 transition-colors"
                              onClick={() => {
                                setAddMode("");
                                handleReset();
                              }}
                            >
                              <MdCancel className="text-lg" /> Cancel
                            </button>
                            <button
                              disabled={isLoading}
                              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md shadow ${
                                isLoading
                                  ? "bg-purple-300"
                                  : "bg-purple-600 hover:bg-purple-700"
                              } transition-colors`}
                              onClick={() => addTask(column._id)}
                            >
                              {isLoading ? (
                                <Spinner />
                              ) : (
                                <>
                                  <FaPlus className="text-lg" /> Add
                                </>
                              )}
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
              {/* {!columnAddMode && (
                <button
                  onClick={() => setColumnAddMode(true)}
                  className="w-full gap-1 bg-purple-600 text-white p-2 hover:bg-purple-600 rounded transition duration-200 flex items-center justify-center"
                >
                  <FaPlus /> Add Column
                </button>
              )} */}
              <AddColumnModal onAdd={(value) => addColumn(value)} />
            </div>
          </div>
        </div>
      </DragDropContext>
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() =>
          setConfirmation({ isOpen: false, action: async () => {} })
        }
        onConfirm={async () => {
          await confirmation.action();
          setConfirmation({ isOpen: false, action: async () => {} });
        }}
        message={"Are You Confirm Want To Delete?"}
      />
    </div>
  );
};

export default WorkSpace;
