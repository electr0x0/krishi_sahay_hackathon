'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  MapPin
} from "lucide-react";
import api from '@/lib/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const generateFarmingAdvice = async (location: string) => {
    try {
      const response = await api.getWeatherRecommendations(location);
      if (response.success && response.ai_recommendations) {
        // The backend now returns parsed recommendations directly
        return response.ai_recommendations;
      }
      // Fallback to basic weather data if available
      return generateFallbackAdvice(response.current_weather, response.forecast);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return generateFallbackAdvice(null, null);
    }
  };

const generateFallbackAdvice = (current: any, forecast: any) => {
    const advice: { [key: string]: any } = {
      irrigation: { recommended: true, reason: 'আবহাওয়া শুষ্ক।', reasonEn: 'Weather is dry.'},
      spraying: { suitable: true, reason: 'বাতাস শান্ত।', reasonEn: 'Wind is calm.' },
      harvesting: { suitable: true, reason: 'আজ ফসল কাটার জন্য ভাল দিন।', reasonEn: 'Good day for harvesting.' },
      planting: { suitable: true, reason: 'মাটি প্রস্তুত।', reasonEn: 'Soil is ready.' },
    };

    if (!current || !forecast) return advice;

    if (current.main.temp > 32) {
      advice.irrigation = { recommended: true, reason: 'খুব গরম, সেচ প্রয়োজন।', reasonEn: 'Very hot, irrigation needed.' };
    }
    if (current.wind.speed > 5) { // 5 m/s is windy
      advice.spraying = { suitable: false, reason: 'বেশি বাতাস, স্প্রে করা থেকে বিরত থাকুন।', reasonEn: 'Too windy for spraying.' };
    }
    const willRainSoon = forecast.list.slice(0, 8).some((f: any) => f.weather[0].main === 'Rain');
    if (willRainSoon) {
      advice.harvesting = { suitable: false, reason: 'শীঘ্রই বৃষ্টি হবে, ফসল কাটা থেকে বিরত থাকুন।', reasonEn: 'Rain expected soon, avoid harvesting.' };
      advice.planting = { suitable: false, reason: 'বৃষ্টির আগে বীজ বপন করবেন না।', reasonEn: 'Do not plant before rain.' };
    }
    return advice;
  };


export default function SmartWeatherCard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [farmingAdvice, setFarmingAdvice] = useState<any>(null);
  const [weatherTranslations, setWeatherTranslations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!user) return;

      const location = user.district || 'Dhaka';

      try {
        setIsLoading(true);
        // Get AI-powered recommendations with weather data
        const aiResponse = await generateFarmingAdvice(location);
        setFarmingAdvice(aiResponse);
        
        // Also get the basic weather data for display
        const [current, forecastData] = await Promise.all([
          api.getWeatherData(location),
          api.getWeatherForecast(location, 5)
        ]);
        
        setCurrentWeather(current);
        setForecast(forecastData);
        
        // Get weather translations
        try {
          const translations = await api.getWeatherTranslations();
          setWeatherTranslations(translations.translations);
        } catch (e) {
          console.warn('Could not load weather translations');
        }
        setError(null);
      } catch (err) {
        setError("আবহাওয়ার তথ্য আনতে ব্যর্থ হয়েছে।");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [user]);

  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [selectedTab, setSelectedTab] = useState<'current' | 'forecast' | 'advice'>('current');

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return Sun;
      case 'clouds':
        return Cloud;
      case 'rain':
      case 'drizzle':
        return CloudRain;
      case 'thunderstorm':
        return CloudSnow;
      default:
        return Cloud;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
        case 'sunny':
        case 'clear':
            return 'text-yellow-500';
        case 'clouds':
            return 'text-gray-500';
        case 'rain':
        case 'drizzle':
            return 'text-blue-500';
        case 'thunderstorm':
            return 'text-purple-500';
        default:
            return 'text-gray-500';
    }
  };

    const tabs = [
    { id: 'current', label: language === 'bn' ? 'বর্তমান' : 'Current', icon: Thermometer },
    { id: 'forecast', label: language === 'bn' ? 'পূর্বাভাস' : 'Forecast', icon: Calendar },
    { id: 'advice', label: language === 'bn' ? 'পরামর্শ' : 'Advice', icon: TrendingUp }
  ];

  if (isLoading) {
    return <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 flex items-center justify-center h-full"><p>আবহাওয়ার তথ্য লোড হচ্ছে...</p></Card>;
  }

  if (error) {
    return <Card className="bg-red-50 p-6 flex items-center justify-center h-full"><p className="text-red-500">{error}</p></Card>;
  }

  if (!currentWeather || !forecast) {
    return <Card className="bg-gray-50 p-6 flex items-center justify-center h-full"><p>কোনো আবহাওয়ার তথ্য পাওয়া যায়নি।</p></Card>;
  }

  const { weather, main, wind, visibility } = currentWeather;
  const condition = weather[0].main;
  const conditionText = weather[0].description;
  const IconComponent = getWeatherIcon(condition);

  const dailyForecasts = forecast.list.reduce((acc: any, item: any) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('bn-BD', { weekday: 'long' });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  const processedForecast = Object.entries(dailyForecasts).map(([day, items]: any) => {
    const high = Math.max(...items.map((i: any) => i.main.temp_max));
    const low = Math.min(...items.map((i: any) => i.main.temp_min));
    const condition = items[Math.floor(items.length / 2)].weather[0].main;
    const conditionBn = items[Math.floor(items.length / 2)].weather[0].description;
    const rainChance = Math.max(...items.map((i: any) => i.pop)) * 100;
    return { day, dayEn: new Date(items[0].dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }), high, low, condition, conditionBn, rainChance };
  });

  return (
    <Card className="relative bg-white border-l-4 border-green-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl">
      
      <CardHeader className="pb-3 pt-5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 bg-green-600 rounded-xl shadow-md"
            >
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'bn' ? 'আবহাওয়া ও কৃষি পরামর্শ' : 'Weather & Farm Advice'}
              </h3>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                <p className="text-xs text-gray-600">
                  {currentWeather.name}, বাংলাদেশ 🇧🇩
                </p>
              </div>
            </div>
          </div>
          <motion.button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </motion.button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-5 pb-5 relative z-10">
        <div className="flex space-x-2 mb-5 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`relative flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center space-x-1.5 ${
                  selectedTab === tab.id
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {selectedTab === 'current' && (
            <motion.div
              key="current"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="flex items-center justify-center space-x-6 mb-6">
                  <div
                    className={`p-6 rounded-2xl bg-white shadow-lg ${getConditionColor(condition)}`}
                  >
                    <IconComponent className="w-20 h-20" />
                  </div>
                  <div>
                    <div 
                      className="text-7xl font-bold text-gray-900"
                    >
                      {Math.round(main.temp)}°
                    </div>
                    <p className="text-gray-600 font-medium mt-1">
                      {language === 'bn' ? 'অনুভূত' : 'Feels like'} {Math.round(main.feels_like)}°
                    </p>
                  </div>
                </div>
                <p 
                  className="text-lg text-gray-700 font-semibold capitalize bg-gray-50 px-4 py-2 rounded-lg inline-block border border-gray-200"
                >
                  {language === 'bn' && weatherTranslations && weatherTranslations[conditionText.toLowerCase()]
                    ? weatherTranslations[conditionText.toLowerCase()]
                    : conditionText
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {language === 'bn' ? 'আর্দ্রতা' : 'Humidity'}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {main.humidity}%
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Wind className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {language === 'bn' ? 'বাতাস' : 'Wind'}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {Math.round(wind.speed * 3.6)}
                    <span className="text-base ml-1">km/h</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {language === 'bn' ? 'দৃশ্যমানতা' : 'Visibility'}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {visibility / 1000}
                    <span className="text-base ml-1">km</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                      <Sun className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {language === 'bn' ? 'চাপ' : 'Pressure'}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {main.pressure}
                    <span className="text-base ml-1">hPa</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {selectedTab === 'forecast' && (
            <motion.div
              key="forecast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {processedForecast.map((day, index) => {
                const ForecastIcon = getWeatherIcon(day.condition);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-4 rounded-lg flex items-center justify-between border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <ForecastIcon className={`w-8 h-8 ${getConditionColor(day.condition)}`} />
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {language === 'bn' ? day.day : day.dayEn}
                        </h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {language === 'bn' 
                            ? (weatherTranslations && weatherTranslations[day.conditionBn.toLowerCase()]
                                ? weatherTranslations[day.conditionBn.toLowerCase()]
                                : day.conditionBn)
                            : day.condition
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">
                        {Math.round(day.high)}° / {Math.round(day.low)}°
                      </div>
                      <div className="text-sm text-blue-600">
                        🌧️ {Math.round(day.rainChance)}%
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {selectedTab === 'advice' && farmingAdvice && (
             <motion.div key="advice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
               {Object.entries(farmingAdvice).map(([activity, advice]: any, index) => {
                 const activityNames:any = {
                   irrigation: { bn: 'সেচ দেওয়া', en: 'Irrigation' },
                   spraying: { bn: 'স্প্রে করা', en: 'Spraying' },
                   harvesting: { bn: 'ফসল কাটা', en: 'Harvesting' },
                   planting: { bn: 'বীজ বপন', en: 'Planting' },
                   field_work: { bn: 'মাঠের কাজ', en: 'Field Work' },
                   'field work': { bn: 'মাঠের কাজ', en: 'Field Work' },
                   fertilizer_application: { bn: 'সার প্রয়োগ', en: 'Fertilizer Application' },
                   'fertilizer application': { bn: 'সার প্রয়োগ', en: 'Fertilizer Application' },
                   pest_control: { bn: 'পোকা নিয়ন্ত্রণ', en: 'Pest Control' },
                   'pest control': { bn: 'পোকা নিয়ন্ত্রণ', en: 'Pest Control' },
                   weeding: { bn: 'আগাছা দমন', en: 'Weeding' }
                 };

                 // Get the display name or use the activity key as fallback
                 const displayName = activityNames[activity] || { 
                   bn: activity.replace(/_/g, ' '), 
                   en: activity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
                 };

                 return (
                  <motion.div
                    key={activity}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      advice.recommended || advice.suitable
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${
                        advice.recommended || advice.suitable
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {advice.recommended || advice.suitable ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium mb-2 ${
                          advice.recommended || advice.suitable
                            ? 'text-green-800'
                            : 'text-red-800'
                        }`}>
                          {language === 'bn' 
                            ? displayName.bn
                            : displayName.en
                          }
                          <Badge className={`ml-2 text-xs ${
                            advice.recommended || advice.suitable
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}>
                            {advice.recommended || advice.suitable
                              ? (language === 'bn' ? 'উপযুক্ত' : 'Suitable')
                              : (language === 'bn' ? 'অনুপযুক্ত' : 'Not Suitable')
                            }
                          </Badge>
                        </h4>
                        <p className={`text-sm ${
                          advice.recommended || advice.suitable
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>
                          {language === 'bn' ? advice.reason : advice.reasonEn}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                 );
               })}
             </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <Clock className="w-3 h-3 mr-1" />
            {language === 'bn' ? 'সর্বশেষ আপডেট:' : 'Last updated:'} {new Date().toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}