"use client";
import { useEffect } from "react";
import { Column, Task, useGlobalDispatch } from "../store/store";
import { socket } from "../../socket";

function useSocketListner() {
  const dispach = useGlobalDispatch();
  useEffect(() => {
    function handleAddColumn({
      workSpaceId: sendedWorkSpaceId,
      column,
    }: {
      workSpaceId: string;
      column: Column;
    }) {
      dispach({ type: "ADD_COLUMN", payload: column });
    }

    function handleDeleteColumn(columnId: string) {
      dispach({ type: "DELETE_COLUMN", payload: { id: columnId } });
    }

    function addNewTask({ columnId, task }: { columnId: string; task: Task }) {
      dispach({ type: "CREATE_TASK", payload: { columnId, task } });
    }

    function handleUpdateTask({
      columnId,
      task,
    }: {
      columnId: string;
      task: Task;
    }) {
      dispach({ type: "UPDATE_TASK", payload: { columnId, task } });
    }

    const handleDeleteTask = ({
      columnId,
      taskId,
    }: {
      columnId: string;
      taskId: string;
    }) => {
      dispach({ type: "DELETE_TASK", payload: { columnId, taskId } });
    };

    const handleTaskPositionUpdate = ({
      source,
      destination,
    }: {
      source: { droppableId: string; index: number };
      destination: { droppableId: string; index: number };
    }) => {
      dispach({
        type: "UPDATE_TASK_POSITION",
        payload: { source, destination },
      });
    };

    socket.on("create-task", addNewTask);
    socket.on("update-task", handleUpdateTask);
    socket.on("delete-task", handleDeleteTask);
    socket.on("new-column", handleAddColumn);
    socket.on("delete-column", handleDeleteColumn);
    socket.on("task-position-update", handleTaskPositionUpdate);
    return () => {
      socket.off("new-column", handleAddColumn);
      socket.off("delete-column", handleDeleteColumn);
      socket.off("create-task", addNewTask);
      socket.off("update-task", handleUpdateTask);
      socket.off("delete-task", handleDeleteTask);
      socket.off("task-position-update", handleTaskPositionUpdate);
    };
  });
}

export default useSocketListner;
