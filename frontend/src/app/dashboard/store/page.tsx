'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Camera, Package, TrendingUp, ShoppingCart, Plus, Upload, 
  Image as ImageIcon, Calendar, Award, Leaf, Store, 
  MapPin, Tag, Star, CheckCircle2, Clock, TruckIcon,
  Filter, Search, X, Sparkles, BarChart3, DollarSign
} from 'lucide-react'

export default function DashboardStorePage() {
  const [products, setProducts] = useState<any[]>([])
  const [myListings, setMyListings] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Product form
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'vegetables',
    unit: 'kg',
    description: '',
    image_url: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  // Listing form
  const [listingForm, setListingForm] = useState({
    product_id: '',
    price: '',
    stock_qty: '',
    location: '',
    min_order_qty: '1',
    harvest_date: '',
    quality_grade: 'A',
    organic_certified: false
  })

  const categories = [
    'vegetables', 'fruits', 'grains', 'pulses', 'spices', 'herbs', 'dairy', 'meat', 'seafood', 'other'
  ]

  const qualityGrades = ['A', 'B', 'C']

  const load = async () => {
    setLoading(true)
    try {
      const [prods, listings, orderData] = await Promise.all([
        api.request('/api/store/products'),
        api.request('/api/store/listings/mine'),
        api.getFarmerStoreOrders()
      ])
      setProducts(prods || [])
      setMyListings(listings || [])
      setOrders(orderData || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null
    setUploading(true)
    try {
      const result = await api.uploadProductImage(imageFile)
      return result.image_url
    } catch (error) {
      alert('Image upload failed')
      return null
    } finally {
      setUploading(false)
    }
  }

  const createProduct = async () => {
    if (!productForm.name) {
      alert('Product name is required')
      return
    }

    try {
      let imageUrl = productForm.image_url
      if (imageFile) {
        imageUrl = await uploadImage()
        if (!imageUrl) return
      }

      await api.createStoreProduct({
        ...productForm,
        image_url: imageUrl
      })

      setProductForm({
        name: '',
        category: 'vegetables',
        unit: 'kg',
        description: '',
        image_url: ''
      })
      setImageFile(null)
      setImagePreview('')
      load()
      alert('Product created successfully!')
    } catch (error: any) {
      alert('Failed to create product: ' + error.message)
    }
  }

  const createListing = async () => {
    if (!listingForm.product_id || !listingForm.price || !listingForm.stock_qty || !listingForm.location) {
      alert('Please fill all required fields')
      return
    }

    try {
      await api.createStoreListing({
        ...listingForm,
        price: parseFloat(listingForm.price),
        stock_qty: parseFloat(listingForm.stock_qty),
        min_order_qty: parseFloat(listingForm.min_order_qty),
        product_id: parseInt(listingForm.product_id),
        harvest_date: listingForm.harvest_date || null
      })

      setListingForm({
        product_id: '',
        price: '',
        stock_qty: '',
        location: '',
        min_order_qty: '1',
        harvest_date: '',
        quality_grade: 'A',
        organic_certified: false
      })
      load()
      alert('Listing created successfully!')
    } catch (error: any) {
      alert('Failed to create listing: ' + error.message)
    }
  }

  const updateOrderStatus = async (orderId: number, currentStatus: string) => {
    const statusFlow = {
      'pending': 'processing',
      'processing': 'shipped',
      'shipped': 'completed'
    }
    const nextStatus = statusFlow[currentStatus as keyof typeof statusFlow]
    if (!nextStatus) return

    try {
      await api.updateStoreOrderStatus(orderId, nextStatus)
      load()
    } catch (error: any) {
      alert('Failed to update status: ' + error.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" />
        <div className="relative z-10 flex items-center justify-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    )
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.payment?.amount || 0), 0);
  const activeProducts = products.filter(p => p.is_active).length;
  const pendingOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-green-400/10 to-emerald-400/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl shadow-2xl mb-4"
            >
              <Store className="w-10 h-10 text-white" />
            </motion.div>

            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                আমার কৃষি দোকান
              </h1>
              <p className="text-lg text-gray-600">
                🌾 <span className="font-semibold">পণ্য বিক্রয়</span> এবং অর্ডার পরিচালনা করুন
              </p>
            </div>
          </motion.div>

          {/* Stats Cards Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">সক্রিয়</Badge>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{myListings.length}</div>
                <div className="text-sm text-gray-600">সক্রিয় লিস্টিং</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">মুলতুবি</Badge>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{pendingOrders}</div>
                <div className="text-sm text-gray-600">মুলতুবি অর্ডার</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">সম্পন্ন</Badge>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{completedOrders}</div>
                <div className="text-sm text-gray-600">সম্পন্ন অর্ডার</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">আয়</Badge>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">৳{totalRevenue.toFixed(0)}</div>
                <div className="text-sm text-gray-600">মোট আয়</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Tabs defaultValue="listings" className="space-y-6">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl border-0 shadow-xl p-2">
                <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2">
                  <TabsTrigger 
                    value="listings" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl transition-all duration-200"
                  >
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:inline">আমার লিস্টিং</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="create" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">পণ্য তৈরি</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="orders" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl transition-all duration-200"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">অর্ডার</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white rounded-xl transition-all duration-200"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">বিশ্লেষণ</span>
                  </TabsTrigger>
                </TabsList>
              </div>

        {/* Create Product Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  নতুন পণ্য তৈরি করুন
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">পণ্যের নাম *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="যেমন: তাজা টমেটো, জৈব চাল"
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ধরন *</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    >
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
                  <div>
                    <label className="block text-sm font-medium mb-2">একক *</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      value={productForm.unit}
                      onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                    >
                      <option value="kg">কিলোগ্রাম (কেজি)</option>
                      <option value="piece">পিস</option>
                      <option value="dozen">ডজন</option>
                      <option value="liter">লিটার</option>
                      <option value="gram">গ্রাম</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">বিবরণ</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="আপনার পণ্যের গুণমান, কৃষি পদ্ধতি ইত্যাদি বর্ণনা করুন"
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">পণ্যের ছবি</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {imagePreview ? (
                      <div className="text-center">
                        <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-lg mb-4" />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview('')
                          }}
                        >
                          ছবি মুছুন
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div className="text-sm text-gray-600 mb-4">আপনার পণ্যের উচ্চমানের ছবি আপলোড করুন</div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload">
                          <Button variant="outline" className="cursor-pointer" asChild>
                            <span>
                              <Camera className="w-4 h-4 mr-2" />
                              ছবি নির্বাচন করুন
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={createProduct} className="w-full bg-green-600 hover:bg-green-700" disabled={uploading}>
                  {uploading ? 'আপলোড হচ্ছে...' : 'পণ্য তৈরি করুন'}
                </Button>
              </CardContent>
            </Card>

            {/* Create Listing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  লিস্টিং তৈরি করুন
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">পণ্য নির্বাচন করুন *</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    value={listingForm.product_id}
                    onChange={e => setListingForm({ ...listingForm, product_id: e.target.value })}
                  >
                    <option value="">একটি পণ্য নির্বাচন করুন...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">প্রতি একক দাম *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      placeholder="৳০.০০"
                      value={listingForm.price}
                      onChange={e => setListingForm({ ...listingForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">মজুদের পরিমাণ *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      placeholder="০"
                      value={listingForm.stock_qty}
                      onChange={e => setListingForm({ ...listingForm, stock_qty: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">অবস্থান *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="যেমন: ঢাকা, চট্টগ্রাম"
                    value={listingForm.location}
                    onChange={e => setListingForm({ ...listingForm, location: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">সর্বনিম্ন অর্ডার পরিমাণ</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      value={listingForm.min_order_qty}
                      onChange={e => setListingForm({ ...listingForm, min_order_qty: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">মানের গ্রেড</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      value={listingForm.quality_grade}
                      onChange={e => setListingForm({ ...listingForm, quality_grade: e.target.value })}
                    >
                      {qualityGrades.map(grade => (
                        <option key={grade} value={grade}>গ্রেড {grade}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ফসল তোলার তারিখ</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    value={listingForm.harvest_date}
                    onChange={e => setListingForm({ ...listingForm, harvest_date: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="organic"
                    checked={listingForm.organic_certified}
                    onChange={e => setListingForm({ ...listingForm, organic_certified: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="organic" className="text-sm font-medium">জৈব সার্টিফাইড</label>
                </div>

                <Button onClick={createListing} className="w-full bg-blue-600 hover:bg-blue-700">
                  লিস্টিং তৈরি করুন
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

              {/* My Listings Tab - Enhanced Product Cards */}
              <TabsContent value="listings">
                {myListings.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl p-12 text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">কোনো লিস্টিং নেই</h3>
                    <p className="text-gray-600 mb-6">আপনার প্রথম পণ্য তৈরি করে বিক্রয় শুরু করুন</p>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      পণ্য তৈরি করুন
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myListings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="group relative bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl"
                      >
                        {/* Product Image */}
                        <div className="relative h-48 overflow-hidden">
                          {listing.product_image_url ? (
                            <>
                              <img 
                                src={`${process.env.NEXT_PUBLIC_API_URL}${listing.product_image_url}`} 
                                alt={listing.product_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <div className="text-center text-gray-400">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                                <span className="text-sm">কোনো ছবি নেই</span>
                              </div>
                            </div>
                          )}

                          {/* Category Badge */}
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 border-0 shadow-lg">
                              {listing.product_category}
                            </Badge>
                          </div>

                          {/* Organic Badge */}
                          {listing.organic_certified && (
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-green-500 text-white border-0 shadow-lg flex items-center gap-1">
                                <Leaf className="w-3 h-3" />
                                জৈব
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-5">
                          {/* Product Name */}
                          <h3 className="font-bold text-lg text-gray-800 mb-3 line-clamp-2">
                            {listing.product_name}
                          </h3>

                          {/* Price */}
                          <div className="flex items-baseline justify-between mb-4">
                            <div>
                              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                ৳{Number(listing.price).toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-600 ml-1">/{listing.unit}</span>
                            </div>
                            {listing.quality_grade && (
                              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-md flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                গ্রেড {listing.quality_grade}
                              </Badge>
                            )}
                          </div>

                          {/* Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Package className="w-4 h-4" />
                                <span>মজুদ</span>
                              </div>
                              <span className="font-semibold text-gray-800">
                                {Number(listing.stock_qty).toFixed(1)} {listing.unit}
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>অবস্থান</span>
                              </div>
                              <span className="font-semibold text-gray-800">{listing.location}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Tag className="w-4 h-4" />
                            বিস্তারিত দেখুন
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">{order.customer_name} • {order.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, order.status)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            স্ট্যাটাস এগিয়ে নিন
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>ঠিকানা:</strong> {order.address}
                    </div>
                    
                    <div className="text-sm">
                      <strong>পণ্যসমূহ:</strong>
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between mt-1">
                          <span>লিস্টিং #{item.listing_id} × {Number(item.quantity).toFixed(1)}</span>
                          <span>৳{Number(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {order.payment && (
                      <div className="text-sm mt-2 pt-2 border-t">
                        <span className="text-green-600">
                          পেমেন্ট: {order.payment.status} {order.payment.amount ? `(৳${order.payment.amount})` : ''}
                        </span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">মোট আয়</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ৳{Number(orders.reduce((sum, order) => sum + (order.payment?.amount || 0), 0)).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 mt-1">{orders.length} টি অর্ডার থেকে</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">সক্রিয় পণ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{products.filter(p => p.is_active).length}</div>
                <p className="text-sm text-gray-600 mt-1">লিস্টিংয়ের জন্য প্রস্তুত</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">গড় অর্ডার মূল্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ৳{orders.length > 0 ? Number(orders.reduce((sum, order) => sum + (order.payment?.amount || 0), 0) / orders.length).toFixed(2) : '০.০০'}
                </div>
                <p className="text-sm text-gray-600 mt-1">প্রতি অর্ডারে</p>
              </CardContent>
            </Card>
          </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}