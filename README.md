# AI Shopping Assistant

A modern web application that connects a Next.js frontend with a FastAPI backend to provide an AI-powered shopping assistant that can search for product prices from Chaldal.

## Features

- 🤖 **AI-Powered**: Uses Google Gemini AI for natural language understanding
- 🛒 **Product Search**: Searches Chaldal for real-time product prices
- 💬 **Chat Interface**: Beautiful chat UI with real-time messaging
- ⚡ **Fast API**: Built with FastAPI for high performance
- 🎨 **Modern UI**: Built with Next.js and shadcn/ui components

## Project Structure

```
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration
│   │   └── services/       # Business logic
│   ├── main.py             # Application entry point
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # UI components
│   │   └── lib/          # Utilities
│   └── package.json
└── README.md
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**

   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables:**
   Create a `.env` file in the backend directory:

   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

   Get your Google API key from: https://makersuite.google.com/app/apikey

6. **Run the backend:**

   ```bash
   python main.py
   ```

   The backend will start on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the frontend:**

   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:3000`

## Usage

1. Open your browser and go to `http://localhost:3000`
2. You'll see the AI Shopping Assistant interface
3. Ask questions like:
   - "What's the price of rice?"
   - "How much does milk cost?"
   - "Find the price of bread"
4. The AI will search Chaldal and return real-time pricing information

## API Endpoints

- `GET /` - Health check
- `POST /api/agent/invoke` - Main AI agent endpoint

### Example API Request:

```json
{
  "query": "What's the price of rice?"
}
```

### Example API Response:

```json
{
  "result": "Found prices for rice: Basmati Rice: ৳120, Brown Rice: ৳95"
}
```

## Technologies Used

### Backend

- **FastAPI**: Modern Python web framework
- **LangChain**: AI orchestration framework
- **Google Gemini**: Large language model
- **LangGraph**: Workflow management
- **httpx**: HTTP client for API calls

### Frontend

- **Next.js 14**: React framework with app router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful UI components
- **Lucide React**: Icon library

## Development

### Backend Development

- The main application logic is in `app/services/agent.py`
- API routes are defined in `app/api/agent.py`
- Configuration is managed in `app/core/config.py`

### Frontend Development

- The main page is in `src/app/page.tsx`
- UI components are in `src/components/ui/`
- Styling uses Tailwind CSS classes

## Troubleshooting

1. **Backend won't start**: Make sure you have the correct Google API key in your `.env` file
2. **Frontend can't connect to backend**: Ensure both servers are running and CORS is properly configured
3. **API calls failing**: Check that the backend is running on port 8000

## License

This project is open source and available under the MIT License.
