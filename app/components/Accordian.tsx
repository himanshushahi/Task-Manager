'use client';
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface AccordionProps {
  question: string;
  answer: string;
}

const Accordion: React.FC<AccordionProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        className="w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
        onClick={toggleAccordion}
      >
        <span className="font-medium text-gray-800">{question}</span>
      
          <FaChevronDown className={`text-gray-600 transition-transform ${isOpen?'rotate-180':'rotate-0'}`}/>
        
      </button>
        <div className={`${isOpen?'max-h-96 py-3':'max-h-0 py-0'} overflow-hidden transition-all text-gray-700  bg-gray-50`}>
          {answer}
        </div>
    </div>
  );
};

export default Accordion;