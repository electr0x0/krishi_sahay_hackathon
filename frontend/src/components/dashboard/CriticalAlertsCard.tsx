'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  actionRequired: boolean;
}

export default function CriticalAlertsCard() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'urgent',
      title: 'পোকামাকড়ের আক্রমণ',
      message: '⚠️ সতর্কতা: আপনার এলাকায় মাজরা পোকার আক্রমণ দেখা গেছে। করণীয় জানতে এখানে ট্যাপ করুন।',
      timestamp: new Date(),
      actionRequired: true
    },
    {
      id: '2',
      type: 'warning',
      title: 'আবহাওয়া সতর্কতা',
      message: '🌧️ এই বিকেলে প্রবল বৃষ্টির সম্ভাবনা। সার বা কীটনাশক প্রয়োগ থেকে বিরত থাকুন।',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      actionRequired: false
    }
  ]);

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'urgent':
        return {
          border: 'border-l-4 border-red-500',
          bg: 'bg-gradient-to-r from-red-50 to-red-100',
          icon: '🚨',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          border: 'border-l-4 border-yellow-500',
          bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
          icon: '⚠️',
          textColor: 'text-yellow-800'
        };
      case 'info':
        return {
          border: 'border-l-4 border-blue-500',
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          icon: 'ℹ️',
          textColor: 'text-blue-800'
        };
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'এখনই';
    if (diffMins < 60) return `${diffMins} মিনিট আগে`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ঘন্টা আগে`;
    return `${Math.floor(diffHours / 24)} দিন আগে`;
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            🚨 জরুরি সতর্কতা
          </h2>
          <span className="text-sm text-gray-500">
            {alerts.length} টি সতর্কতা
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p>কোনো জরুরি সতর্কতা নেই</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const styles = getAlertStyles(alert.type);
            return (
              <div
                key={alert.id}
                className={`${styles.border} ${styles.bg} p-4 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1`}
                onClick={() => {
                  // Handle alert click - could navigate to details or open modal
                  console.log('Alert clicked:', alert.id);
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl flex-shrink-0">
                    {styles.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${styles.textColor} mb-1`}>
                      {alert.title}
                    </h3>
                    <p className={`text-sm ${styles.textColor} leading-relaxed`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-600">
                        {formatTimeAgo(alert.timestamp)}
                      </span>
                      {alert.actionRequired && (
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                          ব্যবস্থা নিন
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
