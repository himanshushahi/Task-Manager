"use client";
import Link from "next/link";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BsArrowLeft } from "react-icons/bs";
import { FaLock, FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import Spinner from "../components/Spinner";
import { useRouter } from "next/navigation";
import Image from "next/image";

type auth = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<auth>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const [passwordType, setPasswordType] = useState<"password" | "text">(
    "password"
  );

  const onSubmit: SubmitHandler<auth> = async (data, event: any) => {
    event.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { Content_Type: "application/json" },
        body: JSON.stringify(data),
      });
      const resData: { success: boolean; message: string } =
        await response.json();
      if (resData.success) {
        toast.success(resData.message);
        router.push("/dashboard/tasks");
      } else {
        toast.error(resData.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-screen flex gap-2 items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white py-8 px-4 w-[30%] shadow sm:rounded-lg sm:px-10">
        <div className="flex items-center relative">
          <Link
            href={"/"}
            className="absolute left-0 top-4 text-purple-500 hover:bg-gray-400 transition-colors font-bold rounded-full p-1 bg-gray-300"
          >
            <BsArrowLeft size={25} strokeWidth={1} />
          </Link>
          <Image
            width={300}
            height={300}
            className="mx-auto h-20 w-auto rounded-full"
            src="/logo.jpeg"
            alt="Workflow"
          />
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm ">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                type="text"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                  pattern: {
                    value: /^(?=.*[A-Z])/,
                    message:
                      "Password must contain at least one uppercase letter",
                  },
                })}
                type={passwordType}
                autoComplete="new-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password"
              />
              <button
                onClick={() =>
                  setPasswordType((prev) =>
                    prev === "text" ? "password" : "text"
                  )
                }
                className="absolute top-[32%] right-2"
                type="button"
              >
                {passwordType === "password" ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
          <ul style={{ marginTop: "8px" }} className="list-inside list-disc">
            {errors.email && (
              <li className="text-red-500 text-sm">{errors.email.message}</li>
            )}
            {errors.password && (
              <li className="text-red-500 text-sm">
                {errors.password.message}
              </li>
            )}
          </ul>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="text-sm">
              <Link
                href="/register"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Register?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FaLock
                  className="h-5 w-5 text-purple-500 group-hover:text-purple-400"
                  aria-hidden="true"
                />
              </span>
              {isLoading && <Spinner />}
              {!isLoading && "Login"}
            </button>
          </div>

          <div>
            <button
              type="button"
              className="flex items-center justify-center px-4 gap-2 bg-gray-300 w-full py-2 rounded-full text-purple-600"
            >
              <FaGoogle /> Login With Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
