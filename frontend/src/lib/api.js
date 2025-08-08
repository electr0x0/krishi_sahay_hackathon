import Cookies from "js-cookie";

// Use empty base URL in development to leverage Next.js proxy
// In production, set NEXT_PUBLIC_API_URL to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from cookies
  getToken = () => {
    return Cookies.get("auth_token");
  };
  // Set auth token in cookies
  setToken = (token) => {
    Cookies.set("auth_token", token, {
      expires: 30,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  };

  // Remove auth token
  removeToken = () => {
    Cookies.remove("auth_token");
  };

  // Generic API request method
  request = async (endpoint, options = {}) => {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const defaultHeaders = {};

    // Only set Content-Type if not FormData (let browser set it for FormData)
    if (!(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
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
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        throw new Error(
          errorData.detail || errorData.message || `HTTP ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  };

  // Authentication APIs
  register = async (userData) => {
    const data = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone_number || userData.phone || "",
        password: userData.password,
        confirm_password: userData.confirmPassword || userData.confirm_password,
        division: userData.division,
        district: userData.district,
        upazila: userData.upazila,
        location: userData.location,
        farming_experience: userData.farming_experience,
      }),
    });

    if (data.access_token) {
      this.setToken(data.access_token);
    }

    return data;
  };

  login = async (credentials) => {
    const formData = new FormData();
    formData.append("username", credentials.email || credentials.username);
    formData.append("password", credentials.password);

    const data = await this.request("/api/auth/login", {
      method: "POST",
      body: formData, // FormData will automatically set the right Content-Type
    });

    if (data.access_token) {
      this.setToken(data.access_token);
    }

    return data;
  };

  
  saveFarmData = async (data) => {
    return this.request('/api/form-data/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getFarmData = async () => {
    return this.request('/api/form-data/');
  }

  getCurrentUser = async () => {
    return this.request("/api/auth/me");
  };

  getProfile = async () => {
    return this.request("/api/users/me");
  };

  updateProfile = async (profileData) => {
    return this.request("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  };

  logout = async () => {
    this.removeToken();
    // Optional: call backend logout if it exists
    try {
      await this.request("/api/auth/logout", { method: "POST" });
    } catch (error) {
      // Ignore logout API errors
      console.log("Logout API call failed (ignored):", error.message);
    }
  };

  // Chat APIs
  createChatSession = async (data = {}) => {
    return this.request("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({
        title: data.title || "নতুন কথোপকথন",
        language: data.language || "bn",
      }),
    });
  };

  getChatSessions = async () => {
    return this.request("/api/chat/sessions");
  };

  getChatSession = async (sessionId) => {
    return this.request(`/api/chat/sessions/${sessionId}`);
  };

  sendMessage = async (sessionId, message) => {
    return this.request(`/api/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content: message.content,
        language: message.language || "bn",
        message_type: message.message_type || "text",
        voice_confidence: message.voice_confidence,
        voice_duration: message.voice_duration,
      }),
    });
  };

  sendVoiceMessage = async (sessionId, message) => {
    return this.request(`/api/chat/sessions/${sessionId}/voice`, {
      method: "POST",
      body: JSON.stringify({
        content: message.content,
        language: message.language || "bn",
        message_type: "voice",
        voice_confidence: message.voice_confidence || 0.9,
        voice_duration: message.voice_duration || 2.0,
      }),
    });
  };

  getChatHistory = async (sessionId) => {
    return this.request(`/api/chat/sessions/${sessionId}/messages`);
  };

  // Dashboard APIs
  getDashboardStats = async () => {
    return this.request("/api/dashboard/stats");
  };

  getCriticalAlerts = async () => {
    return this.request("/api/dashboard/alerts");
  };

  // IoT Sensor APIs
  getSensorData = async () => {
    return this.request("/api/iot/sensors/data");
  };

  getSensorDataByType = async (sensorType) => {
    return this.request(`/api/iot/sensors/type/${sensorType}`);
  };

  sendSensorData = async (data) => {
    return this.request("/api/iot/sensors/data", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  // Get latest sensor data from all sensors
  getLatestSensorData = async () => {
    return this.request("/api/iot/get-latest-data");
  };

  // Get sensor data history
  getSensorDataHistory = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/api/iot/get-data-history${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  // Get dashboard sensor summary
  getDashboardSensorData = async () => {
    return this.request("/api/iot/dashboard/sensors");
  };

  // Weather APIs
  getWeatherData = async (location) => {
    const params = location ? `?location=${encodeURIComponent(location)}` : "";
    return this.request(`/api/weather/current${params}`);
  };

  getWeatherForecast = async (location, days = 3) => {
    const params = `?location=${encodeURIComponent(location)}&days=${days}`;
    return this.request(`/api/weather/forecast${params}`);
  };

  getWeatherAlerts = async (location) => {
    const params = location ? `?location=${encodeURIComponent(location)}` : "";
    return this.request(`/api/weather/alerts${params}`);
  };

  // AI-powered weather recommendations
  getWeatherRecommendations = async (location, lat = null, lon = null) => {
    const body = {};
    if (location) body.location = location;
    if (lat && lon) {
      body.lat = lat;
      body.lon = lon;
    }
    
    return this.request("/api/weather/weather-recommendations", {
      method: "POST",
      body: JSON.stringify(body),
    });
  };

  getWeatherTranslations = async () => {
    return this.request("/api/weather/weather-translations");
  };

  // Market APIs
  getMarketPrices = async () => {
    return this.request("/api/market/prices");
  };

  getItemPrice = async (item) => {
    return this.request(`/api/market/prices/${encodeURIComponent(item)}`);
  };

  // AI Agent API
  askAgent = async (query, context = {}) => {
    return this.request("/api/agent/invoke", {
      method: "POST",
      body: JSON.stringify({
        query,
        session_id: context.session_id,
        language: context.language || "bn",
        user_context: context.user_context || {},
      }),
    });
  };

  // Helper method to check if user is authenticated
  isAuthenticated = () => {
    return !!this.getToken();
  };

  // Helper method for handling API errors with fallback data
  safeRequest = async (endpoint, options = {}, fallbackData = null) => {
    try {
      return await this.request(endpoint, options);
    } catch (error) {
      console.warn(`API call failed, using fallback data:`, error.message);
      return fallbackData;
    }
  };

  // TTS API - returns audio blob
  synthesizeSpeech = async (text, language = null, slow = false) => {
    const url = `${this.baseURL}/api/tts/synthesize`;
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          text,
          language: language || undefined, // Send undefined instead of null
          slow,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        throw new Error(
          errorData.detail || errorData.message || `HTTP ${response.status}`
        );
      }

      // Return the response object for blob handling
      return response;
    } catch (error) {
      console.error(`TTS API Error:`, error);
      throw error;
    }
  };

  // Community APIs
  // Get communities with optional filtering
  getCommunities = async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.size) queryParams.append("size", params.size);
    if (params.search) queryParams.append("search", params.search);
    if (params.location) queryParams.append("location", params.location);

    const queryString = queryParams.toString();
    const endpoint = `/api/community/${queryString ? `?${queryString}` : ""}`;
    return this.request(endpoint);
  };

  // Get nearby communities
  getNearbyCommunities = async (maxDistance = 50) => {
    return this.request(`/api/community/nearby?max_distance=${maxDistance}`);
  };

  // Get specific community
  getCommunity = async (communityId) => {
    return this.request(`/api/community/${communityId}`);
  };

  // Get user's joined community
  getUserCommunity = async () => {
    return this.request("/api/community/user/joined");
  };

  // Join a community
  joinCommunity = async (communityId) => {
    return this.request("/api/community/join", {
      method: "POST",
      body: JSON.stringify({ community_id: communityId }),
    });
  };

  // Leave current community
  leaveCommunity = async () => {
    return this.request("/api/community/leave", {
      method: "POST",
    });
  };

  // Create a new community
  createCommunity = async (communityData) => {
    return this.request("/api/community/", {
      method: "POST",
      body: JSON.stringify(communityData),
    });
  };

  // Help Request APIs
  // Get help requests with filtering
  getHelpRequests = async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.community_id)
      queryParams.append("community_id", params.community_id);
    if (params.category) queryParams.append("category", params.category);
    if (params.urgency) queryParams.append("urgency", params.urgency);
    if (params.status) queryParams.append("status", params.status);
    if (params.page) queryParams.append("page", params.page);
    if (params.size) queryParams.append("size", params.size);

    const queryString = queryParams.toString();
    const endpoint = `/api/community/help-requests${
      queryString ? `?${queryString}` : ""
    }`;
    return this.request(endpoint);
  };

  // Create help request
  createHelpRequest = async (helpRequestData) => {
    return this.request("/api/community/help-requests", {
      method: "POST",
      body: JSON.stringify(helpRequestData),
    });
  };

  // Event APIs
  // Get events with filtering
  getEvents = async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.community_id)
      queryParams.append("community_id", params.community_id);
    if (params.event_type) queryParams.append("event_type", params.event_type);
    if (params.page) queryParams.append("page", params.page);
    if (params.size) queryParams.append("size", params.size);

    const queryString = queryParams.toString();
    const endpoint = `/api/community/events${
      queryString ? `?${queryString}` : ""
    }`;
    return this.request(endpoint);
  };

  // Create event
  createEvent = async (eventData) => {
    return this.request("/api/community/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  };

  // Join event
  joinEvent = async (eventId) => {
    return this.request(`/api/community/events/${eventId}/join`, {
      method: "POST",
    });
  };

  // Community Chat
  getCommunityChat = async (communityId, page = 1, size = 20) => {
    return this.request(
      `/api/community/${communityId}/chat?page=${page}&size=${size}`
    );
  };

  sendCommunityMessage = async (communityId, messageData) => {
    return this.request(`/api/community/${communityId}/chat`, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  };

  // Help Request Actions
  acceptHelpRequest = async (communityId, messageId) => {
    return this.request(
      `/api/community/${communityId}/help/${messageId}/accept`,
      {
        method: "POST",
      }
    );
  };

  completeHelpRequest = async (communityId, messageId) => {
    return this.request(
      `/api/community/${communityId}/help/${messageId}/complete`,
      {
        method: "POST",
      }
    );
  };

  // Event Actions
  payForEvent = async (communityId, messageId) => {
    return this.request(
      `/api/community/${communityId}/event/${messageId}/pay`,
      {
        method: "POST",
      }
    );
  };

  // ===== Store (New E-commerce) =====
  // Public listings
  getStoreListings = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/store/listings${query ? `?${query}` : ""}`);
  };

  // Public: create order (no auth)
  createStoreOrder = async (orderData) => {
    return this.request(`/api/store/orders`, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  };

  // Public: track orders by phone (and optional order id)
  trackStoreOrders = async (phone, orderId = null) => {
    const query = new URLSearchParams({
      phone,
      ...(orderId ? { order_id: orderId } : {}),
    }).toString();
    return this.request(`/api/store/orders/track?${query}`);
  };

  // Farmer: upload product image
  uploadProductImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return this.request(`/api/store/products/upload-image`, {
      method: "POST",
      body: formData,
    });
  };

  // Farmer: products
  createStoreProduct = async (data) => {
    return this.request(`/api/store/products`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  // Farmer: listings
  createStoreListing = async (data) => {
    return this.request(`/api/store/listings`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  updateStoreListing = async (listingId, data) => {
    return this.request(`/api/store/listings/${listingId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  // Farmer: orders
  getFarmerStoreOrders = async () => {
    return this.request(`/api/store/orders`);
  };

  updateStoreOrderStatus = async (orderId, statusValue) => {
    return this.request(
      `/api/store/orders/${orderId}/status?status_value=${encodeURIComponent(
        statusValue
      )}`,
      {
        method: "POST",
      }
    );
  };

  // Detection API methods
  detectPlantDisease = async (imageFile, confidenceThreshold = 0.25) => {
    try {
      // Convert image file to base64
      const base64String = await this.fileToBase64(imageFile);

      const payload = {
        file_name: imageFile.name,
        file_content: base64String,
        confidence_threshold: confidenceThreshold,
      };

      return await this.request("/api/detection/detect", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Detection Error:", error);
      throw error;
    }
  };

  getDetectionHistory = async (skip = 0, limit = 20) => {
    try {
      return await this.request(
        `/api/detection/history?skip=${skip}&limit=${limit}`,
        {
          method: "GET",
        }
      );
    } catch (error) {
      console.error("Detection History Error:", error);
      throw error;
    }
  };

  getDetectionById = async (detectionId) => {
    try {
      return await this.request(`/api/detection/history/${detectionId}`, {
        method: "GET",
      });
    } catch (error) {
      console.error("Get Detection Error:", error);
      throw error;
    }
  };

  deleteDetection = async (detectionId) => {
    try {
      return await this.request(`/api/detection/history/${detectionId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Delete Detection Error:", error);
      throw error;
    }
  };

  // Detection Alert API methods
  getDetectionAlerts = async (skip = 0, limit = 20, unreadOnly = false, includeDismissed = false) => {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
        unread_only: unreadOnly.toString(),
        include_dismissed: includeDismissed.toString()
      });
      
      return await this.request(`/api/detection/alerts?${params}`, {
        method: "GET",
      });
    } catch (error) {
      console.error("Get Detection Alerts Error:", error);
      throw error;
    }
  };

  markAlertAsRead = async (alertId) => {
    try {
      return await this.request(`/api/detection/alerts/${alertId}/read`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("Mark Alert as Read Error:", error);
      throw error;
    }
  };

  dismissAlert = async (alertId) => {
    try {
      return await this.request(`/api/detection/alerts/${alertId}/dismiss`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("Dismiss Alert Error:", error);
      throw error;
    }
  };

  deleteAlert = async (alertId) => {
    try {
      return await this.request(`/api/detection/alerts/${alertId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Delete Alert Error:", error);
      throw error;
    }
  };

  markAllAlertsAsRead = async () => {
    try {
      return await this.request('/api/detection/alerts/mark-all-read', {
        method: "PUT",
      });
    } catch (error) {
      console.error("Mark All Alerts as Read Error:", error);
      throw error;
    }
  };

  getAlertStats = async () => {
    try {
      return await this.request('/api/detection/alerts/stats', {
        method: "GET",
      });
    } catch (error) {
      console.error("Get Alert Stats Error:", error);
      throw error;
    }
  };

  // Helper method to convert file to base64
  fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the data:image/jpeg;base64, part
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // HTTP Method shortcuts
  get = async (endpoint, options = {}) => {
    return this.request(endpoint, { ...options, method: "GET" });
  };

  post = async (endpoint, data, options = {}) => {
    const config = { ...options, method: "POST" };

    // Handle different data types
    if (data instanceof FormData) {
      config.body = data;
      // Don't set Content-Type for FormData, let browser set it with boundary
      delete config.headers?.["Content-Type"];
    } else if (typeof data === "object") {
      config.body = JSON.stringify(data);
      config.headers = {
        "Content-Type": "application/json",
        ...config.headers,
      };
    } else {
      config.body = data;
    }

    return this.request(endpoint, config);
  };

  put = async (endpoint, data, options = {}) => {
    const config = { ...options, method: "PUT" };

    if (data instanceof FormData) {
      config.body = data;
      delete config.headers?.["Content-Type"];
    } else if (typeof data === "object") {
      config.body = JSON.stringify(data);
      config.headers = {
        "Content-Type": "application/json",
        ...config.headers,
      };
    } else {
      config.body = data;
    }

    return this.request(endpoint, config);
  };

  delete = async (endpoint, options = {}) => {
    return this.request(endpoint, { ...options, method: "DELETE" });
  };
}

// Create singleton instance
const api = new ApiService();

// Export both the class and instance
export default api;
export { ApiService };
