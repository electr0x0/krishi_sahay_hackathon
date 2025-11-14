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
    bg: 'from-green-500 to-emerald-600',
    light: 'from-green-50 to-emerald-50',
    text: 'text-green-600',
    border: 'border-green-200',
    shadow: 'shadow-green-500/20',
  },
  blue: {
    bg: 'from-blue-500 to-cyan-600',
    light: 'from-blue-50 to-cyan-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    shadow: 'shadow-blue-500/20',
  },
  orange: {
    bg: 'from-orange-500 to-amber-600',
    light: 'from-orange-50 to-amber-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    shadow: 'shadow-orange-500/20',
  },
  purple: {
    bg: 'from-purple-500 to-violet-600',
    light: 'from-purple-50 to-violet-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    shadow: 'shadow-purple-500/20',
  },
  red: {
    bg: 'from-red-500 to-rose-600',
    light: 'from-red-50 to-rose-50',
    text: 'text-red-600',
    border: 'border-red-200',
    shadow: 'shadow-red-500/20',
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
      className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border ${colors.border} shadow-lg hover:shadow-xl ${colors.shadow} transition-all duration-300 overflow-hidden group`}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.light} opacity-50`} />
      
      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2316a34a' fill-opacity='1'%3E%3Cpath d='M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
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
        
        {/* Icon with gradient background */}
        <motion.div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg ${colors.shadow}`}
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
          whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
      </div>
      
      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
        style={{ skewX: '-20deg' }}
      />
    </motion.div>
  );
}

