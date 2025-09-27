# 🌾 Krishi Sahay - AI-Powered Smart Agriculture Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.4.5-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.0+-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
</div>

## 🚀 Overview

**Krishi Sahay** is a comprehensive AI-powered smart agriculture platform that revolutionizes farming through cutting-edge technology. Our platform integrates IoT sensors, machine learning, computer vision, and AI agents to provide farmers with intelligent insights, real-time monitoring, and community-driven solutions.

## 🎥 Project Demo

<div align="center">
  
### 📺 Complete Platform Overview

<!-- GitHub Hosted Video -->
https://github.com/electr0x0/krishi_sahay_hackathon/blob/mekat/VID_20250928000825336.mp4

**🎥 [Watch Full Demo Video](https://github.com/electr0x0/krishi_sahay_hackathon/blob/mekat/VID_20250928000825336.mp4)** | **📥 [Download Video](https://github.com/electr0x0/krishi_sahay_hackathon/raw/mekat/VID_20250928000825336.mp4)**

### 🎬 Key Demo Highlights
- 🤖 **AI Agent with Tool Integration** - Smart farming assistant with 10+ specialized tools
- 🔬 **Real-time Disease Detection** - Image/video analysis with 13 disease classifications  
- 🌐 **Live IoT Dashboard** - ESP32 sensor data streaming and analytics
- 🏪 **Marketplace & Community** - Farmer clans, equipment store, and funding platform
- 🌤️ **Weather Intelligence** - 7-day forecasts with crop recommendations

</div>

### 🌐 Live Demo
> **Frontend:** [Live URL - Deploy Link Here]  
> **Backend API:** [API Documentation - Deploy Link Here]

---

## ✨ Key Features

### 🤖 **AI-Powered Intelligence**
- **Smart AI Agent** with 10+ specialized tool integrations(
  -get_item_price, get_price_trend
  -diagnose_crop_disease, get_crop_calendar, get_fertilizer_recommendation
  -get_current_weather, get_weather_forecast, get_weather_alerts
  -get_latest_sensor_data, get_sensor_history, get_sensor_alerts
  )
- **Multi-language Support** with real-time translation
- **Voice Assistant** with text-to-speech capabilities
- **Intelligent Crop Recommendations** based on weather and soil data

### 🔬 **Advanced Disease Detection**
- **Image Processing** with 13 disease classification classes( - Apple Black Rot, Rust, Scab
  - Corn Gray Leaf Spot, Rust, Blight
  - Grape Leaf Blight, Rot
  - Potato Early/Late Blight
  - Tomato Blight, Mosaic Virus, Spot)
- **Video Processing** for continuous disease monitoring
- **Multiple Input Methods**: Image upload, video processing, live camera
- **Real-time Camera Detection** using YOLOv11 models
- **PlantVillage Dataset Integration** for accurate diagnosis

### 🌐 **IoT & Real-Time Monitoring**
- **ESP32 Sensor Integration** for live environmental data
- **Real-time Dashboard** with interactive charts
- **Historical Data Analytics** with trend analysis
- **Automated Alert System** for critical conditions

### 🌤️ **Weather Intelligence**
- **Weather Forecast Prediction** with 7-day outlook
- **Smart Recommendations** based on weather patterns
- **Climate-based Crop Planning** suggestions
- **Seasonal Advisory System**

### 🏪 **Marketplace & Community**
- **Real-time Market Prices** with live updates
- **Community Clans** with collaborative farming
- **Knowledge Sharing Platform** among farmers
- **Equipment & Supply Store** with order tracking
- **Funding & Investment Opportunities**

### 🏘️ Community & Marketplace
- **Farmer Communities (Clans)** with shared resources
- **Knowledge Sharing Platform** for best practices
- **Equipment Marketplace** with secure transactions
- **Funding Opportunities** and investment matching
- **Real-time Market Prices** for crops and supplies

### 📊 **Analytics & Reporting**
- **Comprehensive Farm Reports** with insights
- **Crop Performance Analytics** with recommendations
- **Financial Tracking** and profitability analysis
- **Predictive Analytics** for yield optimization

---

## 🛠️ Technology Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.4.5 | React framework with SSR/SSG |
| **TypeScript** | 5.0+ | Type-safe development |
| **TailwindCSS** | 4.0+ | Utility-first CSS framework |
| **Framer Motion** | 12.23.12 | Animation library |
| **React Hook Form** | 7.62.0 | Form management |
| **Chart.js** | 4.5.0 | Data visualization |
| **Leaflet** | 1.9.4 | Interactive maps |
| **Radix UI** | Latest | Accessible UI components |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | Latest | High-performance API framework |
| **Python** | 3.10+ | Backend programming language |
| **SQLAlchemy** | Latest | Database ORM |
| **LangChain** | Latest | AI/LLM integration framework |
| **Ultralytics** | Latest | YOLOv11 computer vision |
| **OpenCV** | Latest | Image/video processing |
| **PyTorch** | Latest | Deep learning framework |
| **WebSockets** | Latest | Real-time communication |

### **AI & Machine Learning**
- **Google Gemini Pro** - Advanced language model
- **YOLOv11** - Object detection and classification
- **PlantVillage Model** - Disease detection (13 classes)
- **LangGraph** - AI agent orchestration
- **Custom Vision Models** - Crop-specific analysis

### **IoT & Hardware**
- **ESP32** - Microcontroller for sensor data
- **Various Sensors** - Temperature, humidity, soil moisture,
- **Real-time Data Streaming** - WebSocket integration

---

## 🏗️ Project Structure

```
krishi-sahay/
├── frontend/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── dashboard/      # Main dashboard features
│   │   │   ├── detection/      # Disease detection interface
│   │   │   ├── market/         # Marketplace components
│   │   │   └── iot-dashboard/  # IoT monitoring
│   │   ├── components/         # Reusable UI components
│   │   │   ├── dashboard/      # Dashboard-specific components
│   │   │   ├── detection/      # Detection UI components
│   │   │   └── ui/            # Base UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── contexts/          # React contexts
│   │   └── types/             # TypeScript definitions
│   └── public/                # Static assets
│
├── backend/                    # FastAPI Backend Application
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   │   ├── agent.py       # AI agent endpoints
│   │   │   ├── detection.py   # Disease detection API
│   │   │   ├── iot.py         # IoT data endpoints
│   │   │   ├── market.py      # Marketplace API
│   │   │   └── weather.py     # Weather API
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   │   ├── detection_service.py
│   │   │   ├── weather_service.py
│   │   │   └── agent.py
│   │   ├── tools/             # AI agent tools
│   │   │   ├── crop_tool.py
│   │   │   ├── weather_tool.py
│   │   │   ├── iot_sensor_tool.py
│   │   │   └── pricing_tool.py
│   │   └── visionmodels/      # ML model files
│   └── uploads/               # File uploads
│
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm/pnpm
- **Python** 3.10+
- **Git**

### 🖥️ Frontend Setup

```bash
# Clone the repository
git clone <repository-url>
cd krishi-sahay/frontend

# Install dependencies
npm install
# or
pnpm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
# or
pnpm dev
```

The frontend will be available at `http://localhost:3000`

### ⚙️ Backend Setup

```bash
# Navigate to backend directory
cd ../backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Run database migrations
python migrate_*.py

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

### 🗄️ Database Setup

```bash
# Initialize database with sample data
python create_test_data.py
python init_default_sensor.py
python create_sample_sensor_data.py
```

---

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000

```

### Backend (.env)
```env
DATABASE_URL=sqlite:///./krishi_sahay.db
SECRET_KEY=your-secret-key-here
GOOGLE_API_KEY=your-google-gemini-api-key
WEATHER_API_KEY=your-weather-api-key
SECRET_KEY=jwt
# App Configuration
APP_NAME=Krishi Sahay - Smart Agriculture Platform
APP_VERSION=1.0.0
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CHALDAL_API_KEY=
```

---

## 📱 Core Features in Detail

### 🤖 AI Agent with Tool Calling
Our intelligent AI agent integrates 8+ specialized tools:
- **Weather Forecasting Tool** - Real-time weather data and predictions
- **Crop Recommendation Tool** - AI-powered crop suggestions
- **IoT Sensor Tool** - Live sensor data integration
- **Disease Detection Tool** - Image/video analysis
- **Market Pricing Tool** - Real-time price monitoring
- **Translation Tool** - Multi-language support
- **Voice Synthesis Tool** - Text-to-speech capabilities

### 🔬 Disease Detection System
- **13 Disease Classes** supported including:
  - Apple Black Rot, Rust, Scab
  - Corn Gray Leaf Spot, Rust, Blight
  - Grape Leaf Blight, Rot
  - Potato Early/Late Blight
  - Tomato Blight, Mosaic Virus, Spot
- **Multiple Input Methods**: Image upload, video processing, live camera
- **Real-time Analysis** with confidence scoring
- **Treatment Recommendations** for detected diseases

### 🌐 IoT Integration
- **ESP32-based Sensor Network**
- **Real-time Data Streaming** via WebSockets
- **Environmental Monitoring**: Temperature, humidity, soil conditions
- **Automated Alerts** for critical thresholds
- **Historical Data Analytics** with trend visualization

### 🏘️ Community & Marketplace
- **Farmer Communities (Clans)** with shared resources
- **Knowledge Sharing Platform** for best practices
- **Equipment Marketplace** with secure transactions
- **Funding Opportunities** and investment matching
- **Real-time Market Prices** for crops and supplies

---

## 🛡️ Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **API Rate Limiting** and request validation
- **Secure File Upload** with type validation
- **Data Encryption** for sensitive information

---

## 📊 Performance & Analytics

- **Real-time Dashboard** with live updates
- **Predictive Analytics** for crop yield
- **Financial Tracking** and ROI analysis
- **Performance Metrics** and KPI monitoring
- **Custom Report Generation**

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **PlantVillage Dataset** for disease classification models
- **OpenWeatherMap** for weather data
- **Google Gemini** for AI capabilities
- **Ultralytics** for YOLOv8 implementation
- **FastAPI** and **Next.js** communities

---

## 📞 Support & Contact

- **Documentation**: [Wiki/Docs Link]
- **Issues**: [GitHub Issues]
- **Discord**: [Community Discord]
- **Email**: support@krishisahay.com

---

<div align="center">
  <p><strong>Built with ❤️ for farmers worldwide</strong></p>
  <p>Empowering agriculture through technology</p>
</div>
