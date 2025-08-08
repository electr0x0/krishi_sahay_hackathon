'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import useSWR from 'swr';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Sprout,
  RefreshCw,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Types for sensor data
interface SensorData {
  id: number;
  timestamp: string;
  temperature_c: number;
  humidity_percent: number;
  heat_index_c: number;
  water_level_percent: number;
  soil_moisture_percent: number;
  device_status: string;
  data_quality: string;
  received_at: string;
}

interface SensorHistoryResponse {
  data: SensorData[];
  total: number;
  page: number;
  limit: number;
}

// API helper functions
const apiRequest = async (endpoint: string) => {
  const response = await fetch(`http://localhost:8000${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
};

// SWR fetcher function
const fetcher = async (url: string) => {
  if (url === 'latest-sensor-data') {
    return await apiRequest('/api/iot/get-latest-data');
  } else if (url === 'sensor-history') {
    return await apiRequest('/api/iot/get-data-history?limit=50');
  }
  throw new Error('Unknown endpoint');
};

// Utility functions for data formatting
const DataFormatter = {
  formatTimestamp: (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  },
  formatTimeForChart: (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
};

// Gauge component for displaying sensor values
const SensorGauge = ({ 
  title, 
  value, 
  unit, 
  max, 
  color, 
  icon: Icon 
}: {
  title: string;
  value: number;
  unit: string;
  max: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">{value?.toFixed(1) || '0.0'}</span>
          <span className="text-lg text-gray-500">{unit}</span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className={`h-3 rounded-full ${color.replace('text-', 'bg-')}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="text-sm text-gray-500 mt-2">
        {percentage.toFixed(0)}% of max ({max}{unit})
      </div>
    </motion.div>
  );
};

// Status indicator component
const StatusIndicator = ({ 
  status, 
  lastUpdate 
}: { 
  status: string; 
  lastUpdate: string; 
}) => {
  const isOnline = status === 'online';
  
  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Device Status</h3>
          <div className="flex items-center space-x-2 mt-2">
            {isOnline ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Last update: {DataFormatter.formatTimestamp(lastUpdate)}
          </p>
        </div>
        <Activity className={`h-8 w-8 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
      </div>
    </motion.div>
  );
};

export default function IoTDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch latest sensor data with SWR (refreshes every 5 seconds)
  const { data: latestData, error: latestError, mutate: mutateLatest } = useSWR<SensorData>(
    'latest-sensor-data',
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: false,
    }
  );

  // Fetch historical data
  const { data: historyData, error: historyError, mutate: mutateHistory } = useSWR<SensorHistoryResponse>(
    'sensor-history',
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: false,
    }
  );

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([mutateLatest(), mutateHistory()]);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Prepare chart data with proper validation
  const chartData = historyData?.data?.map((item, index) => ({
    index: index,
    time: DataFormatter.formatTimeForChart(item.timestamp),
    temperature: Number(item.temperature_c) || 0,
    humidity: Number(item.humidity_percent) || 0,
    soil_moisture: Number(item.soil_moisture_percent) || 0,
    water_level: Number(item.water_level_percent) || 0,
  })).filter(item => 
    // Filter out invalid data points
    !isNaN(item.temperature) && 
    !isNaN(item.humidity) && 
    !isNaN(item.soil_moisture) && 
    !isNaN(item.water_level) &&
    item.time !== 'Invalid Date'
  ) || [];

  if (latestError || historyError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">Unable to connect to the sensor data API</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <motion.div
        className="bg-white shadow-sm border-b border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IoT Sensor Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time agricultural sensor monitoring</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {!latestData && !latestError && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <motion.div
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-gray-600">Loading sensor data...</p>
            </div>
          </div>
        )}

        {latestData && (
          <>
            {/* Status Card */}
            <div className="mb-8">
              <StatusIndicator 
                status={latestData.device_status} 
                lastUpdate={latestData.received_at} 
              />
            </div>

            {/* Sensor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SensorGauge
                title="Temperature"
                value={Number(latestData.temperature_c) || 0}
                unit="°C"
                max={50}
                color="text-red-500"
                icon={Thermometer}
              />
              <SensorGauge
                title="Humidity"
                value={Number(latestData.humidity_percent) || 0}
                unit="%"
                max={100}
                color="text-blue-500"
                icon={Droplets}
              />
              <SensorGauge
                title="Soil Moisture"
                value={Number(latestData.soil_moisture_percent) || 0}
                unit="%"
                max={100}
                color="text-green-500"
                icon={Sprout}
              />
              <SensorGauge
                title="Water Level"
                value={Number(latestData.water_level_percent) || 0}
                unit="%"
                max={100}
                color="text-cyan-500"
                icon={Gauge}
              />
            </div>

            {/* Charts */}
            {chartData.length > 0 && chartData.every(item => item && typeof item === 'object') ? (
              <motion.div
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Sensor History (Last 50 readings)</h3>
                
                {/* Temperature and Humidity Chart */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Temperature & Humidity</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(label) => `Time: ${label}`}
                        formatter={(value, name) => [
                          `${value}${String(name).includes('temperature') ? '°C' : '%'}`,
                          String(name).charAt(0).toUpperCase() + String(name).slice(1)
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                        name="temperature"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="humidity" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                        name="humidity"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Soil and Water Chart */}
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Soil Moisture & Water Level</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(label) => `Time: ${label}`}
                        formatter={(value, name) => [
                          `${value}%`,
                          String(name).replace('_', ' ').charAt(0).toUpperCase() + String(name).replace('_', ' ').slice(1)
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="soil_moisture" 
                        stroke="#10b981" 
                        fill="#10b981"
                        fillOpacity={0.3}
                        name="soil_moisture"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="water_level" 
                        stroke="#06b6d4" 
                        fill="#06b6d4"
                        fillOpacity={0.3}
                        name="water_level"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ) : historyData ? (
              <motion.div
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Chart Data Available</h3>
                  <p className="text-gray-500">
                    {historyData?.data?.length === 0 
                      ? "No historical sensor data found. Start sending data from your ESP32 to see charts."
                      : "Chart data is invalid or corrupted. Please refresh the page or check your sensor data format."
                    }
                  </p>
                </div>
              </motion.div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
