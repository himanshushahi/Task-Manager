"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  MutableRefObject,
  useState,
} from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { FaEdit, FaEllipsisV, FaPlus, FaSave, FaTrash } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { BiTrashAlt } from "react-icons/bi";
import toast from "react-hot-toast";
import Spinner from "../../../components/Spinner";
import ConfirmationModal from "../../../components/ConfirmationModal";
import AddColumnModal from "../../../components/AddColumnModal";
import WorkSpaceMembers from "../../../components/WorkSpaceMembers";
import {
  Column,
  Task,
  useGlobalDispatch,
  useGlobalState,
} from "../../../store/store";
import { socket } from "../../../../socket";
import useSocketListner from "../../../Hooks/useSocketListner";
import WorkSpaceSkeleton from "../../../components/WorkSpaceSkeleton";
import { Editor } from "@tiptap/react";
import RichTextEditor from "../../../components/RichTextEditor";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface paramsType {
  params: {
    id: string;
  };
}

interface textType {
  [columnId: string]: string;
}

interface EditorRefs {
  [columnId: string]: Editor | null;
}
const WorkSpace = ({ params }: paramsType) => {
  const workSpaceId = params.id;
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const { user, activeWorkSpaceColumn: columns, workSpaces } = useGlobalState();
  const dispach = useGlobalDispatch();
  const [text, setText] = useState<textType>({});
  const [addMode, setAddMode] = useState<string>("");
  const [editMode, setEditMode] = useState<{
    columnId: string | null;
    taskId: string | null;
  }>({ columnId: null, taskId: null });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    action: async () => {},
  });
  const [name, setName] = useState("");
  useEffect(() => {
    const getInitialColumn = async () => {
      try {
        const response = await fetch(`/api/task/${workSpaceId}`, {
          credentials: "include",
        });
        const data: {
          success: boolean;
          name: string;
          columns: Column[];
          message?: string;
        } = await response.json();
        if (data.success) {
          dispach({
            type: "SET_ACTIVE_WORKSPACE_COLUMN",
            payload: { columns: data.columns },
          });
          setName(data.name);
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        console.log(error);
        router.push("/");
      } finally {
        setIsPageLoading(false);
      }
    };
    getInitialColumn();
  }, [setIsPageLoading, dispach, workSpaceId, router]);

  useSocketListner();

  const joinRoom = useCallback(() => {
    if (socket.connected) {
      console.log(`Attempting to join room: ${workSpaceId}`);
      socket.emit("join-room", workSpaceId);
    }
  }, [workSpaceId]);

  useEffect(() => {
    joinRoom();
  }, [joinRoom]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    dispach({ type: "UPDATE_TASK_POSITION", payload: { source, destination } });

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
        socket.emit("task-position-update", {
          roomId: workSpaceId,
          source,
          destination,
        });
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
      content: text[addMode],
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
        dispach({
          type: "CREATE_TASK",
          payload: { columnId, task: data.task },
        });
        socket.emit("create-task", {
          roomId: workSpaceId,
          task: data.task,
          columnId,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      setText((prev) => ({ ...prev, [columnId]: "" }));
      setAddMode("");
      editorRefs.current[columnId]?.commands.setContent("");
    }
  };

  const updateTask = async (columnId: string | null, taskId: string | null) => {
    if (!columnId || !taskId) {
      toast.error("Bad Request!");
      return;
    }

    const newTask = {
      content: text[columnId],
    };

    try {
      setIsLoading(true);
      const response = await fetch("/api/task", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workSpaceId, columnId, taskId, task: newTask }),
      });
      const data: { success: string; task: Task; message: string } =
        await response.json();

      if (data.success) {
        toast.success(data.message);
        dispach({
          type: "UPDATE_TASK",
          payload: { columnId, task: data.task },
        });
        socket.emit("update-task", {
          roomId: workSpaceId,
          task: data.task,
          columnId,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      setText((prev) => ({ ...prev, [columnId]: "" }));
      setEditMode({ columnId: null, taskId: null });
      editorRefs.current[columnId]?.commands.setContent("");
    }
  };

  const addColumn = async (newColumnTitle: string) => {
    if (newColumnTitle.trim() === "") return;
    const newColumnId = newColumnTitle.toLowerCase().replace(/\s+/g, "");
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
        if (socket.connected) {
          socket.emit("new-column", {
            roomId: workSpaceId,
            column: data.column,
          });
        }
        dispach({ type: "ADD_COLUMN", payload: data.column });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteTask = async (columnId: string, taskId: string) => {
    if (!columnId || !taskId) return;
    dispach({ type: "DELETE_TASK", payload: { columnId, taskId } });

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
        socket.emit("delete-task", {
          roomId: workSpaceId,
          columnId,
          taskId,
        });
        toast.success(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteColumn = async (columnId: string) => {
    dispach({
      type: "DELETE_COLUMN",
      payload: {
        id: columnId,
      },
    });

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
        if (socket.connected) {
          socket.emit("delete-column", {
            roomId: workSpaceId,
            columnId,
          });
        }
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

  const handleClose = (columnId: string) => {
    setAddMode("");
    setEditMode({ columnId: null, taskId: null });
    setText((prev) => ({
      ...prev,
      [columnId]: "",
    }));
    editorRefs.current[columnId]?.commands.clearContent();
  };

  const [menuOpen, setMenuOpen] = useState<string>("0");

  const editorRefs: MutableRefObject<EditorRefs> = useRef({});
  const [columnUpdating, setColumUpdating] = useState<string>("0");

  const handleUpdateColumnTitle = async (
    columnTitle: string,
    columnId: string,
    oldColumnTitle: string
  ) => {
    if (columnTitle === oldColumnTitle) return;
    try {
      setColumUpdating(columnId);
      const res = await fetch(`/api/column/${columnId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workSpaceId, columnTitle }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        dispach({
          type: "UPDATE_COLUMN_TITLE",
          payload: { id: columnId, title: columnTitle },
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setColumUpdating("0");
    }
  };

  if (isPageLoading) {
    return <WorkSpaceSkeleton />;
  }

  return (
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto">
      <div className="flex mb-6 ">
        <div className="flex justify-center flex-1 items-center">
          <h2
            id="header"
            className="lg:text-2xl text-xl text-teal-600 text-center "
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
          {columns?.map((column) => (
            <div
              key={column._id}
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-6"
            >
              <div className="bg-gradient-to-r from-teal-500 to-indigo-500 rounded-lg shadow-lg overflow-hidden">
                <div className="flex justify-between bg-opacity-75 bg-teal-700 text-white p-4 rounded-t-lg">
                  <h2
                    className="text-lg font-semibold select-none  "
                    aria-disabled={column._id === columnUpdating}
                    onBlur={(e) => {
                      handleUpdateColumnTitle(
                        e.target.innerText,
                        column._id,
                        column.title
                      );
                    }}
                    onDoubleClick={(e) =>
                      (e.currentTarget.contentEditable = "true")
                    }
                  >
                    {column.title}
                  </h2>
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
                      className="p-4 min-h-[250px] bg-white rounded-b-lg"
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
                              className="bg-gray-100 p-4 mb-3 rounded-lg shadow-md hover:shadow-lg transition-shadow flex justify-between items-start"
                            >
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: task.content,
                                }}
                                className="w-full"
                              ></span>

                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen((prev) =>
                                      prev === task._id ? "0" : task._id
                                    );
                                  }}
                                  className="text-gray-500 rounded p-2 hover:bg-gray-200 transition-colors"
                                >
                                  <FaEllipsisV />
                                </button>

                                <div
                                  className={`absolute top-full min-w-28 right-0 mt-2 bg-white border rounded-lg shadow-lg transition-all origin-top-right z-20 ${
                                    menuOpen === task._id
                                      ? "scale-100 opacity-100 pointer-events-auto"
                                      : "scale-95 opacity-0 pointer-events-none"
                                  }`}
                                >
                                  <button
                                    onClick={() => {
                                      setEditMode((prev) => ({
                                        ...prev,
                                        columnId: column._id,
                                        taskId: task._id,
                                      }));
                                      setText((prev) => ({
                                        ...prev,
                                        [column._id]: task.content,
                                      }));
                                      editorRefs.current[
                                        column._id
                                      ]?.commands.setContent(task.content);
                                    }}
                                    className="text-teal-600 w-full flex items-center gap-2 p-3 hover:bg-gray-100 rounded-t-lg"
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
                                    className="text-red-500 w-full flex items-center gap-2 p-3 hover:bg-gray-100 rounded-b-lg"
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
                          className="w-full bg-teal-600 text-white p-3 mt-3 hover:bg-teal-700 rounded-lg transition duration-200 flex items-center justify-center"
                        >
                          <FaPlus className="mr-2" /> Add Task
                        </button>
                      )}

                      {/* modal */}
                      <div
                        className={`${
                          addMode === column._id ||
                          editMode.columnId === column._id
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                        }  fixed inset-0 z-30 flex items-center justify-center transition-opacity duration-3000`}
                      >
                        <div
                          className="absolute inset-0 bg-black bg-opacity-50"
                          onClick={() => handleClose(column._id)}
                        />
                        <div
                          className={`relative bg-white lg:max-w-2xl md:w-[70%] w-[95%] mx-2 lg:p-6 md:p-4 p-2 rounded-lg shadow-xl transform transition-all duration-300 ${
                            addMode === column._id ||
                            editMode.columnId === column._id
                              ? "scale-100"
                              : "scale-95"
                          }`}
                        >
                          <RichTextEditor
                            ref={(el: Editor | null) => {
                              editorRefs.current[column._id] = el;
                            }}
                            onChange={(value: string) =>
                              setText((prev) => ({
                                ...prev,
                                [column._id]: value,
                              }))
                            }
                          />
                          <div className="flex justify-end gap-4 mt-6">
                            <button
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition-colors"
                              onClick={() => handleClose(column._id)}
                            >
                              <MdCancel className="text-lg" /> Cancel
                            </button>
                            {addMode === column._id && (
                              <button
                                disabled={isLoading}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow ${
                                  isLoading
                                    ? "bg-teal-300"
                                    : "bg-teal-600 hover:bg-teal-700"
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
                            )}

                            {editMode.columnId === column._id && (
                              <button
                                disabled={isLoading}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow ${
                                  isLoading
                                    ? "bg-teal-300"
                                    : "bg-teal-600 hover:bg-teal-700"
                                } transition-colors`}
                                onClick={() =>
                                  updateTask(editMode.columnId, editMode.taskId)
                                }
                              >
                                {isLoading ? (
                                  <Spinner />
                                ) : (
                                  <>
                                    <FaSave className="text-lg" /> Update
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-6">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-lg overflow-hidden">
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
