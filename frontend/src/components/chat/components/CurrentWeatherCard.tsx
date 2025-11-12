'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CurrentWeatherCardProps {
  data: {
    location?: string;
    temperature?: number;
    temp?: number;
    condition?: string;
    description?: string;
    humidity?: number;
    wind_speed?: number;
    windSpeed?: number;
    visibility?: number;
    pressure?: number;
    feels_like?: number;
    feelsLike?: number;
  };
  actions?: Array<{
    type: string;
    label: string;
    icon?: string;
  }>;
  onActionClick?: (action: string) => void;
}

export default function CurrentWeatherCard({
  data,
  actions = [],
  onActionClick,
}: CurrentWeatherCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const temperature = data?.temperature ?? data?.temp ?? 0;
  const condition = data?.condition ?? data?.description ?? 'Unknown';
  const humidity = data?.humidity ?? 0;
  const windSpeed = data?.wind_speed ?? data?.windSpeed ?? 0;
  const feelsLike = data?.feels_like ?? data?.feelsLike ?? temperature;
  const visibility = data?.visibility ?? 0;
  const pressure = data?.pressure ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='w-full max-w-md'
    >
      <Card className='overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-white'>
        <CardHeader className='pb-2 pt-3 px-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Cloud className='h-8 w-8 text-green-600' />
              <div>
                <CardTitle className='text-base text-green-800'>
                  {data?.location || 'Current Location'}
                </CardTitle>
                <CardDescription className='text-xs'>Current Weather</CardDescription>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='h-7 px-2'
            >
              {isExpanded ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className='px-4 pb-3'>
          <div className='mb-3'>
            <div className='flex items-center justify-between'>
              <div className='text-3xl font-bold text-green-800'>
                {temperature.toFixed(1)}C
              </div>
              <div className='text-right'>
                <div className='text-sm font-medium text-green-700'>{condition}</div>
                <div className='text-xs text-green-600'>
                  Feels like {feelsLike.toFixed(1)}C
                </div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2 text-xs'>
            <div className='flex items-center gap-1 rounded-lg bg-white/50 p-2'>
              <Droplets className='h-4 w-4 text-green-600' />
              <div>
                <div className='text-green-600'>Humidity</div>
                <div className='font-semibold text-green-800'>{humidity}%</div>
              </div>
            </div>

            <div className='flex items-center gap-1 rounded-lg bg-white/50 p-2'>
              <Wind className='h-4 w-4 text-green-600' />
              <div>
                <div className='text-green-600'>Wind</div>
                <div className='font-semibold text-green-800'>{windSpeed} km/h</div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='overflow-hidden'
              >
                <div className='mt-2 grid grid-cols-2 gap-2 text-xs'>
                  <div className='flex items-center gap-1 rounded-lg bg-white/50 p-2'>
                    <Eye className='h-4 w-4 text-green-600' />
                    <div>
                      <div className='text-green-600'>Visibility</div>
                      <div className='font-semibold text-green-800'>{visibility} km</div>
                    </div>
                  </div>

                  <div className='flex items-center gap-1 rounded-lg bg-white/50 p-2'>
                    <Gauge className='h-4 w-4 text-green-600' />
                    <div>
                      <div className='text-green-600'>Pressure</div>
                      <div className='font-semibold text-green-800'>{pressure} hPa</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {actions.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-1.5'>
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
