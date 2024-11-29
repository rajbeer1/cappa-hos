'use client';

import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axiosClient from '@/helpers/axios';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';


export default function SignUp() {
  const router = useRouter();
  const [data, setData] = useState({
    email: '',
    password: '',
    name: '',
    address: '',
    phoneNumber: '',
    location: {
      lat: null,
      lng: null,
    },
  });
  const [remember, setRemember] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Function to request location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setData((prevData) => ({
          ...prevData,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        }));
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error(
          'Unable to retrieve your location. Please enter it manually.'
        );
      }
    );
  };

  useEffect(() => {
    requestLocation(); // Request location on component mount
  }, []);

 
  const submit = async () => {
    try {
      setIsLoading(true);
      const user = await axiosClient.post('/api/hospitals/signup', {
        name: data.name,
        address: data.address,
        location: {
          type: "Point",
          "coordinates":[data.location.lat,data.location.lng]
        },
        phoneNumber: data.phoneNumber,
        email: data.email,
        password: data.password,
      });
      toast.success('Successfully signed up');
         Cookies.set('hosuser', user.data.token, { expires: 365 });

      router.push('/home');
    } catch (error: any) {
      const erro = error.response?.data?.message || error?.message || 'error';
      toast.error(erro);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden">
      <div className="w-full m-auto bg-white lg:max-w-lg">
        <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
            <CardDescription className="text-center font-bold text-black">
              Welcome to HelmetTech-Hospital Portal
            </CardDescription>
            <CardDescription className="text-center">
              Enter your details to create an account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Hospital Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={data.address}
                onChange={(e) => setData({ ...data, address: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={data.phoneNumber}
                onChange={(e) =>
                  setData({ ...data, phoneNumber: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                onCheckedChange={(checked) => {
                  setRemember(checked ? 1 : 0);
                }}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Revisiting?</span>
              <Button onClick={() => router.push('/')}>Log In</Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button disabled={isLoading} className="w-full" onClick={submit}>
              Sign Up
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
