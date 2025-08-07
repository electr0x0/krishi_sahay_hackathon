'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  currentLocation?: { lat: number; lng: number; address: string };
}

export default function LocationPicker({ onLocationSelect, currentLocation }: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(currentLocation || { lat: 0, lng: 0, address: '' });
  const [error, setError] = useState('');

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('আপনার ব্রাউজার GPS সাপোর্ট করে না');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          const address = data.display_name || 'অজানা অবস্থান';
          
          const newLocation = {
            lat: latitude,
            lng: longitude,
            address: address
          };
          
          setLocation(newLocation);
          onLocationSelect(newLocation);
        } catch (err) {
          setError('ঠিকানা পাওয়া যায়নি');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        let errorMessage = 'অবস্থান পাওয়া যায়নি';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'GPS অনুমতি প্রয়োজন';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'অবস্থান তথ্য উপলব্ধ নয়';
            break;
          case error.TIMEOUT:
            errorMessage = 'সময় শেষ হয়ে গেছে';
            break;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleManualLocation = (address: string) => {
    // For now, we'll use a simple approach
    // In a real app, you'd want to use a geocoding service
    const newLocation = {
      lat: 23.8103, // Default to Dhaka coordinates
      lng: 90.4125,
      address: address
    };
    
    setLocation(newLocation);
    onLocationSelect(newLocation);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">অবস্থান নির্বাচন করুন</h3>
        <Badge variant="outline" className="text-xs">
          GPS সক্রিয়
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Current Location Button */}
        <Button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              অবস্থান খুঁজছি...
            </div>
          ) : (
            <div className="flex items-center">
              <Crosshair className="w-4 h-4 mr-2" />
              বর্তমান অবস্থান ব্যবহার করুন
            </div>
          )}
        </Button>

        {/* Manual Location Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            বা ম্যানুয়ালভাবে ঠিকানা লিখুন
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="আপনার ঠিকানা লিখুন..."
              value={location.address}
              onChange={(e) => handleManualLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Location Display */}
        {location.address && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">নির্বাচিত অবস্থান</p>
                <p className="text-sm text-green-700">{location.address}</p>
                <p className="text-xs text-green-600 mt-1">
                  স্থানাঙ্ক: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Location Tips */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 পরামর্শ</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• সঠিক অবস্থান দিলে কাছাকাছি কৃষকরা খুঁজে পাবে</li>
            <li>• GPS ব্যবহার করে স্বয়ংক্রিয়ভাবে অবস্থান নির্ধারণ করুন</li>
            <li>• আপনার গ্রাম/উপজেলার নাম লিখুন</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
