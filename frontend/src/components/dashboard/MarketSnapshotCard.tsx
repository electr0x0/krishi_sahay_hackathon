'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, Loader2 } from "lucide-react";
import { useMarketPrices } from "@/hooks/useDashboardData";
import { useRouter } from "next/navigation";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useTheme } from "next-themes";

export default function MarketSnapshotCard() {
  const { marketPrices, loading, error, refetch } = useMarketPrices();
  const router = useRouter();
  const { theme } = useTheme();

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : trend === 'down' ? (
      <TrendingDown className="w-4 h-4 text-red-600" />
    ) : (
      <BarChart3 className="w-4 h-4 text-gray-600" />
    );
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="relative h-full bg-white/70 backdrop-blur-sm shadow-lg border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <ShineBorder shineColor={theme === "dark" ? "white" : "#3b82f6"} />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">বাজার দর</h3>
              <p className="text-sm text-gray-500">আজকের দাম</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refetch}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>বাজার দর লোড করতে সমস্যা হয়েছে</p>
          </div>
        ) : marketPrices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>কোনো বাজার দর পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-3">
            {marketPrices.slice(0, 6).map((price, index) => (
              <motion.div
                key={price.item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {price.item}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(price.trend)}
                        <span className={`text-xs px-2 py-1 rounded-full ${getTrendColor(price.trend)}`}>
                          {(price.change_percentage || 0) > 0 ? '+' : ''}{(price.change_percentage || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          ৳{price.price}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          /{price.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">{price.market}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(price.date).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {marketPrices.length > 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center"
              >
                <button 
                  onClick={() => router.push('/dashboard/market')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center w-full py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  আরো দাম দেখুন
                  <BarChart3 className="w-4 h-4 ml-1" />
                </button>
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}