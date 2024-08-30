import React from 'react';

const WorkSpaceSkeleton = () => {
  return (
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto animate-pulse">
      <div className="flex mb-6">
        <div className="flex justify-center flex-1 items-center">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        </div>
        <div className="mx-auto">
          <div className="h-10 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
      
      <div className="flex flex-wrap -mx-2">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-6">
            <div className="bg-gray-300 rounded-lg shadow-lg overflow-hidden">
              <div className="flex justify-between bg-gray-400 p-4 rounded-t-lg">
                <div className="h-6 bg-gray-500 rounded w-1/2"></div>
                <div className="h-6 w-6 bg-gray-500 rounded"></div>
              </div>
              <div className="p-4 min-h-[250px] bg-gray-200 rounded-b-lg">
                {[1, 2, 3].map((taskIndex) => (
                  <div key={taskIndex} className="bg-gray-300 p-4 mb-3 rounded-lg flex justify-between items-start">
                    <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                    <div className="h-6 w-6 bg-gray-400 rounded"></div>
                  </div>
                ))}
                <div className="w-full bg-gray-400 p-3 mt-3 rounded-lg h-10"></div>
              </div>
            </div>
          </div>
        ))}
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-6">
          <div className="bg-gray-300 rounded-lg shadow-lg overflow-hidden h-[250px]"></div>
        </div>
      </div>
    </div>
  );
};

export default WorkSpaceSkeleton;