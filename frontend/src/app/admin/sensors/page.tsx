'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Wifi, WifiOff, Battery, BatteryCharging, MapPin } from 'lucide-react';

interface Sensor {
  id: number;
  sensor_id: string;
  user_id: number;
  user_name: string;
  location: string;
  status: string;
  battery_level: number;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  last_reading: string;
}

export default function SensorsMonitoring() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      // Import the API service
      const apiModule = await import('@/lib/api.js');
      const api = apiModule.default;
      const token = api.getToken();
      
      if (!token) {
        console.error('No token found - user not authenticated');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/admin/sensors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSensors(data);
      } else {
        console.error('Failed to fetch sensors:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch sensors:', error);
    } finally {
      setLoading(false);
    }
  };

  const onlineSensors = sensors.filter(s => s.status === 'online').length;
  const offlineSensors = sensors.filter(s => s.status === 'offline').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">IoT Sensor Monitoring</h1>
        <p className="text-gray-600 mt-1">Real-time status of all registered sensors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sensors</p>
              <p className="text-2xl font-bold">{sensors.length}</p>
            </div>
            <Cpu className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Online</p>
              <p className="text-2xl font-bold text-green-600">{onlineSensors}</p>
            </div>
            <Wifi className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Offline</p>
              <p className="text-2xl font-bold text-red-600">{offlineSensors}</p>
            </div>
            <WifiOff className="w-8 h-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-bold">98.7%</p>
            </div>
            <BatteryCharging className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Sensors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-center py-12 text-gray-500">Loading sensors...</p>
        ) : sensors.length === 0 ? (
          <p className="col-span-full text-center py-12 text-gray-500">No sensors found</p>
        ) : (
          sensors.map((sensor) => (
            <Card key={sensor.id} className="p-5 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    sensor.status === 'online' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Cpu className={`w-5 h-5 ${
                      sensor.status === 'online' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{sensor.sensor_id}</p>
                    <p className="text-xs text-gray-500">{sensor.user_name}</p>
                  </div>
                </div>
                <Badge 
                  variant={sensor.status === 'online' ? 'default' : 'secondary'}
                  className={sensor.status === 'online' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                  }
                >
                  {sensor.status}
                </Badge>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{sensor.location}</span>
              </div>

              {/* Readings */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Temperature</span>
                  <span className="font-medium">{sensor.temperature}°C</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Humidity</span>
                  <span className="font-medium">{sensor.humidity}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Soil Moisture</span>
                  <span className="font-medium">{sensor.soil_moisture}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Battery</span>
                  <span className={`font-medium ${
                    sensor.battery_level > 50 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {sensor.battery_level}%
                  </span>
                </div>
              </div>

              {/* Last Reading */}
              <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                Last reading: {new Date(sensor.last_reading).toLocaleString()}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
