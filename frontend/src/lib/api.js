import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from cookies
  getToken = () => {
    return Cookies.get('auth_token');
  }
  // Set auth token in cookies
  setToken = (token) => {
    Cookies.set('auth_token', token, { 
      expires: 30,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  // Remove auth token
  removeToken = () => {
    Cookies.remove('auth_token');
  }

  // Generic API request method
  request = async (endpoint, options = {}) => {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const defaultHeaders = {};

    // Only set Content-Type if not FormData (let browser set it for FormData)
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication APIs
  register = async (userData) => {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone_number || userData.phone || '',
        password: userData.password,
        confirm_password: userData.confirmPassword || userData.confirm_password,
        division: userData.division,
        district: userData.district,
        upazila: userData.upazila,
        location: userData.location,
        farming_experience: userData.farming_experience
      }),
    });

    if (data.access_token) {
      this.setToken(data.access_token);
    }

    return data;
  }

  login = async (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.email || credentials.username);
    formData.append('password', credentials.password);

    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: formData, // FormData will automatically set the right Content-Type
    });

    if (data.access_token) {
      this.setToken(data.access_token);
    }

    return data;
  }

  getCurrentUser = async () => {
    return this.request('/api/auth/me');
  }

  getProfile = async () => {
    return this.request('/api/users/me');
  }

  updateProfile = async (profileData) => {
    return this.request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  logout = async () => {
    this.removeToken();
    // Optional: call backend logout if it exists
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignore logout API errors
      console.log('Logout API call failed (ignored):', error.message);
    }
  }

  // Chat APIs
  createChatSession = async (data = {}) => {
    return this.request('/api/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title || 'নতুন কথোপকথন',
        language: data.language || 'bn'
      }),
    });
  }

  getChatSessions = async () => {
    return this.request('/api/chat/sessions');
  }

  getChatSession = async (sessionId) => {
    return this.request(`/api/chat/sessions/${sessionId}`);
  }

  sendMessage = async (sessionId, message) => {
    return this.request(`/api/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content: message.content,
        language: message.language || 'bn',
        message_type: message.message_type || 'text',
        voice_confidence: message.voice_confidence,
        voice_duration: message.voice_duration
      }),
    });
  }

  sendVoiceMessage = async (sessionId, message) => {
    return this.request(`/api/chat/sessions/${sessionId}/voice`, {
      method: 'POST',
      body: JSON.stringify({
        content: message.content,
        language: message.language || 'bn',
        message_type: 'voice',
        voice_confidence: message.voice_confidence || 0.9,
        voice_duration: message.voice_duration || 2.0
      }),
    });
  }

  getChatHistory = async (sessionId) => {
    return this.request(`/api/chat/sessions/${sessionId}/messages`);
  }

  // Dashboard APIs
  getDashboardStats = async () => {
    return this.request('/api/dashboard/stats');
  }

  getCriticalAlerts = async () => {
    return this.request('/api/dashboard/alerts');
  }

  // IoT Sensor APIs
  getSensorData = async () => {
    return this.request('/api/iot/sensors/data');
  }

  getSensorDataByType = async (sensorType) => {
    return this.request(`/api/iot/sensors/type/${sensorType}`);
  }

  sendSensorData = async (data) => {
    return this.request('/api/iot/sensors/data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Weather APIs
  getWeatherData = async (location) => {
    const params = location ? `?location=${encodeURIComponent(location)}` : '';
    return this.request(`/api/weather/current${params}`);
  }

  getWeatherForecast = async (location, days = 3) => {
    const params = `?location=${encodeURIComponent(location)}&days=${days}`;
    return this.request(`/api/weather/forecast${params}`);
  }

  getWeatherAlerts = async (location) => {
    const params = location ? `?location=${encodeURIComponent(location)}` : '';
    return this.request(`/api/weather/alerts${params}`);
  }

  // Market APIs  
  getMarketPrices = async () => {
    return this.request('/api/market/prices');
  }

  getItemPrice = async (item) => {
    return this.request(`/api/market/prices/${encodeURIComponent(item)}`);
  }

  // AI Agent API
  askAgent = async (query, context = {}) => {
    return this.request('/api/agent/ask', {
      method: 'POST',
      body: JSON.stringify({
        query,
        session_id: context.session_id,
        language: context.language || 'bn',
        user_context: context.user_context || {}
      }),
    });
  }

  // Helper method to check if user is authenticated
  isAuthenticated = () => {
    return !!this.getToken();
  }

  // Helper method for handling API errors with fallback data
  safeRequest = async (endpoint, options = {}, fallbackData = null) => {
    try {
      return await this.request(endpoint, options);
    } catch (error) {
      console.warn(`API call failed, using fallback data:`, error.message);
      return fallbackData;
    }
  }

  // TTS API - returns audio blob
  synthesizeSpeech = async (text, language = null, slow = false) => {
    const url = `${this.baseURL}/api/tts/synthesize`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text,
          language: language || undefined, // Send undefined instead of null
          slow
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
      }

      // Return the response object for blob handling
      return response;
    } catch (error) {
      console.error(`TTS API Error:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const api = new ApiService();

// Export both the class and instance
export default api;
export { ApiService };
