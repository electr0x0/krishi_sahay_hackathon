export interface ImpactStat {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface WorkStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: string;
}

// Market Price interface to match backend API
export interface MarketPrice {
  id: number;
  product_name_bn: string;
  product_name_en: string;
  category: string;
  unit: string;
  market_name: string;
  district: string;
  division: string;
  market_type: string;
  current_price: number;
  previous_price?: number;
  min_price?: number;
  max_price?: number;
  avg_price?: number;
  price_change?: number;
  price_change_percentage?: number;
  trend?: string;
  supply_level?: string;
  demand_level?: string;
  quality_grade?: string;
  data_source: string;
  reliability_score: number;
  price_date: string;
  created_at: string;
  updated_at?: string;
}

// Frontend display interface for compatibility
export interface MarketPriceDisplay {
  item: string;
  price: number;
  unit: string;
  market: string;
  date: string;
  trend: string;
  change_percentage: number;
  category?: string;
}

// Sensor Data interface
export interface SensorData {
  id: string;
  sensor_id?: string;
  sensor_type?: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  location: string;
  battery_level?: number;
  signal_strength?: number;
  data?: {
    temperature?: number;
    humidity?: number;
    moisture?: number;
    soil_moisture?: number;
    light?: number;
  };
}

// Weather Data interface
export interface WeatherData {
  temperature?: number;
  humidity?: number;
  condition?: string;
  location: string;
  timestamp?: string;
  current?: {
    temperature: number;
    humidity: number;
    condition: string;
    wind_speed: number;
    precipitation: number;
  };
  forecast?: Array<{
    date: string;
    temperature?: number;
    high?: number;
    low?: number;
    condition: string;
    precipitation_chance?: number;
  }>;
}

// Alert interface
export interface Alert {
  id: string;
  type: 'weather' | 'pest' | 'market' | 'sensor' | 'disease_detected' | 'severe_disease' | 'multiple_diseases';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  action_required: boolean;
}

// Detection Alert from backend
export interface DetectionAlert {
  id: number;
  user_id: number;
  detection_history_id: number;
  alert_type: string;
  severity: string;
  disease_names: string[];
  confidence_scores: number[];
  title_bn?: string;
  title_en?: string;
  message_bn?: string;
  message_en?: string;
  recommendations_bn?: string;
  recommendations_en?: string;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  read_at?: string;
  dismissed_at?: string;
}

// Alias for compatibility
export type AlertType = Alert;
export type SensorDataDisplay = SensorData;
export type WeatherDataDisplay = WeatherData;

// Dashboard Stats interface
export interface DashboardStats {
  total_farms: number;
  active_sensors: number;
  weather_alerts: number;
  market_trends: {
    price_changes: { [key: string]: number };
    trending_crops: string[];
  };
  recent_activities: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

// AI-powered interfaces
export interface AIPriceRecommendation {
  product_name: string;
  current_price: number;
  suggested_price: number;
  confidence: number;
  price_change: number;
  price_change_percentage: number;
  reasoning: string;
  recommendation: string;
  updated_at: string;
}

export interface MarketForecast {
  product_name: string;
  forecast_days: number;
  forecast: {
    date: string;
    predicted_price: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  generated_at: string;
}

export interface MarketInsights {
  market_sentiment: {
    overall: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    description: string;
  };
  trending_products: {
    name: string;
    trend: 'up' | 'down';
    change_percentage: number;
    reason: string;
  }[];
  price_predictions: {
    next_week: {
      direction: 'increase' | 'decrease' | 'stable';
      confidence: number;
      expected_change: number;
    };
    next_month: {
      direction: 'increase' | 'decrease' | 'stable';
      confidence: number;
      expected_change: number;
    };
  };
  recommendations: string[];
  risk_factors: string[];
  generated_at: string;
}

export interface PriceComparison {
  product_name: string;
  user_price: number;
  market_average: number;
  price_difference: number;
  percentage_difference: number;
  analysis: string;
  recommendation: 'competitive' | 'increase' | 'maintain';
  market_comparison: { market: string; price: number }[];
  confidence: number;
  generated_at: string;
}
