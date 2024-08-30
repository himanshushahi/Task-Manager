"use client";
import React, { useState, useEffect } from "react";
import { socket } from "../../socket";
import { useGlobalState } from "../store/store";

interface CursorPosition {
  x: number;
  y: number;
}

interface Cursors {
  [userId: string]: CursorPosition;
}

interface LiveCursorProps {
  roomId: string;
}

const LiveCursor = ({ roomId }: LiveCursorProps) => {
  const { user } = useGlobalState();
  const [cursors, setCursors] = useState<Cursors>({});
  useEffect(() => {
    const handleCursorMove = ({
      userId,
      x,
      y,
    }: {
      userId: string;
      x: number;
      y: number;
    }) => {
      setCursors((prevCursors) => ({
        ...prevCursors,
        [userId]: { x, y },
      }));
    };
    // Listen for cursor updates from other users
    socket.on("cursor-move", handleCursorMove);

    return () => {
      socket.off("cursor-move", handleCursorMove);
    };
  }, [socket]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      // Broadcast cursor position to other users
      socket.emit("cursor-move", {
        roomId,
        userId: user?._id,
        x: clientX,
        y: clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [roomId, user?._id]);

  return (
    <>
      {Object.entries(cursors).map(
        ([cursorUserId, position]) =>
          cursorUserId !== user?._id && (
            <div
              data-Id="cursor"
              key={cursorUserId}
              style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "red",
                pointerEvents: "none",
                zIndex: 9999,
              }}
            />
          )
      )}
    </>
  );
};

export default LiveCursor;
