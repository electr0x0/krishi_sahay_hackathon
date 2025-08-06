'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, SearchIcon, FilterIcon, RefreshCcwIcon, SortAscIcon } from 'lucide-react';
import { useAllMarketPrices } from '@/hooks/useDashboardData';
import { MarketPriceDisplay } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [filteredPrices, setFilteredPrices] = useState<MarketPriceDisplay[]>([]);

  const { marketPrices, loading, error, refetch } = useAllMarketPrices(selectedCategory, selectedDistrict);

  // Filter prices based on search and filters
  useEffect(() => {
    let filtered = marketPrices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(price => 
        price.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.market.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort prices
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'change-high':
          return (b.change_percentage || 0) - (a.change_percentage || 0);
        case 'change-low':
          return (a.change_percentage || 0) - (b.change_percentage || 0);
        default:
          return a.item.localeCompare(b.item);
      }
    });

    setFilteredPrices(filtered);
  }, [marketPrices, searchTerm, selectedCategory, selectedDistrict, sortBy]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDownIcon className="w-4 h-4 text-red-600" />;
      default:
        return <TrendingUpIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'down':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-destructive mb-2">ডেটা লোড করতে সমস্যা</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => refetch()} variant="outline">
                পুনরায় চেষ্টা করুন
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">বাজার দর</h1>
              <p className="text-muted-foreground">সর্বশেষ কৃষি পণ্যের বাজার মূল্য ও প্রবণতা</p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={loading}
            >
              <RefreshCcwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="পণ্য বা বাজার খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="ক্যাটাগরি" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ধরনের পণ্য</SelectItem>
                    <SelectItem value="grain">খাদ্যশস্য</SelectItem>
                    <SelectItem value="vegetable">সবজি</SelectItem>
                    <SelectItem value="fruit">ফল</SelectItem>
                    <SelectItem value="spice">মসলা</SelectItem>
                  </SelectContent>
                </Select>

                {/* District Filter */}
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="জেলা" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব জেলা</SelectItem>
                    <SelectItem value="dhaka">ঢাকা</SelectItem>
                    <SelectItem value="chittagong">চট্টগ্রাম</SelectItem>
                    <SelectItem value="sylhet">সিলেট</SelectItem>
                    <SelectItem value="rajshahi">রাজশাহী</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="সাজান" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">নাম অনুসারে</SelectItem>
                    <SelectItem value="price-high">দাম (বেশি)</SelectItem>
                    <SelectItem value="price-low">দাম (কম)</SelectItem>
                    <SelectItem value="change-high">পরিবর্তন (বেশি)</SelectItem>
                    <SelectItem value="change-low">পরিবর্তন (কম)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredPrices.length} টি পণ্যের দাম পাওয়া গেছে
                </p>
                <Badge variant="secondary">{new Date().toLocaleDateString('bn-BD')}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Prices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrices.map((price, index) => (
            <Card key={`${price.item}-${index}`} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{price.item}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`gap-1 ${getCategoryBadgeColor(price.category || 'other')}`}
                  >
                    {price.category === 'grain' ? 'খাদ্যশস্য' :
                     price.category === 'vegetable' ? 'সবজি' :
                     price.category === 'fruit' ? 'ফল' :
                     price.category === 'spice' ? 'মসলা' : 'অন্যান্য'}
                  </Badge>
                </div>
                
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border w-fit ${getTrendColor(price.trend)}`}>
                  {getTrendIcon(price.trend)}
                  <span className="font-medium">
                    {(price.change_percentage || 0) > 0 ? '+' : ''}
                    {(price.change_percentage || 0).toFixed(1)}%
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Price */}
                  <div>
                    <div className="text-2xl font-bold">
                      ৳{price.price}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        /{price.unit}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Market Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">বাজার:</span>
                      <span className="font-medium">{price.market}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">তারিখ:</span>
                      <span className="font-medium">
                        {new Date(price.date).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPrices.length === 0 && !loading && (
          <Card className="p-12">
            <div className="text-center">
              <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="text-muted-foreground">অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
            </div>
          </Card>
        )}

        {/* Statistics Summary */}
        {filteredPrices.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>বাজার সারসংক্ষেপ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{filteredPrices.length}</div>
                  <div className="text-sm text-muted-foreground">মোট পণ্য</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredPrices.filter(p => p.trend === 'up').length}
                  </div>
                  <div className="text-sm text-muted-foreground">দাম বৃদ্ধি</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredPrices.filter(p => p.trend === 'down').length}
                  </div>
                  <div className="text-sm text-muted-foreground">দাম হ্রাস</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">
                    ৳{Math.round(filteredPrices.reduce((sum, p) => sum + p.price, 0) / filteredPrices.length)}
                  </div>
                  <div className="text-sm text-muted-foreground">গড় মূল্য</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}