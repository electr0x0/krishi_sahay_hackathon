'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Cloud, Bug, TrendingUp, Clock, ChevronRight, X, Loader2, Wifi } from "lucide-react";
import { useCriticalAlerts } from "@/hooks/useDashboardData";

export default function CriticalAlertsCard() {
  const { alerts, loading, error, dismissAlert } = useCriticalAlerts();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'pest': 
        return <Bug className="w-3 h-3 text-white" />;
      case 'weather': 
        return <Cloud className="w-3 h-3 text-white" />;
      case 'market': 
        return <TrendingUp className="w-3 h-3 text-white" />;
      case 'sensor':
        return <Wifi className="w-3 h-3 text-white" />;
      default: 
        return <AlertTriangle className="w-3 h-3 text-white" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-orange-400';
      case 'low': return 'bg-yellow-400';
      default: return 'bg-gray-400';
    }
  };

  const getSeverityBadgeVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeLabel = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'জরুরি';
      case 'high': return 'উচ্চ';
      case 'medium': return 'মাঝারি';
      case 'low': return 'কম';
      default: return 'সাধারণ';
    }
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'এখনই';
    if (diffInMinutes < 60) return `${diffInMinutes} মিনিট আগে`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ঘন্টা আগে`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} দিন আগে`;
  };

  return (
    <Card className="h-full bg-white/70 backdrop-blur-sm shadow-lg border-l-4 border-l-red-500 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">জরুরি সতর্কতা</h3>
              <p className="text-xs text-gray-500">গুরুত্বপূর্ণ বিজ্ঞপ্তি</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs px-1 py-0">
            {loading ? 'লোড হচ্ছে...' : `${alerts.length} টি`}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-3 pb-3">
        <AnimatePresence>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>সতর্কতা লোড করতে সমস্যা হয়েছে</p>
            </div>
          ) : alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">সব ঠিক আছে!</h3>
              <p className="text-gray-500 text-sm">এই মুহূর্তে কোনো জরুরি সতর্কতা নেই</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)} flex-shrink-0`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {alert.title}
                          </h4>
                          <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                            {getTypeLabel(alert.severity)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(new Date(alert.timestamp))}
                            </span>
                          </div>
                          {alert.action_required && (
                            <button className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center transition-colors">
                              ব্যবস্থা নিন
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {alerts.length > 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <button className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center justify-center w-full py-2 rounded-lg hover:bg-green-50 transition-colors">
              আরো {alerts.length - 5} টি সতর্কতা দেখুন
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}