import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as LovcalAuthentication from 'expo-local-authentication';
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
        if (result.error === 'user_cancel') {
          setErrorMessage('Autenticação cancelada');
        } else {
          setErrorMessage('Falha na autenticação biométrica');
        }
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      setErrorMessage('Erro ao tentar autenticar');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Tela de carregamento enquanto verifica o dispositivo
  if (isBiometricCompatible === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Verificando dispositivo...</Text>
      </View>
    );
  }

  // Caso não tenha biometria disponível
  if (!isBiometricCompatible) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Biometria não disponível</Text>
        <Text style={styles.subtitle}>
          Seu dispositivo não suporta biometria ou não há biometria cadastrada.
        </Text>
        <Text style={styles.infoText}>
          Configure a biometria nas configurações ou use outro método de login.
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  // Tela principal
  return (
    <View style={styles.container}>
      {isAuthenticated ? (
        // Tela após autenticação bem-sucedida
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Autenticado com sucesso!</Text>
          <Text style={styles.welcomeText}>
            Bem-vindo ao CLA - Controle de Licenças Ambientais
          </Text>

          {/* Aqui você coloca o conteúdo principal do app */}
          <Text style={styles.placeholderText}>
            (Sua tela principal, lista de licenças, menu, etc. vai aqui)
          </Text>

          {/* Botão de exemplo para "sair" / resetar autenticação */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setIsAuthenticated(false)}
          >
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Tela de autenticação biométrica
        <View style={styles.authContainer}>
          <Text style={styles.title}>Autenticação Biométrica</Text>

          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          {isAuthenticating ? (
            <View style={styles.loadingAuth}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Verificando identidade...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.button} onPress={authenticate}>
              <Text style={styles.buttonText}>
                {errorMessage ? 'Tentar novamente' : 'Entrar com biometria'}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.infoText}>
            Use Face ID, Touch ID ou impressão digital
          </Text>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#777',
    marginTop: 24,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingAuth: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  logoutButton: {
    marginTop: 60,
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});