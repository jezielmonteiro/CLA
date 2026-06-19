import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert,
  Image, StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
  TouchableWithoutFeedback, Keyboard, Dimensions, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useBiometric } from '../hooks/useBiometric';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showBioOption, setShowBioOption] = useState(false);

  const [slideAnim] = useState(new Animated.Value(0));
  const [termsAccepted, setTermsAccepted] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { isBiometricCompatible, isAuthenticating, authenticateBiometry } = useBiometric();

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    try {
      const accepted = await AsyncStorage.getItem('@terms_accepted');
      setTermsAccepted(accepted === 'true');

      if (accepted === 'true') {
        const userAcceptedBio = await AsyncStorage.getItem('@use_registered_biometrics');
        if (userAcceptedBio === 'true' && auth.currentUser) {
          const success = await authenticateBiometry();
          if (success) onLoginSuccess();
        }
      }
    } catch (e) {
      console.log('Error initializing', e);
      setTermsAccepted(false);
    }
  };

  const acceptTerms = async () => {
    await AsyncStorage.setItem('@terms_accepted', 'true');
    setTermsAccepted(true);
  };

  const handleToggleMode = (modeIsLogin) => {
    if (isLoginMode === modeIsLogin) return;
    setIsLoginMode(modeIsLogin);
    Animated.spring(slideAnim, {
      toValue: modeIsLogin ? 0 : 1,
      useNativeDriver: false,
      bounciness: 6,
      speed: 12,
    }).start();
  };

  const handleAuth = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !senha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Erro', 'Por favor, insira um endereço de e-mail válido.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, trimmedEmail, senha);
      } else {
        await createUserWithEmailAndPassword(auth, trimmedEmail, senha);
      }

      const isBioConfigured = await AsyncStorage.getItem('@biometrics_configured');

      if (isBioConfigured !== null) {
        const userAcceptedBio = await AsyncStorage.getItem('@use_registered_biometrics');
        await finalizarLogin(userAcceptedBio === 'true');
      } else if (isBiometricCompatible) {
        setShowBioOption(true);
      } else {
        await finalizarLogin(false);
      }
    } catch (error) {
      console.log('Firebase Error:', error);
      let errorMsg = isLoginMode
        ? 'Falha ao realizar login. Verifique suas credenciais.'
        : 'Falha ao criar conta.';

      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'Este e-mail já está em uso por outra conta.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'O e-mail informado é inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'A senha deve ter no mínimo 6 caracteres.';
      } else if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        errorMsg = 'E-mail ou senha incorretos.';
      }

      Alert.alert('Erro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const finalizarLogin = async (useBiometricFlag = false) => {
    try {
      await AsyncStorage.setItem('@biometrics_configured', 'true');
      await AsyncStorage.setItem('@use_registered_biometrics', useBiometricFlag ? 'true' : 'false');

      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          email: auth.currentUser.email,
          biometriaHabilitada: useBiometricFlag,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      onLoginSuccess();
    } catch (error) {
      console.error('Erro ao finalizar login:', error);
      Alert.alert('Erro', 'Falha ao concluir o processo de login');
    }
  };

  if (termsAccepted === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#296959" />
      </View>
    );
  }

  if (termsAccepted === false) {
    return (
      <SafeAreaView style={styles.termsContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.termsCard}>
          <View style={styles.termsHeader}>
            <Ionicons name="document-text" size={32} color="#296959" />
            <Text style={styles.termsTitle}>Termos de Uso</Text>
          </View>
          <ScrollView style={styles.termsScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.termsText}>
              Bem-vindo ao aplicativo de Gestão de Licenças Ambientais.
              {'\n\n'}
              Ao utilizar nossa plataforma, você concorda em fornecer informações precisas e verdadeiras necessárias para o acompanhamento e emissão das suas licenças.
              {'\n\n'}
              <Text style={{ fontWeight: 'bold', color: '#1b4339' }}>1. Privacidade e Dados</Text>{'\n'}
              Os dados coletados serão utilizados exclusivamente para fins de regularização e análise ambiental, sendo armazenados de forma segura.
              {'\n\n'}
              <Text style={{ fontWeight: 'bold', color: '#1b4339' }}>2. Responsabilidades</Text>{'\n'}
              O usuário é responsável pela guarda de suas credenciais de acesso, bem como pela veracidade dos documentos anexados aos processos.
              {'\n\n'}
              <Text style={{ fontWeight: 'bold', color: '#1b4339' }}>3. Troca de Informações</Text>{'\n'}
              Os usuários poderão trocar informações de forma segura com outros usuários cadastrados na plataforma, respeitando as regras de privacidade e uso.
              {'\n\n'}
              <Text style={{ fontWeight: 'bold', color: '#1b4339' }}>4. Atualizações</Text>{'\n'}
              Nos reservamos o direito de atualizar estes termos periodicamente, notificando os usuários sempre que houver mudanças substanciais.
              {'\n\n'}
              Ao prosseguir, você concorda com todas as condições descritas acima e confirma que leu estes termos.
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.acceptButton} onPress={acceptTerms} activeOpacity={0.8}>
            <Text style={styles.acceptButtonText}>Concordo e Li</Text>
            <Ionicons name="checkmark-circle" size={22} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showBioOption) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.bioContainer}>
          <View style={styles.bioIconContainer}>
            <Ionicons name="finger-print" size={70} color="#296959" />
          </View>
          <Text style={styles.bioTitle}>Autenticação Rápida</Text>
          <Text style={styles.bioSubtitle}>
            Deseja habilitar o acesso com biometria para entrar no aplicativo mais rapidamente na próxima vez?
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => finalizarLogin(true)}>
            <Text style={styles.primaryButtonText}>Habilitar Biometria</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => finalizarLogin(false)}>
            <Text style={styles.secondaryButtonText}>Pular por enquanto</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <LinearGradient colors={['#115E59', '#059669']} style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              <View style={styles.header}>
                <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="stretch" />
                <Text style={styles.welcomeText}>
                  {isLoginMode ? 'Bem-vindo!' : 'Crie sua conta'}
                </Text>
                <Text style={styles.subWelcomeText}>
                  {isLoginMode
                    ? 'Faça login para continuar gerenciando suas licenças ambientais.'
                    : 'Preencha os dados abaixo para iniciar sua gestão ambiental.'}
                </Text>
              </View>

              <View style={styles.formContainer}>

                <View style={styles.tabContainer}>
                  <Animated.View style={[styles.activeTabBackground, { left: toggleTranslateX }]} />
                  <TouchableOpacity style={styles.tabButton} onPress={() => handleToggleMode(true)}>
                    <Text style={[styles.tabText, isLoginMode && styles.tabTextActive]}>Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tabButton} onPress={() => handleToggleMode(false)}>
                    <Text style={[styles.tabText, !isLoginMode && styles.tabTextActive]}>Cadastrar</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>E-mail</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Seu endereço de e-mail"
                      placeholderTextColor="#9ca3af"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Senha</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Sua senha secreta"
                      placeholderTextColor="#9ca3af"
                      value={senha}
                      onChangeText={setSenha}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>

                {loading || isAuthenticating ? (
                  <View style={styles.loadingWrapper}>
                    <ActivityIndicator size="large" color="#296959" />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.primaryButton, !isLoginMode && { backgroundColor: '#0284c7', shadowColor: '#0284c7' }]}
                    onPress={handleAuth}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>{isLoginMode ? 'Entrar' : 'Cadastrar'}</Text>
                    <Ionicons
                      name={isLoginMode ? 'log-in-outline' : 'person-add-outline'}
                      size={20}
                      color="white"
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                )}

              </View>

              {/* Espaço extra no fim da página para o teclado não engolir o formulário */}
              <View style={{ height: 100 }} />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#115E59' },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  header: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  logoImage: {
    width: 96,
    height: 96,
    marginBottom: 24,
    borderRadius: 20,
    padding: 8,
  },
  welcomeText: { fontSize: 28, fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: 8 },
  subWelcomeText: { fontSize: 15, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', paddingHorizontal: 10, lineHeight: 22 },

  formContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#f3f4f6',
    marginBottom: 24,
    position: 'relative',
  },
  activeTabBackground: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    top: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: { fontSize: 15, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#296959' },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827', height: '100%' },
  eyeIcon: { padding: 8 },
  loadingWrapper: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 12 },

  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#059669',
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  termsContainer: { flex: 1, backgroundColor: '#f0fdf4', padding: 24, justifyContent: 'center' },
  termsCard: {
    backgroundColor: 'white',
    flex: 1,
    maxHeight: '85%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  termsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 16 },
  termsTitle: { fontSize: 22, fontWeight: 'bold', color: '#1b4339', marginLeft: 12 },
  termsScroll: { flex: 1, marginBottom: 24 },
  termsText: { fontSize: 15, color: '#4b5563', lineHeight: 24 },
  acceptButton: {
    flexDirection: 'row',
    backgroundColor: '#296959',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#296959',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  bioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  bioIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5f0ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#b8d6ce',
  },
  bioTitle: { fontSize: 24, fontWeight: 'bold', color: '#1b4339', marginBottom: 16, textAlign: 'center' },
  bioSubtitle: { fontSize: 16, color: '#4b5563', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  secondaryButton: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 12, width: '100%' },
  secondaryButtonText: { color: '#6b7280', fontSize: 16, fontWeight: '600' },
});
