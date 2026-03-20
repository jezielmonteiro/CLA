import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { licenca } from './licencas';

export default function App() {
  const [isBiometricCompatible, setIsBiometricCompatible] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

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
        !showPanel ? (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Autenticado(a)!</Text>
            <Text style={styles.welcomeText}>
              Bem-vindo ao CLA
            </Text>
            <TouchableOpacity 
              style={styles.panelButton} 
              onPress={() => setShowPanel(true)}
            >
              <Text style={styles.panelButtonText}>Painel de Licenças</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                setIsAuthenticated(false);
                setShowPanel(false);
              }}
            >
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.panelContainer}>
            <View style={styles.header}>
              <Text style={styles.successTitle}>Painel CLA</Text>
              <Text style={styles.welcomeText}>Controle de Licenças Ambientais</Text>
            </View>
            <FlatList
              data={licenca}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={[styles.badge, { backgroundColor: item.cor }]}>
                    <Text style={styles.badgeText}>{item.sigla}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.projeto}</Text>
                    <Text style={styles.cardSubtitle}>{item.nome}</Text>
                    <View style={styles.footerCard}>
                      <Text style={styles.cardDate}>Vencimento: {item.validade}</Text>
                      <Text style={[styles.cardStatus, { color: item.cor }]}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              )}
              style={styles.list}
              ListFooterComponent={() => (
                <TouchableOpacity style={styles.backButton} onPress={() => setShowPanel(false)}>
                  <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
              )}
              ListFooterComponentStyle={{ color: '#2e7d32', alignItems: 'center', paddingVertical: 30 }}
            />
          </View>
        )
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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e9' },
  container: { flex: 1, backgroundColor: '#e8f5e9' },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e9' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24 },
  successTitle: { fontSize: 32, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  welcomeText: { fontSize: 20, marginBottom: 40 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#2e7d32', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  errorText: { color: '#d32f2f', marginBottom: 20 },
  loadingText: { marginTop: 16 },
  logoutButton: { marginTop: 40, backgroundColor: '#d32f2f', padding: 12, borderRadius: 10 },
  logoutText: { color: 'white' },
  panelButton: { backgroundColor: '#2e7d32', paddingVertical: 18, paddingHorizontal: 30, borderRadius: 15, marginTop: 20, elevation: 4 },
  panelButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  panelContainer: { flex: 1, padding: 20, backgroundColor: '#e8f5e9', paddingTop: 40 },
  card: { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  list: { flex: 1, width: '100%', paddingHorizontal: 10, paddingTop: 5, backgroundColor: '#e8f5e9' },
  badge: { width: 55, height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 15, elevation: 2 },
  backButton: { backgroundColor: '#2e7d32', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, alignSelf: 'center', marginTop: 10 },
  backButtonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
});