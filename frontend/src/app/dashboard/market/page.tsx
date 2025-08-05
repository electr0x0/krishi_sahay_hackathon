'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  TrendingUpIcon, 
  SearchIcon, 
  FilterIcon, 
  RefreshCcwIcon, 
  SortAscIcon,
  PlusIcon,
  EditIcon,
  BrainIcon,
  MapPinIcon,
  CalendarIcon,
  DollarSignIcon
} from 'lucide-react';
import { useAllMarketPrices } from '@/hooks/useDashboardData';
import { MarketPriceDisplay } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HoverEffect } from '@/components/ui/card-hover-effect';

interface UserPrice {
  id: string;
  item: string;
  price: number;
  unit: string;
  location: string;
  date: Date;
  aiSuggestion?: {
    suggestedPrice: number;
    confidence: number;
    reason: string;
  };
}

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [filteredPrices, setFilteredPrices] = useState<MarketPriceDisplay[]>([]);
  const [showMyPrices, setShowMyPrices] = useState(false);
  const [userPrices, setUserPrices] = useState<UserPrice[]>([]);
  const [newPriceItem, setNewPriceItem] = useState('');
  const [newPriceAmount, setNewPriceAmount] = useState('');
  const [newPriceUnit, setNewPriceUnit] = useState('kg');
  const [aiRecommendations, setAiRecommendations] = useState<{[key: string]: any}>({});

  const { marketPrices, loading, error, refetch } = useAllMarketPrices(selectedCategory, selectedDistrict);

  // Transform market prices for hover effect
  const transformPricesForHoverEffect = (prices: MarketPriceDisplay[]) => {
    return prices.map((price) => {
      return {
        title: price.item,
        description: (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                ৳{price.price}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  /{price.unit}
                </span>
              </span>
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

            <Separator />

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

            {/* AI Insights */}
            {aiRecommendations[price.item] && (
              <div className="mt-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <BrainIcon className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">AI পূর্বাভাস</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  আগামী সপ্তাহে দাম {Math.random() > 0.5 ? 'বৃদ্ধি' : 'হ্রাস'} পেতে পারে
                </div>
              </div>
            )}
          </div>
        ),
        onClick: () => {
          // Optional: Handle click events, could open a modal with more details
          console.log('Clicked on:', price.item);
        }
      };
    });
  };

  // Enhanced filter logic
  useEffect(() => {
    let filtered = marketPrices;

    // Apply category filter first
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(price => price.category === selectedCategory);
    }

    // Apply district filter
    if (selectedDistrict !== 'all') {
      filtered = filtered.filter(price => 
        price.market.toLowerCase().includes(selectedDistrict.toLowerCase())
      );
    }

    // Search filter with better matching
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(price => 
        price.item.toLowerCase().includes(searchLower) ||
        price.market.toLowerCase().includes(searchLower) ||
        (price.category && price.category.toLowerCase().includes(searchLower))
      );
    }

    // Enhanced sorting
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
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        default:
          return a.item.localeCompare(b.item);
      }
    });

    setFilteredPrices(filtered);
  }, [marketPrices, searchTerm, selectedCategory, selectedDistrict, sortBy]);

  // Simulate AI price recommendations
  const getAIPriceRecommendation = async (item: string, currentPrice: number) => {
    // Simulate API call to AI service
    const mockAI = {
      suggestedPrice: currentPrice * (0.95 + Math.random() * 0.1), // Random adjustment
      confidence: 75 + Math.random() * 20, // 75-95% confidence
      reason: `Based on market trends and seasonal factors, the optimal price for ${item} should be adjusted to maximize profit while remaining competitive.`
    };
    
    setAiRecommendations(prev => ({
      ...prev,
      [item]: mockAI
    }));
  };

  const addUserPrice = () => {
    if (newPriceItem && newPriceAmount) {
      const newPrice: UserPrice = {
        id: Date.now().toString(),
        item: newPriceItem,
        price: parseFloat(newPriceAmount),
        unit: newPriceUnit,
        location: 'আমার এলাকা',
        date: new Date()
      };
      
      setUserPrices(prev => [...prev, newPrice]);
      getAIPriceRecommendation(newPriceItem, parseFloat(newPriceAmount));
      
      // Reset form
      setNewPriceItem('');
      setNewPriceAmount('');
      setNewPriceUnit('kg');
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDownIcon className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <TrendingUpIcon className="w-4 h-4 text-gray-600" />;
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
      case 'stable':
        return 'text-gray-700 bg-gray-50 border-gray-200';
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
              <p className="text-muted-foreground">AI-চালিত স্মার্ট বাজার মূল্য ও প্রবণতা বিশ্লেষণ</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowMyPrices(!showMyPrices)}
                variant={showMyPrices ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                <DollarSignIcon className="w-4 h-4" />
                {showMyPrices ? 'বাজার দর দেখুন' : 'আমার দাম দেখুন'}
              </Button>
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
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    <SelectItem value="khulna">খুলনা</SelectItem>
                    <SelectItem value="barisal">বরিশাল</SelectItem>
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
                    <SelectItem value="date">তারিখ অনুসারে</SelectItem>
                  </SelectContent>
                </Select>

                {/* AI Filter Toggle */}
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    // Trigger AI analysis for visible items
                    filteredPrices.slice(0, 10).forEach(price => {
                      getAIPriceRecommendation(price.item, price.price);
                    });
                  }}
                >
                  <BrainIcon className="w-4 h-4" />
                  AI বিশ্লেষণ
                </Button>
              </div>

              {/* Results Count */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {showMyPrices ? userPrices.length : filteredPrices.length} টি পণ্যের দাম পাওয়া গেছে
                </p>
                <Badge variant="secondary" className="gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {new Date().toLocaleDateString('bn-BD')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Prices Section */}
        {showMyPrices && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSignIcon className="w-5 h-5" />
                আমার বর্তমান দাম
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add New Price Form */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-muted/20 rounded-lg">
                <Input
                  placeholder="পণ্যের নাম"
                  value={newPriceItem}
                  onChange={(e) => setNewPriceItem(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="দাম"
                  value={newPriceAmount}
                  onChange={(e) => setNewPriceAmount(e.target.value)}
                />
                <Select value={newPriceUnit} onValueChange={setNewPriceUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">কেজি</SelectItem>
                    <SelectItem value="piece">পিস</SelectItem>
                    <SelectItem value="dozen">ডজন</SelectItem>
                    <SelectItem value="bag">বস্তা</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addUserPrice} className="gap-2">
                  <PlusIcon className="w-4 h-4" />
                  যোগ করুন
                </Button>
              </div>

              {/* User Prices Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPrices.map((userPrice) => (
                  <Card key={userPrice.id} className="border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{userPrice.item}</h3>
                        <Badge variant="outline">আমার দাম</Badge>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        ৳{userPrice.price} /{userPrice.unit}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <MapPinIcon className="w-3 h-3 inline mr-1" />
                        {userPrice.location}
                      </div>
                      
                      {/* AI Recommendation */}
                      {aiRecommendations[userPrice.item] && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <BrainIcon className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">AI সুপারিশ</span>
                          </div>
                          <div className="text-sm">
                            <div className="font-semibold text-green-600">
                              প্রস্তাবিত দাম: ৳{aiRecommendations[userPrice.item].suggestedPrice.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              আত্মবিশ্বাস: {aiRecommendations[userPrice.item].confidence.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {userPrices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSignIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>এখনো কোনো দাম যোগ করা হয়নি</p>
                  <p className="text-sm">উপরের ফর্মে আপনার পণ্যের দাম যোগ করুন</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Market Prices Grid with Hover Effect */}
        {!showMyPrices && (
          <div className="relative">
            <HoverEffect 
              items={transformPricesForHoverEffect(filteredPrices)}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6"
            />
          </div>
        )}

        {/* Empty State */}
        {filteredPrices.length === 0 && !loading && !showMyPrices && (
          <Card className="p-12">
            <div className="text-center">
              <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="text-muted-foreground">অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
            </div>
          </Card>
        )}

        {/* Enhanced Statistics Summary */}
        {filteredPrices.length > 0 && !showMyPrices && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5" />
                স্মার্ট বাজার বিশ্লেষণ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
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
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(aiRecommendations).length}
                  </div>
                  <div className="text-sm text-muted-foreground">AI সুপারিশ</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
