import  { useEffect } from "react";
import { useSocket } from "./useSocket";

function useSocketListner() {
    const {socket} = useSocket()
  useEffect(() => {
    function handleNewTask(task:any) {
         console.log(task)
    }
    socket.on("new Task", handleNewTask);
    return () => {
      socket.off("new Task", handleNewTask);
    };
  }, [socket]);
}

export default useSocketListner;
