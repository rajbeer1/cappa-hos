'use client';

import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow,
  Libraries,
} from '@react-google-maps/api';
import { useState } from 'react';
import Loader from '@/components/loader';

interface MapProps {
  hospitalLocation: { lat: number; lng: number };
  userLocations: { lat: number; lng: number; email: string }[]; // Array of user locations
}

export default function Map({ hospitalLocation, userLocations }: MapProps) {
  const libraries: Libraries = ['visualization'] as const;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAN6b_-hDFORuqIbR3NITLQOv9L8IMmHzs',
    libraries,
  });

  const [showUserInfo, setShowUserInfo] = useState<number | null>(null); // Track which user info to show

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error loading the map</div>
      </div>
    );
  }

  if (!isLoaded) {
    return <Loader />;
  }

  return (
    <div className="h-full w-full relative">
      <GoogleMap
        mapContainerStyle={{
          height: '100%',
          width: '100%',
        }}
        zoom={15}
        center={hospitalLocation} // Center the map on the hospital location
      >
        {/* User Location Markers */}
        {userLocations.map((userLocation, index) => (
          console.log(userLocation),
          <Marker
            key={index}
            position={userLocation}
            onClick={() => setShowUserInfo(index)} // Show info for this user
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
          >
            {showUserInfo === index && (
              <InfoWindow
                onCloseClick={() => setShowUserInfo(null)}
                position={userLocation}
              >
                <div className="p-2">
                  <h3 className="font-bold mb-2">User Location</h3>
                  <p>Email: {userLocation.email}</p>
                  <p>Lat: {userLocation.lat.toFixed(6)}</p>
                  <p>Lng: {userLocation.lng.toFixed(6)}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Hospital Location Marker */}
        <Marker
          position={hospitalLocation}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', // Different color for hospital
          }}
        >
          <InfoWindow position={hospitalLocation}>
            <div className="p-2">
              <h3 className="font-bold mb-2">Hospital Location</h3>
              <p>Lat: {hospitalLocation.lat.toFixed(6)}</p>
              <p>Lng: {hospitalLocation.lng.toFixed(6)}</p>
            </div>
          </InfoWindow>
        </Marker>
      </GoogleMap>
    </div>
  );
}
