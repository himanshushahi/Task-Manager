import Image from "next/image";
import React from "react";
import { BsAlarm, BsCardChecklist, BsClockHistory } from "react-icons/bs";
import Accordion from "./components/Accordian";


function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-purple-500 text-white py-10">
        <div className="lg:px-20 md:px-10 px-1 flex justify-center gap-x-20 items-center lg:flex-row md:flex-row">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Welcome to Your Task Manager
            </h1>
            <p className="text-lg mb-8">
              Stay organized and focused on what matters most.
            </p>
            <button className="bg-white text-purple-500 font-semibold py-2 px-4 rounded hover:bg-gray-200 hover:text-purple-500">
              Get Started
            </button>
          </div>
          <div>
            <Image
              className="h-full w-full "
              src={"/form.webp"}
              width={400}
              height={400}
              alt="form"
            />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-purple-500">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <BsCardChecklist className="text-5xl text-blue-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Task Organization</h3>
              <p className="text-gray-600">
                Effortlessly organize your tasks and projects.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <BsAlarm className="text-5xl text-red-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Priority Setting</h3>
              <p className="text-gray-600">
                Set priorities to focus on what&rsquo;s most important.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <BsClockHistory className="text-5xl text-green-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">
                Deadline Management
              </h3>
              <p className="text-gray-600">
                Never miss a deadline with our intuitive tools.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-purple-500">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-8 lg:px-10 md:px-5 px-1">
            <Accordion
              question="How do I get started?"
              answer="Simply sign up for an account and start adding your tasks!"
            />
            <Accordion
              question="Is my data secure?"
              answer="Yes, we take data security and privacy seriously."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-purple-500 text-white py-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Your Task Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
