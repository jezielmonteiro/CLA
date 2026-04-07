import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const MapScreen = ({ onConfirm, onCancel, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      const loc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(loc);
      if (!selectedLocation) setSelectedLocation(loc);
    }
  };

  const confirmarLocalizacao = () => {
    if (selectedLocation) {
      onConfirm(selectedLocation);
    } else {
      Alert.alert('Erro', 'Selecione uma localização no mapa');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: selectedLocation?.latitude || -23.5505,
          longitude: selectedLocation?.longitude || -46.6333,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            draggable
            onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
          />
        )}
      </MapView>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={confirmarLocalizacao}>
          <Icon name="check" size={24} color="white" />
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Icon name="close" size={24} color="white" />
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  buttonsContainer: { position: 'absolute', bottom: 30, left: 20, right: 20, gap: 12 },
  confirmButton: { backgroundColor: '#296959', padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  cancelButton: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});