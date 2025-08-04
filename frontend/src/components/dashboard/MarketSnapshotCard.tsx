'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface CropPrice {
  name: string;
  price: number;
  unit: string;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
}

export default function MarketSnapshotCard() {
  const [primaryCrop, setPrimaryCrop] = useState<CropPrice>({
    name: 'আলু',
    price: 45,
    unit: 'কেজি',
    change: +8.5,
    trend: 'up'
  });

  const [otherCrops, setOtherCrops] = useState<CropPrice[]>([
    {
      name: 'টমেটো',
      price: 80,
      unit: 'কেজি',
      change: -5.2,
      trend: 'down'
    },
    {
      name: 'বেগুন',
      price: 35,
      unit: 'কেজি',
      change: +2.1,
      trend: 'up'
    }
  ]);

  const getTrendIcon = (trend: CropPrice['trend']) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '📊';
    }
  };

  const getTrendColor = (trend: CropPrice['trend']) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
    }
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          📊 বাজার দর
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Crop - Featured */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">আপনার প্রধান ফসল</h3>
            <span className="text-2xl">{getTrendIcon(primaryCrop.trend)}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-medium text-gray-700">
                {primaryCrop.name}
              </span>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ৳{primaryCrop.price}
                </div>
                <div className="text-sm text-gray-600">
                  প্রতি {primaryCrop.unit}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${getTrendColor(primaryCrop.trend)}`}>
                {formatChange(primaryCrop.change)}
              </span>
              <span className="text-xs text-gray-500">
                গত সপ্তাহের তুলনায়
              </span>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="mt-3 p-2 bg-white/70 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">AI পরামর্শ:</span> {
                primaryCrop.trend === 'up' 
                  ? 'এখন বিক্রির জন্য ভালো সময়। দাম বাড়ছে।'
                  : primaryCrop.trend === 'down'
                  ? 'আরো কিছুদিন অপেক্ষা করুন। দাম কমছে।'
                  : 'দাম স্থির। যেকোনো সময় বিক্রি করতে পারেন।'
              }
            </p>
          </div>
        </div>

        {/* Other Crops */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">অন্যান্য ফসলের দর</h4>
          {otherCrops.map((crop, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getTrendIcon(crop.trend)}</span>
                <span className="font-medium text-gray-700">{crop.name}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  ৳{crop.price}/{crop.unit}
                </div>
                <div className={`text-xs ${getTrendColor(crop.trend)}`}>
                  {formatChange(crop.change)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action */}
        <button 
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
          onClick={() => {/* Navigate to market page */}}
        >
          সব দর দেখুন 📱
        </button>

        {/* Last Updated */}
        <p className="text-xs text-gray-500 text-center">
          সর্বশেষ আপডেট: {new Date().toLocaleTimeString('bn-BD', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </CardContent>
    </Card>
  );
}
