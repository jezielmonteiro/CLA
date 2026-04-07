import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatarData, validarData } from '../utils/dateUtils';

export const FormScreen = ({ item, onSave, onCancel, onOpenCamera, onOpenMap, selectedLocation, setSelectedLocation }) => {
  const insets = useSafeAreaInsets();
  const [projeto, setProjeto] = useState(item?.projeto || '');
  const [nome, setNome] = useState(item?.nome || '');
  const [validade, setValidade] = useState(item?.validade || '');
  const [fotoUri, setFotoUri] = useState(item?.fotoUri || null);

  const salvar = () => {
    if (!projeto.trim()) { Alert.alert('Erro', 'Projeto é obrigatório'); return; }
    if (!validade.trim()) { Alert.alert('Erro', 'Validade é obrigatória'); return; }
    if (!validarData(validade)) { Alert.alert('Erro', 'Data inválida. Use dd/mm/aaaa'); return; }
    onSave({ projeto, nome, validade, fotoUri });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Icon name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          
          <Text style={styles.title}>{item ? 'Editar Licença' : 'Nova Licença'}</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nome do Projeto *"
            placeholderTextColor="#9ca3af"
            value={projeto}
            onChangeText={setProjeto}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Órgão Emissor / Descrição"
            placeholderTextColor="#9ca3af"
            value={nome}
            onChangeText={setNome}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Data de Validade (dd/mm/aaaa) *"
            placeholderTextColor="#9ca3af"
            value={validade}
            onChangeText={t => setValidade(formatarData(t))}
            maxLength={10}
            keyboardType="numeric"
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.mapButton} onPress={onOpenMap}>
              <Icon name="map" size={20} color="#4338ca" />
              <Text style={styles.mapButtonText}>Localização</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cameraButton} onPress={onOpenCamera}>
              <Icon name="camera-alt" size={20} color="#296959" />
              <Text style={styles.cameraButtonText}>Foto</Text>
            </TouchableOpacity>
          </View>
          
          {fotoUri && (
            <View style={styles.photoPreview}>
              <Image source={{ uri: fotoUri }} style={styles.previewImage} />
              <TouchableOpacity onPress={() => setFotoUri(null)} style={styles.removePhotoButton}>
                <Icon name="delete" size={20} color="#ef4444" />
                <Text style={styles.removePhotoText}>Remover foto</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {selectedLocation && (
            <View style={styles.locationInfo}>
              <Icon name="location-on" size={20} color="#4338ca" />
              <Text style={styles.locationText}>Localização selecionada</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.saveButton} onPress={salvar}>
            <Icon name="check" size={20} color="white" />
            <Text style={styles.buttonText}> Salvar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  closeButton: { alignSelf: 'flex-end', padding: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 24, paddingHorizontal: 24 },
  input: { backgroundColor: 'white', marginHorizontal: 24, padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 16, color: '#1e293b' },
  buttonRow: { flexDirection: 'row', gap: 12, marginHorizontal: 24, marginBottom: 16 },
  mapButton: { flex: 1, backgroundColor: '#e0e7ff', padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  mapButtonText: { color: '#4338ca', fontSize: 16, fontWeight: '600' },
  cameraButton: { flex: 1, backgroundColor: '#6ee7b7', padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  cameraButtonText: { color: '#065f46', fontSize: 16, fontWeight: '600' },
  photoPreview: { alignItems: 'center', marginVertical: 16, marginHorizontal: 24 },
  previewImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 8 },
  removePhotoButton: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  removePhotoText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  locationInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 8, marginHorizontal: 24, backgroundColor: '#e0e7ff', padding: 12, borderRadius: 12 },
  locationText: { color: '#4338ca', fontSize: 14, fontWeight: '500' },
  saveButton: { backgroundColor: '#296959', marginHorizontal: 24, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 24, flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});