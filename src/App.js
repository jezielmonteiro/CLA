import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { licenca as initialLicencas } from '../licencas';
import { useLicenses } from './hooks/useLicenses';
import { useLocation } from './hooks/useLocation';
import { getPassword } from './services/auth';
import { LoginScreen } from './screens/LoginScreen';
import { MainScreen } from './screens/MainScreen';
import { FormScreen } from './screens/FormScreen';
import { CameraScreen } from './screens/CameraScreen';
import { MapScreen } from './screens/MapScreen';
import { DetailScreen } from './screens/DetailScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const { licencas, isLoading, loadData, adicionarOuEditar, excluir } = useLicenses(initialLicencas);
  const { getLocationPermission } = useLocation();

  useEffect(() => {
    checkLogin();
    loadData();
    getLocationPermission();
  }, []);

  const checkLogin = async () => {
    const saved = await getPassword();
    setIsLoggedIn(!!saved);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentScreen('main');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
  };

  const handleSave = async (data) => {
    const success = await adicionarOuEditar(data, editingItem, selectedLocation);
    if (success) {
      setCurrentScreen('main');
      setEditingItem(null);
      setSelectedLocation(null);
    }
  };

  const handleCameraCapture = (uri) => {
    if (editingItem) {
      handleSave({ ...editingItem, fotoUri: uri });
    } else {
      setEditingItem({ fotoUri: uri });
      setCurrentScreen('form');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!isLoggedIn || currentScreen === 'login') {
    return (
      <SafeAreaProvider>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'camera') {
    return (
      <SafeAreaProvider>
        <CameraScreen
          onCapture={handleCameraCapture}
          onCancel={() => setCurrentScreen('form')}
        />
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'map') {
      return (
        <SafeAreaProvider>
          <MapScreen
            onConfirm={(location) => {
              setSelectedLocation(location); // Salva o local
              setCurrentScreen('form');      // Vai para o formulário
            }}
            onCancel={() => {
            // MUDANÇA AQUI: Se cancelar o mapa ANTES de criar a licença,
            // ele deve voltar para a tela inicial (main), não para o form.
              setCurrentScreen('main'); 
            }}
            initialLocation={editingItem ? { latitude: editingItem.latitude, longitude: editingItem.longitude } : null}
          />
        </SafeAreaProvider>
    );
  }

  if (currentScreen === 'form') {
    return (
      <SafeAreaProvider>
        <FormScreen
          item={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setCurrentScreen('main');
            setEditingItem(null);
            setSelectedLocation(null);
          }}
          onOpenCamera={() => setCurrentScreen('camera')}
          onOpenMap={() => setCurrentScreen('map')}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'detail') {
    return (
      <SafeAreaProvider>
        <DetailScreen
          item={selectedItem}
          onBack={() => setCurrentScreen('main')}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <MainScreen
        licencas={licencas}
        onEdit={(item) => {
          setEditingItem(item);
          setCurrentScreen('form');
        }}
        onDelete={excluir}
        onLogout={handleLogout}
        onAddPress={() => {
          setEditingItem(null);
          setSelectedLocation(null);
          setCurrentScreen('map');
        }}
        onViewDetail={(item) => {
          setSelectedItem(item);
          setCurrentScreen('detail');
        }}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280' },
});