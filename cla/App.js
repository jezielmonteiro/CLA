import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';

export default function App() {
  const [isBiometricCompatible, setIsBiometricCompatible] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricCompatible(hasHardware && isEnrolled);
      } catch (err) {
        console.error('Erro ao verificar biometria:', err);
        setIsBiometricCompatible(false);
      }
    })();
  }, []);

  const authenticate = async () => {
    try {
      setIsAuthenticating(true);
      setErrorMessage(null);

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique para acessar o CLA',
        fallbackLabel: 'Usar senha ou PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticated(true);
      } else {
        setErrorMessage(result.error === 'user_cancel' ? 'Autenticação cancelada' : 'Falha na biometria');
      }
    } catch (err) {
      setErrorMessage('Erro ao tentar autenticar');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const bypassAuth = () => setIsAuthenticated(true);

  if (isBiometricCompatible === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Verificando dispositivo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isAuthenticated ? (
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Autenticado(a)!</Text>
          <Text style={styles.welcomeText}>Bem-vindo ao CLA</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={() => setIsAuthenticated(false)}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authContainer}>
          <Text style={styles.title}>Autenticação Biométrica</Text>

          {!isBiometricCompatible ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.subtitle}>Biometria não disponível.</Text>
              <TouchableOpacity style={styles.button} onPress={bypassAuth}>
                <Text style={styles.buttonText}>Entrar sem biometria</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
              {isAuthenticating ? (
                <ActivityIndicator size="large" color="#2e7d32" />
              ) : (
                <>
                  <TouchableOpacity style={styles.button} onPress={authenticate}>
                    <Text style={styles.buttonText}>Entrar com biometria</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={bypassAuth} style={{ marginTop: 25 }}>
                    <Text style={{ color: '#2e7d32' }}>Pular autenticação</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e9' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24 },
  successTitle: { fontSize: 32, fontWeight: 'bold', color: '#2e7d32' },
  welcomeText: { fontSize: 20, marginBottom: 40 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#2e7d32', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  errorText: { color: '#d32f2f', marginBottom: 20 },
  loadingText: { marginTop: 16 },
  logoutButton: { marginTop: 40, backgroundColor: '#d32f2f', padding: 12, borderRadius: 10 },
  logoutText: { color: 'white' },
});