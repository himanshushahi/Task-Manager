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
} from "../store/store";

// Correct function syntax for accepting props
function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const response = await fetch(`/api/authenticate`, {
          credentials: "include",
        });

        const data = await response.json();
        dispatch({ type: "SET_AUTHENTICATE", payload: data.success });
      } catch (error: any) {
        dispatch({ type: "SET_AUTHENTICATE", payload: false });
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
