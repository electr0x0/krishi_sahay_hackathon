'use client';

import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { useState } from 'react';

interface ChartData {
  month: string;
  yield: number;
  income: number;
}

const monthlyData: ChartData[] = [
  { month: 'জানু', yield: 65, income: 18000 },
  { month: 'ফেব্রু', yield: 70, income: 22000 },
  { month: 'মার্চ', yield: 75, income: 25000 },
  { month: 'এপ্রিল', yield: 80, income: 28000 },
  { month: 'মে', yield: 85, income: 32000 },
  { month: 'জুন', yield: 90, income: 35000 },
];

export default function PerformanceChartCard() {
  const [selectedMetric, setSelectedMetric] = useState<'yield' | 'income'>('yield');

  const maxValue = Math.max(...monthlyData.map(d => selectedMetric === 'yield' ? d.yield : d.income));

  return (
    <div className="relative bg-white/70 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden rounded-3xl">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/50"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">কর্মক্ষমতা চার্ট</h3>
              <p className="text-xs text-gray-500">গত ৬ মাসের ডেটা</p>
            </div>
          </div>

          {/* Metric Toggle */}
          <div className="flex bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setSelectedMetric('yield')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedMetric === 'yield'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ফলন
            </button>
            <button
              onClick={() => setSelectedMetric('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedMetric === 'income'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              আয়
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200/50"
          >
            <p className="text-xs text-gray-600 mb-1">মোট বৃদ্ধি</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-green-600">+38%</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-200/50"
          >
            <p className="text-xs text-gray-600 mb-1">সর্বোচ্চ</p>
            <p className="text-2xl font-bold text-blue-600">
              {selectedMetric === 'yield' ? '90%' : '৳35k'}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200/50"
          >
            <p className="text-xs text-gray-600 mb-1">গড়</p>
            <p className="text-2xl font-bold text-purple-600">
              {selectedMetric === 'yield' ? '77%' : '৳27k'}
            </p>
          </motion.div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
          <div className="flex items-end justify-between h-48 space-x-3">
            {monthlyData.map((data, index) => {
              const value = selectedMetric === 'yield' ? data.yield : data.income;
              const heightPercentage = (value / maxValue) * 100;

              return (
                <div key={data.month} className="flex-1 flex flex-col items-center">
                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1,
                      ease: 'easeOut',
                    }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative w-full bg-gradient-to-t from-green-500 via-emerald-500 to-teal-500 rounded-t-xl shadow-lg cursor-pointer group"
                  >
                    {/* Value tooltip */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {selectedMetric === 'yield' ? `${value}%` : `৳${value}`}
                    </motion.div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>

                  {/* Month label */}
                  <p className="text-xs text-gray-600 font-medium mt-3">
                    {data.month}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
            <span className="text-xs text-gray-600">
              {selectedMetric === 'yield' ? 'ফলনের হার' : 'মাসিক আয়'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">জানুয়ারি - জুন ২০২৫</span>
          </div>
        </div>
      </div>
    </div>
  );
}

