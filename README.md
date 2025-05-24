# Smart Home Web Application

A modern web application for managing your smart home system. Built with React, Vite, and Tailwind CSS.

## Features

- 🏠 **Dashboard**: Overview of your smart home system
- 🎤 **Voice Control**: Natural language interface for controlling your smart home devices
- 📊 **System Logs**: Monitor and track all system activities and events
- 👤 **User Profile**: Manage your account settings and preferences
- ❓ **Help Center**: Access FAQs and support resources
- 🔐 **Authentication**: Secure login and registration system
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌓 **Modern UI**: Clean and intuitive interface with Tailwind CSS
- 🔌 **Real-time Updates**: Socket.IO integration for live device status updates
- 🌤️ **Weather Integration**: Real-time weather information using OpenWeatherMap API

## Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite 6
- **Styling:** 
  - Tailwind CSS 3
  - Custom CSS
- **Routing:** React Router v7
- **Icons:** React Icons 5
- **State Management:** React Hooks
- **API Integration:** 
  - Axios
  - OpenWeatherMap API
- **Real-time Communication:** Socket.IO Client
- **Code Quality:** ESLint 9

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenWeatherMap API key (for weather functionality)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/OmarZarifa/smart-home-web.git
cd smart-home-web
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenWeatherMap API key:

```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and visit:

```
http://localhost:3000
```

## Project Structure

```
smart-home-web/
├── src/
│   ├── assets/        # Static assets and images
│   ├── components/    # Reusable UI components
│   │   └── Header.jsx # Header with weather and navigation
│   ├── context/       # React context providers
│   ├── pages/         # Page components
│   │   ├── Dashboard.jsx
│   │   ├── VoiceRecognition.jsx
│   │   ├── Logs.jsx
│   │   ├── Profile.jsx
│   │   ├── Help.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── services/      # API and service integrations
│   ├── utils/         # Utility functions
│   ├── socket.js      # Socket.IO configuration
│   ├── App.jsx        # Main application component
│   ├── index.css      # Global styles and Tailwind imports
│   └── main.jsx       # Application entry point
├── public/            # Static assets
├── swe-python-backend/ # Backend service
├── index.html         # HTML template
├── tailwind.config.js # Tailwind CSS configuration
├── postcss.config.js  # PostCSS configuration
├── vite.config.js     # Vite configuration
├── eslint.config.js   # ESLint configuration
└── package.json       # Project dependencies
```

## Available Scripts

- `npm run dev` - Start development server (runs on port 3000)


## Weather Integration

The application uses the OpenWeatherMap API to display real-time weather information in the header. The weather data includes:
- Current temperature
- Weather condition
- Location
- Auto-refresh every 30 minutes

To get your OpenWeatherMap API key:
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Go to your account dashboard
3. Generate a new API key
4. Add the key to your `.env` file as `VITE_OPENWEATHER_API_KEY`
