import { render, screen, act } from '@testing-library/react';
import Map from '../Map';
import { vi } from 'vitest';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: { children: React.ReactNode }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    setView: vi.fn(),
  }),
}));

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  default: () => ({
    on: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
});

// Mock GeolocationPositionError
class MockGeolocationPositionError extends Error {
  code: number;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.PERMISSION_DENIED = 1;
    this.POSITION_UNAVAILABLE = 2;
    this.TIMEOUT = 3;
  }
}

describe('Map', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders map container', () => {
    render(<Map />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders tile layer', () => {
    render(<Map />);
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  it('shows location error when geolocation fails', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((successCallback: PositionCallback, errorCallback: PositionErrorCallback) => {
      const error = new MockGeolocationPositionError(1, 'Permission denied');
      errorCallback(error as GeolocationPositionError);
    });

    render(<Map />);
    
    // Wait for the error message to appear
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText('Please enable location access in your browser settings')).toBeInTheDocument();
  });

  it('updates user location when geolocation is successful', async () => {
    const mockLocation = {
      coords: {
        latitude: 52.3985,
        longitude: 17.2281,
        accuracy: 0,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
      toJSON: () => ({
        coords: {
          latitude: 52.3985,
          longitude: 17.2281,
          accuracy: 0,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      }),
    };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((successCallback: PositionCallback) => {
      successCallback(mockLocation as GeolocationPosition);
    });

    render(<Map />);
    
    // Wait for the location to be updated
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('marker')).toBeInTheDocument();
  });

  it('renders with focus vehicle', () => {
    const focusVehicle = {
      lat: 52.3985,
      long: 17.2281,
    };

    render(<Map focusVehicle={focusVehicle} />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });
}); 