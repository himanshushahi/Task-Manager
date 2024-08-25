"use client";
import React, { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCircleInfo } from "react-icons/fa6";
import { MdEmail, MdLock, MdVerifiedUser } from "react-icons/md";
import Spinner from "../components/Spinner";
import { useRouter } from "next/navigation";

function Forgot() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmitEmail = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!email) {
        setError("Email is required");
        return;
      }
      setIsLoading(true);
      const response = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setStep(2);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!otp) {
        setError("OTP Is Required!");
        return;
      }
      setIsLoading(true);
      const response = await fetch("/api/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, email }),
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
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!/^(?=.*[A-Z])/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        router.push("/login");
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const StepBar = () => (
    <div className="flex justify-between mb-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          data-stepbar={i}
          className={`flex flex-col ${
            step > i ? "after:bg-purple-600 " : "after:bg-gray-200"
          } z-10 items-center`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= i
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {i}
          </div>
          <div
            className={`text-xs mt-1 ${
              step >= i ? "text-purple-600" : "text-gray-400"
            }`}
          >
            {i === 1 ? "Email" : i === 2 ? "OTP" : "Reset"}
          </div>
        </div>
      ))}
    </div>
  );

  const [timer, setTimer] = useState(120);

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

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="bg-white py-8 px-4 sm:px-10 lg:w-[30%] md:w-[50%] w-full shadow sm:rounded-lg lg:mx-0 mx-4">
        <div className="sm:mx-auto mb-4 sm:w-full sm:max-w-md">
          <h2 className="text-center text-2xl font-extrabold text-purple-500">
            Forgot Password
          </h2>
        </div>

        <StepBar />
        {step === 1 && (
          <form onSubmit={handleSubmitEmail}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 z-[2] flex items-center pointer-events-none">
                  <MdEmail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500  sm:text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {isLoading && <Spinner />}
                {!isLoading && "Send OTP"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Enter OTP
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 z-[2] flex items-center pointer-events-none">
                  <MdVerifiedUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="otp"
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
            {timer === 0 && (
              <div className="mt-2">
                <p className="text-red-600 flex items-center gap-1">
                  <FaCircleInfo /> OTP Is Expired!
                </p>
              </div>
            )}
            {timer > 0 && (
              <div className="mt-2">OTP Will Expires In {timer} Seconds</div>
            )}
            <div className="mt-6">
              {timer === 0 && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSubmitEmail}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {isLoading && <Spinner />}
                  {!isLoading && "Resend OTP"}
                </button>
              )}
              {timer > 0 && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {isLoading && <Spinner />}
                  {!isLoading && "Verify OTP"}
                </button>
              )}
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdLock className="h-5 w-5 z-[2] text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500  sm:text-sm"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdLock className="h-5 w-5 z-[2] text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  className="appearance-none rounded-none relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500  sm:text-sm"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {isLoading && <Spinner />}
                {!isLoading && "Reset Password"}
              </button>
            </div>
          </form>
        )}
        {error && (
          <div className=" my-2 text-sm text-red-600 flex justify-center gap-1 items-center">
            <FaCircleInfo size={15} /> <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Forgot;
