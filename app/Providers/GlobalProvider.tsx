"use client";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import {
  GlobalDispatchContext,
  GlobalStateContext,
  initialState,
  reducer,
  userType,
} from "../store/store";

// Correct function syntax for accepting props
function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const getWorkSpace = async () => {
      try {
        const response = await fetch("/api/workspace", {
          credentials: "include",
        });

        const data = await response.json();
        if (data.success) {
          dispatch({ type: "SET_WORKSPACE", payload: data.workSpaces });
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };
    const authenticateUser = async () => {
      try {
        const response = await fetch(`/api/authenticate`, {
          credentials: "include",
        });

        const data = (await response.json()) as {
          success: boolean;
          user: userType;
        };
        if (data.success) {
          getWorkSpace();
        }
        dispatch({ type: "SET_USER", payload: data.user });
      } catch (error: any) {
        dispatch({ type: "SET_USER", payload: null });
      }
    };
    authenticateUser();
  }, []);
  const pathname = usePathname();
  if (!pathname) return;
  const navbarHidden =
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/forgot-password");

  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>
        <>
          {!navbarHidden && <Navbar />}
          {children}
          <Toaster />
        </>
      </GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
}

export default GlobalProvider;
