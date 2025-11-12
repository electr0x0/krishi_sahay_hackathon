'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bell, CheckCircle } from 'lucide-react';

interface SensorAlertsCardProps {
  data: any;
  actions?: Array<{ label: string; action: string; icon: string }>;
  onAction?: (action: string) => void;
}

const SensorAlertsCard: React.FC<SensorAlertsCardProps> = ({ data, actions, onAction }) => {
  const alerts = Array.isArray(data) ? data : data?.alerts || [];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
      <Card className="border-2 border-yellow-200 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center">
            <Bell className="w-5 h-5 mr-2 text-yellow-600" />
            সেন্সর সতর্কতা
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-gray-500">কোন সতর্কতা নেই</div>
          ) : (
            <div className="space-y-2 mb-4">
              {alerts.slice(0, 5).map((alert: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-gray-900">{alert.message || alert}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {actions && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-yellow-100">
              {actions.map((action, idx) => (
                <Button key={idx} variant="outline" size="sm" onClick={() => onAction && onAction(action.action)}>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SensorAlertsCard;
