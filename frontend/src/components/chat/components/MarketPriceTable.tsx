'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, Tag, Bell } from 'lucide-react';

interface MarketPriceTableProps {
  data: any;
  actions?: Array<{ label: string; action: string; icon: string }>;
  onAction?: (action: string) => void;
}

const MarketPriceTable: React.FC<MarketPriceTableProps> = ({ data, actions, onAction }) => {
  // Parse data if it's a JSON string
  let parsedData = data;
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = { textData: data };
    }
  }

  // Extract price information from text
  const extractPricesFromText = (text: string) => {
    const prices: any[] = [];
    
    // Pattern 1: Multi-line bullet format
    // "• Miniket Rice Premium:\n  ৫ কেজি: ৪৪৯.০ টাকা (প্রতি কেজি ৮৯.৮ টাকা)"
    const multiLineMatches = text.matchAll(/[•\-*]\s*(.+?)(?:\(.*?\))?:\s*\n?\s*.*?:\s*৳?(\d+(?:\.\d+)?)\s*টাকা\s*\(প্রতি\s*কেজি\s*৳?(\d+(?:\.\d+)?)\s*টাকা\)/gm);
    for (const match of multiLineMatches) {
      prices.push({
        item: match[1].trim(),
        price: parseFloat(match[3]), // Use per-kg price
        unit: 'কেজি',
        trend: 'স্থিতিশীল',
        change: 0
      });
    }
    
    // Pattern 2: Single line bullet "• Item: ৫ কেজি: ৪৪৯.০ টাকা"
    if (prices.length === 0) {
      const bulletMatches = text.matchAll(/[•\-*]\s*(.+?):\s*.*?:\s*৳?(\d+(?:\.\d+)?)\s*টাকা/gm);
      for (const match of bulletMatches) {
        prices.push({
          item: match[1].trim().replace(/\(.*?\)/, '').trim(),
          price: parseFloat(match[2]),
          unit: 'কেজি',
          trend: 'স্থিতিশীল',
          change: 0
        });
      }
    }
    
    // Pattern 3: Simple format "Item: ৪৪৯.০ টাকা (প্রতি কেজি)"
    if (prices.length === 0) {
      const listMatches = text.matchAll(/(.+?):\s*৳?(\d+(?:\.\d+)?)\s*টাকা\s*\(প্রতি\s*(.+?)\)/gm);
      for (const match of listMatches) {
        prices.push({
          item: match[1].trim().replace(/^[•\-*]\s*/, '').replace(/\(.*?\)/, '').trim(),
          price: parseFloat(match[2]),
          unit: match[3].trim(),
          trend: 'স্থিতিশীল',
          change: 0
        });
      }
    }
    
    // Pattern 4: Trend format "বর্তমান গড় দাম: 27 টাকা"
    if (prices.length === 0) {
      const priceMatch = text.match(/বর্তমান গড় দাম:\s*(\d+)\s*টাকা/);
      const trendMatch = text.match(/দামের প্রবণতা:\s*(\S+)/);
      const changeMatch = text.match(/পরিবর্তনের হার:\s*(\d+)%/);
      const itemMatch = text.match(/📈\s*(.+?)\s*এর গত/);
      
      if (priceMatch) {
        prices.push({
          item: itemMatch?.[1] || 'পণ্য',
          price: parseInt(priceMatch[1]),
          trend: trendMatch?.[1] || 'স্থিতিশীল',
          change: changeMatch ? parseInt(changeMatch[1]) : 0,
          unit: 'কেজি'
        });
      }
    }
    
    return prices;
  };

  // Parse price data
  let priceData = [];
  if (parsedData?.textData) {
    priceData = extractPricesFromText(parsedData.textData);
  } else if (Array.isArray(parsedData)) {
    priceData = parsedData;
  } else if (parsedData?.prices || parsedData?.items) {
    priceData = parsedData.prices || parsedData.items;
  }
  
  // If still no data, try parsing the raw data as text
  if (priceData.length === 0 && typeof parsedData === 'object' && parsedData !== null) {
    const textContent = JSON.stringify(parsedData);
    const extracted = extractPricesFromText(textContent);
    if (extracted.length > 0) {
      priceData = extracted;
    }
  }

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'tag': return <Tag className="w-4 h-4" />;
      case 'bell': return <Bell className="w-4 h-4" />;
      case 'trending-up': return <TrendingUp className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
      <Card className="overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-green-800">বাজার মূল্য</CardTitle>
              <p className="text-xs text-green-600">{priceData.length} টি পণ্য</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {priceData.length === 0 ? (
            <div className="text-center py-6 text-gray-500">কোন মূল্য তথ্য নেই</div>
          ) : (
            <div className="space-y-2 mb-3">
              {priceData.map((item: any, idx: number) => {
                const price = item.price || 0;
                const change = item.change || 0;
                const trend = item.trend || (change > 0 ? 'বৃদ্ধি' : change < 0 ? 'হ্রাস' : 'স্থিতিশীল');
                const isPositive = change > 0;
                const isNegative = change < 0;
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-2 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800">
                          {item.item || item.name || 'পণ্য'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-lg font-bold text-green-700">৳{price}</span>
                          <span className="text-xs text-green-600">/{item.unit || 'কেজি'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          isPositive ? 'bg-green-100 text-green-700' : 
                          isNegative ? 'bg-red-100 text-red-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {isPositive && <TrendingUp className="w-3 h-3" />}
                          {isNegative && <TrendingDown className="w-3 h-3" />}
                          <span>{trend}</span>
                        </div>
                        {change !== 0 && (
                          <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {change > 0 ? '+' : ''}{change}%
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-green-100">
              {actions.map((action, idx) => (
                <Button 
                  key={idx} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAction && onAction(action.action)}
                  className="h-7 border-green-300 bg-white text-xs text-green-700 hover:bg-green-50"
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

export default MarketPriceTable;
