'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Phone, 
  MapPin, 
  CreditCard,
  ArrowLeft,
  Calendar
} from 'lucide-react'

export default function StoreTrackPage() {
  const [phone, setPhone] = useState('')
  const [orderId, setOrderId] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState<number | null>(null)

  const searchOrders = async () => {
    if (!phone.trim()) {
      alert('Please enter your phone number')
      return
    }

    setLoading(true)
    try {
      const result = await api.trackStoreOrders(phone, orderId ? parseInt(orderId) : null)
      setOrders(result || [])
      if (result?.length === 0) {
        alert('No orders found for this phone number')
      }
    } catch (error: any) {
      alert('Failed to search orders: ' + error.message)
    }
    setLoading(false)
  }

  const makePayment = async (order: any) => {
    const amount = 100 // Demo amount
    setPaymentLoading(order.id)
    try {
      await api.request(`/api/store/orders/${order.id}/pay?amount=${amount}`, { method: 'POST' })
      alert('Payment successful!')
      // Refresh orders
      searchOrders()
    } catch (error: any) {
      alert('Payment failed: ' + error.message)
    }
    setPaymentLoading(null)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600 bg-yellow-100', text: 'Pending' }
      case 'processing':
        return { icon: Package, color: 'text-blue-600 bg-blue-100', text: 'Processing' }
      case 'shipped':
        return { icon: Truck, color: 'text-purple-600 bg-purple-100', text: 'Shipped' }
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'Completed' }
      case 'cancelled':
        return { icon: Clock, color: 'text-red-600 bg-red-100', text: 'Cancelled' }
      default:
        return { icon: Clock, color: 'text-gray-600 bg-gray-100', text: status }
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'unpaid': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateOrderTotal = (items: any[]) => {
    return items?.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0) || 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="/store" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </a>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
              <p className="text-gray-600 mt-1">Enter your phone number to find your orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Your Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+880 1xxx-xxxxxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order ID (Optional)</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="12345"
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={searchOrders} 
              className="mt-4 bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Orders'}
            </Button>
          </CardContent>
        </Card>

        {/* Orders List */}
        {orders.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Orders ({orders.length})</h2>
            
            {orders.map(order => {
              const statusInfo = getStatusInfo(order.status)
              const StatusIcon = statusInfo.icon
              const orderTotal = calculateOrderTotal(order.items)
              
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {order.phone}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.text}
                        </Badge>
                        <div className="text-lg font-bold text-gray-900 mt-1">
                          ৳{Number(orderTotal).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                        <p className="text-sm text-gray-600">{order.customer_name}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                        <div className="flex items-start gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{order.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">Listing #{item.listing_id}</div>
                              <div className="text-sm text-gray-600">
                                Quantity: {Number(item.quantity).toFixed(1)} × ৳{Number(item.unit_price).toFixed(2)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">৳{Number(item.unit_price * item.quantity).toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Payment Status</h4>
                          <Badge className={getPaymentStatusColor(order.payment?.status || 'unpaid')}>
                            <CreditCard className="w-3 h-3 mr-1" />
                            {order.payment?.status || 'Unpaid'}
                            {order.payment?.amount && ` (৳${order.payment.amount})`}
                          </Badge>
                          {order.payment?.paid_at && (
                            <div className="text-xs text-gray-500 mt-1">
                              Paid on {new Date(order.payment.paid_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        {(!order.payment || order.payment.status !== 'paid') && (
                          <Button
                            onClick={() => makePayment(order)}
                            disabled={paymentLoading === order.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {paymentLoading === order.id ? 'Processing...' : 'Pay Now (Demo)'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">Order Timeline</h4>
                      <div className="flex items-center gap-4">
                        {['pending', 'processing', 'shipped', 'completed'].map((step, index) => {
                          const isActive = ['pending', 'processing', 'shipped', 'completed'].indexOf(order.status) >= index
                          const isCurrent = order.status === step
                          
                          return (
                            <div key={step} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                isActive ? 'bg-green-600' : 'bg-gray-300'
                              } ${isCurrent ? 'ring-2 ring-green-600 ring-offset-2' : ''}`} />
                              <span className={`text-xs ${
                                isActive ? 'text-green-600 font-medium' : 'text-gray-400'
                              }`}>
                                {step.charAt(0).toUpperCase() + step.slice(1)}
                              </span>
                              {index < 3 && <div className={`w-8 h-0.5 ${
                                isActive ? 'bg-green-600' : 'bg-gray-300'
                              }`} />}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && phone && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any orders for the phone number "{phone}".
              </p>
              <Button variant="outline" onClick={() => { setPhone(''); setOrderId(''); setOrders([]) }}>
                Try Different Number
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}