"use client";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";
import Spinner from "../components/Spinner";
import { useRouter } from "next/navigation";
import Image from "next/image";

type user = {
  name: string;
  email: string;
  password: string;
};

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<user>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordType, setPasswordType] = useState<"text" | "password">(
    "password"
  );
  const router = useRouter();

  const onSubmit: SubmitHandler<user> = async (data, event: any) => {
    event.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { Content_Type: "application/json" },
        body: JSON.stringify(data),
      });
      const resData: { success: boolean; message: string } =
        await response.json();
      console.log(resData);
      if (resData.success) {
        toast.success(resData.message);
        router.push("/login");
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
      <div className="bg-white py-8 px-4 lg:w-[30%] md:w-[50%] w-full shadow sm:rounded-lg sm:px-10">
        <div className="flex items-center relative">
          <Link
            href={"/"}
            className="absolute left-0 top-4 text-purple-500 hover:bg-gray-400 transition-colors font-bold rounded-full p-1 bg-gray-300"
          >
            <BsArrowLeft size={25} strokeWidth={1} />
          </Link>
          <Image
            width={400}
            height={400}
            className="mx-auto h-20 w-auto rounded-full"
            src="/logo.jpeg"
            alt="Workflow"
          />
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "Name is required" })}
                autoComplete="name"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Name"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="mb-8 relative">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500  sm:text-sm"
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
            <ul style={{ marginTop: "8px" }} className="list-inside list-disc">
              {errors.name && (
                <li className="text-red-500 text-sm">{errors.name.message}</li>
              )}
              {errors.email && (
                <li className="text-red-500 text-sm">{errors.email.message}</li>
              )}
              {errors.password && (
                <li className="text-red-500 text-sm">
                  {errors.password.message}
                </li>
              )}
            </ul>
            <div className="text-sm flex justify-end">
              <Link
                href="/login"
                className="font-medium mt-4 text-purple-600 hover:text-purple-500"
              >
                Already Registered?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FaUser
                  className="h-5 w-5 text-purple-500 group-hover:text-purple-400"
                  aria-hidden="true"
                />
              </span>
              {isLoading && <Spinner />}
              {!isLoading && "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
