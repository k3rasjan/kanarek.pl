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
