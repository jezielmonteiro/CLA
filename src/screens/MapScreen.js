import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';

export const MapScreen = ({ onConfirm, onCancel, initialLocation }) => {
  const [selectedLocations, setSelectedLocations] = useState(
    Array.isArray(initialLocation) ? initialLocation : (initialLocation ? [initialLocation] : [])
  );
  const mapRef = useRef(null);

  const buscarMinhaPosicao = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erro', 'Permissão de localização negada.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    mapRef.current?.animateToRegion(coords, 1000);
  };

  const handleMapPress = (e) => {
    if (e.nativeEvent && e.nativeEvent.coordinate) {
      setSelectedLocations([...selectedLocations, e.nativeEvent.coordinate]);
    }
  };

  const handlePoiClick = (e) => {
    if (e.nativeEvent && e.nativeEvent.coordinate) {
      setSelectedLocations([...selectedLocations, e.nativeEvent.coordinate]);
    }
  };

  const undoLastPoint = () => {
    setSelectedLocations(selectedLocations.slice(0, -1));
  };

  const clearArea = () => {
    setSelectedLocations([]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: -23.5505,
          longitude: -46.6333,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
        onPoiClick={handlePoiClick}
      >
        {selectedLocations.map((coord, index) => (
          <Marker key={index} coordinate={coord} />
        ))}
        {selectedLocations.length > 2 && (
          <Polygon
            coordinates={selectedLocations}
            fillColor="rgba(41, 105, 89, 0.4)"
            strokeColor="rgba(41, 105, 89, 1)"
            strokeWidth={2}
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.gpsButton} onPress={buscarMinhaPosicao}>
        <Text style={{ fontWeight: 'bold', color: '#296959' }}>Onde estou?</Text>
      </TouchableOpacity>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={undoLastPoint}>
          <Text style={styles.controlButtonText}>Desfazer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={clearArea}>
          <Text style={styles.controlButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          testID="confirmAreaButton"
          style={styles.confirmButton}
          onPress={() =>
            selectedLocations.length >= 3
              ? onConfirm(selectedLocations)
              : Alert.alert('Aviso', 'Marque pelo menos 3 pontos para formar uma área')
          }
        >
          <Text style={styles.buttonText}>Confirmar Área</Text>
        </TouchableOpacity>

        <TouchableOpacity testID="closeMapButton" style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  gpsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#296959',
    elevation: 5,
  },
  controlsContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'column',
    gap: 10,
  },
  controlButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ef4444',
    alignItems: 'center',
    elevation: 3,
  },
  controlButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonsContainer: { position: 'absolute', bottom: 40, left: 20, right: 20, gap: 10 },
  confirmButton: { backgroundColor: '#296959', padding: 18, borderRadius: 12, alignItems: 'center', elevation: 5 },
  cancelButton: { backgroundColor: '#ef4444', padding: 18, borderRadius: 12, alignItems: 'center', elevation: 5 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
