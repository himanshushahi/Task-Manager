'use client';
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

// Correct function syntax for accepting props
function Provider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (!pathname) return;
  const navbarHidden =
    pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/forgot-password");

  return (
    <>
      {!navbarHidden && <Navbar />}
      {children}
      <Toaster />
    </>
  );
}

export default Provider;
