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
  BarChart3,
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
  Calendar,
  Users,
  Globe,
  Zap,
  Eye,
  Wind,
  Gauge,
  Battery,
  Signal,
  Leaf,
  Minus,
} from "lucide-react"

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
    await loadRealTimeData()
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

  const sensorCards = [
    {
      title: "মাটির আর্দ্রতা",
      description: `${realTimeData.sensorData.soilMoisture}% (আদর্শ: ৬০-৮০%)`,
      icon: <Droplets className="h-4 w-4 text-blue-600" />,
      value: `${realTimeData.sensorData.soilMoisture}%`
    },
    {
      title: "তাপমাত্রা",
      description: `পরিবেশের তাপমাত্রা`,
      icon: <Thermometer className="h-4 w-4 text-red-600" />,
      value: `${realTimeData.sensorData.temperature}°C`
    },
    {
      title: "আর্দ্রতা",
      description: `বাতাসের আর্দ্রতা`,
      icon: <Wind className="h-4 w-4 text-cyan-600" />,
      value: `${realTimeData.sensorData.humidity}%`
    },
    {
      title: "আলোর তীব্রতা",
      description: `ফসলের জন্য পর্যাপ্ত আলো`,
      icon: <Sun className="h-4 w-4 text-yellow-600" />,
      value: `${Math.round(realTimeData.sensorData.lightIntensity / 1000)}k Lux`
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
              <h2 className="text-xl font-bold text-slate-900">সেন্সর ডেটা (রিয়েল-টাইম)</h2>
              <HoverEffect items={sensorCards} />
            </div>

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
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Battery className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-slate-700">ব্যাটারি</span>
                    </div>
                    <span className="font-bold text-slate-900">{realTimeData.sensorData.batteryLevel}%</span>
                  </div>
                  <Progress value={realTimeData.sensorData.batteryLevel} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Signal className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-slate-700">সিগন্যাল</span>
                    </div>
                    <span className="font-bold text-slate-900">{realTimeData.sensorData.signalStrength}%</span>
                  </div>
                  <Progress value={realTimeData.sensorData.signalStrength} className="h-2" />
                  
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500">শেষ আপডেট</p>
                    <p className="text-sm text-slate-900">
                      {new Date(realTimeData.sensorData.lastUpdated).toLocaleString('bn-BD')}
                    </p>
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
                      <p className="text-sm text-slate-600">pH মান</p>
                      <p className="text-2xl font-bold text-slate-900">{realTimeData.sensorData.ph}</p>
                      <Badge variant={realTimeData.sensorData.ph >= 6.0 && realTimeData.sensorData.ph <= 7.5 ? "default" : "destructive"} className="mt-1">
                        {realTimeData.sensorData.ph >= 6.0 && realTimeData.sensorData.ph <= 7.5 ? "আদর্শ" : "সমন্বয় প্রয়োজন"}
                      </Badge>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-600">পানির স্তর</p>
                      <p className="text-2xl font-bold text-slate-900">{realTimeData.sensorData.waterLevel}%</p>
                      <Badge variant={realTimeData.sensorData.waterLevel > 70 ? "default" : "destructive"} className="mt-1">
                        {realTimeData.sensorData.waterLevel > 70 ? "পর্যাপ্ত" : "কম"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
