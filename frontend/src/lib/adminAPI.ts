const API_BASE_URL = 'http://localhost:8000';

export class AdminAPI {
  private static getHeaders(): HeadersInit {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  static async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async patch(endpoint: string, data?: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Specific API functions
export const adminAPI = {
  // Dashboard
  getDashboardMetrics: () => AdminAPI.get('/api/admin/dashboard/metrics'),
  getUserGrowth: (days: number = 30) => AdminAPI.get(`/api/admin/dashboard/user-growth?days=${days}`),
  getDiseaseStats: () => AdminAPI.get('/api/admin/dashboard/disease-statistics'),
  getRecentActivity: () => AdminAPI.get('/api/admin/dashboard/recent-activity'),

  // Users
  getUsers: (skip: number = 0, limit: number = 100) => 
    AdminAPI.get(`/api/admin/users?skip=${skip}&limit=${limit}`),
  getUser: (userId: number) => AdminAPI.get(`/api/admin/users/${userId}`),
  suspendUser: (userId: number) => AdminAPI.patch(`/api/admin/users/${userId}/suspend`),
  activateUser: (userId: number) => AdminAPI.patch(`/api/admin/users/${userId}/activate`),
  deleteUser: (userId: number) => AdminAPI.delete(`/api/admin/users/${userId}`),

  // Sensors
  getSensors: (skip: number = 0, limit: number = 100) => 
    AdminAPI.get(`/api/admin/sensors?skip=${skip}&limit=${limit}`),
  getSensor: (sensorId: number) => AdminAPI.get(`/api/admin/sensors/${sensorId}`),
  updateSensorStatus: (sensorId: number, status: string) => 
    AdminAPI.patch(`/api/admin/sensors/${sensorId}/status`, { status }),

  // Detections
  getDetections: (skip: number = 0, limit: number = 100) => 
    AdminAPI.get(`/api/admin/detections?skip=${skip}&limit=${limit}`),
  getDetection: (detectionId: number) => AdminAPI.get(`/api/admin/detections/${detectionId}`),
  getDetectionStats: () => AdminAPI.get('/api/admin/detections/stats/summary'),
};
