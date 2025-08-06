'use client';

import { HoverEffect } from '@/components/ui/card-hover-effect';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, BrainIcon } from 'lucide-react';

interface MarketPrice {
  item: string;
  price: number;
  unit: string;
  market?: string;
  category?: string;
  date?: string;
  trend?: string;
  change_percentage?: number;
}

interface ChatMarketPricesProps {
  prices: MarketPrice[];
  maxDisplay?: number;
  compact?: boolean;
}

export const ChatMarketPrices = ({ 
  prices, 
  maxDisplay = 6, 
  compact = false 
}: ChatMarketPricesProps) => {
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="w-3 h-3 text-green-600" />;
      case 'down':
        return <ArrowDownIcon className="w-3 h-3 text-red-600" />;
      default:
        return <TrendingUpIcon className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'down':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getCategoryBadgeColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'grain':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'vegetable':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'fruit':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      case 'spice':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getCategoryNameBn = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'grain':
        return 'খাদ্যশস্য';
      case 'vegetable':
        return 'সবজি';
      case 'fruit':
        return 'ফল';
      case 'spice':
        return 'মসলা';
      default:
        return 'অন্যান্য';
    }
  };

  // Transform prices for hover effect with compact or full display
  const transformPricesForHoverEffect = (prices: MarketPrice[]) => {
    return prices.slice(0, maxDisplay).map((price) => {
      return {
        title: price.item,
        description: compact ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                ৳{price.price}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  /{price.unit}
                </span>
              </span>
              {price.category && (
                <Badge
                  variant="outline"
                  className={`text-xs ${getCategoryBadgeColor(price.category)}`}
                >
                  {getCategoryNameBn(price.category)}
                </Badge>
              )}
            </div>
            
            {price.change_percentage !== undefined && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border w-fit ${getTrendColor(price.trend)}`}>
                {getTrendIcon(price.trend)}
                <span className="font-medium">
                  {price.change_percentage > 0 ? '+' : ''}
                  {price.change_percentage.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">
                ৳{price.price}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  /{price.unit}
                </span>
              </span>
              {price.category && (
                <Badge
                  variant="outline"
                  className={`gap-1 ${getCategoryBadgeColor(price.category)}`}
                >
                  {getCategoryNameBn(price.category)}
                </Badge>
              )}
            </div>
            
            {price.change_percentage !== undefined && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border w-fit ${getTrendColor(price.trend)}`}>
                {getTrendIcon(price.trend)}
                <span className="font-medium">
                  {price.change_percentage > 0 ? '+' : ''}
                  {price.change_percentage.toFixed(1)}%
                </span>
              </div>
            )}

            {(price.market || price.date) && <Separator />}

            <div className="space-y-1 text-sm">
              {price.market && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">বাজার:</span>
                  <span className="font-medium">{price.market}</span>
                </div>
              )}
              {price.date && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">তারিখ:</span>
                  <span className="font-medium">
                    {new Date(price.date).toLocaleDateString('bn-BD')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ),
        onClick: () => {
          console.log('Clicked on market price:', price.item);
        }
      };
    });
  };

  if (!prices || prices.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        কোন মূল্য তথ্য পাওয়া যায়নি
      </div>
    );
  }

  const displayPrices = transformPricesForHoverEffect(prices);

  return (
    <div className="w-full max-w-full">
      <HoverEffect 
        items={displayPrices}
        className={compact 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 py-4" 
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-6"
        }
      />
      {prices.length > maxDisplay && (
        <div className="text-center mt-2">
          <span className="text-xs text-muted-foreground">
            আরও {prices.length - maxDisplay}টি পণ্যের দাম উপলব্ধ
          </span>
        </div>
      )}
    </div>
  );
};
