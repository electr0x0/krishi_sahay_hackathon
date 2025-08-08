// API base URL
const API_BASE_URL = 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  // IoT Sensor endpoints
  LATEST_SENSOR_DATA: `${API_BASE_URL}/api/iot/get-latest-data`,
  SENSOR_HISTORY: `${API_BASE_URL}/api/iot/get-data-history`,
  SUBMIT_SENSOR_DATA: `${API_BASE_URL}/api/iot/sensor-data/`,
  
  // Dashboard endpoints
  DASHBOARD_SENSORS: `${API_BASE_URL}/api/iot/dashboard/sensors`,
} as const;

// Types for sensor data
export interface SensorData {
  id: number;
  timestamp: string;
  temperature_c: number;
  humidity_percent: number;
  heat_index_c: number;
  water_level_percent: number;
  soil_moisture_percent: number;
  device_status: string;
  data_quality: string;
  received_at: string;
}

export interface SensorHistoryResponse {
  data: SensorData[];
  count: number;
  latest_timestamp: string;
}

export interface ESP32SensorData {
  timestamp: string;
  temperature_c: number;
  humidity_percent: number;
  heat_index_c: number;
  water_level_raw: number;
  water_level_percent: number;
  soil_moisture_raw: number;
  soil_moisture_percent: number;
}

// API helper functions
export class SensorAPI {
  static async getLatestData(): Promise<SensorData> {
    const response = await fetch(API_ENDPOINTS.LATEST_SENSOR_DATA);
    if (!response.ok) {
      throw new Error(`Failed to fetch latest sensor data: ${response.statusText}`);
    }
    return response.json();
  }

  static async getHistoryData(limit: number = 50): Promise<SensorHistoryResponse> {
    const response = await fetch(`${API_ENDPOINTS.SENSOR_HISTORY}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch sensor history: ${response.statusText}`);
    }
    return response.json();
  }

  static async submitSensorData(data: ESP32SensorData): Promise<any> {
    const response = await fetch(API_ENDPOINTS.SUBMIT_SENSOR_DATA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit sensor data: ${response.statusText}`);
    }
    return response.json();
  }

  // Utility function to check if API is available
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// SWR fetcher function
export const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error(`API request failed: ${res.statusText}`);
  }
  return res.json();
});

// Utility functions for data formatting
export class DataFormatter {
  static formatTimestamp(timestamp: string): string {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  }

  static formatTimeForChart(timestamp: string): string {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  }

  static formatSensorValue(value: number, unit: string, decimals: number = 1): string {
    if (value === null || value === undefined || isNaN(value)) {
      return `N/A${unit}`;
    }
    return `${value.toFixed(decimals)}${unit}`;
  }

  static getStatusColor(status: string): string {
    if (!status) return 'text-gray-500';
    switch (status.toLowerCase()) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  }

  static getQualityColor(quality: string): string {
    if (!quality) return 'text-gray-500';
    switch (quality.toLowerCase()) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }
}

export default SensorAPI;
