import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
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

export default function Map() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const center: [number, number] = [52.3925, 16.9357];

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

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className={styles.mapContainer}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
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
              {vehicle.hasInspector && <p style={{ color: 'red' }}>Kontroler biletów!</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
