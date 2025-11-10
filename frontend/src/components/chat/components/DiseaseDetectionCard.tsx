'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, CheckCircle, Info, ShoppingCart, Phone, 
  Users, ChevronDown, ChevronUp, Pill, Leaf, AlertCircle
} from 'lucide-react';

interface DiseaseDetectionCardProps {
  data: any;
  actions?: Array<{ label: string; action: string; icon: string }>;
  onAction?: (action: string) => void;
}

const DiseaseDetectionCard: React.FC<DiseaseDetectionCardProps> = ({ data, actions, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const disease = data?.disease || data?.name || 'অজানা রোগ';
  const severity = data?.severity || 'medium';
  const confidence = data?.confidence || 0;
  const treatment = data?.treatment || data?.recommendations || 'কোন চিকিৎসা তথ্য পাওয়া যায়নি';
  const prevention = data?.prevention || [];
  const symptoms = data?.symptoms || [];

  const getSeverityColor = () => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'from-red-500 to-rose-600';
      case 'medium':
      case 'moderate':
        return 'from-orange-500 to-amber-600';
      case 'low':
      case 'mild':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-blue-500 to-cyan-600';
    }
  };

  const getSeverityBadge = () => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-700 border-red-300',
      medium: 'bg-orange-100 text-orange-700 border-orange-300',
      low: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };
    const severityKey = severity.toLowerCase() as 'high' | 'medium' | 'low';
    return colors[severityKey] || colors.medium;
  };

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'shopping-cart': return <ShoppingCart className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'users': return <Users className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border-2 border-red-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-red-50 to-rose-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${getSeverityColor()} rounded-xl flex items-center justify-center shadow-md`}>
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  রোগ নির্ণয়
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityBadge()}`}>
                    {severity === 'high' ? 'গুরুতর' : severity === 'medium' ? 'মাঝারি' : 'হালকা'}
                  </span>
                  {confidence > 0 && (
                    <span className="text-xs text-gray-500">
                      নিশ্চিততা: {Math.round(confidence * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:bg-red-100"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Disease Name */}
          <div className="bg-white p-4 rounded-lg border-2 border-red-200 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Leaf className="w-6 h-6 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">সনাক্ত রোগ</p>
                  <p className="text-lg font-bold text-gray-900">{disease}</p>
                </div>
              </div>
              <div className="text-right">
                {confidence > 0.8 ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : confidence > 0.5 ? (
                  <Info className="w-8 h-8 text-yellow-500" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                )}
              </div>
            </div>
          </div>

          {/* Quick Treatment Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-start space-x-3">
              <Pill className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-2">প্রস্তাবিত চিকিৎসা</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {typeof treatment === 'string' 
                    ? treatment.substring(0, isExpanded ? treatment.length : 150) + (treatment.length > 150 && !isExpanded ? '...' : '')
                    : 'চিকিৎসা তথ্য পাওয়া যায়নি'}
                </p>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Symptoms */}
                {symptoms && symptoms.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      লক্ষণসমূহ
                    </h4>
                    <ul className="space-y-2">
                      {symptoms.map((symptom: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prevention */}
                {prevention && prevention.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      প্রতিরোধ ব্যবস্থা
                    </h4>
                    <ul className="space-y-2">
                      {prevention.map((step: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional Info */}
                {data?.additional_info && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">অতিরিক্ত তথ্য</p>
                        <p className="text-sm text-blue-700">{data.additional_info}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-red-100">
              {actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => onAction && onAction(action.action)}
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                >
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

export default DiseaseDetectionCard;
