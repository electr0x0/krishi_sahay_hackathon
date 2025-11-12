'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Download, Lightbulb } from 'lucide-react';

interface DetectionInsightsCardProps {
  data: any;
  actions?: Array<{ label: string; action: string; icon: string }>;
  onAction?: (action: string) => void;
}

const DetectionInsightsCard: React.FC<DetectionInsightsCardProps> = ({ data, actions, onAction }) => {
  // Parse data if it's a string
  let parsedData = data;
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = {};
    }
  }

  // Extract history data
  const history = parsedData?.history || [];
  const totalDetections = parsedData?.total_detections || history.length || 0;
  
  // Calculate stats from history
  const totalDiseases = history.reduce((sum: number, item: any) => 
    sum + (item.diseases_found?.length || 0), 0
  );
  
  const avgConfidence = history.length > 0 
    ? Math.round(
        history.reduce((sum: number, item: any) => {
          const diseaseConfidences = item.diseases_found?.map((d: any) => d.confidence || 0) || [];
          const itemAvg = diseaseConfidences.length > 0 
            ? diseaseConfidences.reduce((a: number, b: number) => a + b, 0) / diseaseConfidences.length 
            : 0;
          return sum + itemAvg;
        }, 0) / history.length
      )
    : 0;

  const insights = parsedData?.insights || [];
  const stats = parsedData?.stats || {
    total: totalDetections,
    diseases: totalDiseases,
    accuracy: avgConfidence
  };

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'file-text': return <FileText className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'lightbulb': return <Lightbulb className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
      <Card className="overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-base font-bold text-green-800">সনাক্তকরণ বিশ্লেষণ</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {/* Stats Summary */}
          {stats && Object.keys(stats).length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white p-2 rounded-lg border border-green-200 text-center">
                <p className="text-xl font-bold text-green-600">{stats.total || 0}</p>
                <p className="text-xs text-green-600 mt-0.5">মোট সনাক্তকরণ</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-green-200 text-center">
                <p className="text-xl font-bold text-green-600">{stats.diseases || 0}</p>
                <p className="text-xs text-green-600 mt-0.5">রোগ পাওয়া গেছে</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-green-200 text-center">
                <p className="text-xl font-bold text-green-600">{stats.accuracy || 0}%</p>
                <p className="text-xs text-green-600 mt-0.5">নির্ভুলতা</p>
              </div>
            </div>
          )}

          {/* Detection History */}
          {history.length > 0 && (
            <div className="space-y-2 mb-3">
              {history.slice(0, 3).map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-2 rounded-lg border border-green-200">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-green-700">
                      {item.date} {item.time}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      {item.diseases_found?.length || 0} টি রোগ
                    </span>
                  </div>
                  {item.diseases_found && item.diseases_found.length > 0 && (
                    <div className="space-y-1">
                      {item.diseases_found.map((disease: any, dIdx: number) => (
                        <div key={dIdx} className="text-xs bg-green-50 p-1.5 rounded flex justify-between">
                          <span className="font-medium text-green-800">{disease.disease_name_bengali}</span>
                          <span className="text-green-600">{disease.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {insights.map((insight: any, idx: number) => (
                <div key={idx} className="bg-white p-2 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-900">{insight.text || insight}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-green-100">
              {actions.map((action, idx) => (
                <Button 
                  key={idx} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAction && onAction(action.action)} 
                  className="h-7 border-green-300 bg-white text-xs text-green-700 hover:bg-green-50 hover:text-green-800"
                >
                  {getActionIcon(action.icon)}
                  <span className="ml-1">{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DetectionInsightsCard;
