'use client';

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'আমি আপনার কৃষি সহায়ক। আমাকে যেকোনো প্রশ্ন করুন বা মাইক্রোফোনে ট্যাপ করে কথা বলুন।',
      timestamp: new Date()
    }
  ]);
  
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "আজকের আবহাওয়া?",
    "সারের দাম কত?",
    "আলুর রোগ কিভাবে চিনবো?",
    "সেচ কখন দেব?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceInput = () => {
    setIsListening(true);
    
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: 'আমার টমেটো গাছে হলুদ পাতা দেখা যাচ্ছে। কী করব?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsThinking(true);
      
      // Simulate AI response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'টমেটো গাছের হলুদ পাতা সাধারণত পানির অভাব বা নাইট্রোজেনের ঘাটতির কারণে হয়। প্রথমে মাটির আর্দ্রতা পরীক্ষা করুন। যদি মাটি শুকনো থাকে তাহলে সেচ দিন। এছাড়া ইউরিয়া সার প্রয়োগ করতে পারেন। আরও সাহায্যের জন্য ছবি তুলে পাঠান।',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsThinking(false);
      }, 2000);
    }, 3000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: suggestion,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);
    
    // Simulate response based on suggestion
    setTimeout(() => {
      let response = '';
      switch (suggestion) {
        case "আজকের আবহাওয়া?":
          response = 'আজ সর্বোচ্চ তাপমাত্রা ২৮°C, সর্বনিম্ন ২০°C। দুপুর ২টার পর বৃষ্টির সম্ভাবনা ৭০%। সকালে সেচ দিয়ে রাখুন।';
          break;
        case "সারের দাম কত?":
          response = 'বর্তমানে ইউরিয়ার দাম ২২ টাকা কেজি, TSP ২৮ টাকা কেজি, এবং MP ১৮ টাকা কেজি। সরকারি দোকানে কিনলে ভর্তুকি পাবেন।';
          break;
        case "আলুর রোগ কিভাবে চিনবো?":
          response = 'আলুর প্রধান রোগ লেট ব্লাইট। পাতায় বাদামী দাগ, কান্ডে কালো দাগ দেখা যায়। আক্রান্ত অংশ পুড়িয়ে ফেলুন এবং ছত্রাকনাশক স্প্রে করুন।';
          break;
        default:
          response = 'সেচ দেওয়ার সবচেয়ে ভালো সময় সকাল ৬-৮টা বা বিকাল ৪-৬টা। দুপুরে সেচ দিলে পানি বাষ্প হয়ে যায় এবং গাছের ক্ষতি হতে পারে।';
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2 text-green-600 hover:text-green-700">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>ড্যাশবোর্ডে ফিরুন</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">🤖 কৃষি সহায়ক</h1>
            <div className="w-24"></div> {/* Spacer for balance */}
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
        {/* Messages */}
        <Card className="flex-1 p-4 mb-6 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-white shadow-md text-gray-900 border'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('bn-BD', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white shadow-md text-gray-900 border px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Voice Input */}
        <div className="text-center mb-6">
          <button
            onClick={handleVoiceInput}
            disabled={isListening || isThinking}
            className={`w-20 h-20 rounded-full shadow-2xl transition-all duration-300 transform ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-110'
            } text-white disabled:opacity-50`}
          >
            {isListening ? (
              <div className="flex justify-center items-center">
                <div className="flex space-x-1">
                  <div className="w-1 h-8 bg-white rounded-full animate-pulse"></div>
                  <div className="w-1 h-6 bg-white rounded-full animate-pulse delay-75"></div>
                  <div className="w-1 h-8 bg-white rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            ) : (
              <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <p className="text-sm text-gray-600 mt-3">
            {isListening ? 'শুনছি... কথা বলুন' : 'মাইক্রোফোনে ট্যাপ করে কথা বলুন'}
          </p>
        </div>

        {/* Suggestions */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">💡 সাধারণ প্রশ্ন</h3>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isListening || isThinking}
                className="p-3 text-left bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg transition-all duration-200 text-sm disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
