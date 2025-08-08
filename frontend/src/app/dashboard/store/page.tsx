'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, Package, TrendingUp, ShoppingCart, Plus, Upload, Image as ImageIcon, Calendar, Award, Leaf } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
                  <h1 className="text-3xl font-bold text-gray-900">আমার কৃষি দোকান</h1>
        <p className="text-gray-600 mt-1">আপনার পণ্য, তালিকা এবং অর্ডার পরিচালনা করুন</p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-lg font-semibold">{myListings.length}</div>
                <div className="text-sm text-gray-600">সক্রিয় লিস্টিং</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-lg font-semibold">{orders.filter(o => o.status !== 'completed').length}</div>
                <div className="text-sm text-gray-600">মুলতুবি অর্ডার</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            পণ্য তৈরি করুন
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            আমার লিস্টিং
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            অর্ডার
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            বিশ্লেষণ
          </TabsTrigger>
        </TabsList>

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

        {/* My Listings Tab */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>আমার সক্রিয় লিস্টিং</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map(listing => (
                  <Card key={listing.id} className="overflow-hidden">
                    {listing.product_image_url ? (
                      <img 
                        src={`http://localhost:8000${listing.product_image_url}`} 
                        alt={listing.product_name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                          <span className="text-sm">No Image</span>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{listing.product_name}</h3>
                        <Badge variant="outline">{listing.product_category}</Badge>
                      </div>
                      
                                              <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>দাম:</span>
                            <span className="font-semibold text-green-600">৳{Number(listing.price).toFixed(2)}/{listing.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>মজুদ:</span>
                            <span>{Number(listing.stock_qty).toFixed(1)} {listing.unit}</span>
                          </div>
                        <div className="flex justify-between">
                          <span>অবস্থান:</span>
                          <span>{listing.location}</span>
                        </div>
                        {listing.organic_certified && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Leaf className="w-4 h-4" />
                            <span>জৈব সার্টিফাইড</span>
                          </div>
                        )}
                        {listing.quality_grade && (
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            <span>গ্রেড {listing.quality_grade}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
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
    </div>
  )
}