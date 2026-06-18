import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform, UIManager, LayoutAnimation } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { useLicenses } from './hooks/useLicenses';
import { useLocation } from './hooks/useLocation';
import { getPassword } from './services/auth';
import { LoginScreen } from './screens/LoginScreen';
import { MainScreen } from './screens/MainScreen';
import { FormScreen } from './screens/FormScreen';
import { CameraScreen } from './screens/CameraScreen';
import { MapScreen } from './screens/MapScreen';
import { DetailScreen } from './screens/DetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ChatScreen } from './screens/ChatScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppContent />
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [mainTab, setMainTab] = useState('home');

  // Estado para segurar os dados do formulário enquanto tira foto ou vê mapa
  const [tempFormData, setTempFormData] = useState(null);

  const navigate = (screen) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentScreen(screen);
  };

  const { licencas, isLoading, loadData, adicionarOuEditar, excluir } = useLicenses();
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
    navigate('main');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('login');
  };

  const handleSave = async (data) => {
    const success = await adicionarOuEditar(data, editingItem, selectedLocation);
    if (success) {
      navigate('main');
      setEditingItem(null);
      setSelectedLocation(null);
      setTempFormData(null);
    }
  };

  const handleCameraCapture = (uri, base64) => {
    if (editingItem) {
      handleSave({ ...editingItem, fotoUri: uri, fotoBase64: base64 });
    } else {
      setTempFormData(prev => ({ ...prev, fotoUri: uri, fotoBase64: base64 }));
      navigate('form');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#296959" />
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
          onCancel={() => navigate('form')}
        />
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'map') {
    return (
      <SafeAreaProvider>
        <MapScreen
          onConfirm={(location) => {
            setSelectedLocation(location);
            navigate('form');
          }}
          onCancel={() => {
            navigate('main');
          }}
          initialLocation={
            editingItem
              ? (editingItem.coordinates || (editingItem.latitude ? [{ latitude: editingItem.latitude, longitude: editingItem.longitude }] : []))
              : null
          }
        />
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'form') {
    return (
      <SafeAreaProvider>
        <FormScreen
          item={editingItem}
          tempData={tempFormData}
          onSave={handleSave}
          onCancel={() => {
            navigate('main');
            setEditingItem(null);
            setSelectedLocation(null);
            setTempFormData(null);
          }}
          onOpenCamera={(dadosAtuais) => {
            setTempFormData(dadosAtuais);
            navigate('camera');
          }}
          onOpenMap={(dadosAtuais) => {
            setTempFormData(dadosAtuais);
            navigate('map');
          }}
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
          onBack={() => navigate('main')}
        />
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'profile') {
    return (
      <SafeAreaProvider>
        <ProfileScreen onBack={() => navigate('main')} />
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'chat') {
    return (
      <SafeAreaProvider>
        <ChatScreen 
          onBack={() => navigate('main')} 
          targetUser={targetUser} 
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <MainScreen
        initialTab={mainTab}
        onTabChange={setMainTab}
        licencas={licencas}
        onEdit={(item) => {
          setEditingItem(item);
          navigate('form');
        }}
        onDelete={excluir}
        onLogout={handleLogout}
        onAddPress={() => {
          setEditingItem(null);
          setSelectedLocation(null);
          setTempFormData(null);
          navigate('map');
        }}
        onViewDetail={(item) => {
          setSelectedItem(item);
          navigate('detail');
        }}
        onProfilePress={() => navigate('profile')}
        onOpenChat={(user) => {
          setTargetUser(user);
          navigate('chat');
        }}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280' },
});
