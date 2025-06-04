import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useState, useCallback } from 'react';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.css';
import io from 'socket.io-client';

type Vehicle = {
  id: string;
  tripId: string;
  routeId: string;
  long: number;
  lat: number;
  directionId: string;
  hasInspector: boolean;
  inspectorReportedAt?: string;
};

type MapProps = {
  focusVehicle?: {
    lat: number;
    long: number;
  };
};

type UserLocation = {
  lat: number;
  long: number;
  timestamp: number;
};

function MapFocus({ focusVehicle }: MapProps) {
  const map = useMap();
  
  useEffect(() => {
    if (focusVehicle) {
      map.setView([focusVehicle.lat, focusVehicle.long], 16);
    }
  }, [focusVehicle, map]);

  return null;
}

const defaultIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const inspectorIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Map({ focusVehicle }: MapProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = useCallback((): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            long: position.coords.longitude,
            timestamp: Date.now()
          };
          console.log('Received location:', location);
          resolve(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        }
      );
    });
  }, []);

  const updateLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setLocationError(null);
    } catch (error) {
      console.error('Error getting location:', error);
      if (error instanceof Error) {
        const geolocationError = error as GeolocationPositionError;
        switch (geolocationError.code) {
          case 1:
            setLocationError('Please enable location access in your browser settings');
            break;
          case 2:
            setLocationError('Location information is unavailable');
            break;
          case 3:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('An unknown error occurred');
        }
      } else {
        setLocationError('An unknown error occurred');
      }
    }
  }, [getCurrentLocation]);

  useEffect(() => {
    const socket = io('http://localhost:8080');

    socket.on('vehiclePositions', (data) => {
      if (data.status === 'success') {
        setVehicles(data.data);
      }
    });

    socket.on('vehicleUpdate', (data) => {
      setVehicles(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    updateLocation();
    const intervalId = setInterval(updateLocation, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [updateLocation]);
  
  const defaultCenter: [number, number] = [52.3985, 17.2281];

  return (
    <MapContainer
      center={userLocation ? [userLocation.lat, userLocation.long] : defaultCenter} 
      zoom={13}
      scrollWheelZoom
      className={styles.mapContainer}
    >
      {locationError && <div className={styles.locationError}>{locationError}</div>}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      <MapFocus focusVehicle={focusVehicle} />
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.long]}
          icon={userIcon}
        >
          <Popup>
            <div>
              <p>Twoja lokalizacja</p>
              <p>Ostatnia aktualizacja: {new Date(userLocation.timestamp).toLocaleTimeString()}</p>
            </div>
          </Popup>
        </Marker>
      )}
      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.id}
          position={[vehicle.lat, vehicle.long]}
          icon={vehicle.hasInspector ? inspectorIcon : defaultIcon}
        >
          <Popup>
            <div>
              <p>Linia: {vehicle.routeId}</p>
              <p>Kierunek: {vehicle.directionId}</p>
              <p>ID: {vehicle.tripId}</p>
              <p>Has inspector: {vehicle.hasInspector.toString()}</p>
              {vehicle.hasInspector && <p style={{ color: 'red' }}>Kontroler biletów!</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
