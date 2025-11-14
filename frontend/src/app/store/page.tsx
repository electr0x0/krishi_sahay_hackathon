'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import api from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  MapPin, 
  Star, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Leaf, 
  Award, 
  TrendingUp,
  Filter,
  Package,
  Phone,
  MapPinIcon,
  CreditCard,
  Users,
  X,
  ChevronRight,
  Truck,
  Shield,
  Clock,
  ArrowRight,
  ChevronDown,
  Info
} from 'lucide-react'

function MiniTrend({ points }: { points: { recorded_at: string, price: number }[] }) {
  if (!points || points.length < 2) return null
  
  const prices = points.map(p => p.price)
  const latest = prices[prices.length - 1]
  const previous = prices[prices.length - 2]
  const change = ((latest - previous) / previous) * 100
  
  return (
    <div className="flex items-center gap-1 text-xs">
      <TrendingUp className={`w-3 h-3 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
      <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
      </span>
    </div>
  )
}

export default function StorePage() {
  const [listings, setListings] = useState<any[]>([])
  const [filteredListings, setFilteredListings] = useState<any[]>([])
  const [trends, setTrends] = useState<Record<number, any[]>>({})
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [showOrganic, setShowOrganic] = useState(false)
  const [showCommunityOnly, setShowCommunityOnly] = useState(false)

  // Checkout
  const [checkoutData, setCheckoutData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    advance_amount: 0
  })
  
  // Auto-calculate advance payment (5% of total)
  const calculateAdvancePayment = () => {
    const total = getTotalPrice()
    return Math.round(total * 0.05 * 100) / 100 // 5% rounded to 2 decimal places
  }
  const [orderResult, setOrderResult] = useState<any>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const categories = ['all', 'vegetables', 'fruits', 'grains', 'pulses', 'spices', 'herbs', 'dairy', 'meat', 'seafood', 'other']
  const locations = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh']

  const loadListings = async () => {
    setLoading(true)
    try {
      const res = await api.getStoreListings()
      setListings(res || [])
      setFilteredListings(res || [])
      
      // Load price trends for each listing
      for (const listing of res || []) {
        try {
          const history = await api.request(`/api/store/listings/${listing.id}/price-history`)
          setTrends(prev => ({ ...prev, [listing.id]: history }))
        } catch (error) {
          console.error(`Failed to load trends for listing ${listing.id}`)
        }
      }
    } catch (error) {
      console.error('Failed to load listings:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadListings()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...listings]

    if (searchQuery) {
      filtered = filtered.filter(l => 
        l.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.product_category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(l => l.product_category === selectedCategory)
    }

    if (selectedLocation) {
      filtered = filtered.filter(l => l.location.toLowerCase().includes(selectedLocation.toLowerCase()))
    }

    if (priceRange.min) {
      filtered = filtered.filter(l => l.price >= parseFloat(priceRange.min))
    }

    if (priceRange.max) {
      filtered = filtered.filter(l => l.price <= parseFloat(priceRange.max))
    }

    if (showOrganic) {
      filtered = filtered.filter(l => l.organic_certified)
    }

    if (showCommunityOnly) {
      filtered = filtered.filter(l => l.community_id != null)
    }

    setFilteredListings(filtered)
  }, [listings, searchQuery, selectedCategory, selectedLocation, priceRange, showOrganic, showCommunityOnly])

  const addToCart = (listing: any, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.listing_id === listing.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].quantity += quantity
        return updated
      }
      return [...prev, {
        listing_id: listing.id,
        product_name: listing.product_name,
        unit: listing.unit,
        price: listing.price,
        min_order_qty: listing.min_order_qty,
        farmer_name: listing.farmer_name,
        quantity: Math.max(quantity, listing.min_order_qty)
      }]
    })
  }

  const updateCartQuantity = (listingId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.listing_id !== listingId))
      return
    }
    setCart(prev => prev.map(item => 
      item.listing_id === listingId ? { ...item, quantity: newQuantity } : item
    ))
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const placeOrder = async () => {
    if (!checkoutData.customer_name || !checkoutData.phone || !checkoutData.address || cart.length === 0) {
      alert('Please fill all required fields and add items to cart')
      return
    }

    setCheckoutLoading(true)
    try {
      const orderPayload = {
        phone: checkoutData.phone,
        customer_name: checkoutData.customer_name,
        address: checkoutData.address,
        items: cart.map(item => ({
          listing_id: item.listing_id,
          quantity: item.quantity
        })),
        advance_amount: checkoutData.advance_amount
      }

      const result = await api.createStoreOrder(orderPayload)
      setOrderResult(result)
      setCart([])
      setCheckoutData({
        customer_name: '',
        phone: '',
        address: '',
        advance_amount: 0
      })
      alert(`Order placed successfully! Order ID: ${result.id}`)
    } catch (error: any) {
      alert('Failed to place order: ' + error.message)
    }
    setCheckoutLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-5xl font-bold mb-3"
              >
                কৃষি বাজার
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-green-50 text-lg mb-6"
              >
                কৃষকদের কাছ থেকে সরাসরি তাজা ও প্রাকৃতিক পণ্য
              </motion.p>
              
              {/* Trust Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm">দ্রুত ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">১০০% তাজা গ্যারান্টি</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Leaf className="w-4 h-4" />
                  <span className="text-sm">জৈব সার্টিফাইড</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              {/* Cart Badge */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative cursor-pointer"
              >
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl hover:bg-white/20 transition-all">
                  <ShoppingCart className="w-7 h-7" />
                  <AnimatePresence>
                    {cart.length > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-yellow-400 text-green-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                      >
                        {cart.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
              
              <Button 
                asChild 
                className="bg-white text-green-700 hover:bg-green-50 shadow-lg font-semibold"
              >
                <a href="/store/track" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  অর্ডার ট্র্যাক করুন
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-4 border-0 shadow-lg">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                    <Filter className="w-5 h-5 text-green-600" />
                    ফিল্টার
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs text-gray-500 hover:text-green-600"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                      setSelectedLocation('')
                      setPriceRange({ min: '', max: '' })
                      setShowOrganic(false)
                      setShowCommunityOnly(false)
                    }}
                  >
                    রিসেট
                  </Button>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">পণ্য খুঁজুন</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                      placeholder="পণ্য খুঁজুন..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">ধরন</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 bg-white transition-all"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">সকল ধরন</option>
                    <option value="vegetables">সবজি</option>
                    <option value="fruits">ফল</option>
                    <option value="grains">শস্য</option>
                    <option value="pulses">ডাল</option>
                    <option value="spices">মসলা</option>
                    <option value="herbs">ভেষজ</option>
                    <option value="dairy">দুগ্ধজাত</option>
                    <option value="meat">মাংস</option>
                    <option value="seafood">মাছ</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">এলাকা</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 bg-white transition-all"
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                  >
                    <option value="">সকল এলাকা</option>
                    <option value="Dhaka">ঢাকা</option>
                    <option value="Chittagong">চট্টগ্রাম</option>
                    <option value="Sylhet">সিলেট</option>
                    <option value="Rajshahi">রাজশাহী</option>
                    <option value="Khulna">খুলনা</option>
                    <option value="Barishal">বরিশাল</option>
                    <option value="Rangpur">রংপুর</option>
                    <option value="Mymensingh">ময়মনসিংহ</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">দাম সীমা (৳)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="সর্বনিম্ন"
                      className="border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 bg-white transition-all"
                      value={priceRange.min}
                      onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <input
                      type="number"
                      placeholder="সর্বোচ্চ"
                      className="border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 bg-white transition-all"
                      value={priceRange.max}
                      onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">বিশেষ ফিল্টার</label>
                  
                  {/* Organic Filter */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showOrganic}
                        onChange={e => setShowOrganic(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-sm font-medium flex items-center gap-2 group-hover:text-green-600 transition-colors">
                      <Leaf className="w-4 h-4 text-green-600" />
                      শুধু জৈব পণ্য
                    </span>
                  </label>

                  {/* Community Filter */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showCommunityOnly}
                        onChange={e => setShowCommunityOnly(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-sm font-medium flex items-center gap-2 group-hover:text-green-600 transition-colors">
                      <Users className="w-4 h-4 text-green-600" />
                      কমিউনিটি পণ্য
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Tabs defaultValue="products" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-white p-1 shadow-sm border-0">
                <TabsTrigger 
                  value="products" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Package className="w-4 h-4" />
                  <span className="font-semibold">পণ্যসমূহ</span>
                  <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 data-[state=active]:bg-white data-[state=active]:text-green-700">
                    {filteredListings.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="cart" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-semibold">ঝুড়ি</span>
                  <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 data-[state=active]:bg-white data-[state=active]:text-green-700">
                    {cart.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Card key={i} className="overflow-hidden border-0 shadow-lg">
                        <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
                        <CardContent className="p-4 space-y-3">
                          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredListings.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">কোন পণ্য পাওয়া যায়নি</h3>
                    <p className="text-gray-500 mb-6">অনুগ্রহ করে আপনার ফিল্টার পরিবর্তন করুন</p>
                    <Button 
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('all')
                        setSelectedLocation('')
                        setPriceRange({ min: '', max: '' })
                        setShowOrganic(false)
                        setShowCommunityOnly(false)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      সব ফিল্টার মুছুন
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {filteredListings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-200/60 hover:border-green-300 bg-white h-full flex flex-col">
                          {/* Image Section */}
                          <div className="relative overflow-hidden aspect-square">
                            {listing.product_image_url ? (
                              <div className="relative w-full h-full">
                                <Image 
                                  src={`${process.env.NEXT_PUBLIC_API_URL}${listing.product_image_url}`} 
                                  alt={listing.product_name}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                                <Package className="w-16 h-16 text-gray-300" />
                              </div>
                            )}
                            
                            {/* Minimal Badges */}
                            <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                              <div className="flex flex-col gap-1.5">
                                {listing.organic_certified && (
                                  <div className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                                    <Leaf className="w-3 h-3 text-green-600" />
                                    <span className="text-xs font-medium text-green-700">জৈব</span>
                                  </div>
                                )}
                                {listing.community_id && (
                                  <div className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                                    <Users className="w-3 h-3 text-blue-600" />
                                    <span className="text-xs font-medium text-blue-700">কমিউনিটি</span>
                                  </div>
                                )}
                              </div>
                              
                              {listing.quality_grade && (
                                <div className="inline-flex items-center gap-1 bg-yellow-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                                  <Award className="w-3 h-3" />
                                  <span className="text-xs font-semibold">{listing.quality_grade}</span>
                                </div>
                              )}
                            </div>

                            {/* Stock Warning */}
                            {listing.stock_qty > 0 && listing.stock_qty < 10 && (
                              <div className="absolute bottom-3 left-3">
                                <div className="inline-flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full shadow-md">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs font-semibold">স্টক সীমিত</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Content Section */}
                          <CardContent className="p-4 flex-1 flex flex-col">
                            {/* Category */}
                            <div className="mb-1.5">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {listing.product_category}
                              </span>
                            </div>

                            {/* Product Name */}
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                              {listing.product_name}
                            </h3>

                            {/* Price */}
                            <div className="mb-3">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-gray-900">
                                  ৳{Number(listing.price).toFixed(0)}
                                </span>
                                {Number(listing.price) % 1 !== 0 && (
                                  <span className="text-lg font-semibold text-gray-600">
                                    .{(Number(listing.price) % 1).toFixed(2).split('.')[1]}
                                  </span>
                                )}
                                <span className="text-sm text-gray-500 ml-1">
                                  / {listing.unit}
                                </span>
                              </div>
                              {trends[listing.id] && trends[listing.id].length > 1 && (
                                <div className="mt-1">
                                  <MiniTrend points={trends[listing.id]} />
                                </div>
                              )}
                            </div>

                            {/* Compact Info */}
                            <div className="mb-3 space-y-1.5 text-sm">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">মজুদ</span>
                                <span className="font-semibold text-gray-900">
                                  {Number(listing.stock_qty).toFixed(0)} {listing.unit}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">সর্বনিম্ন</span>
                                <span className="font-semibold text-gray-900">
                                  {Number(listing.min_order_qty).toFixed(0)} {listing.unit}
                                </span>
                              </div>
                            </div>

                            {/* View Details Toggle */}
                            <button
                              onClick={() => setExpandedCard(expandedCard === listing.id ? null : listing.id)}
                              className="flex items-center justify-between w-full text-xs text-green-700 hover:text-green-800 font-medium py-2 px-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors mb-3"
                            >
                              <span className="flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5" />
                                বিস্তারিত তথ্য
                              </span>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedCard === listing.id ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Expandable Details */}
                            <AnimatePresence>
                              {expandedCard === listing.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden mb-3"
                                >
                                  <div className="space-y-2 pt-2 pb-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-xs">
                                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                      <span className="text-gray-600 truncate">{listing.location}</span>
                                    </div>
                                    {listing.farmer_name && (
                                      <div className="flex items-center gap-2 text-xs">
                                        <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600 truncate">{listing.farmer_name}</span>
                                      </div>
                                    )}
                                    {listing.harvest_date && (
                                      <div className="flex items-center gap-2 text-xs">
                                        <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600">
                                          {new Date(listing.harvest_date).toLocaleDateString('bn-BD')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Action Button */}
                            <div className="mt-auto">
                              <Button 
                                onClick={() => addToCart(listing)}
                                className={`w-full font-semibold py-5 rounded-lg transition-all duration-300 ${
                                  listing.stock_qty <= 0 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100' 
                                    : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
                                }`}
                                disabled={listing.stock_qty <= 0}
                              >
                                {listing.stock_qty <= 0 ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <X className="w-4 h-4" />
                                    স্টক নেই
                                  </span>
                                ) : (
                                  <span className="flex items-center justify-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    ঝুড়িতে যোগ করুন
                                  </span>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              {/* Cart Tab */}
              <TabsContent value="cart">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cart Items */}
                  <div className="lg:col-span-2">
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold text-xl text-gray-900">কেনাকাটার ঝুড়ি</h3>
                          {cart.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setCart([])}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              সব মুছুন
                            </Button>
                          )}
                        </div>
                        
                        {cart.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16"
                          >
                            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                              <ShoppingCart className="w-12 h-12 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">আপনার ঝুড়ি খালি</h3>
                            <p className="text-gray-500 mb-6">পণ্য যোগ করতে &ldquo;পণ্যসমূহ&rdquo; ট্যাবে যান</p>
                          </motion.div>
                        ) : (
                          <div className="space-y-4">
                            <AnimatePresence>
                              {cart.map((item, index) => (
                                <motion.div
                                  key={item.listing_id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="group bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">
                                        {item.product_name}
                                      </h4>
                                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                          <span className="font-semibold text-green-700">৳{item.price}</span>
                                          <span className="text-gray-400">/{item.unit}</span>
                                        </div>
                                        <span className="text-gray-300">•</span>
                                        <div className="flex items-center gap-1">
                                          <Users className="w-3.5 h-3.5" />
                                          <span className="truncate">{item.farmer_name}</span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        সর্বনিম্ন অর্ডার: {item.min_order_qty} {item.unit}
                                      </p>
                                    </div>
                                    
                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => updateCartQuantity(item.listing_id, item.quantity - 1)}
                                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                      <span className="w-12 text-center font-semibold text-gray-900">
                                        {item.quantity}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => updateCartQuantity(item.listing_id, item.quantity + 1)}
                                        className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    
                                    {/* Price & Remove */}
                                    <div className="text-right">
                                      <div className="font-bold text-xl text-green-700 mb-1">
                                        ৳{Number(item.price * item.quantity).toFixed(2)}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => updateCartQuantity(item.listing_id, 0)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 text-xs"
                                      >
                                        <X className="w-3 h-3 mr-1" />
                                        মুছুন
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                            
                            {/* Summary */}
                            <div className="border-t border-gray-200 pt-4 mt-6 space-y-3">
                              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>সাবটোটাল</span>
                                  <span className="font-semibold">৳{Number(getTotalPrice()).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>সুপারিশকৃত অগ্রিম (৫%)</span>
                                  <span className="font-semibold">৳{calculateAdvancePayment().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 pb-3 border-b border-green-200">
                                  <span>ডেলিভারির সময় পরিশোধ</span>
                                  <span className="font-semibold">৳{(getTotalPrice() - calculateAdvancePayment()).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                  <span className="text-lg font-bold text-gray-900">মোট</span>
                                  <span className="text-3xl font-bold text-green-700">
                                    ৳{Number(getTotalPrice()).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Checkout */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-4 space-y-4">
                      {/* Order Summary Card */}
                      {cart.length > 0 && (
                        <Card className="border-0 shadow-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                              <ShoppingCart className="w-5 h-5" />
                              অর্ডার সারসংক্ষেপ
                            </h3>
                          </div>
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">মোট পণ্য</span>
                                <span className="font-semibold text-gray-900">{cart.length}টি</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">মোট পরিমাণ</span>
                                <span className="font-semibold text-gray-900">
                                  {cart.reduce((sum, item) => sum + item.quantity, 0)} ইউনিট
                                </span>
                              </div>
                              <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-700 font-medium">সাবটোটাল</span>
                                  <span className="text-xl font-bold text-gray-900">
                                    ৳{Number(getTotalPrice()).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Payment Breakdown */}
                              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-3 space-y-2 border border-green-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <CreditCard className="w-4 h-4 text-green-700" />
                                  <span className="text-xs font-semibold text-green-900">পেমেন্ট বিভাজন</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-green-700">অগ্রিম (৫%)</span>
                                  <span className="font-semibold text-green-900">
                                    ৳{calculateAdvancePayment().toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-green-700">ডেলিভারিতে</span>
                                  <span className="font-semibold text-green-900">
                                    ৳{(getTotalPrice() - calculateAdvancePayment()).toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              {/* Delivery Info */}
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <div className="flex items-start gap-2">
                                  <Truck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-semibold text-blue-900 mb-1">
                                      ডেলিভারি সময়
                                    </p>
                                    <p className="text-xs text-blue-700">
                                      ২-৩ কর্মদিবসের মধ্যে ডেলিভারি হবে
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Checkout Form Card */}
                      <Card className="border-0 shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                          <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            চেকআউট তথ্য
                          </h3>
                        </div>
                        
                        <CardContent className="p-6">
                          {/* Security Banner */}
                          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 via-blue-50/80 to-blue-100/50 rounded-xl border border-blue-200">
                            <div className="flex gap-3">
                              <div className="bg-blue-600 rounded-full p-2 h-fit">
                                <Shield className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-blue-900 mb-1.5">
                                  ১০০% নিরাপদ পেমেন্ট
                                </p>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                  আপনার তথ্য সম্পূর্ণ সুরক্ষিত। সাধারণত মোট মূল্যের ৫% অগ্রিম পেমেন্ট করতে হয় এবং বাকি টাকা ডেলিভারির সময় পরিশোধ করতে হবে।
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-5">
                            {/* Name Input */}
                            <div>
                              <label className="flex items-center gap-2 text-sm font-bold mb-2.5 text-gray-900">
                                <Users className="w-4 h-4 text-green-600" />
                                পূর্ণ নাম
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder:text-gray-400"
                                placeholder="আপনার পূর্ণ নাম লিখুন"
                                value={checkoutData.customer_name}
                                onChange={e => setCheckoutData(prev => ({ ...prev, customer_name: e.target.value }))}
                              />
                            </div>

                            {/* Phone Input */}
                            <div>
                              <label className="flex items-center gap-2 text-sm font-bold mb-2.5 text-gray-900">
                                <Phone className="w-4 h-4 text-green-600" />
                                ফোন নম্বর
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-400 text-sm">+৮৮০</span>
                                </div>
                                <input
                                  className="w-full pl-20 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder:text-gray-400"
                                  placeholder="১XXX-XXXXXX"
                                  value={checkoutData.phone}
                                  onChange={e => setCheckoutData(prev => ({ ...prev, phone: e.target.value }))}
                                />
                              </div>
                              <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ডেলিভারি আপডেটের জন্য ব্যবহৃত হবে
                              </p>
                            </div>

                            {/* Address Input */}
                            <div>
                              <label className="flex items-center gap-2 text-sm font-bold mb-2.5 text-gray-900">
                                <MapPinIcon className="w-4 h-4 text-green-600" />
                                ডেলিভারি ঠিকানা
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <MapPinIcon className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
                                <textarea
                                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-300 resize-none text-gray-900 placeholder:text-gray-400"
                                  rows={3}
                                  placeholder="বাড়ি নং, রোড নং, এলাকা, থানা, জেলা"
                                  value={checkoutData.address}
                                  onChange={e => setCheckoutData(prev => ({ ...prev, address: e.target.value }))}
                                />
                              </div>
                              <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                <MapPinIcon className="w-3 h-3" />
                                সম্পূর্ণ ঠিকানা দিন যাতে ডেলিভারি সহজ হয়
                              </p>
                            </div>

                            {/* Advance Payment */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border-2 border-dashed border-gray-300">
                              <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-900">
                                <CreditCard className="w-4 h-4 text-green-600" />
                                অগ্রিম পেমেন্ট
                                <span className="text-xs font-normal text-gray-500">(ঐচ্ছিক)</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                                  ৳
                                </span>
                                <input
                                  type="number"
                                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 placeholder:text-gray-400 font-semibold"
                                  placeholder="০.০০"
                                  value={checkoutData.advance_amount || ''}
                                  onChange={e => setCheckoutData(prev => ({ ...prev, advance_amount: parseFloat(e.target.value) || 0 }))}
                                />
                              </div>
                              
                              {/* Quick Apply */}
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="bg-green-100 rounded-full p-1.5">
                                    <TrendingUp className="w-3.5 h-3.5 text-green-700" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-700">
                                      সুপারিশকৃত পরিমাণ
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      ৳{calculateAdvancePayment().toFixed(2)} (৫% অগ্রিম)
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => setCheckoutData(prev => ({ ...prev, advance_amount: calculateAdvancePayment() }))}
                                  className={`text-xs h-8 px-3 font-semibold transition-all ${
                                    checkoutData.advance_amount === calculateAdvancePayment() 
                                      ? 'bg-green-600 text-white hover:bg-green-700' 
                                      : 'bg-white border-2 border-green-600 text-green-700 hover:bg-green-50'
                                  }`}
                                  disabled={checkoutData.advance_amount === calculateAdvancePayment()}
                                >
                                  {checkoutData.advance_amount === calculateAdvancePayment() ? (
                                    <span className="flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                      </svg>
                                      প্রয়োগকৃত
                                    </span>
                                  ) : 'প্রয়োগ করুন'}
                                </Button>
                              </div>
                            </div>

                            {/* Place Order Button */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="pt-2"
                            >
                              <Button 
                                onClick={placeOrder} 
                                className="w-full bg-gradient-to-r from-green-600 via-green-600 to-green-700 hover:from-green-700 hover:via-green-700 hover:to-green-800 text-white font-bold py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all text-base relative overflow-hidden group"
                                disabled={cart.length === 0 || checkoutLoading || !checkoutData.customer_name || !checkoutData.phone || !checkoutData.address}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                {checkoutLoading ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>অর্ডার প্রসেস হচ্ছে...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2 relative z-10">
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>
                                      {cart.length === 0 
                                        ? 'ঝুড়ি খালি' 
                                        : !checkoutData.customer_name || !checkoutData.phone || !checkoutData.address
                                        ? 'তথ্য পূরণ করুন'
                                        : `অর্ডার নিশ্চিত করুন • ৳${Number(getTotalPrice()).toFixed(2)}`
                                      }
                                    </span>
                                  </div>
                                )}
                              </Button>
                            </motion.div>

                            {/* Success Message */}
                            <AnimatePresence>
                              {orderResult && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  className="p-4 bg-gradient-to-br from-green-50 via-green-100/50 to-green-50 border-2 border-green-300 rounded-xl shadow-md"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="bg-green-600 text-white rounded-full p-2 shadow-lg">
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-bold text-green-900 mb-1 text-base">
                                        অর্ডার সফল হয়েছে! 🎉
                                      </p>
                                      <p className="text-green-800 text-sm mb-2">
                                        অর্ডার নম্বর: <span className="font-bold">#{orderResult.id}</span>
                                      </p>
                                      <p className="text-xs text-green-700">
                                        আপনার ফোনে শীঘ্রই কনফার্মেশন পাবেন
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Security Features */}
                            <div className="pt-4 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-3">আমরা নিশ্চিত করি:</p>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-start gap-2">
                                  <div className="bg-green-100 rounded-full p-1">
                                    <Shield className="w-3 h-3 text-green-600" />
                                  </div>
                                  <span className="text-xs text-gray-600">তাজা পণ্য</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="bg-green-100 rounded-full p-1">
                                    <Truck className="w-3 h-3 text-green-600" />
                                  </div>
                                  <span className="text-xs text-gray-600">দ্রুত ডেলিভারি</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="bg-green-100 rounded-full p-1">
                                    <CreditCard className="w-3 h-3 text-green-600" />
                                  </div>
                                  <span className="text-xs text-gray-600">নিরাপদ পেমেন্ট</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="bg-green-100 rounded-full p-1">
                                    <Clock className="w-3 h-3 text-green-600" />
                                  </div>
                                  <span className="text-xs text-gray-600">২৪/৭ সাপোর্ট</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}