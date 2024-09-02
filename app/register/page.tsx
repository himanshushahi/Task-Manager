"use client";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import {
  FaCheckSquare,
  FaEye,
  FaEyeSlash,
  FaTrashAlt,
  FaUser,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaCircleInfo } from "react-icons/fa6";

type user = {
  name: string;
  email: string;
  password: string;
  avatar: string | null;
};

const RegisterPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [user, setUser] = useState<user>({
    name: "",
    email: "",
    avatar: "",
    password: "",
  });
  const [passwordType, setPasswordType] = useState<"text" | "password">(
    "password"
  );
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(2);
  const [storedEmail, setStoredEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState(120);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user.name) {
      setError("Please enter your name");
      return;
    }
    if (!user.email) {
      setError("Please enter your email");
      return;
    }
    if (!user.password) {
      setError("Please enter your password");
      return;
    }
    if (step !== 3) {
      setError("Verify the email first.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password,
          avatar: user.avatar,
        }),
      });
      const resData: { success: boolean; message: string } =
        await response.json();
      if (resData.success) {
        toast.success(resData.message);
        router.push("/login");
      } else {
        toast.error(resData.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendOTPHandler = async () => {
    try {
      if (!user.email) {
        setError("Email is required");
        return;
      }
      setOtpLoading(true);
      const response = await fetch("/api/otp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setStoredEmail(user.email);
        setStep(2);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    let timerId: string | number | NodeJS.Timeout | undefined;

    if (step === 2 && timer > 0) {
      timerId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [step, timer]);

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!otp) {
        setError("OTP Is Required!");
        return;
      }
      setOtpLoading(true);
      const response = await fetch("/api/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, email: storedEmail }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setStep(3);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev) => ({ ...prev, avatar: reader.result as string })); // Store the avatar as a base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white py-8 px-6 lg:w-[30%] md:w-[50%] w-full shadow sm:rounded-lg">
        <div className="flex items-center relative mb-6">
          <Link
            href="/"
            className="absolute left-0 top-[20px] text-teal-600 hover:bg-gray-200 transition-colors font-bold rounded-full p-2"
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
        <form className="mt-6" onSubmit={onSubmit}>
          <div className="rounded">
            <div className="mb-4">
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="appearance-none rounded-b w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-600 focus:border-teal-600 sm:text-sm"
                placeholder="Name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col sm:flex-row">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleChange}
                  disabled={step === 2 || step === 3}
                  className="appearance-none w-full sm:flex-1 rounded-b px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-600 focus:border-teal-600 text-sm"
                  placeholder="Email address"
                />
                {step === 1 && (
                  <button
                    type="button"
                    disabled={otpLoading}
                    className="mt-2 sm:mt-0 w-full flex justify-center sm:w-auto px-3 py-2 bg-teal-600 text-white rounded-b sm:rounded-r sm:rounded-b-none border border-teal-600 hover:bg-teal-700 transition-colors duration-200 ease-in-out"
                    onClick={sendOTPHandler}
                  >
                    {otpLoading ? <Spinner /> : "Send OTP"}
                  </button>
                )}
                {step === 3 && (
                  <span className="mt-2 sm:mt-0 w-full sm:w-auto flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-b sm:rounded-r sm:rounded-b-none">
                    <FaCheckSquare className="mr-2" />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {step === 2 && (
              <div className="mb-4">
                <label htmlFor="otp" className="sr-only">
                  OTP
                </label>
                <div className="flex flex-col sm:flex-row">
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none w-full sm:flex-1 rounded-t sm:rounded-l sm:rounded-t-none px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-600 focus:border-teal-600 text-sm"
                    placeholder="Enter OTP"
                  />
                  <button
                    type="button"
                    disabled={otpLoading}
                    className="mt-2 sm:mt-0 w-full flex justify-center sm:w-auto px-3 py-2 bg-teal-600 text-white rounded-b sm:rounded-r sm:rounded-b-none border border-teal-600 hover:bg-teal-700 transition-colors duration-200 ease-in-out disabled:bg-teal-400 disabled:cursor-not-allowed"
                    onClick={handleVerifyOtp}
                  >
                    {otpLoading ? <Spinner /> : "Verify OTP"}
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="avatar"
                className="flex items-center justify-center rounded w-full px-3 py-2 bg-teal-600 text-white cursor-pointer"
              >
                Avatar
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            {user.avatar && (
              <div className="mx-auto mb-4 group relative w-24 h-24">
                <img
                  src={user.avatar}
                  alt="Avatar Preview"
                  className="w-24 h-24 transition-all group-hover:blur-sm object-cover rounded-full"
                />
                <button
                  onClick={() => setUser((prev) => ({ ...prev, avatar: null }))}
                  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTrashAlt />
                </button>
              </div>
            )}

            <div className="mb-4 relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                type={passwordType}
                autoComplete="new-password"
                className="appearance-none rounded-b w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-600 focus:border-teal-600 sm:text-sm"
                placeholder="Password"
              />
              <button
                onClick={() =>
                  setPasswordType((prev) =>
                    prev === "text" ? "password" : "text"
                  )
                }
                className="absolute top-2/4 right-3 transform -translate-y-2/4"
                type="button"
              >
                {passwordType === "password" ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

            {timer === 0 && (
              <div className="mt-4 pl-2">
                <p className="text-red-600 flex items-center gap-1">
                  <FaCircleInfo /> OTP Is Expired!
                </p>
              </div>
            )}
            {timer > 0 && step === 2 && (
              <div className="mt-4 pl-2">
                <p>OTP Will Expire In {timer} Seconds</p>
              </div>
            )}

            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}

            <div className="text-sm flex justify-end mb-2">
              <Link
                href="/login"
                className="font-medium text-teal-600 hover:text-teal-700"
              >
                Already Registered?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <FaUser
                    className="h-5 w-5 text-teal-300 group-hover:text-teal-200"
                    aria-hidden="true"
                  />
                </span>
                {isSubmitting ? <Spinner /> : "Register"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
