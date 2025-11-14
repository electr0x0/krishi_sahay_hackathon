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
  const [activeTab, setActiveTab] = useState('listings')

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

      const newProduct = await api.createStoreProduct({
        ...productForm,
        image_url: imageUrl
      })

      // Auto-fill the listing form with the newly created product
      setListingForm({
        ...listingForm,
        product_id: newProduct.id.toString()
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
      
      // Show success message and guide user to create listing
      alert('Product created successfully! Now create a listing to sell it.')
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
      case 'pending': return 'bg-orange-50 text-orange-700 border border-orange-200'
      case 'processing': return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'shipped': return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'completed': return 'bg-green-50 text-green-700 border border-green-200'
      case 'cancelled': return 'bg-gray-200 text-gray-700 border border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border border-gray-200'
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
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Enhanced Header with Better Layout */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6 border-l-4 border-green-500"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <Store className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-1">
                    আমার কৃষি দোকান
                  </h1>
                  <p className="text-sm md:text-base text-gray-600">
                    পণ্য বিক্রয় এবং অর্ডার পরিচালনা করুন
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-green-500 hover:bg-green-600 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">নতুন পণ্য</span>
                </Button>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">ফিল্টার</span>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Cards with Better Visual Hierarchy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-white rounded-2xl shadow-lg border-l-4 border-green-500 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <Badge className="bg-green-50 text-green-700 border border-green-200 font-semibold">সক্রিয়</Badge>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">{myListings.length}</div>
                <div className="text-sm font-medium text-gray-600">সক্রিয় লিস্টিং</div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">মোট পণ্য তালিকা</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-white rounded-2xl shadow-lg border-l-4 border-blue-500 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <ShoppingCart className="w-7 h-7 text-white" />
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold">মুলতুবি</Badge>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">{pendingOrders}</div>
                <div className="text-sm font-medium text-gray-600">মুলতুবি অর্ডার</div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">প্রক্রিয়াকরণ প্রয়োজন</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-white rounded-2xl shadow-lg border-l-4 border-green-500 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <Badge className="bg-green-50 text-green-700 border border-green-200 font-semibold">সম্পন্ন</Badge>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">{completedOrders}</div>
                <div className="text-sm font-medium text-gray-600">সম্পন্ন অর্ডার</div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">সফল ডেলিভারি</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-white rounded-2xl shadow-lg border-l-4 border-orange-500 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <Badge className="bg-orange-50 text-orange-700 border border-orange-200 font-semibold">আয়</Badge>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">৳{totalRevenue.toFixed(0)}</div>
                <div className="text-sm font-medium text-gray-600">মোট আয়</div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">সব অর্ডার থেকে</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Modern Tabs with Better Spacing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-3">
                <TabsList className="grid w-full grid-cols-4 bg-gray-50 gap-2 p-1">
                  <TabsTrigger 
                    value="listings" 
                    className="flex items-center justify-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-xl transition-all duration-200 py-3 font-medium"
                  >
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:inline">লিস্টিং</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="create" 
                    className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-200 py-3 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">নতুন</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="orders" 
                    className="flex items-center justify-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-xl transition-all duration-200 py-3 font-medium"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">অর্ডার</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className="flex items-center justify-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-xl transition-all duration-200 py-3 font-medium"
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
            <Card className="border-l-4 border-green-500 shadow-lg">
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
            <Card className="border-l-4 border-blue-500 shadow-lg">
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

              {/* Enhanced Product Cards with Modern Design */}
              <TabsContent value="listings">
                {/* Show unlisted products first */}
                {products.filter(p => !myListings.find(l => l.product_id === p.id)).length > 0 && (
                  <div className="mb-8">
                    <div className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-orange-800 mb-1">পণ্য লিস্টিং প্রয়োজন</h3>
                          <p className="text-sm text-orange-700">নিচের পণ্যগুলির জন্য লিস্টিং তৈরি করুন যাতে সেগুলি বিক্রয়ের জন্য প্রদর্শিত হয়</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {products
                        .filter(p => !myListings.find(l => l.product_id === p.id))
                        .map((product, index) => (
                          <div 
                            key={product.id}
                            className="bg-white rounded-xl shadow-md border-l-4 border-orange-500 p-5"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-gray-800 mb-1">{product.name}</h4>
                                <p className="text-sm text-gray-600">{product.category} • {product.unit}</p>
                              </div>
                              <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
                                লিস্টিং নেই
                              </Badge>
                            </div>
                            <Button
                              onClick={() => {
                                setListingForm({
                                  ...listingForm,
                                  product_id: product.id.toString()
                                })
                                // Switch to create tab
                                setActiveTab('create')
                              }}
                              className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-3"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              লিস্টিং তৈরি করুন
                            </Button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {myListings.length === 0 && products.filter(p => !myListings.find(l => l.product_id === p.id)).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-lg p-12 md:p-16 text-center border-l-4 border-gray-300"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">কোনো পণ্য নেই</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">প্রথমে একটি পণ্য তৈরি করুন, তারপর সেটির জন্য লিস্টিং তৈরি করে বিক্রয় শুরু করুন</p>
                    <Button 
                      onClick={() => {
                        setActiveTab('create')
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      পণ্য তৈরি করুন
                    </Button>
                  </motion.div>
                ) : myListings.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-lg p-12 md:p-16 text-center border-l-4 border-orange-300"
                  >
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Tag className="w-12 h-12 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">লিস্টিং তৈরি করুন</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">আপনার পণ্যগুলির জন্য মূল্য এবং মজুদ সেট করে লিস্টিং তৈরি করুন</p>
                    <Button 
                      onClick={() => {
                        setActiveTab('create')
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      লিস্টিং তৈরি করুন
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
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-green-500"
                      >
                        {/* Enhanced Product Image */}
                        <div className="relative h-56 overflow-hidden bg-gray-50">
                          {listing.product_image_url ? (
                            <>
                              <img 
                                src={`${process.env.NEXT_PUBLIC_API_URL}${listing.product_image_url}`} 
                                alt={listing.product_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <div className="text-center text-gray-400">
                                <ImageIcon className="w-16 h-16 mx-auto mb-3" />
                                <span className="text-sm font-medium">কোনো ছবি নেই</span>
                              </div>
                            </div>
                          )}

                          {/* Floating Badges */}
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                            {listing.organic_certified && (
                              <Badge className="bg-green-500 text-white border-0 shadow-lg flex items-center gap-1.5 px-3 py-1.5">
                                <Leaf className="w-3.5 h-3.5" />
                                <span className="font-semibold">জৈব</span>
                              </Badge>
                            )}
                            <Badge className="bg-white text-gray-800 border border-gray-200 shadow-lg ml-auto px-3 py-1.5 font-semibold">
                              {listing.product_category}
                            </Badge>
                          </div>

                          {/* Quality Badge - Bottom Right */}
                          {listing.quality_grade && (
                            <div className="absolute bottom-3 right-3">
                              <Badge className="bg-orange-500 text-white border-0 shadow-lg flex items-center gap-1.5 px-3 py-1.5">
                                <Star className="w-3.5 h-3.5 fill-white" />
                                <span className="font-semibold">গ্রেড {listing.quality_grade}</span>
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Product Info */}
                        <div className="p-6">
                          {/* Product Name */}
                          <h3 className="font-bold text-xl text-gray-800 mb-4 line-clamp-2 min-h-[3.5rem]">
                            {listing.product_name}
                          </h3>

                          {/* Price Section - Enhanced */}
                          <div className="mb-5 pb-5 border-b border-gray-100">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-green-600">
                                ৳{Number(listing.price).toFixed(2)}
                              </span>
                              <span className="text-base text-gray-500 font-medium">/{listing.unit}</span>
                            </div>
                          </div>

                          {/* Info Grid - Better Layout */}
                          <div className="space-y-3 mb-5">
                            <div className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                  <Package className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="font-medium">মজুদ</span>
                              </div>
                              <span className="font-bold text-gray-800">
                                {Number(listing.stock_qty).toFixed(1)} {listing.unit}
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                  <MapPin className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="font-medium">অবস্থান</span>
                              </div>
                              <span className="font-bold text-gray-800">{listing.location}</span>
                            </div>
                          </div>

                          {/* Enhanced Action Button */}
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5"
                          >
                            <Tag className="w-5 h-5" />
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
          <Card className="border-l-4 border-green-500 shadow-lg">
            <CardHeader>
              <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id} className="p-4 shadow-md hover:shadow-lg transition-shadow">
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
            <Card className="border-l-4 border-green-500 shadow-lg">
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
            
            <Card className="border-l-4 border-blue-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">সক্রিয় পণ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{products.filter(p => p.is_active).length}</div>
                <p className="text-sm text-gray-600 mt-1">লিস্টিংয়ের জন্য প্রস্তুত</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-orange-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">গড় অর্ডার মূল্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
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