// API base URL
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

// Import the main API service for authenticated requests
import api from './api';

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
    return await api.getLatestSensorData();
  }

  static async getHistoryData(limit: number = 50): Promise<SensorHistoryResponse> {
    return await api.getSensorDataHistory({ limit: limit.toString() });
  }

  static async submitSensorData(data: ESP32SensorData): Promise<{success: boolean; message: string}> {
    return await api.request('/api/iot/sensor-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Utility function to check if API is available
  static async healthCheck(): Promise<boolean> {
    try {
      await api.request('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// SWR fetcher function that uses the authenticated API service
export const fetcher = async (url: string) => {
  try {
    // Extract the endpoint from the full URL
    const endpoint = url.replace(API_BASE_URL, '');
    return await api.request(endpoint);
  } catch (error) {
    throw new Error(`API request failed: ${error}`);
  }
};

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
