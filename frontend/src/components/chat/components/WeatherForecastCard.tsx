'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cloud, CloudRain, Sun, Wind, Droplets, Eye, 
  ChevronDown, ChevronUp, Calendar, Bell, FileText,
  CloudDrizzle, CloudSnow, CloudLightning
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeatherForecastCardProps {
  data: any;
  actions?: Array<{ label: string; action: string; icon: string }>;
  onAction?: (action: string) => void;
}

const WeatherForecastCard: React.FC<WeatherForecastCardProps> = ({ data, actions, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse forecast data
  const forecast = data?.list || data?.forecast || [];
  const location = data?.city?.name || data?.location || 'অজানা স্থান';

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    const lower = condition?.toLowerCase() || '';
    if (lower.includes('rain') || lower.includes('বৃষ্টি')) return <CloudRain className="w-6 h-6" />;
    if (lower.includes('drizzle')) return <CloudDrizzle className="w-6 h-6" />;
    if (lower.includes('snow')) return <CloudSnow className="w-6 h-6" />;
    if (lower.includes('thunder') || lower.includes('storm')) return <CloudLightning className="w-6 h-6" />;
    if (lower.includes('cloud')) return <Cloud className="w-6 h-6" />;
    return <Sun className="w-6 h-6" />;
  };

  // Get action icon
  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'droplet': return <Droplets className="w-4 h-4" />;
      case 'file-text': return <FileText className="w-4 h-4" />;
      case 'bell': return <Bell className="w-4 h-4" />;
      case 'calendar': return <Calendar className="w-4 h-4" />;
      default: return null;
    }
  };

  // Prepare chart data (take first 7 days)
  const chartData = {
    labels: forecast.slice(0, 7).map((day: any, idx: number) => {
      if (day.dt_txt) {
        const date = new Date(day.dt_txt);
        return date.toLocaleDateString('bn-BD', { weekday: 'short' });
      }
      return `দিন ${idx + 1}`;
    }),
    datasets: [
      {
        label: 'তাপমাত্রা (°C)',
        data: forecast.slice(0, 7).map((day: any) => day.main?.temp || day.temp || 0),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value: any) => `${value}°C`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  ৭-দিনের আবহাওয়া পূর্বাভাস
                </CardTitle>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Eye className="w-3 h-3 mr-1" />
                  {location}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:bg-green-100"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Quick Overview - Always Visible */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {forecast.slice(0, 3).map((day: any, idx: number) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-lg border border-green-100 hover:border-green-300 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-2">
                    {idx === 0 ? 'আজ' : idx === 1 ? 'আগামীকাল' : `দিন ${idx + 1}`}
                  </span>
                  <div className="text-green-600 mb-2">
                    {getWeatherIcon(day.weather?.[0]?.main || day.condition || 'Clear')}
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {Math.round(day.main?.temp || day.temp || 0)}°C
                  </span>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Droplets className="w-3 h-3 mr-1" />
                    {day.main?.humidity || day.humidity || 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expanded View */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Temperature Chart */}
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    তাপমাত্রার প্রবণতা
                  </h4>
                  <div className="h-48">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>

                {/* Detailed Forecast List */}
                <div className="space-y-2">
                  {forecast.slice(0, 7).map((day: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-green-600">
                            {getWeatherIcon(day.weather?.[0]?.main || day.condition || 'Clear')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {idx === 0 ? 'আজ' : idx === 1 ? 'আগামীকাল' : `দিন ${idx + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {day.weather?.[0]?.description || day.description || 'পরিষ্কার'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round(day.main?.temp || day.temp || 0)}°C
                          </p>
                          <div className="flex items-center justify-end space-x-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Wind className="w-3 h-3 mr-1" />
                              {day.wind?.speed || day.wind_speed || 0} m/s
                            </span>
                            <span className="flex items-center">
                              <Droplets className="w-3 h-3 mr-1" />
                              {day.main?.humidity || day.humidity || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-green-100">
              {actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => onAction && onAction(action.action)}
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                >
                  {getActionIcon(action.icon)}
                  <span className="ml-2 text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeatherForecastCard;
