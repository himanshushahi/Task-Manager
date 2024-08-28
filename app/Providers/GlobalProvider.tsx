"use client";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";
import { useReducer } from "react";
import {
  GlobalDispatchContext,
  GlobalStateContext,
  initialState,
  reducer,
} from "../store/store";
import UserInitialData from "../Hooks/UserInitialData";

// Correct function syntax for accepting props
function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
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
          <UserInitialData/>
          <Toaster />
        </>
      </GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
}

export default GlobalProvider;
