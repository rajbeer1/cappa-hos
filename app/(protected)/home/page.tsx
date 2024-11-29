'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import axiosClient from '@/helpers/axios';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import Map from '@/components/ui/map';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

interface CrashData {
  crash: {
    _id: string;
    hospitalId: string;
    userId: string;
    time: string;
  };
  userDetails: {
    _id: string;
    name: string;
    DOB: string;
    contactNumber: string;
    fatherName: string;
    emergencyContactNumber: string;
    email: string;
    bloodGroup: string;
    address: string;
    height: number;
    createdAt: string;
  };
  latestReading: {
    location: {
      type: string;
      coordinates: [number, number];
    };
    _id: string;
    userId: string;
    crashDetected: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

const HomePage = () => {
      const handleLogout = () => {
        Cookies.remove('hosuser');
        window.location.reload();
      };
  const [crashData, setCrashData] = useState<CrashData[]>([]);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<number[] | null>(null); // Change to array
  const [hospitalLocation, setHospitalLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);


    const fetchCrashes = async () => {
      try {
        const token = Cookies.get('hosuser');
        const response = await axiosClient.get('/api/crashes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Set crash data
        setCrashData(response.data);

        // Extract user location from the latest reading
     const locations = response.data.map((crash) => {
       const latestReading = crash.latestReading;
       return {
         lat: latestReading.location.coordinates[0], // Latitude
         lng: latestReading.location.coordinates[1], // Longitude
         email: crash.userDetails.email, // User email
       };
     });
     setCoordinates(locations); 
     const hospitalResponse = await axiosClient.get('/api/hospitals', {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     });

     // Set hospital location from the response
     const hospitalData = hospitalResponse.data;
     setHospitalLocation({
       lat: hospitalData.location.coordinates[0], // Latitude
       lng: hospitalData.location.coordinates[1], // Longitude
     });
      } catch (error) {
        console.error('Error fetching crash data:', error);
        toast.error('Failed to load crash data');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCrashes();

    const intervalId = setInterval(() => {
      fetchCrashes(); 
    }, 60000); 

    return () => clearInterval(intervalId);
  }, []);

  const InfoItem = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <div className="flex flex-col space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-4 w-[250px]" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Crash Details</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingSkeleton />
              ) : crashData.length > 0 ? (
                crashData.map((crash, index) => (
                  <div
                    key={crash.crash._id}
                    className="mb-4 border-b border-gray-300 pb-4"
                  >
                    <InfoItem
                      label="User Name"
                      value={crash.userDetails.name}
                    />
                    <InfoItem
                      label="Crash Time"
                      value={new Date(crash.crash.time).toLocaleString()}
                    />
                    <InfoItem
                      label="Contact Number"
                      value={crash.userDetails.contactNumber}
                    />
                    <InfoItem
                      label="Address"
                      value={crash.userDetails.address}
                    />
                    <InfoItem
                      label="Blood Group"
                      value={crash.userDetails.bloodGroup}
                    />
                    <InfoItem
                      label="Crash Detected"
                      value={crash.latestReading.crashDetected ? 'Yes' : 'No'}
                    />
                    {/* Divider between crash data entries */}
                    {index < crashData.length - 1 && (
                      <div className="border-t border-gray-300 my-4" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  No crash data available
                </p>
              )}
            </CardContent>
          </Card>
          <div className="w-full lg:w-1/2 p-6">
            <Button onClick={handleLogout} className="bg-red-500 text-white">
              Logout
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-6 h-full">
          <Card className="w-full h-full">
            <CardHeader>
              <CardTitle>Location Tracking</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)]">
              {hospitalLocation && coordinates ? (
                <Map
                  hospitalLocation={hospitalLocation}
                  userLocations={coordinates}
                />
              ) : (
                <p className="text-center text-muted-foreground">
                  Waiting for location data...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
