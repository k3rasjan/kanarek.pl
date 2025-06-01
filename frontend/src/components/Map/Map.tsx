
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.css';

type Report = {
  id: number;
  location: [number, number];
  description: string;
  timestamp: string;
};

export default function Map({ reports }: { reports: Report[] }) {
  const center: [number, number] = [52.3925, 16.9357]; // środek domyślny

  return (
      <MapContainer center={center} zoom={13} scrollWheelZoom className={styles.mapContainer}>
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
        />
        {reports.map((report) => (
            <Circle
                key={report.id}
                center={report.location}
                radius={500}
                pathOptions={{ fillColor: 'red', fillOpacity: 0.4, color: 'red' }}
            />
        ))}
      </MapContainer>

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function Map() {
  return (
    <>
      <div className="w-screen h-screen">
        <MapContainer
          center={[52.4057, 16.9313]}
          zoom={20}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[51.505, -0.09]}>
            <Popup>This is a custom marker popup</Popup>
          </Marker>
        </MapContainer>
        <p className="">sigma</p>
      </div>
    </>

  );
}
