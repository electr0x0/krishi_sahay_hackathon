'use client';

import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

export default function TopBar() {
  const [weather] = useState<WeatherData>({
    temperature: 28,
    condition: "সূর্যালোক",
    icon: "☀️"
  });
  
  const [farmerName] = useState("রহিম মিয়া");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "শুভ সকাল";
    if (hour < 17) return "শুভ দুপুর";
    if (hour < 20) return "শুভ সন্ধ্যা";
    return "শুভ রাত্রি";
  };

  return (
    <header className="bg-white shadow-sm border-b border-green-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Greeting */}
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {getGreeting()}, {farmerName}! 👋
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {currentTime.toLocaleDateString('bn-BD', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Weather Widget */}
          <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 rounded-2xl">
            <div className="text-3xl">{weather.icon}</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {weather.temperature}°C
              </div>
              <div className="text-sm text-gray-600">
                {weather.condition}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
