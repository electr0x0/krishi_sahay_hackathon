"use client";

import { useState, useEffect } from "react";
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
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Wifi,
  WifiOff
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
  count: number;
  latest_timestamp?: string;
}

// Mock data generator for demonstration
const generateMockData = (): SensorData => ({
  id: Date.now(),
  timestamp: new Date().toISOString(),
  temperature_c: 22 + Math.random() * 15,
  humidity_percent: 45 + Math.random() * 30,
  heat_index_c: 25 + Math.random() * 10,
  water_level_percent: 60 + Math.random() * 30,
  soil_moisture_percent: 40 + Math.random() * 40,
  device_status: Math.random() > 0.1 ? 'online' : 'offline',
  data_quality: 'good',
  received_at: new Date().toISOString()
});

const generateHistoryData = (count: number): SensorData[] => {
  const data: SensorData[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now - (count - i) * 5 * 60 * 1000); // 5 minutes apart
    data.push({
      ...generateMockData(),
      timestamp: timestamp.toISOString(),
      received_at: timestamp.toISOString(),
      id: i
    });
  }
  return data;
};

// Enhanced Card Component
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 pb-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>
    {children}
  </p>
);

// Progress Component
const Progress = ({ value, className = "" }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

// Badge Component
const Badge = ({ 
  children, 
  variant = "default", 
  className = "" 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "destructive" | "outline";
  className?: string;
}) => {
  const variants = {
    default: "bg-emerald-100 text-emerald-700 border-emerald-200",
    destructive: "bg-red-100 text-red-700 border-red-200",
    outline: "bg-white border-amber-300 text-amber-700"
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Button Component
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = "default",
  className = "" 
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  className?: string;
}) => {
  const variants = {
    default: "bg-emerald-600 hover:bg-emerald-700 text-white",
    outline: "border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// Utility functions
const DataFormatter = {
  formatTimestamp: (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  },
  formatTimeForChart: (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },
  validateSensorValue: (value: unknown): number => {
    const num = Number(value);
    return isNaN(num) || num < 0 ? 0 : num;
  }
};

// Enhanced Sensor Card component
const SensorCard = ({ 
  title, 
  value, 
  unit, 
  max, 
  icon: Icon,
  color = "emerald",
  trend
}: {
  title: string;
  value: number;
  unit: string;
  max: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: number;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const isHealthy = percentage > 30 && percentage < 90;
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown;
  
  const colorClasses = {
    emerald: {
      icon: "text-emerald-600",
      bg: "bg-gradient-to-br from-emerald-50 to-green-50",
      trend: trend && trend > 0 ? "text-emerald-600" : "text-red-500"
    },
    blue: {
      icon: "text-blue-600", 
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      trend: trend && trend > 0 ? "text-emerald-600" : "text-red-500"
    },
    amber: {
      icon: "text-amber-600",
      bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
      trend: trend && trend > 0 ? "text-emerald-600" : "text-red-500"
    },
    cyan: {
      icon: "text-cyan-600",
      bg: "bg-gradient-to-br from-cyan-50 to-teal-50",
      trend: trend && trend > 0 ? "text-emerald-600" : "text-red-500"
    }
  };
  
  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald;
  
  return (
    <div className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
      <Card className={`h-full border-none shadow-xl ${colors.bg}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              {title}
            </CardTitle>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">
                {value?.toFixed(1) || '0.0'}
              </span>
              <span className="text-lg text-gray-500">{unit}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">{percentage.toFixed(0)}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
            
            {trend !== undefined && TrendIcon && (
              <div className="flex items-center space-x-1">
                <TrendIcon className={`h-4 w-4 ${colors.trend}`} />
                <span className={`text-sm font-medium ${colors.trend}`}>
                  {Math.abs(trend).toFixed(1)}% vs last hour
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Max: {max}{unit}</span>
              {isHealthy ? (
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3" />
                  Healthy
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertCircle className="h-3 w-3" />
                  Monitor
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Status indicator component
const DeviceStatusCard = ({ 
  status, 
  lastUpdate,
  dataCount24h = 0,
  isRealData = true
}: { 
  status: string; 
  lastUpdate: string;
  dataCount24h?: number;
  isRealData?: boolean;
}) => {
  const isOnline = status === 'online';
  const lastUpdateTime = new Date(lastUpdate);
  const timeDiff = Date.now() - lastUpdateTime.getTime();
  const minutesAgo = Math.floor(timeDiff / (1000 * 60));
  
  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-emerald-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span>Device Status</span>
          </CardTitle>
          {!isRealData && (
            <Badge variant="outline">
              <AlertCircle className="h-3 w-3" />
              Fallback Data
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3" />
                  Online
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3" />
                  Offline
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Connection Status
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-gray-900">
                {minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Last Update
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-gray-900">
                {dataCount24h}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Readings (24h)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Statistics Overview Component
const StatisticsCard = ({ historyData }: { historyData: SensorHistoryResponse | undefined }) => {
  if (!historyData?.data || historyData.data.length === 0) return null;
  
  const data = historyData.data;
  const avgTemp = data.reduce((sum, item) => sum + (item.temperature_c || 0), 0) / data.length;
  const avgHumidity = data.reduce((sum, item) => sum + (item.humidity_percent || 0), 0) / data.length;
  const avgSoilMoisture = data.reduce((sum, item) => sum + (item.soil_moisture_percent || 0), 0) / data.length;
  const avgWaterLevel = data.reduce((sum, item) => sum + (item.water_level_percent || 0), 0) / data.length;
  
  const stats = [
    { label: "Avg Temperature", value: avgTemp.toFixed(1), unit: "°C", color: "text-amber-600" },
    { label: "Avg Humidity", value: avgHumidity.toFixed(1), unit: "%", color: "text-blue-600" },
    { label: "Avg Soil Moisture", value: avgSoilMoisture.toFixed(1), unit: "%", color: "text-emerald-600" },
    { label: "Avg Water Level", value: avgWaterLevel.toFixed(1), unit: "%", color: "text-cyan-600" }
  ];
  
  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-50/50 to-green-50/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Activity className="h-5 w-5 text-emerald-600" />
          <span>24-Hour Averages</span>
        </CardTitle>
        <CardDescription>
          Statistical overview from your recent sensor readings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.unit}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

function IoTDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [historyData, setHistoryData] = useState<SensorHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState<number>(5);

  // Fetch real data from API
  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch latest sensor data
      const latestResponse = await fetch('http://localhost:8000/api/iot/get-latest-data');
      if (!latestResponse.ok) {
        throw new Error(`Failed to fetch latest data: ${latestResponse.status}`);
      }
      const latestData = await latestResponse.json();
      
      // Fetch historical sensor data
      const historyResponse = await fetch('http://localhost:8000/api/iot/get-data-history?limit=50');
      if (!historyResponse.ok) {
        throw new Error(`Failed to fetch history data: ${historyResponse.status}`);
      }
      const historyData = await historyResponse.json();
      
      setLatestData(latestData);
      setHistoryData(historyData);
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch sensor data");
      
      // Fallback to mock data if API fails
      const mockLatest = generateMockData();
      const mockHistory = {
        data: generateHistoryData(50),
        count: 50,
        latest_timestamp: new Date().toISOString()
      };
      
      setLatestData(mockLatest);
      setHistoryData(mockHistory);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchData();
        setNextRefreshIn(5); // Reset countdown
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshing]);

  // Countdown timer for next refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setNextRefreshIn(prev => prev > 0 ? prev - 1 : 5);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setNextRefreshIn(5); // Reset countdown
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Prepare chart data with validation
  const chartData = historyData?.data?.map((item, index) => {
    // Ensure all values are valid numbers
    const temperature = typeof item.temperature_c === 'number' && !isNaN(item.temperature_c) ? item.temperature_c : 0;
    const humidity = typeof item.humidity_percent === 'number' && !isNaN(item.humidity_percent) ? item.humidity_percent : 0;
    const soilMoisture = typeof item.soil_moisture_percent === 'number' && !isNaN(item.soil_moisture_percent) ? item.soil_moisture_percent : 0;
    const waterLevel = typeof item.water_level_percent === 'number' && !isNaN(item.water_level_percent) ? item.water_level_percent : 0;
    
    return {
      index: index,
      time: DataFormatter.formatTimeForChart(item.timestamp),
      temperature,
      humidity,
      soil_moisture: soilMoisture,
      water_level: waterLevel,
    };
  }).filter(item => 
    item.time !== 'Invalid Date' &&
    (item.temperature > 0 || item.humidity > 0 || item.soil_moisture > 0 || item.water_level > 0)
  ) || [];

  // Show error banner but continue with data if available
  const showErrorBanner = error && !latestData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                IoT Sensor Dashboard
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <p>Real-time agricultural sensor monitoring</p>
                {lastRefreshTime && (
                  <span>•</span>
                )}
                {lastRefreshTime && (
                  <p>Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!refreshing && (
                <div className="text-sm text-gray-500">
                  Next refresh in {nextRefreshIn}s
                </div>
              )}
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {showErrorBanner && (
          <div className="mb-6">
            <Card className="border-red-200 bg-red-50 border-none shadow-xl">
              <CardContent className="py-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Connection Error</p>
                    <p className="text-red-600 text-sm">Unable to fetch live sensor data. Using fallback data for demonstration.</p>
                  </div>
                  <Button onClick={handleRefresh} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {!latestData && !error && (
          <div className="flex items-center justify-center py-12">
            <Card className="p-8 border-none shadow-xl">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto animate-spin" />
                <p className="text-gray-600">Loading sensor data...</p>
              </div>
            </Card>
          </div>
        )}

        {latestData && (
          <>
            {/* Status Card */}
            <div className="mb-8">
              <DeviceStatusCard 
                status={latestData.device_status} 
                lastUpdate={latestData.received_at}
                dataCount24h={historyData?.count || 0}
                isRealData={!error}
              />
            </div>

            {/* Statistics Overview */}
            {historyData && historyData.data && historyData.data.length > 0 && (
              <div className="mb-8">
                <StatisticsCard historyData={historyData} />
              </div>
            )}

            {/* Sensor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SensorCard
                title="Temperature"
                value={DataFormatter.validateSensorValue(latestData.temperature_c)}
                unit="°C"
                max={50}
                color="amber"
                icon={Thermometer}
                trend={2.5}
              />
              <SensorCard
                title="Humidity"
                value={DataFormatter.validateSensorValue(latestData.humidity_percent)}
                unit="%"
                max={100}
                color="blue"
                icon={Droplets}
                trend={-1.2}
              />
              <SensorCard
                title="Soil Moisture"
                value={DataFormatter.validateSensorValue(latestData.soil_moisture_percent)}
                unit="%"
                max={100}
                color="emerald"
                icon={Sprout}
                trend={3.7}
              />
              <SensorCard
                title="Water Level"
                value={DataFormatter.validateSensorValue(latestData.water_level_percent)}
                unit="%"
                max={100}
                color="cyan"
                icon={Gauge}
                trend={-0.8}
              />
            </div>

            {/* Charts */}
            {chartData.length > 0 && (
              <Card className="border-none shadow-xl bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    <span>Sensor History</span>
                  </CardTitle>
                  <CardDescription>
                    Last 50 readings from your IoT sensors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Temperature and Humidity Chart */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Temperature & Humidity</span>
                    </h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            tickLine={{ stroke: "#6b7280" }}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            tickLine={{ stroke: "#6b7280" }}
                          />
                          <Tooltip 
                            labelFormatter={(label) => `Time: ${label}`}
                            formatter={(value, name) => [
                              `${value}${String(name).includes('temperature') ? '°C' : '%'}`,
                              String(name).charAt(0).toUpperCase() + String(name).slice(1)
                            ]}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="temperature" 
                            stroke="#f59e0b" 
                            strokeWidth={3}
                            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                            name="temperature"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="humidity" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            name="humidity"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Soil and Water Chart */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      </div>
                      <span>Soil Moisture & Water Level</span>
                    </h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            tickLine={{ stroke: "#6b7280" }}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            tickLine={{ stroke: "#6b7280" }}
                          />
                          <Tooltip 
                            labelFormatter={(label) => `Time: ${label}`}
                            formatter={(value, name) => [
                              `${value}%`,
                              String(name).replace('_', ' ').charAt(0).toUpperCase() + String(name).replace('_', ' ').slice(1)
                            ]}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="soil_moisture" 
                            stroke="#10b981" 
                            fill="#10b981"
                            fillOpacity={0.3}
                            strokeWidth={2}
                            name="soil_moisture"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="water_level" 
                            stroke="#06b6d4" 
                            fill="#06b6d4"
                            fillOpacity={0.3}
                            strokeWidth={2}
                            name="water_level"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default IoTDashboard;