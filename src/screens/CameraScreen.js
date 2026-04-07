import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const CameraScreen = ({ onCapture, onCancel }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isTaking, setIsTaking] = useState(false);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Solicitando permissão...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Precisamos de acesso à câmera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Permitir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tirarFoto = async () => {
    if (isTaking || !cameraRef.current) return;
    setIsTaking(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      onCapture(photo.uri);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    } finally {
      setIsTaking(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Icon name="close" size={30} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.captureButton} onPress={tirarFoto} disabled={isTaking}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  cancelButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start', marginLeft: 20 },
  captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white', borderWidth: 2, borderColor: '#10b981' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { backgroundColor: '#296959', padding: 16, borderRadius: 12, marginTop: 20 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});