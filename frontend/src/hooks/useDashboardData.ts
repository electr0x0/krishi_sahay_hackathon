import { useState, useEffect } from 'react';
import api from '@/lib/api.js';

import { useAuth } from '@/contexts/AuthContext.jsx';

interface DashboardStats {
  total_farms: number;
  active_sensors: number;
  weather_alerts: number;
  market_trends: {
    price_changes: Record<string, number>;
    trending_crops: string[];
  };
  recent_activities: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

interface Alert {
  id: string;
  type: 'weather' | 'pest' | 'market' | 'sensor';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  action_required: boolean;
}

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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return;

      const location = user.district || 'Dhaka';

      try {
        setLoading(true);
        const weatherAlerts = await api.getWeatherAlerts(location);
        
        // The API returns a string, so we need to parse it or handle it.
        // For now, we'll create a single alert from the string response.
        const newAlerts = [];
        if (weatherAlerts && typeof weatherAlerts === 'string' && !weatherAlerts.startsWith('✅')) {
            newAlerts.push({
                id: 'weather-1',
                type: 'weather',
                severity: 'high', // Assuming all API alerts are high severity for now
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
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
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
              sensor_id: 'DHT22-001',
              sensor_type: 'DHT22',
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
              sensor_id: 'SOIL-001',
              sensor_type: 'Soil Moisture',
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
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
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
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        setLoading(true);
        const data = await api.safeRequest('/api/market/prices', {}, null);
        
        if (data) {
          setMarketPrices(data);
        } else {
          // Fallback dummy data
          setMarketPrices([
            {
              item: 'ধান',
              price: 32,
              unit: 'কেজি',
              market: 'শ্যামবাজার',
              date: new Date().toISOString(),
              trend: 'up',
              change_percentage: 5.2
            },
            {
              item: 'আলু',
              price: 28,
              unit: 'কেজি',
              market: 'কারওয়ান বাজার',
              date: new Date().toISOString(),
              trend: 'down',
              change_percentage: -2.1
            },
            {
              item: 'পেঁয়াজ',
              price: 55,
              unit: 'কেজি',
              market: 'নিউ মার্কেট',
              date: new Date().toISOString(),
              trend: 'up',
              change_percentage: 8.5
            }
          ]);
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