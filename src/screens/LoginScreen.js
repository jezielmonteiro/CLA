import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useBiometric } from '../hooks/useBiometric';
import { savePassword } from '../services/auth';
import { DEFAULT_PASSWORD } from '../utils/constants';

export const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { isBiometricCompatible, isAuthenticating, authenticateBiometry } = useBiometric();

  const fazerLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu e-mail');
      return;
    }
    if (senha !== DEFAULT_PASSWORD) {
      Alert.alert('Erro', 'Senha incorreta\nTeste: 123456');
      return;
    }
    try {
      await savePassword(senha);
      const success = await authenticateBiometry();
      if (success) onLoginSuccess();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao realizar login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Image 
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>
      <Text style={styles.title}>Bem-vindo</Text>
      <Text style={styles.subtitle}>Controle de Licenças Ambientais</Text>
      
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#9ca3af"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      
      {isBiometricCompatible !== null && (
        <Text style={styles.bioText}>
          {isBiometricCompatible ? '🔐 Biometria disponível' : '📱 Biometria não disponível'}
        </Text>
      )}
      
      {isAuthenticating ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 24 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={fazerLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: '#296959', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#296959', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  logoImage: { 
    width: 80, 
    height: 80,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#296959', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#111827', textAlign: 'center', marginBottom: 48 },
  input: { backgroundColor: 'white', borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', color: '#111827' },
  button: { backgroundColor: '#296959', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 24, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  bioText: { textAlign: 'center', marginTop: 20, color: '#6b7280', fontSize: 14 },
});