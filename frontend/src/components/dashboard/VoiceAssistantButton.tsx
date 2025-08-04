'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VoiceAssistantButton() {
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();

  const handleVoiceClick = () => {
    setIsListening(true);
    
    // Navigate to assistant page after a brief animation
    setTimeout(() => {
      router.push('/assistant');
    }, 300);
  };

  return (
    <>
      {/* Floating Voice Assistant Button */}
      <button
        onClick={handleVoiceClick}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-50 ${
          isListening ? 'animate-pulse scale-110' : ''
        }`}
        aria-label="কণ্ঠস্বর দিয়ে সহায়তা নিন"
      >
        <div className="flex items-center justify-center">
          {isListening ? (
            <div className="flex space-x-1">
              <div className="w-1 h-6 bg-white rounded-full animate-pulse"></div>
              <div className="w-1 h-4 bg-white rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-6 bg-white rounded-full animate-pulse delay-150"></div>
            </div>
          ) : (
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Voice Hint Tooltip */}
      <div className="fixed bottom-24 right-6 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-40">
        কণ্ঠস্বর দিয়ে প্রশ্ন করুন
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </>
  );
}
