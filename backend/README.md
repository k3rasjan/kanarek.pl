# Kanarek.pl Backend

A real-time backend service for tracking public transportation vehicles and managing inspector reports in Poznań.

## Features

- Real-time vehicle position tracking from ZTM API
- WebSocket-based real-time updates
- Inspector reporting system with 5-minute expiration
- Vehicle detection based on user location
- PostgreSQL database with Prisma ORM

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Socket.IO
- Prisma ORM
- PostgreSQL
- Protobuf for GTFS-RT parsing

## Project Structure

```
backend/
├── src/
│   ├── routes/         # API endpoints
│   ├── helpers/        # Business logic
│   ├── socket/         # WebSocket handlers
│   ├── assets/         # Static assets (GTFS files)
│   └── prisma/         # Database schema and migrations
```

## Key Components

### Vehicle Positions
- Fetches real-time vehicle data from ZTM API
- Parses GTFS-RT protocol buffer data
- Updates vehicle positions every 5 seconds
- Maintains vehicle store with inspector status

### Inspector Reports
- Handles inspector reporting
- Manages 5-minute expiration of reports
- Updates vehicle status in real-time
- Stores reports in PostgreSQL database

### WebSocket Server
- Real-time vehicle position updates
- Inspector status updates
- Automatic cleanup of expired reports

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
```

3. Start development server:
```bash
npm run dev
```

4. Start production server:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/kanarek"
PORT=8080
NODE_ENV=development
```

## API Endpoints

### Vehicle Endpoints
- `GET /api/vehicles/get-positions` - Get current vehicle positions

### Inspector Endpoints
- `POST /api/inspector/find-vehicle` - Find vehicle based on user location
- `POST /api/inspector/report` - Report inspector on a vehicle

## WebSocket Events

### Client Events
- `connection` - Client connects to server
- `disconnect` - Client disconnects from server

### Server Events
- `vehiclePositions` - Initial vehicle positions
- `vehicleUpdate` - Real-time vehicle updates

## Database Schema

The application uses PostgreSQL with the following main tables:
- `inspectors` - Stores inspector reports
- `vehicles` - Caches vehicle positions
- `shapes` - GTFS shape data
- `trips` - GTFS trip data

## Development

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Jest for testing
- Hot reloading in development

## Production

- PM2 for process management
- Environment-specific configurations
- Error logging and monitoring
- Database connection pooling 