# Kanarek.pl API

A real-time vehicle tracking API built with Express.js, Socket.IO, and Prisma, designed to provide GTFS (General Transit Feed Specification) data and real-time vehicle locations.

## Features

- Real-time vehicle tracking using Socket.IO
- GTFS data integration and automatic updates
- RESTful API endpoints
- MySQL database with Prisma ORM
- Daily automated data updates
- TypeScript support

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration values.

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

## Configuration

The following environment variables need to be configured in your `.env` file:

- `PORT`: Server port (default: 8080)
- `HOST`: Server host (default: localhost)
- `DATABASE_URL`: MySQL database connection string
- `GTFS_URL`: URL to your GTFS data feed
- `GTFS_UPDATE_INTERVAL`: Cron schedule for GTFS updates
- `SOCKET_UPDATE_INTERVAL`: Socket.IO update interval in milliseconds
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `NODE_ENV`: Environment (development, production)

## Running the Application

Development mode:
```bash
npm start
```

Build and run in production:
```bash
npm run build
npm start
```

## API Endpoints

The API provides various endpoints for accessing vehicle and route data. Detailed endpoint documentation will be added here.

## Real-time Updates

The application uses Socket.IO to provide real-time updates for vehicle locations. Clients can connect to the WebSocket server to receive live updates.

## Data Updates

The system automatically updates GTFS data daily at midnight. This includes:
- Shapes data
- Trips data

## Development

### Project Structure

```
├── src/              # Source code
├── prisma/          # Database schema and migrations
├── server.ts        # Main application entry point
├── package.json     # Project dependencies and scripts
└── tsconfig.json    # TypeScript configuration
```

### Available Scripts

- `npm start`: Start the development server
- `npm run build`: Build the TypeScript project
- `npm test`: Run tests (not implemented yet)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Authors

- k3rasjan
- JWalczak123

## License

This project is licensed under the ISC License. 