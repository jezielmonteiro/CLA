import { useState } from 'react';
import * as Location from 'expo-location';

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState(null);

  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  return { userLocation, getLocationPermission };
};