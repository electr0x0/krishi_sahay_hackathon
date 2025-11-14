'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnimatedStatsCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'orange' | 'purple' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

const colorVariants = {
  green: {
    bg: 'bg-green-600',
    light: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  blue: {
    bg: 'bg-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  orange: {
    bg: 'bg-orange-600',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  purple: {
    bg: 'bg-purple-600',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  red: {
    bg: 'bg-red-600',
    light: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
};

export default function AnimatedStatsCard({
  title,
  value,
  unit = '',
  icon: Icon,
  color = 'green',
  trend,
  delay = 0
}: AnimatedStatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const colors = colorVariants[color];
  
  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative bg-white rounded-2xl p-6 border ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}
    >
      {/* Background */}
      <div className={`absolute inset-0 ${colors.light} opacity-40`} />
      
      {/* Content */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
          <div className="flex items-baseline space-x-2">
            <motion.h3
              className="text-3xl font-bold text-gray-900"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: 'spring' }}
            >
              {typeof value === 'number' ? displayValue.toLocaleString('bn-BD') : value}
            </motion.h3>
            {unit && (
              <span className="text-lg text-gray-500 font-medium">{unit}</span>
            )}
          </div>
          
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.4 }}
              className="mt-2 flex items-center space-x-1"
            >
              <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">এই মাসে</span>
            </motion.div>
          )}
        </div>
        
        {/* Icon */}
        <motion.div
          className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center shadow-md`}
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
}

