'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Leaf, CalendarPlus, Bell, Download } from 'lucide-react';

interface CropCalendarCardProps {
  data: any;
  actions?: Array<{ label: string; action: string; icon: string }>;
  onAction?: (action: string) => void;
}

const CropCalendarCard: React.FC<CropCalendarCardProps> = ({ data, actions, onAction }) => {
  const events = data?.events || data?.schedule || [];
  const crop = data?.crop || 'ফসল';

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar-plus': return <CalendarPlus className="w-4 h-4" />;
      case 'bell': return <Bell className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
      <Card className="border-2 border-teal-200 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">ফসল ক্যালেন্ডার</CardTitle>
              <p className="text-sm text-gray-600">{crop}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {events.length === 0 ? (
              <div className="text-center py-6 text-gray-500">কোন ক্যালেন্ডার ইভেন্ট নেই</div>
            ) : (
              events.map((event: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Leaf className="w-5 h-5 text-teal-600 mr-2" />
                      <div>
                        <p className="font-semibold text-gray-900">{event.title || event.name}</p>
                        <p className="text-xs text-gray-500">{event.date || event.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-teal-100">
              {actions.map((action, idx) => (
                <Button key={idx} variant="outline" size="sm" onClick={() => onAction && onAction(action.action)} className="border-teal-200 text-teal-700 hover:bg-teal-50">
                  {getActionIcon(action.icon)}
                  <span className="ml-2 text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CropCalendarCard;
