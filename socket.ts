"use client";

import { io } from "socket.io-client";

export const socket = io("https://task-manager-socket.onrender.com",{
    withCredentials:true
});