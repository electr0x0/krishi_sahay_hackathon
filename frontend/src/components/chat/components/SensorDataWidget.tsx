'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Thermometer, Droplets, Activity, AlertCircle } from 'lucide-react';

interface SensorDataWidgetProps {
  data: {
    sensors?: Array<{
      temperature?: number;
      temp?: number;
      temperature_c?: number;
      humidity?: number;
      humidity_percent?: number;
      soil_moisture?: number;
      soilMoisture?: number;
      moisture?: number;
      soil_moisture_percent?: number;
      timestamp?: string;
      time?: string;
    }>;
    sensorData?: {
      temperature?: number;
      temp?: number;
      temperature_c?: number;
      humidity?: number;
      humidity_percent?: number;
      soil_moisture?: number;
      soilMoisture?: number;
      moisture?: number;
      soil_moisture_percent?: number;
    };
    temperature?: number;
    temp?: number;
    temperature_c?: number;
    humidity?: number;
    humidity_percent?: number;
    soil_moisture?: number;
    soilMoisture?: number;
    moisture?: number;
    soil_moisture_percent?: number;
  };
  actions?: Array<{
    type: string;
    label: string;
    icon?: string;
  }>;
  onActionClick?: (action: string) => void;
}

export default function SensorDataWidget({
  data,
  actions = [],
  onActionClick,
}: SensorDataWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse data if it's a JSON string
  let parsedData = data;
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = {};
    }
  }

  // Extract sensor data with multiple fallback paths
  let sensorData: any = {};
  
  if (parsedData?.sensors && Array.isArray(parsedData.sensors) && parsedData.sensors.length > 0) {
    sensorData = parsedData.sensors[0];
  } else if (parsedData?.sensorData) {
    sensorData = parsedData.sensorData;
  } else {
    sensorData = parsedData || {};
  }

  // Handle backend property names: temperature_c, humidity_percent, soil_moisture_percent
  const temperature = sensorData?.temperature_c ?? sensorData?.temperature ?? sensorData?.temp ?? 0;
  const humidity = sensorData?.humidity_percent ?? sensorData?.humidity ?? 0;
  const soilMoisture = sensorData?.soil_moisture_percent ?? sensorData?.soil_moisture ?? sensorData?.soilMoisture ?? sensorData?.moisture ?? 0;

  const getStatusColor = (value: number, type: 'temp' | 'humidity' | 'moisture') => {
    if (type === 'temp') {
      if (value < 15 || value > 35) return 'text-red-600';
      if (value < 20 || value > 30) return 'text-yellow-600';
      return 'text-green-600';
    }
    if (type === 'humidity') {
      if (value < 40 || value > 80) return 'text-red-600';
      if (value < 50 || value > 70) return 'text-yellow-600';
      return 'text-green-600';
    }
    if (type === 'moisture') {
      if (value < 30) return 'text-red-600';
      if (value < 40) return 'text-yellow-600';
      return 'text-green-600';
    }
    return 'text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='w-full max-w-md'
    >
      <Card className='overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-white'>
        <CardHeader className='pb-2 pt-3 px-4'>
          <div className='flex items-center gap-2'>
            <Activity className='h-8 w-8 text-green-600' />
            <div>
              <CardTitle className='text-base text-green-800'>Sensor Data</CardTitle>
              <CardDescription className='text-xs'>Live readings</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='px-4 pb-3 space-y-2'>
          <div className='grid grid-cols-3 gap-2'>
            <div className='rounded-lg bg-white/50 p-2'>
              <div className='flex items-center gap-1 mb-1'>
                <Thermometer className='h-4 w-4 text-green-600' />
                <span className='text-xs text-green-600'>Temp</span>
              </div>
              <div className={`text-lg font-bold ${getStatusColor(temperature, 'temp')}`}>
                {temperature.toFixed(1)}°C
              </div>
            </div>

            <div className='rounded-lg bg-white/50 p-2'>
              <div className='flex items-center gap-1 mb-1'>
                <Droplets className='h-4 w-4 text-green-600' />
                <span className='text-xs text-green-600'>Humidity</span>
              </div>
              <div className={`text-lg font-bold ${getStatusColor(humidity, 'humidity')}`}>
                {humidity.toFixed(0)}%
              </div>
            </div>

            <div className='rounded-lg bg-white/50 p-2'>
              <div className='flex items-center gap-1 mb-1'>
                <Droplets className='h-4 w-4 text-green-600' />
                <span className='text-xs text-green-600'>Soil</span>
              </div>
              <div className={`text-lg font-bold ${getStatusColor(soilMoisture, 'moisture')}`}>
                {soilMoisture.toFixed(0)}%
              </div>
            </div>
          </div>

          {actions.length > 0 && (
            <div className='flex flex-wrap gap-1.5 pt-1'>
              {actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant='outline'
                  size='sm'
                  onClick={() => onActionClick?.(action.type)}
                  className='h-7 border-green-300 bg-white text-xs text-green-700 hover:bg-green-50 hover:text-green-800'
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
