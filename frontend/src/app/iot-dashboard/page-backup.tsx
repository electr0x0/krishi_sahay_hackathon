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
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
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

// Enhanced Sensor Card component using Shadcn UI
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className={`h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 ${colors.bg}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-foreground">
                {value?.toFixed(1) || '0.0'}
              </span>
              <span className="text-lg text-muted-foreground">{unit}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{percentage.toFixed(0)}%</span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
              />
            </div>
            
            {trend !== undefined && TrendIcon && (
              <div className="flex items-center space-x-1">
                <TrendIcon className={`h-4 w-4 ${colors.trend}`} />
                <span className={`text-sm font-medium ${colors.trend}`}>
                  {Math.abs(trend).toFixed(1)}% vs last hour
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Max: {max}{unit}</span>
              {isHealthy ? (
                <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <CheckCircle className="h-3 w-3" />
                  Healthy
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  <AlertCircle className="h-3 w-3" />
                  Monitor
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Status indicator component
const DeviceStatusCard = ({ 
  status, 
  lastUpdate,
  dataCount24h = 0
}: { 
  status: string; 
  lastUpdate: string;
  dataCount24h?: number;
}) => {
  const isOnline = status === 'online';
  const lastUpdateTime = new Date(lastUpdate);
  const timeDiff = Date.now() - lastUpdateTime.getTime();
  const minutesAgo = Math.floor(timeDiff / (1000 * 60));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Activity className={`h-5 w-5 ${isOnline ? 'text-emerald-600' : 'text-red-500'}`} />
            <span>Device Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
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
              <p className="text-sm text-muted-foreground">
                Connection Status
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-foreground">
                  {minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Last Update
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="font-semibold text-foreground">
                  {dataCount24h}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Readings (24h)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-emerald-50/50">
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
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="space-y-1">
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-lg">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <CardTitle className="text-2xl mb-3 text-foreground">Connection Error</CardTitle>
            <CardDescription className="mb-6">
              Unable to connect to the sensor data API. Please check your connection and try again.
            </CardDescription>
            <Button
              onClick={handleRefresh}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/50">
      {/* Header */}
      <motion.div
        className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                IoT Sensor Dashboard
              </h1>
              <p className="text-muted-foreground">Real-time agricultural sensor monitoring</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="default"
              className="space-x-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {!latestData && !latestError && (
          <div className="flex items-center justify-center py-12">
            <Card className="p-8 border-none shadow-lg">
              <div className="text-center space-y-4">
                <motion.div
                  className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-muted-foreground">Loading sensor data...</p>
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
                dataCount24h={historyData?.data?.length || 0}
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
                value={Number(latestData.temperature_c) || 0}
                unit="°C"
                max={50}
                color="amber"
                icon={Thermometer}
                trend={2.5}
              />
              <SensorCard
                title="Humidity"
                value={Number(latestData.humidity_percent) || 0}
                unit="%"
                max={100}
                color="blue"
                icon={Droplets}
                trend={-1.2}
              />
              <SensorCard
                title="Soil Moisture"
                value={Number(latestData.soil_moisture_percent) || 0}
                unit="%"
                max={100}
                color="emerald"
                icon={Sprout}
                trend={3.7}
              />
              <SensorCard
                title="Water Level"
                value={Number(latestData.water_level_percent) || 0}
                unit="%"
                max={100}
                color="cyan"
                icon={Gauge}
                trend={-0.8}
              />
            </div>

            {/* Charts */}
            {chartData.length > 0 && chartData.every(item => item && typeof item === 'object') ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-none shadow-lg bg-gradient-to-br from-card to-muted/5">
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
                      <h4 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        </div>
                        <span>Temperature & Humidity</span>
                      </h4>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                              tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                              interval="preserveStartEnd"
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                              tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                            />
                            <Tooltip 
                              labelFormatter={(label) => `Time: ${label}`}
                              formatter={(value, name) => [
                                `${value}${String(name).includes('temperature') ? '°C' : '%'}`,
                                String(name).charAt(0).toUpperCase() + String(name).slice(1)
                              ]}
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px"
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
                      <h4 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                        </div>
                        <span>Soil Moisture & Water Level</span>
                      </h4>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                              tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                              interval="preserveStartEnd"
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                              tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                            />
                            <Tooltip 
                              labelFormatter={(label) => `Time: ${label}`}
                              formatter={(value, name) => [
                                `${value}%`,
                                String(name).replace('_', ' ').charAt(0).toUpperCase() + String(name).replace('_', ' ').slice(1)
                              ]}
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px"
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
              </motion.div>
            ) : historyData ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-none shadow-lg">
                  <CardContent className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="text-lg mb-2">No Chart Data Available</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                      {historyData?.data?.length === 0 
                        ? "No historical sensor data found. Start sending data from your ESP32 to see charts."
                        : "Chart data is invalid or corrupted. Please refresh the page or check your sensor data format."
                      }
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
