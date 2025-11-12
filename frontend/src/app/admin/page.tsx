'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  Activity, 
  Cpu, 
  Eye, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  userGrowth: number;
  totalSensors: number;
  sensorUptime: string;
  detectionsToday: number;
  monthlyRevenue: number;
  revenueGrowth: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      // Import the API service
      const apiModule = await import('@/lib/api.js');
      const api = apiModule.default;
      const token = api.getToken();
      
      console.log('🔑 Admin Dashboard - Token:', token ? 'Present' : 'Missing');
      console.log('🔑 Token length:', token?.length);
      
      if (!token) {
        setError('Not authenticated - Please login again');
        return;
      }
      
      console.log('📡 Fetching metrics from backend...');
      const response = await fetch('http://localhost:8000/api/admin/dashboard/metrics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Received metrics data:', data);
        
        // Map backend snake_case to frontend camelCase
        const mappedMetrics: DashboardMetrics = {
          totalUsers: data.total_users || 0,
          activeUsers: data.active_users || 0,
          userGrowth: data.new_users_today || 0,
          totalSensors: data.total_sensors || 0,
          sensorUptime: `${data.sensor_uptime_percent || 0}%`,
          detectionsToday: data.detections_today || 0,
          monthlyRevenue: data.monthly_revenue || 0,
          revenueGrowth: 0 // TODO: Calculate from backend
        };
        
        setMetrics(mappedMetrics);
        setError('');
      } else {
        setError('Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-2">⚠️ {error || 'No data available'}</p>
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activePercentage = metrics.totalUsers > 0
    ? ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Real-time platform metrics and analytics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <StatCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          change={metrics.userGrowth}
          changeLabel="new today"
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        {/* Active Users */}
        <StatCard
          title="Active Users"
          value={metrics.activeUsers.toLocaleString()}
          subtitle={`${activePercentage}% of total`}
          icon={<Activity className="w-6 h-6" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

        {/* IoT Sensors */}
        <StatCard
          title="IoT Sensors"
          value={metrics.totalSensors.toLocaleString()}
          subtitle={`${metrics.sensorUptime} uptime`}
          icon={<Cpu className="w-6 h-6" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        {/* Detections Today */}
        <StatCard
          title="Detections Today"
          value={metrics.detectionsToday.toString()}
          subtitle="disease detections"
          icon={<Eye className="w-6 h-6" />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />

        {/* Monthly Revenue */}
        <StatCard
          title="Monthly Revenue"
          value={`$${metrics.monthlyRevenue.toLocaleString()}`}
          change={metrics.revenueGrowth}
          changeLabel="vs last month"
          icon={<DollarSign className="w-6 h-6" />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth (Last 30 Days)</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-400">Chart.js or Recharts visualization here</p>
          </div>
        </Card>

        {/* Disease Detection Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Disease Detection Trends</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-400">Disease frequency bar chart here</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <ActivityItem
            title="New user registered"
            description="john.farmer@email.com joined the platform"
            time="2 minutes ago"
            type="user"
          />
          <ActivityItem
            title="Sensor offline alert"
            description="ESP32_045 went offline - Farm #234"
            time="15 minutes ago"
            type="warning"
          />
          <ActivityItem
            title="Disease detected"
            description="Tomato Late Blight detected - Farm #156"
            time="1 hour ago"
            type="detection"
          />
          <ActivityItem
            title="Marketplace transaction"
            description="Pesticide order completed - $85.00"
            time="2 hours ago"
            type="success"
          />
        </div>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  change, 
  changeLabel,
  icon, 
  iconBg, 
  iconColor 
}: {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center mt-2 text-xs">
              {change >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+{change}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                  <span className="text-red-600 font-medium">{change}</span>
                </>
              )}
              {changeLabel && <span className="text-gray-500 ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={`${iconBg} ${iconColor} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// Activity Item Component
function ActivityItem({ 
  title, 
  description, 
  time, 
  type 
}: {
  title: string;
  description: string;
  time: string;
  type: 'user' | 'warning' | 'detection' | 'success';
}) {
  const colors = {
    user: 'bg-blue-100 text-blue-600',
    warning: 'bg-yellow-100 text-yellow-600',
    detection: 'bg-red-100 text-red-600',
    success: 'bg-green-100 text-green-600'
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`w-2 h-2 mt-2 rounded-full ${colors[type].split(' ')[0].replace('100', '500')}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
}
