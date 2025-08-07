'use client'

import { useEffect, useState } from 'react'
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
  CreditCard
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
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [showOrganic, setShowOrganic] = useState(false)

  // Checkout
  const [checkoutData, setCheckoutData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    advance_amount: 0
  })
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

    setFilteredListings(filtered)
  }, [listings, searchQuery, selectedCategory, selectedLocation, priceRange, showOrganic])

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agriculture Marketplace</h1>
              <p className="text-gray-600 mt-1">Fresh produce directly from farmers</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </div>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href="/store/track">Track Order</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </h3>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium mb-2">Search Products</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                  >
                    <option value="">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range (৳)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      value={priceRange.min}
                      onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      value={priceRange.max}
                      onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Organic Filter */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="organic-filter"
                    checked={showOrganic}
                    onChange={e => setShowOrganic(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="organic-filter" className="text-sm font-medium flex items-center gap-1">
                    <Leaf className="w-4 h-4 text-green-600" />
                    Organic Only
                  </label>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setSelectedLocation('')
                    setPriceRange({ min: '', max: '' })
                    setShowOrganic(false)
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="products" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Products ({filteredListings.length})
                </TabsTrigger>
                <TabsTrigger value="cart" className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Cart ({cart.length})
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading products...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredListings.map(listing => (
                      <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          {listing.product_image_url ? (
                            <img 
                              src={`http://localhost:8000${listing.product_image_url}`} 
                              alt={listing.product_name}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                              <div className="text-center text-gray-400">
                                <Package className="w-12 h-12 mx-auto mb-2" />
                                <span className="text-sm">No Image</span>
                              </div>
                            </div>
                          )}
                          {listing.organic_certified && (
                            <Badge className="absolute top-2 left-2 bg-green-600">
                              <Leaf className="w-3 h-3 mr-1" />
                              Organic
                            </Badge>
                          )}
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{listing.product_name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {listing.product_category}
                                </Badge>
                                {listing.quality_grade && (
                                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                                    <Award className="w-3 h-3" />
                                    Grade {listing.quality_grade}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Price & Trend */}
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-2xl font-bold text-green-600">
                                  ৳{Number(listing.price).toFixed(2)}
                                  <span className="text-sm text-gray-600 font-normal">/{listing.unit}</span>
                                </div>
                                <MiniTrend points={trends[listing.id] || []} />
                              </div>
                              <div className="text-right text-sm text-gray-600">
                                <div>Stock: {Number(listing.stock_qty).toFixed(1)} {listing.unit}</div>
                                <div>Min: {Number(listing.min_order_qty).toFixed(1)} {listing.unit}</div>
                              </div>
                            </div>

                            {/* Location & Farmer */}
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{listing.location}</span>
                              </div>
                              {listing.farmer_name && (
                                <div>Farmer: {listing.farmer_name}</div>
                              )}
                              {listing.harvest_date && (
                                <div>Harvested: {new Date(listing.harvest_date).toLocaleDateString()}</div>
                              )}
                            </div>

                            {/* Add to Cart */}
                            <Button 
                              onClick={() => addToCart(listing)}
                              className="w-full bg-green-600 hover:bg-green-700"
                              disabled={listing.stock_qty <= 0}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {listing.stock_qty <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Cart Tab */}
              <TabsContent value="cart">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cart Items */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Shopping Cart</h3>
                        {cart.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Your cart is empty</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {cart.map(item => (
                              <div key={item.listing_id} className="flex items-center gap-4 p-4 border rounded-lg">
                                <div className="flex-1">
                                  <h4 className="font-medium">{item.product_name}</h4>
                                  <p className="text-sm text-gray-600">
                                    ৳{item.price}/{item.unit} • {item.farmer_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Min order: {item.min_order_qty} {item.unit}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateCartQuantity(item.listing_id, item.quantity - 1)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-12 text-center">{item.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateCartQuantity(item.listing_id, item.quantity + 1)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                <div className="text-right">
                                  <div className="font-semibold">৳{Number(item.price * item.quantity).toFixed(2)}</div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => updateCartQuantity(item.listing_id, 0)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))}
                            
                            <div className="border-t pt-4">
                              <div className="flex justify-between text-lg font-semibold">
                                <span>Total:</span>
                                <span>৳{Number(getTotalPrice()).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Checkout */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Checkout</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Full Name *</label>
                            <input
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                              placeholder="Your full name"
                              value={checkoutData.customer_name}
                              onChange={e => setCheckoutData(prev => ({ ...prev, customer_name: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Phone Number *</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="+880 1xxx-xxxxxx"
                                value={checkoutData.phone}
                                onChange={e => setCheckoutData(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Delivery Address *</label>
                            <div className="relative">
                              <MapPinIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <textarea
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                rows={3}
                                placeholder="Your complete address"
                                value={checkoutData.address}
                                onChange={e => setCheckoutData(prev => ({ ...prev, address: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Advance Payment (Optional)</label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="number"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="৳0.00"
                                value={checkoutData.advance_amount}
                                onChange={e => setCheckoutData(prev => ({ ...prev, advance_amount: parseFloat(e.target.value) || 0 }))}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Demo payment - any amount</p>
                          </div>

                          <Button 
                            onClick={placeOrder} 
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={cart.length === 0 || checkoutLoading}
                          >
                            {checkoutLoading ? 'Placing Order...' : `Place Order • ৳${Number(getTotalPrice()).toFixed(2)}`}
                          </Button>

                          {orderResult && (
                            <div className="text-sm text-green-700 p-3 bg-green-50 rounded-lg">
                              ✅ Order #{orderResult.id} placed successfully!
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}