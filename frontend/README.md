# Kanarek.pl Frontend

A modern web application for tracking and reporting ticket inspectors on public transportation in Poznań.

## Features

- Real-time vehicle tracking on an interactive map
- Inspector reporting system
- Automatic vehicle detection based on user location
- Responsive design for mobile and desktop
- Real-time updates using WebSocket

## Tech Stack

- React 18
- TypeScript
- Leaflet for maps
- Socket.IO client
- CSS Modules for styling

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── assets/        # Static assets
│   ├── utils/         # Utility functions
│   └── socket.ts      # Socket.IO client setup
```

## Key Components

### Map Component
- Displays real-time vehicle positions
- Shows inspector status with color-coded markers
- Handles user location tracking
- Updates vehicle positions every 5 seconds

### Report Page
- Detects nearby vehicles using geolocation
- Allows reporting ticket inspectors
- Provides feedback on report status

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080
```

## Development

- The application uses Vite for fast development
- Hot Module Replacement (HMR) is enabled
- TypeScript for type safety
- ESLint and Prettier for code formatting

## Production

- Optimized builds with Vite
- Code splitting for better performance
- Minified assets
- Environment-specific configurations
