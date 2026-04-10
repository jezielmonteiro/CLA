import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location'; // Reativando o GPS
import { StatusBar } from 'expo-status-bar';

export const MapScreen = ({ onConfirm, onCancel }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);

  // Função para pegar a localização apenas quando clicar no botão
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
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setSelectedLocation(coords);
    mapRef.current?.animateToRegion(coords, 1000);
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
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>

      {/* Botão de GPS escrito em Texto para não dar erro de ícone */}
      <TouchableOpacity style={styles.gpsButton} onPress={buscarMinhaPosicao}>
        <Text style={{ fontWeight: 'bold', color: '#296959' }}>ONDE ESTOU?</Text>
      </TouchableOpacity>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={() => selectedLocation ? onConfirm(selectedLocation) : Alert.alert('Aviso', 'Selecione um ponto no mapa')}
        >
          <Text style={styles.buttonText}>CONFIRMAR LOCAL</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>VOLTAR</Text>
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
    borderColor: '#296959'
  },
  buttonsContainer: { position: 'absolute', bottom: 40, left: 20, right: 20, gap: 10 },
  confirmButton: { backgroundColor: '#296959', padding: 18, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: '#ef4444', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});