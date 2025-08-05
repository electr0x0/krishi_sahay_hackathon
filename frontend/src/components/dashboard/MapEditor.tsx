'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState } from 'react';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapEvents = ({ onLocationChange, isDraggable }) => {
    useMapEvents({
        click(e) {
            if (isDraggable) {
                onLocationChange(e.latlng);
            }
        },
    });
    return null;
}

const MapEditor = ({ lat, lng, onLocationChange = () => {}, isDraggable = true }) => {
    const [position, setPosition] = useState({ lat, lng });

    const handleMarkerDrag = (e) => {
        if (isDraggable) {
            const newPos = e.target.getLatLng();
            setPosition(newPos);
            onLocationChange(newPos);
        }
    };

    return (
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker 
                position={position} 
                draggable={isDraggable}
                eventHandlers={{
                    dragend: handleMarkerDrag,
                }}
            />
            <MapEvents onLocationChange={(latlng) => {
                setPosition(latlng);
                onLocationChange(latlng);
            }} isDraggable={isDraggable} />
        </MapContainer>
    );
};

export default MapEditor;
