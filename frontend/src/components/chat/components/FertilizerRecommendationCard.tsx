'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, ShoppingCart, Calculator, ListPlus } from 'lucide-react';

interface FertilizerRecommendationCardProps {
  data: any;
  actions?: Array<{ label: string; action: string; icon: string }>;
  onAction?: (action: string) => void;
}

const FertilizerRecommendationCard: React.FC<FertilizerRecommendationCardProps> = ({ data, actions, onAction }) => {
  const fertilizers = Array.isArray(data) ? data : data?.recommendations || [];
  const crop = data?.crop || 'ফসল';

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'shopping-cart': return <ShoppingCart className="w-4 h-4" />;
      case 'calculator': return <Calculator className="w-4 h-4" />;
      case 'list-plus': return <ListPlus className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
      <Card className="border-2 border-amber-200 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-md">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">সার সুপারিশ</CardTitle>
              <p className="text-sm text-gray-600">{crop}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            {fertilizers.length === 0 ? (
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-gray-700">{data?.recommendation || data?.text || 'কোন সার সুপারিশ পাওয়া যায়নি'}</p>
              </div>
            ) : (
              fertilizers.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name || item.type}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.dosage || item.amount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-600">৳{item.price || 0}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-amber-100">
              {actions.map((action, idx) => (
                <Button key={idx} variant="outline" size="sm" onClick={() => onAction && onAction(action.action)} className="border-amber-200 text-amber-700 hover:bg-amber-50">
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

export default FertilizerRecommendationCard;
