import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MarketPriceDisplay,
  MarketPrice,
  SensorDataDisplay,
  WeatherDataDisplay,
  AlertType,
  DashboardStats,
  AIPriceRecommendation,
  MarketForecast,
  MarketInsights,
  PriceComparison
} from '@/types';

// Dashboard stats hook

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.safeRequest('/api/dashboard/stats', {}, null);
        
        if (data) {
          setStats(data);
        } else {
          // Fallback to dummy data if API fails
          setStats({
            total_farms: 150,
            active_sensors: 45,
            weather_alerts: 3,
            market_trends: {
              price_changes: {
                'rice': 5.2,
                'wheat': -2.1,
                'potato': 8.5,
                'onion': -3.4
              },
              trending_crops: ['rice', 'potato', 'tomato']
            },
            recent_activities: [
              {
                type: 'sensor',
                message: 'নতুন সেন্সর ডেটা আপডেট হয়েছে',
                timestamp: new Date().toISOString()
              }
            ]
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
        // Fallback data
        setStats({
          total_farms: 150,
          active_sensors: 45,
          weather_alerts: 3,
          market_trends: {
            price_changes: { 'rice': 5.2, 'wheat': -2.1 },
            trending_crops: ['rice', 'potato']
          },
          recent_activities: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error, refetch: () => setLoading(true) };
};




export const useCriticalAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return;

      // const location = 'Dhaka'; // Default location since user.district doesn't exist

      try {
        setLoading(true);
        const weatherAlerts = await api.getWeatherAlerts('Dhaka'); // Default location
        
        // The API returns a string, so we need to parse it or handle it.
        // For now, we'll create a single alert from the string response.
        const newAlerts: AlertType[] = [];
        if (weatherAlerts && typeof weatherAlerts === 'string' && !weatherAlerts.startsWith('✅')) {
            newAlerts.push({
                id: 'weather-1',
                type: 'weather' as const,
                severity: 'high' as const, // Assuming all API alerts are high severity for now
                title: 'আবহাওয়া সতর্কতা',
                message: weatherAlerts,
                timestamp: new Date().toISOString(),
                action_required: true,
            });
        }
        
        // Here you could also fetch other types of alerts (pest, market) and combine them
        setAlerts(newAlerts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [user]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return { alerts, loading, error, dismissAlert };
};

export const useSensorData = () => {
  const [sensorData, setSensorData] = useState<SensorDataDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setLoading(true);
        const data = await api.safeRequest('/api/iot/sensors/data', {}, null);
        
        if (data) {
          setSensorData(data);
        } else {
          // Fallback dummy data
          setSensorData([
            {
              id: '1',
              sensor_id: 'DHT22-001',
              sensor_type: 'DHT22',
              type: 'temperature',
              value: 28.5,
              unit: '°C',
              location: 'Field A',
              data: {
                temperature: 28.5,
                humidity: 65.2
              },
              timestamp: new Date().toISOString(),
              battery_level: 85,
              signal_strength: 92
            },
            {
              id: '2',
              sensor_id: 'SOIL-001',
              sensor_type: 'Soil Moisture',
              type: 'moisture',
              value: 45.8,
              unit: '%',
              location: 'Field B',
              data: {
                soil_moisture: 45.8
              },
              timestamp: new Date().toISOString(),
              battery_level: 78,
              signal_strength: 88
            }
          ]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sensor data');
        setSensorData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchSensorData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return { sensorData, loading, error, refetch: () => setLoading(true) };
};

export const useWeatherData = (location?: string) => {
  const [weatherData, setWeatherData] = useState<WeatherDataDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const data = await api.safeRequest(`/api/weather/current${location ? `?location=${encodeURIComponent(location)}` : ''}`, {}, null);
        
        if (data) {
          setWeatherData(data);
        } else {
          // Fallback dummy data
          setWeatherData({
            location: location || 'Dhaka',
            current: {
              temperature: 32,
              humidity: 75,
              condition: 'Partly Cloudy',
              wind_speed: 12,
              precipitation: 0
            },
            forecast: [
              {
                date: new Date().toISOString().split('T')[0],
                high: 34,
                low: 26,
                condition: 'Sunny',
                precipitation_chance: 10
              },
              {
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                high: 31,
                low: 24,
                condition: 'Rainy',
                precipitation_chance: 80
              }
            ]
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location]);

  return { weatherData, loading, error, refetch: () => setLoading(true) };
};

export const useMarketPrices = () => {
  const [marketPrices, setMarketPrices] = useState<MarketPriceDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        setLoading(true);
        const data: MarketPrice[] = await api.safeRequest('/api/market/prices', {}, null);
        
        if (data && Array.isArray(data)) {
          // Transform backend data to frontend display format
          const transformedData: MarketPriceDisplay[] = data.map(item => ({
            item: item.product_name_bn,
            price: item.current_price,
            unit: item.unit,
            market: item.market_name,
            date: item.price_date,
            trend: item.trend || 'stable',
            change_percentage: item.price_change_percentage || 0
          }));
          setMarketPrices(transformedData);
        } else {
          // If no data available, show error instead of fallback
          setError('কোন বাজার দরের তথ্য পাওয়া যায়নি। পরে আবার চেষ্টা করুন।');
          setMarketPrices([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market prices');
        setMarketPrices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketPrices();
  }, []);

  return { marketPrices, loading, error, refetch: () => setLoading(true) };
};

// Comprehensive market prices hook for the market page
export const useAllMarketPrices = (category?: string, district?: string) => {
  const [marketPrices, setMarketPrices] = useState<MarketPriceDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAllMarketPrices = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setIsRefreshing(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (district && district !== 'all') params.append('district', district);
      params.append('limit', '100'); // Get more items for the market page
      
      const queryString = params.toString();
      const endpoint = `/api/market/prices${queryString ? `?${queryString}` : ''}`;
      
      const data: MarketPrice[] = await api.safeRequest(endpoint, {}, null);
      
      if (data && Array.isArray(data)) {
        // Transform backend data to frontend display format
        const transformedData: MarketPriceDisplay[] = data.map(item => ({
          item: item.product_name_bn,
          price: item.current_price,
          unit: item.unit,
          market: item.market_name,
          date: item.price_date,
          trend: item.trend || 'stable',
          change_percentage: item.price_change_percentage || 0,
          category: item.category
        }));
        setMarketPrices(transformedData);
        setError(null);
      } else {
        // If no data available, show error
        setError('কোন বাজার দরের তথ্য পাওয়া যায়নি। পরে আবার চেষ্টা করুন।');
        setMarketPrices([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market prices');
      setMarketPrices([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllMarketPrices();
  }, [category, district]);

  const refetch = () => {
    if (!loading && !isRefreshing) {
      fetchAllMarketPrices(false);
    }
  };

  return { 
    marketPrices, 
    loading: loading || isRefreshing, 
    error, 
    refetch 
  };
};

// AI-powered price recommendation hook
export const useAIPriceRecommendation = () => {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState<AIPriceRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendation = async (productName: string, currentPrice: number, unit: string = 'kg') => {
    if (!user || !productName || currentPrice <= 0) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.safeRequest('/api/market/ai-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          current_price: currentPrice,
          unit: unit
        })
      }, null);

      if (response) {
        setRecommendation(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI recommendation');
    } finally {
      setLoading(false);
    }
  };

  return { recommendation, loading, error, getRecommendation };
};

// Market forecast hook
export const useMarketForecast = () => {
  const { user } = useAuth();
  const [forecast, setForecast] = useState<MarketForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getForecast = async (productName: string, days: number = 7) => {
    if (!user || !productName) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.safeRequest(`/api/market/ai-forecast/${encodeURIComponent(productName)}?days=${days}`, {}, null);

      if (response) {
        setForecast(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get market forecast');
    } finally {
      setLoading(false);
    }
  };

  return { forecast, loading, error, getForecast };
};

// Market insights hook
export const useMarketInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (category?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const endpoint = category ? `/api/market/ai-insights?category=${category}` : '/api/market/ai-insights';
      const response = await api.safeRequest(endpoint, {}, null);

      if (response) {
        setInsights(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get market insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user]);

  return { insights, loading, error, refetch: fetchInsights };
};

// Price comparison hook
export const usePriceComparison = () => {
  const { user } = useAuth();
  const [comparison, setComparison] = useState<PriceComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const comparePrice = async (productName: string, userPrice: number, unit: string = 'kg', location: string = 'dhaka') => {
    if (!user || !productName || userPrice <= 0) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.safeRequest('/api/market/ai-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          user_price: userPrice,
          unit: unit,
          location: location
        })
      }, null);

      if (response) {
        setComparison(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare prices');
    } finally {
      setLoading(false);
    }
  };

  return { comparison, loading, error, comparePrice };
};