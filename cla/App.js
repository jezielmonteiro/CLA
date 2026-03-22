import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Seu arquivo de licenças iniciais
import { licenca as initialLicencas } from './licencas';

const SENHA_KEY = 'cla_user_password';
const STORAGE_KEY = '@cla_licencas';
const DEFAULT_PASSWORD = '123456';
const { width, height } = Dimensions.get('window');

// Função para converter string de data para objeto Date
const converterDataParaDate = (dataString) => {
  if (!dataString) return null;
  // Formato esperado: dd/mm/aaaa
  const partes = dataString.split('/');
  if (partes.length !== 3) return null;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1; // Mês em JS é 0-11
  const ano = parseInt(partes[2], 10);
  return new Date(ano, mes, dia);
};

// Função para calcular status baseado na data (string)
const calcularStatusPorData = (validadeString) => {
  if (!validadeString) return 'Sem data';
  
  const dataValidade = converterDataParaDate(validadeString);
  if (!dataValidade) return 'Data inválida';
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Zera as horas para comparação apenas de datas
  dataValidade.setHours(0, 0, 0, 0);
  
  const diffTime = dataValidade - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'Vencida';
  } else if (diffDays === 0) {
    return 'Vence hoje';
  } else if (diffDays <= 30) {
    return `Vence em ${diffDays} dias`;
  } else {
    return 'Válida';
  }
};

// Componente principal da aplicação
function AppContent() {
  const insets = useSafeAreaInsets();

  const [screen, setScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isBiometricCompatible, setIsBiometricCompatible] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [licencas, setLicencas] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const [permissionCamera, requestPermissionCamera] = useCameraPermissions();
  const cameraRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    initializeApp();
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  const initializeApp = async () => {
    setIsLoading(true);
    try {
      await loadLicencas();
      await checkBiometry();
      await checkPermissions();

      const saved = await SecureStore.getItemAsync(SENHA_KEY);
      if (saved) {
        const success = await authenticateBiometry();
        if (success) {
          setScreen('main');
        }
      }
    } catch (error) {
      console.error('Erro na inicialização:', error);
      Alert.alert('Erro', 'Falha ao inicializar o aplicativo');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPermissions = async () => {
    const { status } = await requestPermissionCamera();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à câmera para fotos de licenças.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadLicencas = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const licencasCarregadas = JSON.parse(json);
        // Atualiza os status de todas as licenças baseado na data atual
        const licencasAtualizadas = licencasCarregadas.map(licenca => ({
          ...licenca,
          status: calcularStatusPorData(licenca.validade),
          cor: getCorPorStatus(calcularStatusPorData(licenca.validade)),
          sigla: getSigla(calcularStatusPorData(licenca.validade))
        }));
        setLicencas(licencasAtualizadas);
      } else {
        const licencasIniciais = initialLicencas.map(licenca => ({
          ...licenca,
          status: calcularStatusPorData(licenca.validade),
          cor: getCorPorStatus(calcularStatusPorData(licenca.validade)),
          sigla: getSigla(calcularStatusPorData(licenca.validade))
        }));
        setLicencas(licencasIniciais);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(licencasIniciais));
      }
    } catch (e) {
      console.error('Erro ao carregar licenças:', e);
      setLicencas(initialLicencas);
    }
  };

  const saveLicencas = useCallback(async (novaLista) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
      setLicencas(novaLista);
      return true;
    } catch (e) {
      console.error('Erro ao salvar licenças:', e);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
      return false;
    }
  }, []);

  const checkBiometry = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricCompatible(hasHardware && isEnrolled);
    } catch (err) {
      console.error('Erro ao verificar biometria:', err);
      setIsBiometricCompatible(false);
    }
  };

  const authenticateBiometry = async () => {
    if (!isBiometricCompatible) return true;

    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique para acessar o CLA',
        fallbackLabel: 'Usar senha',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (err) {
      console.error('Erro na biometria:', err);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

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
      await SecureStore.setItemAsync(SENHA_KEY, senha);
      const biometrySuccess = await authenticateBiometry();
      if (biometrySuccess) {
        setScreen('main');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', 'Falha ao realizar login');
    }
  };

  const getCorPorStatus = (status) => {
    if (!status) return '#6b7280';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('vence') || lowerStatus.includes('hoje')) return '#f59e0b';
    if (lowerStatus.includes('vencida')) return '#ef4444';
    return '#10b981';
  };

  const getSigla = (status) => {
    if (!status) return 'LIC';
    if (status.includes('Vence')) return 'VNC';
    if (status.includes('Vencida')) return 'VCD';
    if (status.includes('Válida')) return 'VAL';
    return status.substring(0, 3).toUpperCase();
  };

  const adicionarOuEditar = async (novoItem) => {
    let novaLista;
    const statusCalculado = calcularStatusPorData(novoItem.validade);
    const novoItemCompleto = {
      ...novoItem,
      status: statusCalculado,
      cor: getCorPorStatus(statusCalculado),
      sigla: getSigla(statusCalculado),
    };
    
    if (editingItem) {
      novaLista = licencas.map((i) => 
        i.id === editingItem.id ? { ...i, ...novoItemCompleto, latitude: selectedLocation?.latitude || i.latitude, longitude: selectedLocation?.longitude || i.longitude } : i
      );
      setEditingItem(null);
    } else {
      const novoId = Date.now().toString();
      novaLista = [...licencas, {
        ...novoItemCompleto,
        id: novoId,
        latitude: selectedLocation?.latitude || null,
        longitude: selectedLocation?.longitude || null,
      }];
    }
    
    const sucesso = await saveLicencas(novaLista);
    if (sucesso) {
      setShowMap(false);
      setSelectedLocation(null);
      setScreen('main');
    }
  };

  const excluir = (id) => {
    Alert.alert(
      'Excluir licença',
      'Tem certeza que deseja excluir esta licença?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const novaLista = licencas.filter((item) => item.id !== id);
            await saveLicencas(novaLista);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ marginTop: 16 }}>Carregando...</Text>
      </View>
    );
  }

  // Tela de Login
  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.appTitle}>CLA</Text>
        <Text style={styles.appSubtitle}>Controle de Licenças Ambientais</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuário ou e-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha (teste: 123456)"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          keyboardType="number-pad"
        />

        {isBiometricCompatible !== null && (
          <Text style={styles.biometryStatus}>
            {isBiometricCompatible ? '🔐 Biometria disponível' : '📱 Biometria não disponível'}
          </Text>
        )}

        {isAuthenticating ? (
          <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 24 }} />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={fazerLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  // Tela da Câmera
  if (screen === 'camera') {
    if (!permissionCamera?.granted) {
      return (
        <View style={styles.center}>
          <Text>Solicitando permissão da câmera...</Text>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <StatusBar barStyle="light-content" />
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={async () => {
                if (cameraRef.current) {
                  try {
                    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
                    if (editingItem) {
                      adicionarOuEditar({ ...editingItem, fotoUri: photo.uri });
                    } else {
                      setEditingItem({ fotoUri: photo.uri });
                    }
                    setScreen('form');
                  } catch (err) {
                    Alert.alert('Erro', 'Não foi possível capturar a foto');
                  }
                }
              }}
            >
              <Text style={styles.captureText}>📸 Tirar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setScreen('form')}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // Tela de Formulário
  if (screen === 'form') {
    return (
      <FormLicenca
        item={editingItem}
        onSave={adicionarOuEditar}
        onCancel={() => {
          setEditingItem(null);
          setScreen('main');
        }}
        onOpenCamera={() => setScreen('camera')}
        onOpenMap={() => {
          setSelectedLocation(null);
          setShowMap(true);
        }}
        selectedLocation={selectedLocation}
      />
    );
  }

  // Tela do Mapa
  if (showMap) {
    return (
      <View style={styles.mapContainer}>
        <StatusBar barStyle="dark-content" />
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          showsMyLocationButton={true}
          initialRegion={{
            latitude: userLocation?.latitude || -23.5505,
            longitude: userLocation?.longitude || -46.6333,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={(e) => {
            setSelectedLocation(e.nativeEvent.coordinate);
          }}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              draggable
              onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
            />
          )}
        </MapView>
        
        <View style={styles.mapButtons}>
          <TouchableOpacity
            style={styles.mapConfirmButton}
            onPress={() => setShowMap(false)}
          >
            <Text style={styles.mapButtonText}>Confirmar Localização</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.mapCancelButton}
            onPress={() => {
              setSelectedLocation(null);
              setShowMap(false);
            }}
          >
            <Text style={styles.mapButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Tela de Detalhes
  if (screen === 'detail') {
    return (
      <SafeAreaView style={styles.detailContainer}>
        <StatusBar barStyle="dark-content" />
        <TouchableOpacity style={styles.backButton} onPress={() => setScreen('main')}>
          <Icon name="arrow-back" size={24} color="#3b82f6" />
          <Text style={styles.backText}> Voltar</Text>
        </TouchableOpacity>

        {selectedItem && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailContent}>
              {selectedItem.fotoUri && (
                <Image source={{ uri: selectedItem.fotoUri }} style={styles.detailImage} />
              )}
              <Text style={styles.detailTitle}>{selectedItem.projeto}</Text>
              <Text style={styles.detailSubtitle}>{selectedItem.nome}</Text>
              <View style={styles.detailInfoRow}>
                <Icon name="event" size={20} color="#6b7280" />
                <Text style={styles.detailInfoLabel}>Validade:</Text>
                <Text style={styles.detailInfo}>{selectedItem.validade}</Text>
              </View>
              <View style={styles.detailInfoRow}>
                <Icon name="info" size={20} color="#6b7280" />
                <Text style={styles.detailInfoLabel}>Status:</Text>
                <Text style={[styles.detailStatus, { color: selectedItem.cor }]}>
                  {selectedItem.status}
                </Text>
              </View>
              {selectedItem.latitude && selectedItem.longitude && (
                <View style={styles.detailMapContainer}>
                  <Text style={styles.detailInfoLabel}>Localização:</Text>
                  <MapView
                    style={styles.detailMap}
                    initialRegion={{
                      latitude: selectedItem.latitude,
                      longitude: selectedItem.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker coordinate={{
                      latitude: selectedItem.latitude,
                      longitude: selectedItem.longitude,
                    }} />
                  </MapView>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // Tela Principal com Bottom Tab Bar
  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <FlatList
            data={licencas}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="file-document-outline" size={80} color="#9ca3af" />
                <Text style={styles.emptyText}>Nenhuma licença cadastrada ainda</Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => { setEditingItem(null); setScreen('form'); }}
                >
                  <Text style={styles.emptyButtonText}>+ Adicionar primeira licença</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modernCard}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedItem(item);
                  setScreen('detail');
                }}
              >
                {item.fotoUri && (
                  <Image source={{ uri: item.fotoUri }} style={styles.cardImage} />
                )}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.projeto}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.cor }]}>
                      <Text style={styles.statusBadgeText}>{item.sigla}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSubtitle}>{item.nome}</Text>
                  <View style={styles.cardDateContainer}>
                    <Icon name="event" size={14} color="#9ca3af" />
                    <Text style={styles.cardDate}> Vence em {item.validade}</Text>
                  </View>
                  <Text style={[styles.cardStatus, { color: item.cor }]}>{item.status}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setEditingItem(item);
                      setScreen('form');
                    }}
                    style={styles.actionButton}
                  >
                    <Icon name="edit" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      excluir(item.id);
                    }}
                    style={styles.actionButton}
                  >
                    <Icon name="delete" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}
          />
        );
      case 'stats':
        // Calcular estatísticas baseadas na data (string)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const validas = licencas.filter(l => {
          const dataValidade = converterDataParaDate(l.validade);
          if (!dataValidade) return false;
          dataValidade.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
          return diffDays > 30;
        }).length;
        
        const vencendo = licencas.filter(l => {
          const dataValidade = converterDataParaDate(l.validade);
          if (!dataValidade) return false;
          dataValidade.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 30;
        }).length;
        
        const vencidas = licencas.filter(l => {
          const dataValidade = converterDataParaDate(l.validade);
          if (!dataValidade) return false;
          dataValidade.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
          return diffDays < 0;
        }).length;
        
        return (
          <ScrollView style={styles.statsContainer} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80 }}>
            <Text style={styles.statsTitle}>Estatísticas</Text>
            
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="file-document" size={40} color="#10b981" />
                <Text style={styles.statNumber}>{licencas.length}</Text>
                <Text style={styles.statLabel}>Total de Licenças</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: '#10b98120' }]}>
                <MaterialCommunityIcons name="check-circle" size={32} color="#10b981" />
                <Text style={[styles.statBoxNumber, { color: '#10b981' }]}>{validas}</Text>
                <Text style={styles.statBoxLabel}>Válidas</Text>
                <Text style={styles.statBoxSubLabel}>(+30 dias)</Text>
              </View>
              
              <View style={[styles.statBox, { backgroundColor: '#f59e0b20' }]}>
                <MaterialCommunityIcons name="clock-alert" size={32} color="#f59e0b" />
                <Text style={[styles.statBoxNumber, { color: '#f59e0b' }]}>{vencendo}</Text>
                <Text style={styles.statBoxLabel}>Vencem em breve</Text>
                <Text style={styles.statBoxSubLabel}>(até 30 dias)</Text>
              </View>
              
              <View style={[styles.statBox, { backgroundColor: '#ef444420' }]}>
                <MaterialCommunityIcons name="alert-circle" size={32} color="#ef4444" />
                <Text style={[styles.statBoxNumber, { color: '#ef4444' }]}>{vencidas}</Text>
                <Text style={styles.statBoxLabel}>Vencidas</Text>
                <Text style={styles.statBoxSubLabel}>(data passada)</Text>
              </View>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Header com botão de logout */}
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>CLA</Text>
            <Text style={styles.headerSubtitle}>Controle de Licenças Ambientais</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={async () => {
              Alert.alert(
                'Sair',
                'Deseja realmente sair do aplicativo?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                      await SecureStore.deleteItemAsync(SENHA_KEY);
                      setScreen('login');
                    }
                  }
                ]
              );
            }}
          >
            <Icon name="logout" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo Principal */}
      {renderContent()}

      {/* Bottom Tab Bar - Início Esquerda, Adicionar Meio, Estatísticas Direita */}
      <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity 
          style={[styles.tabItem, styles.tabItemLeft, activeTab === 'home' && styles.tabItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <Icon name="home" size={28} color={activeTab === 'home' ? '#10b981' : '#9ca3af'} />
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItemCenter}
          onPress={() => { setEditingItem(null); setScreen('form'); }}
        >
          <View style={styles.addButton}>
            <Icon name="add" size={32} color="white" />
          </View>
          <Text style={styles.addButtonLabel}>Adicionar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, styles.tabItemRight, activeTab === 'stats' && styles.tabItemActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Icon name="bar-chart" size={28} color={activeTab === 'stats' ? '#10b981' : '#9ca3af'} />
          <Text style={[styles.tabLabel, activeTab === 'stats' && styles.tabLabelActive]}>Estatísticas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Tela de formulário com teclado numérico para data
function FormLicenca({ item, onSave, onCancel, onOpenCamera, onOpenMap, selectedLocation }) {
  const insets = useSafeAreaInsets();
  const [projeto, setProjeto] = useState(item?.projeto || '');
  const [nome, setNome] = useState(item?.nome || '');
  const [validade, setValidade] = useState(item?.validade || '');
  const [fotoUri, setFotoUri] = useState(item?.fotoUri || null);

  // Função para formatar a data automaticamente enquanto digita
  const formatarData = (texto) => {
    let numeros = texto.replace(/\D/g, ''); // Remove tudo que não é número
    
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    } else {
      return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
    }
  };

  const handleDataChange = (texto) => {
    const dataFormatada = formatarData(texto);
    setValidade(dataFormatada);
  };

  const salvar = () => {
    if (!projeto.trim()) {
      Alert.alert('Campo obrigatório', 'O projeto é obrigatório');
      return;
    }
    
    if (!validade.trim()) {
      Alert.alert('Campo obrigatório', 'A validade é obrigatória');
      return;
    }

    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(validade)) {
      Alert.alert('Formato inválido', 'Use o formato dd/mm/aaaa\nExemplo: 31/12/2024');
      return;
    }

    // Valida se a data é real
    const [dia, mes, ano] = validade.split('/');
    const data = new Date(ano, mes - 1, dia);
    if (data.getDate() != dia || data.getMonth() + 1 != mes || data.getFullYear() != ano) {
      Alert.alert('Data inválida', 'Por favor, digite uma data válida');
      return;
    }

    onSave({ 
      projeto, 
      nome, 
      validade, 
      fotoUri,
      latitude: selectedLocation?.latitude || item?.latitude,
      longitude: selectedLocation?.longitude || item?.longitude,
    });
  };

  return (
    <SafeAreaView style={styles.formContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom }}>
          <Text style={styles.titleForm}>
            {item ? 'Editar Licença' : 'Nova Licença'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Projeto *"
            value={projeto}
            onChangeText={setProjeto}
            maxLength={100}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Nome / Órgão emissor"
            value={nome}
            onChangeText={setNome}
            maxLength={100}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Validade (dd/mm/aaaa) *"
            value={validade}
            onChangeText={handleDataChange}
            maxLength={10}
            keyboardType="numeric"
            returnKeyType="done"
          />
          
          <View style={styles.infoBox}>
            <Icon name="info" size={20} color="#10b981" />
            <Text style={styles.infoText}>
              Digite a data no formato dd/mm/aaaa. Exemplo: 31122024{'\n'}
              A data será formatada automaticamente.{'\n\n'}
              O status será calculado automaticamente:{'\n'}
              • Válida (+30 dias){'\n'}
              • Vence em breve (até 30 dias){'\n'}
              • Vence hoje{'\n'}
              • Vencida (data passada)
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.locationButton}
            onPress={onOpenMap}
            activeOpacity={0.7}
          >
            <Icon name="location-on" size={20} color="#4338ca" />
            <Text style={styles.locationButtonText}>
              {selectedLocation || item?.latitude ? 'Localização selecionada' : 'Adicionar localização no mapa'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.photoButton} 
            onPress={onOpenCamera}
            activeOpacity={0.7}
          >
            <Icon name="camera-alt" size={20} color="#065f46" />
            <Text style={styles.photoButtonText}>
              {fotoUri ? 'Mudar foto' : 'Adicionar foto'}
            </Text>
          </TouchableOpacity>

          {fotoUri && (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: fotoUri }} style={styles.photoPreview} />
              <TouchableOpacity 
                onPress={() => setFotoUri(null)}
                style={styles.removePhotoButton}
              >
                <Icon name="delete" size={20} color="#ef4444" />
                <Text style={styles.removePhotoText}>Remover foto</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={salvar}>
            <Icon name="check" size={20} color="white" />
            <Text style={styles.buttonText}> Salvar alterações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Icon name="close" size={20} color="white" />
            <Text style={styles.cancelButtonText}> Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Componente principal com SafeAreaProvider
export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

// Estilos (mantidos os mesmos do código anterior)
const styles = StyleSheet.create({
  // Login
  loginContainer: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', padding: 40 },
  appTitle: { fontSize: 52, fontWeight: 'bold', color: '#065f46', textAlign: 'center', marginBottom: 8 },
  appSubtitle: { fontSize: 22, color: '#6b7280', textAlign: 'center', marginBottom: 60 },
  input: { backgroundColor: 'white', borderRadius: 16, padding: 18, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  loginButton: { backgroundColor: '#10b981', padding: 20, borderRadius: 16, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  biometryStatus: { textAlign: 'center', marginVertical: 20, color: '#6b7280', fontSize: 15 },

  // Principal
  mainContainer: { flex: 1, backgroundColor: '#f8fafc' },
  headerGradient: { 
    backgroundColor: '#10b981',
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { color: 'white', fontSize: 12, marginTop: 2, opacity: 0.9 },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Cards
  modernCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  cardImage: { width: '100%', height: 160, borderRadius: 16, marginBottom: 12 },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#111827', flex: 1, marginRight: 12 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardSubtitle: { fontSize: 15, color: '#6b7280', marginTop: 4, marginBottom: 8 },
  cardDateContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  cardDate: { fontSize: 14, color: '#9ca3af', marginLeft: 4 },
  cardStatus: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  cardActions: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom Tab Bar
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
    alignItems: 'flex-end',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabItemLeft: {
    alignItems: 'center',
    paddingLeft: 20,
  },
  tabItemRight: {
    alignItems: 'center',
    paddingRight: 20,
  },
  tabItemCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  tabLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#10b981',
    fontWeight: '600',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonLabel: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 4,
    fontWeight: '600',
  },

  // Estatísticas
  statsContainer: { flex: 1, backgroundColor: '#f8fafc' },
  statsTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 24 },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 48, fontWeight: 'bold', color: '#10b981', marginVertical: 8 },
  statLabel: { fontSize: 16, color: '#6b7280' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statBoxNumber: { fontSize: 28, fontWeight: 'bold', marginVertical: 8 },
  statBoxLabel: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  statBoxSubLabel: { fontSize: 10, color: '#9ca3af', marginTop: 4, textAlign: 'center' },

  // Formulário
  formContainer: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  titleForm: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 24 },
  photoButton: { backgroundColor: '#6ee7b7', padding: 16, borderRadius: 12, alignItems: 'center', marginVertical: 8, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  photoButtonText: { color: '#065f46', fontSize: 16, fontWeight: '600' },
  locationButton: { backgroundColor: '#e0e7ff', padding: 16, borderRadius: 12, alignItems: 'center', marginVertical: 8, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  locationButtonText: { color: '#4338ca', fontSize: 16, fontWeight: '600' },
  photoPreviewContainer: { alignItems: 'center', marginVertical: 16 },
  photoPreview: { width: 200, height: 200, borderRadius: 12, marginBottom: 8 },
  removePhotoButton: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  removePhotoText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  saveButton: { backgroundColor: '#10b981', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 24, flexDirection: 'row', justifyContent: 'center' },
  cancelButton: { backgroundColor: '#f87171', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 16, flexDirection: 'row', justifyContent: 'center' },
  cancelButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#065f46',
    lineHeight: 18,
  },

  // Detalhes
  detailContainer: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  detailContent: { alignItems: 'center', paddingBottom: 40 },
  detailImage: { width: '100%', height: 300, borderRadius: 20, marginBottom: 24 },
  detailTitle: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  detailSubtitle: { fontSize: 18, color: '#6b7280', marginBottom: 24, textAlign: 'center' },
  detailInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 8 },
  detailInfoLabel: { fontSize: 16, fontWeight: '600', color: '#374151' },
  detailInfo: { fontSize: 16, color: '#6b7280' },
  detailStatus: { fontSize: 18, fontWeight: '600' },
  detailMapContainer: { marginTop: 24, width: '100%', alignItems: 'center' },
  detailMap: { width: '100%', height: 200, borderRadius: 12, marginTop: 8 },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 24, padding: 8 },
  backText: { fontSize: 18, fontWeight: '600', color: '#3b82f6', marginLeft: 4 },

  // Mapa
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  mapButtons: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    gap: 12,
  },
  mapConfirmButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  mapCancelButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Câmera
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraControls: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60 },
  captureButton: { backgroundColor: 'white', borderRadius: 50, paddingVertical: 18, paddingHorizontal: 50, marginBottom: 24 },
  captureText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  cancelText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 12 },

  // Utilitários
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 100 },
  emptyText: { fontSize: 18, color: '#9ca3af', textAlign: 'center', marginVertical: 16 },
  emptyButton: { backgroundColor: '#10b981', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  emptyButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});