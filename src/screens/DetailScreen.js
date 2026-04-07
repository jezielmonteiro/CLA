import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const DetailScreen = ({ item, onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Icon name="arrow-back" size={24} color="#3b82f6" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {item.fotoUri && (
            <Image source={{ uri: item.fotoUri }} style={styles.image} />
          )}
          
          <Text style={styles.title}>{item.projeto}</Text>
          <Text style={styles.subtitle}>{item.nome}</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="event" size={24} color="#296959" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Data de Validade</Text>
                <Text style={styles.infoValue}>{item.validade}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="info" size={24} color="#10b981" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.statusValue, { color: item.cor }]}>{item.status}</Text>
              </View>
            </View>
          </View>
          
          {item.latitude && item.longitude && (
            <View style={styles.mapContainer}>
              <Text style={styles.mapTitle}>Localização</Text>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker coordinate={{ latitude: item.latitude, longitude: item.longitude }} />
              </MapView>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  backButton: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  backText: { fontSize: 18, fontWeight: '600', color: '#3b82f6' },
  content: { padding: 20, paddingBottom: 40 },
  image: { width: '100%', height: 250, borderRadius: 20, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24, textAlign: 'center' },
  infoCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 14, color: '#9ca3af', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statusValue: { fontSize: 18, fontWeight: 'bold' },
  mapContainer: { marginBottom: 24 },
  mapTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  map: { width: '100%', height: 200, borderRadius: 16 },
});