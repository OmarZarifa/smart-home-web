# Smart Home Web Application

A modern web application for managing your smart home system. Built with React, Vite, and Tailwind CSS.

## Features

- 🏠 **Dashboard**: Overview of your smart home system with real-time weather and time information
- 🎤 **Voice Control**: Natural language interface for controlling your smart home devices
- 📊 **System Logs**: Monitor and track all system activities and events
- 👤 **User Profile**: Manage your account settings and preferences
- ❓ **Help Center**: Access FAQs and support resources
- 🔐 **Authentication**: Secure login and registration system
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌓 **Modern UI**: Clean and intuitive interface with Tailwind CSS

## Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Icons:** React Icons
- **State Management:** React Hooks
- **API Integration:** Axios
- **Weather Data:** OpenWeatherMap API

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
http://localhost:5173
```

## Project Structure

```
smart-home-web/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Header.jsx    # Top navigation with weather and time
│   │   └── Sidebar.jsx   # Navigation sidebar
│   ├── pages/         # Page components
│   │   ├── Dashboard.jsx
│   │   ├── VoiceRecognition.jsx
│   │   ├── Logs.jsx
│   │   ├── Profile.jsx
│   │   ├── Help.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Application entry point
├── public/            # Static assets
├── index.html         # HTML template
├── tailwind.config.js # Tailwind CSS configuration
├── vite.config.js     # Vite configuration
└── package.json       # Project dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
