import Image from "next/image";
import React from "react";
import { BsAlarm, BsCardChecklist, BsClockHistory } from "react-icons/bs";
import Accordion from "./components/Accordian";
import GetStartedButton from "./components/GetStartedButton";

function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-purple-600 text-white w-full py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="w-full md:w-[80%] lg:w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-4 lg:gap-12">
            <div className="text-center lg:text-left lg:w-1/2">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                Welcome to Your Task Manager
              </h1>
              <p className="text-lg sm:text-xl mb-6 sm:mb-8">
                Stay organized and focused on what matters most.
              </p>
              <GetStartedButton/>
            </div>
            <div className="lg:w-1/2 mt-0 lg:mt-0">
              <Image
                className="w-full h-auto max-w-md mx-auto"
                src="/form.webp"
                width={400}
                height={400}
                alt="Task manager form"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-10 bg-gray-100">
        <div className="w-full md:w-[80%] lg:w-[80%] mx-auto text-center px-2 lg:px-0">
          <h2 className="lg:text-3xl md:tex-2xl text-xl font-bold mb-8 text-purple-600">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <BsCardChecklist className="text-5xl text-blue-500 mb-4 mx-auto" />
              <h3 className="lg:text-xl text-lg font-semibold mb-2">Task Organization</h3>
              <p className="text-gray-600">
                Effortlessly organize your tasks and projects.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <BsAlarm className="text-5xl text-red-500 mb-4 mx-auto" />
              <h3 className="lg:text-xl text-lg  font-semibold mb-2">Priority Setting</h3>
              <p className="text-gray-600">
                Set priorities to focus on what&rsquo;s most important.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <BsClockHistory className="text-5xl text-green-500 mb-4 mx-auto" />
              <h3 className="lg:text-xl text-lg font-semibold mb-2">
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
        <div className="w-full md:w-[80%] lg:w-[80%] mx-auto px-2 lg:px-0">
          <h2 className="lg:text-3xl md:text-2xl text-xl text-center font-bold mb-8 text-purple-600">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-4">
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
      <footer className="bg-purple-600 text-white py-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Your Task Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
