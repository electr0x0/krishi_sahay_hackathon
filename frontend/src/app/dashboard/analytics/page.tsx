"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { BackgroundGradient, HoverEffect, Spotlight } from "@/components/ui/aceternity"
import { realTimeAnalytics, type RealTimeData } from "@/lib/real-time-analytics"
import api from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from '@/contexts/AuthContext.jsx'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  DollarSign,
  Sprout,
  MapPin,
  Droplets,
  Thermometer,
  Sun,
  CloudRain,
  AlertTriangle,
  CheckCircle,
  Brain,
  MessageSquare,
  RefreshCw,
  Send,
  Loader2,
  Target,
  Wind,
  Gauge,
  Battery,
  Signal,
  Leaf,
  Minus,
} from "lucide-react"

// Types for IoT sensor data
interface IoTSensorData {
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

// IoT Data Hook
function useIoTSensorData() {
  const [latestData, setLatestData] = useState<IoTSensorData | null>(null);
  const [historyData, setHistoryData] = useState<IoTSensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestData = async () => {
    try {
      const data = await api.getLatestSensorData();
      setLatestData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch latest sensor data:', err);
      setError('সেন্সর ডেটা লোড করতে ব্যর্থ হয়েছে');
    }
  };

  const fetchHistoryData = async () => {
    try {
      const response = await api.getSensorDataHistory({ limit: 24 });
      setHistoryData(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch sensor history:', err);
      setError('সেন্সর ইতিহাস লোড করতে ব্যর্থ হয়েছে');
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([fetchLatestData(), fetchHistoryData()]);
    setIsLoading(false);
  };

  useEffect(() => {
    const initData = async () => {
      await Promise.all([fetchLatestData(), fetchHistoryData()]);
      setIsLoading(false);
    };
    
    initData();
    
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchLatestData, 10000);
    return () => clearInterval(interval);
  }, []);

  return {
    latestData,
    historyData,
    isLoading,
    error,
    refreshData
  };
}

// Real-time Weather Card Component
function RealTimeWeatherCard() {
  const { user } = useAuth();
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return Sun;
      case 'clouds':
      case 'cloudy':
        return CloudRain;
      case 'rain':
      case 'drizzle':
        return CloudRain;
      default:
        return Sun;
    }
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!user) return;

      const location = user && typeof user === 'object' && 'district' in user 
        ? (user as { district?: string }).district || 'Dhaka'
        : 'Dhaka';

      try {
        setIsLoading(true);
        const [current, forecastData] = await Promise.all([
          api.getWeatherData(location),
          api.getWeatherForecast(location, 5)
        ]);
        
        setCurrentWeather(current);
        setForecast(forecastData);
        setError(null);
      } catch (err) {
        setError("আবহাওয়ার তথ্য আনতে ব্যর্থ হয়েছে।");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [user]);

  if (isLoading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2">আবহাওয়ার তথ্য লোড হচ্ছে...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !currentWeather || !forecast) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
        <CardContent className="p-6 flex items-center justify-center text-red-500">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error || "আবহাওয়ার তথ্য পাওয়া যায়নি।"}
        </CardContent>
      </Card>
    );
  }

  const { weather, main } = currentWeather;
  const conditionText = weather[0].description;

  // Process forecast data
  const dailyForecasts = forecast.list.reduce((acc: any, item: any) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('bn-BD', { weekday: 'long' });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  const processedForecast = Object.entries(dailyForecasts).slice(0, 3).map(([day, items]: any) => {
    const high = Math.max(...items.map((i: any) => i.main.temp_max));
    const low = Math.min(...items.map((i: any) => i.main.temp_min));
    const condition = items[Math.floor(items.length / 2)].weather[0].main;
    return { day, high, low, condition };
  });

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-slate-900">
          <Sun className="h-5 w-5 mr-2 text-yellow-600" />
          আবহাওয়া (রিয়েল-টাইম)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {Math.round(main.temp)}°C
            </p>
            <p className="text-sm text-slate-600 capitalize">
              {conditionText}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">আর্দ্রতা</p>
            <p className="text-lg font-bold text-slate-900">
              {main.humidity}%
            </p>
          </div>
        </div>
        
        <Separator className="bg-slate-200" />
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">আগামী দিনের পূর্বাভাস</p>
          {processedForecast.map((day, index) => {
            const WeatherIcon = getWeatherIcon(day.condition);
            return (
              <motion.div 
                key={index} 
                className="flex justify-between items-center p-2 bg-slate-50 rounded"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-2">
                  <WeatherIcon className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-700">{day.day}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-900">{Math.round(day.high)}°C</span>
                  <Badge variant="outline" className="text-xs border-slate-300 text-slate-700">
                    {day.condition}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [aiQuery, setAiQuery] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { latestData, historyData, error: ioTError, refreshData: refreshIoTData } = useIoTSensorData();

  const loadRealTimeData = async () => {
    setIsLoading(true)
    try {
      const data = await realTimeAnalytics.fetchRealTimeData()
      setRealTimeData(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to load real-time data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return
    
    setIsAiLoading(true)
    try {
      const response = await api.askAgent(aiQuery, {
        language: 'bn',
        user_context: {
          farm_data: realTimeData?.farmStats,
          sensor_data: realTimeData?.sensorData,
          market_data: realTimeData?.marketData,
          weather_data: realTimeData?.weatherData
        }
      })
      setAiResponse(response.response || "দুঃখিত, এই মুহূর্তে AI সহায়তা উপলব্ধ নেই।")
    } catch (error) {
      console.error("AI query failed:", error)
      setAiResponse("দুঃখিত, AI সহায়তায় সমস্যা হয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।")
    } finally {
      setIsAiLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    realTimeAnalytics.clearCache()
    await Promise.all([
      loadRealTimeData(),
      refreshIoTData()
    ])
    setRefreshing(false)
  }

  useEffect(() => {
    loadRealTimeData()
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadRealTimeData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
        <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
          <div className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600">
            ডেটা লোড করছি...
          </div>
          <p className="mt-4 font-normal text-base text-slate-600 max-w-lg text-center mx-auto">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4 text-blue-600" />
            খামারের তথ্য সংগ্রহ করা হচ্ছে
          </p>
        </div>
      </div>
    )
  }

  if (!realTimeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto" />
          <p className="text-slate-600">তথ্য লোড করতে সমস্যা হয়েছে</p>
          <Button onClick={loadRealTimeData} className="bg-blue-600 hover:bg-blue-700 text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            পুনরায় চেষ্টা করুন
          </Button>
        </div>
      </div>
    )
  }

  const overviewCards = [
    {
      title: "মোট ফসল",
      description: "সক্রিয় কৃষি এলাকা",
      icon: <Sprout className="h-4 w-4 text-emerald-600" />,
      value: realTimeData.farmStats.totalCrops
    },
    {
      title: "মোট জমি",
      description: "একর হিসাবে",
      icon: <MapPin className="h-4 w-4 text-blue-600" />,
      value: `${realTimeData.farmStats.totalArea} একর`
    },
    {
      title: "সুস্থ ফসল",
      description: "স্বাস্থ্যকর অবস্থায়",
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      value: `${realTimeData.farmStats.healthyCrops}/${realTimeData.farmStats.totalCrops}`
    },
    {
      title: "প্রত্যাশিত মূল্য",
      description: "বর্তমান বাজার মূল্যে",
      icon: <DollarSign className="h-4 w-4 text-orange-600" />,
      value: `৳${Math.round(realTimeData.marketData.totalValue / 1000)}k`
    }
  ]

  // Generate sensor cards with real IoT data or fallback to mock data
  const sensorCards = [
    {
      title: "মাটির আর্দ্রতা",
      description: `${latestData?.soil_moisture_percent || realTimeData.sensorData.soilMoisture}% (আদর্শ: ৬০-৮০%)`,
      icon: <Droplets className="h-4 w-4 text-blue-600" />,
      value: `${latestData?.soil_moisture_percent || realTimeData.sensorData.soilMoisture}%`,
      status: latestData ? (latestData.soil_moisture_percent >= 60 && latestData.soil_moisture_percent <= 80 ? 'good' : 'warning') : 'unknown'
    },
    {
      title: "তাপমাত্রা",
      description: `পরিবেশের তাপমাত্রা (হিট ইনডেক্স: ${latestData?.heat_index_c?.toFixed(1) || 'N/A'}°C)`,
      icon: <Thermometer className="h-4 w-4 text-red-600" />,
      value: `${latestData?.temperature_c || realTimeData.sensorData.temperature}°C`,
      status: latestData ? (latestData.temperature_c >= 20 && latestData.temperature_c <= 30 ? 'good' : 'warning') : 'unknown'
    },
    {
      title: "আর্দ্রতা",
      description: `বাতাসের আর্দ্রতা`,
      icon: <Wind className="h-4 w-4 text-cyan-600" />,
      value: `${latestData?.humidity_percent || realTimeData.sensorData.humidity}%`,
      status: latestData ? (latestData.humidity_percent >= 40 && latestData.humidity_percent <= 70 ? 'good' : 'warning') : 'unknown'
    },
    {
      title: "পানির স্তর",
      description: `জলাধারের পানির স্তর`,
      icon: <Gauge className="h-4 w-4 text-blue-500" />,
      value: `${latestData?.water_level_percent || realTimeData.sensorData.waterLevel || 0}%`,
      status: latestData ? (latestData.water_level_percent > 70 ? 'good' : latestData.water_level_percent > 40 ? 'warning' : 'critical') : 'unknown'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
      
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-lg relative z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-slate-700 hover:bg-slate-100">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">স্মার্ট কৃষি বিশ্লেষণ</h1>
                <p className="text-sm text-slate-600">AI চালিত রিয়েল-টাইম ডেটা বিশ্লেষণ</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <p className="text-xs text-slate-500">
                  শেষ আপডেট: {lastUpdated.toLocaleTimeString('bn-BD')}
                </p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={refreshing}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                আপডেট করুন
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-8 relative z-10">
        {/* Overview Cards with Aceternity Effect */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">খামারের সংক্ষিপ্ত তথ্য</h2>
          <HoverEffect items={overviewCards} />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
            <TabsTrigger value="overview" className="text-slate-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">সংক্ষিপ্ত</TabsTrigger>
            <TabsTrigger value="sensors" className="text-slate-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">সেন্সর</TabsTrigger>
            <TabsTrigger value="market" className="text-slate-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">বাজার</TabsTrigger>
            <TabsTrigger value="ai" className="text-slate-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">AI সহায়ক</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Farm Health Overview */}
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    খামারের স্বাস্থ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">গড় স্বাস্থ্য স্কোর</span>
                    <span className="text-2xl font-bold text-slate-900">{realTimeData.farmStats.avgHealth}%</span>
                  </div>
                  <Progress value={realTimeData.farmStats.avgHealth} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <motion.div 
                      className="text-center p-3 bg-green-50 rounded-lg border border-green-200"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <p className="text-sm text-slate-600">সুস্থ ফসল</p>
                      <p className="text-lg font-bold text-green-600">{realTimeData.farmStats.healthyCrops}</p>
                    </motion.div>
                    <motion.div 
                      className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AlertTriangle className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                      <p className="text-sm text-slate-600">সতর্কতা</p>
                      <p className="text-lg font-bold text-orange-600">
                        {realTimeData.farmStats.activeAlerts}
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Overview - Real Data */}
              <RealTimeWeatherCard />

              {/* AI Insights */}
              <div className="lg:col-span-2">
                <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-900">
                      <Brain className="h-5 w-5 mr-2 text-blue-600" />
                      AI পরামর্শ (রিয়েল-টাইম)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <AnimatePresence>
                        {realTimeData.aiInsights.map((insight, index) => (
                          <motion.div 
                            key={insight.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                          >
                            <div className={`p-1 rounded ${
                              insight.priority === 'critical' ? 'bg-red-100 text-red-600' :
                              insight.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <Target className="h-3 w-3" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-slate-900 text-sm">{insight.title}</p>
                                <Badge variant="outline" className={`text-xs ${
                                  insight.priority === 'critical' ? 'border-red-300 text-red-700 bg-red-50' :
                                  insight.priority === 'high' ? 'border-orange-300 text-orange-700 bg-orange-50' :
                                  insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                                  'border-blue-300 text-blue-700 bg-blue-50'
                                }`}>
                                  {insight.confidence}% নিশ্চিত
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">{insight.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-500">{insight.estimatedImpact}</span>
                                {insight.actionRequired && (
                                  <Badge variant="destructive" className="text-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-200">
                                    পদক্ষেপ প্রয়োজন
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sensors" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">সেন্সর ডেটা (রিয়েল-টাইম)</h2>
                <div className="flex items-center space-x-2">
                  {ioTError && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      সংযোগ সমস্যা
                    </Badge>
                  )}
                  {latestData && (
                    <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                      <Activity className="h-3 w-3 mr-1" />
                      লাইভ
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    শেষ আপডেট: {latestData ? new Date(latestData.received_at).toLocaleTimeString('bn-BD') : 'N/A'}
                  </Badge>
                </div>
              </div>
              <HoverEffect items={sensorCards} />
            </div>

            {/* Device Status and Connection Info */}
            {latestData && (
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    ডিভাইস স্ট্যাটাস
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-center mb-2">
                        {latestData.device_status === 'online' ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600">ডিভাইস স্ট্যাটাস</p>
                      <p className="text-lg font-bold text-slate-900 capitalize">{latestData.device_status}</p>
                    </div>
                    
                    <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-center mb-2">
                        {latestData.data_quality === 'good' ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : latestData.data_quality === 'fair' ? (
                          <AlertTriangle className="h-6 w-6 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600">ডেটা গুণমান</p>
                      <p className="text-lg font-bold text-slate-900 capitalize">{latestData.data_quality}</p>
                    </div>
                    
                    <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-center mb-2">
                        <Gauge className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="text-sm text-slate-600">সেন্সর ID</p>
                      <p className="text-lg font-bold text-slate-900">#{latestData.id}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <Thermometer className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">হিট ইনডেক্স</p>
                        <p className="text-2xl font-bold text-blue-900">{latestData.heat_index_c?.toFixed(1)}°C</p>
                        <p className="text-xs text-blue-700 mt-1">
                          {latestData.heat_index_c && latestData.heat_index_c > 32 
                            ? "⚠️ অত্যধিক গরম - সতর্কতা প্রয়োজন" 
                            : "✅ নিরাপদ তাপমাত্রা পরিসীমা"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Sensor Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900">
                    <Gauge className="h-5 w-5 mr-2 text-blue-600" />
                    সিস্টেম স্বাস্থ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Battery Level Simulation based on data quality */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Battery className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-slate-700">ব্যাটারি (আনুমানিক)</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {latestData ? (
                        latestData.data_quality === 'good' ? '85%' :
                        latestData.data_quality === 'fair' ? '60%' : '30%'
                      ) : `${realTimeData.sensorData.batteryLevel}%`}
                    </span>
                  </div>
                  <Progress value={
                    latestData ? (
                      latestData.data_quality === 'good' ? 85 :
                      latestData.data_quality === 'fair' ? 60 : 30
                    ) : realTimeData.sensorData.batteryLevel
                  } className="h-2" />
                  
                  {/* Signal Strength based on device status */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Signal className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-slate-700">সিগন্যাল</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {latestData ? (latestData.device_status === 'online' ? '92%' : '0%') : `${realTimeData.sensorData.signalStrength}%`}
                    </span>
                  </div>
                  <Progress value={
                    latestData ? (latestData.device_status === 'online' ? 92 : 0) : realTimeData.sensorData.signalStrength
                  } className="h-2" />
                  
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500">শেষ আপডেট</p>
                    <p className="text-sm text-slate-900">
                      {latestData 
                        ? new Date(latestData.received_at).toLocaleString('bn-BD')
                        : new Date(realTimeData.sensorData.lastUpdated).toLocaleString('bn-BD')
                      }
                    </p>
                    {latestData && (
                      <p className="text-xs text-slate-500 mt-1">
                        রিডিং: {new Date(latestData.timestamp).toLocaleString('bn-BD')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900">
                    <Leaf className="h-5 w-5 mr-2 text-green-600" />
                    মাটির গুণমান
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-600">pH মান (আনুমানিক)</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {latestData ? (
                          // Estimate pH based on soil moisture
                          latestData.soil_moisture_percent > 70 ? '6.8' :
                          latestData.soil_moisture_percent > 50 ? '6.5' :
                          latestData.soil_moisture_percent > 30 ? '6.2' : '5.9'
                        ) : realTimeData.sensorData.ph}
                      </p>
                      <Badge variant={
                        latestData ? (
                          latestData.soil_moisture_percent > 50 ? "default" : "destructive"
                        ) : (realTimeData.sensorData.ph >= 6.0 && realTimeData.sensorData.ph <= 7.5 ? "default" : "destructive")
                      } className="mt-1">
                        {latestData ? (
                          latestData.soil_moisture_percent > 50 ? "আদর্শ" : "সমন্বয় প্রয়োজন"
                        ) : (realTimeData.sensorData.ph >= 6.0 && realTimeData.sensorData.ph <= 7.5 ? "আদর্শ" : "সমন্বয় প্রয়োজন")}
                      </Badge>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-600">পানির স্তর</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {latestData?.water_level_percent || realTimeData.sensorData.waterLevel}%
                      </p>
                      <Badge variant={
                        (latestData?.water_level_percent || realTimeData.sensorData.waterLevel) > 70 ? "default" : "destructive"
                      } className="mt-1">
                        {(latestData?.water_level_percent || realTimeData.sensorData.waterLevel) > 70 ? "পর্যাপ্ত" : "কম"}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Soil Moisture Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-slate-700">মাটির আর্দ্রতা স্তর</p>
                      <span className="text-sm text-slate-600">
                        {latestData?.soil_moisture_percent || realTimeData.sensorData.soilMoisture}%
                      </span>
                    </div>
                    <Progress 
                      value={latestData?.soil_moisture_percent || realTimeData.sensorData.soilMoisture} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>শুষ্ক (0%)</span>
                      <span>আদর্শ (60-80%)</span>
                      <span>অতিরিক্ত (100%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historical Data Chart */}
            {historyData.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900">
                    <Activity className="h-5 w-5 mr-2 text-purple-600" />
                    সেন্সর ট্রেন্ড (গত ২৪ ঘন্টা)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Recent readings summary */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-700">সাম্প্রতিক রিডিং</h4>
                      {historyData.slice(0, 5).map((reading, index) => (
                        <motion.div 
                          key={reading.id}
                          className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div>
                            <p className="text-xs text-slate-500">
                              {new Date(reading.timestamp).toLocaleTimeString('bn-BD')}
                            </p>
                            <div className="flex space-x-4 text-sm">
                              <span>🌡️ {reading.temperature_c}°C</span>
                              <span>💧 {reading.humidity_percent}%</span>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div>🌱 {reading.soil_moisture_percent}%</div>
                            <div>💧 {reading.water_level_percent}%</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Stats summary */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-700">পরিসংখ্যান (গত ২৪ ঘন্টা)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-red-50 rounded border border-red-200">
                          <p className="text-xs text-red-600">গড় তাপমাত্রা</p>
                          <p className="text-lg font-bold text-red-700">
                            {(historyData.reduce((sum, r) => sum + r.temperature_c, 0) / historyData.length).toFixed(1)}°C
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-600">গড় আর্দ্রতা</p>
                          <p className="text-lg font-bold text-blue-700">
                            {(historyData.reduce((sum, r) => sum + r.humidity_percent, 0) / historyData.length).toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded border border-green-200">
                          <p className="text-xs text-green-600">গড় মাটির আর্দ্রতা</p>
                          <p className="text-lg font-bold text-green-700">
                            {(historyData.reduce((sum, r) => sum + r.soil_moisture_percent, 0) / historyData.length).toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-3 bg-cyan-50 rounded border border-cyan-200">
                          <p className="text-xs text-cyan-600">গড় পানির স্তর</p>
                          <p className="text-lg font-bold text-cyan-700">
                            {(historyData.reduce((sum, r) => sum + r.water_level_percent, 0) / historyData.length).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State for IoT */}
            {ioTError && !latestData && (
              <Card className="bg-red-50 border-red-200 shadow-xl">
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-red-700 mb-2">সেন্সর সংযোগ সমস্যা</h3>
                    <p className="text-red-600 mb-4">{ioTError}</p>
                    <Button 
                      onClick={refreshIoTData}
                      variant="outline" 
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      পুনরায় চেষ্টা করুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Market Performance */}
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-slate-900">
                    <span className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      বাজার কর্মক্ষমতা
                    </span>
                    <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                      +{realTimeData.marketData.priceChange}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {realTimeData.marketData.topPerformers.map((crop, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div>
                          <p className="font-medium text-slate-900">{crop.name}</p>
                          <p className="text-sm text-slate-600">৳{crop.price} প্রতি {crop.unit} - {crop.market}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            {crop.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : crop.trend === 'down' ? (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : (
                              <Minus className="h-4 w-4 text-slate-500" />
                            )}
                            <span className={`text-sm font-bold ${
                              crop.change > 0 ? 'text-green-600' : 
                              crop.change < 0 ? 'text-red-600' : 'text-slate-600'
                            }`}>
                              {crop.change > 0 ? '+' : ''}{crop.change}%
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Market Recommendations */}
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    AI বাজার পরামর্শ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {realTimeData.marketData.aiRecommendations.length > 0 ? (
                      realTimeData.marketData.aiRecommendations.map((rec, index) => (
                        <motion.div 
                          key={index}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium text-slate-900">{rec.product_name}</p>
                            <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                              {rec.confidence}% নিশ্চিত
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-700">{rec.reasoning}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs text-slate-500">প্রস্তাবিত: ৳{rec.suggested_price}</span>
                            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                              {rec.recommendation}
                            </Badge>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">AI পরামর্শ তৈরি হচ্ছে...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Summary */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                  বাজার সারসংক্ষেপ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">মোট প্রত্যাশিত মূল্য</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ৳{realTimeData.marketData.totalValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">গড় দামের পরিবর্তন</p>
                    <p className={`text-2xl font-bold ${
                      realTimeData.marketData.priceChange > 0 ? 'text-green-600' : 
                      realTimeData.marketData.priceChange < 0 ? 'text-red-600' : 'text-slate-900'
                    }`}>
                      {realTimeData.marketData.priceChange > 0 ? '+' : ''}{realTimeData.marketData.priceChange}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">জনপ্রিয় ফসল</p>
                    <p className="text-lg font-bold text-slate-900">
                      {realTimeData.marketData.trendingProducts.length}টি
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            {/* AI Chat Interface */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  AI কৃষি পরামর্শদাতা (রিয়েল-টাইম ডেটা সহ)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="আপনার প্রশ্ন লিখুন..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
                    className="bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button 
                    onClick={handleAiQuery}
                    disabled={isAiLoading || !aiQuery.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isAiLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    প্রশ্ন করুন
                  </Button>
                </div>

                {aiResponse && (
                  <motion.div 
                    className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start space-x-2">
                      <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm mb-2 text-slate-900">AI পরামর্শ:</p>
                        <p className="text-sm leading-relaxed text-slate-700">{aiResponse}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-slate-900">দ্রুত প্রশ্ন:</h4>
                    <div className="space-y-2">
                      {[
                        "আমার খামারের বর্তমান অবস্থা কেমন?",
                        "কখন সেচ দেওয়া উচিত?",
                        "বাজারে কোন ফসলের দাম ভালো?",
                        "আবহাওয়া অনুযায়ী কী করণীয়?",
                        "মাটির pH কমানোর উপায় কী?",
                        "আগামী সপ্তাহের জন্য পরামর্শ দিন"
                      ].map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                          onClick={() => setAiQuery(question)}
                        >
                          <MessageSquare className="h-3 w-3 mr-2" />
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-slate-900">বর্তমান ডেটা সংক্ষেপ:</h4>
                    <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                      <p>• মোট ফসল: {realTimeData.farmStats.totalCrops}টি</p>
                      <p>• জমির পরিমাণ: {realTimeData.farmStats.totalArea} একর</p>
                      <p>• মাটির আর্দ্রতা: {realTimeData.sensorData.soilMoisture}%</p>
                      <p>• তাপমাত্রা: {realTimeData.sensorData.temperature}°C</p>
                      <p>• pH: {realTimeData.sensorData.ph}</p>
                      <p>• বাজার মূল্য: ৳{Math.round(realTimeData.marketData.totalValue / 1000)}k</p>
                      <p>• সতর্কতা: {realTimeData.farmStats.activeAlerts}টি</p>
                      <p>• শেষ আপডেট: {new Date(realTimeData.sensorData.lastUpdated).toLocaleTimeString('bn-BD')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
