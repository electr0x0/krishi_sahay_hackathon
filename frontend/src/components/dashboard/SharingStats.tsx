'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Wrench, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Clock,
  Star,
  Heart,
  MessageCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SharingStatsProps {
  totalEquipment: number;
  totalLaborRequests: number;
  activeUsers: number;
  totalSavings: number;
  averageRating: number;
  totalTransactions: number;
  topLocations: string[];
  recentActivity: Array<{
    id: string;
    type: 'equipment' | 'labor';
    title: string;
    user: string;
    location: string;
    time: string;
  }>;
}

export default function SharingStats({
  totalEquipment,
  totalLaborRequests,
  activeUsers,
  totalSavings,
  averageRating,
  totalTransactions,
  topLocations,
  recentActivity
}: SharingStatsProps) {
  const stats = [
    {
      title: 'মোট যন্ত্রপাতি',
      value: totalEquipment,
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'শ্রমিক চাহিদা',
      value: totalLaborRequests,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'সক্রিয় ব্যবহারকারী',
      value: activeUsers,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'মোট সাশ্রয়',
      value: `৳${totalSavings.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${stat.bgColor} ${stat.borderColor} border`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Community Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating and Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              সম্প্রদায় মূল্যায়ন
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">গড় রেটিং</span>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900 mr-2">{averageRating}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= averageRating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">মোট লেনদেন</span>
              <span className="text-lg font-bold text-green-600">{totalTransactions}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">সফল মিল</span>
              <span className="text-lg font-bold text-blue-600">
                {Math.round((totalTransactions / (totalEquipment + totalLaborRequests)) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-500" />
              জনপ্রিয় এলাকা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topLocations.map((location, index) => (
                <div key={location} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{location}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="w-3 h-3 mr-1" />
                    {Math.floor(Math.random() * 50) + 10} ব্যবহারকারী
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-500" />
            সাম্প্রতিক কার্যক্রম
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'equipment' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {activity.type === 'equipment' ? (
                      <Wrench className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user} • {activity.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{activity.time}</span>
                  <Badge variant="outline" className="text-xs">
                    {activity.type === 'equipment' ? 'যন্ত্রপাতি' : 'শ্রমিক'}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Tips */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Heart className="w-5 h-5 mr-2" />
            সম্প্রদায় পরামর্শ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">যন্ত্রপাতি ভাগাভাগি</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• সঠিক দাম নির্ধারণ করুন</li>
                <li>• যন্ত্রপাতির অবস্থা ভালো রাখুন</li>
                <li>• সময়মতো যোগাযোগ করুন</li>
                <li>• ব্যবহারের নিয়মাবলী জানান</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">শ্রমিক চাহিদা</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• স্পষ্ট কাজের বিবরণ দিন</li>
                <li>• ন্যায্য মজুরি প্রদান করুন</li>
                <li>• নিরাপদ কাজের পরিবেশ নিশ্চিত করুন</li>
                <li>• সময়মতো অর্থ প্রদান করুন</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
