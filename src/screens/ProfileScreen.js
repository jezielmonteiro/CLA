import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../config/firebase';

export const ProfileScreen = ({ onBack }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [cargo, setCargo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNome(data.nome || '');
        setTelefone(data.telefone || '');
        setCpfCnpj(data.cpfCnpj || '');
        setCargo(data.cargo || '');
        setEmpresa(data.empresa || '');
        setAvatarUri(data.avatarUri || null);
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Erro', 'Falha ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'É necessário permitir o acesso à galeria para mudar a foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAvatarUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'É necessário permitir o acesso à câmera para tirar uma foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1,
      base64: true,
      cameraType: 'front',
    });

    if (!result.canceled && result.assets[0].base64) {
      setAvatarUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Foto de Perfil',
      'Como deseja atualizar sua foto?',
      [
        { text: 'Tirar uma Selfie', onPress: takePhoto },
        { text: 'Escolher da Galeria', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert('Aviso', 'O nome não pode estar vazio.');
      return;
    }
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          nome: nome.trim(),
          telefone: telefone.trim(),
          cpfCnpj: cpfCnpj.trim(),
          cargo: cargo.trim(),
          empresa: empresa.trim(),
          avatarUri,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        onBack();
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#296959" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="white" />
      <View style={styles.header}>
        <TouchableOpacity testID="profileBackButton" onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contentContainer}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <TouchableOpacity testID="profileAvatarButton" style={styles.avatarContainer} onPress={handleAvatarPress}>
             <View style={styles.avatar}>
               {avatarUri ? (
                 <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
               ) : (
                 <Text style={styles.avatarText}>{nome ? nome.charAt(0).toUpperCase() : auth.currentUser?.email?.charAt(0).toUpperCase()}</Text>
               )}
               <View style={styles.editAvatarBadge}>
                 <Ionicons name="camera" size={14} color="white" />
               </View>
             </View>
             <Text style={styles.emailText}>{auth.currentUser?.email}</Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput testID="profileNomeInput" style={styles.input} value={nome} onChangeText={setNome} placeholder="Seu nome" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF ou CNPJ</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput testID="profileCpfInput" style={styles.input} value={cpfCnpj} onChangeText={setCpfCnpj} placeholder="000.000.000-00" keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Empresa / Organização Atual</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput testID="profileEmpresaInput" style={styles.input} value={empresa} onChangeText={setEmpresa} placeholder="Ex: Secretaria de Meio Ambiente" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cargo / Ocupação</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="briefcase-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput testID="profileCargoInput" style={styles.input} value={cargo} onChangeText={setCargo} placeholder="Ex: Engenheiro Ambiental" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone de Contato</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput testID="profileTelefoneInput" style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
            </View>
          </View>

          <TouchableOpacity testID="profileSaveButton" style={styles.saveButton} onPress={handleSave} disabled={saving}>
             {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar Alterações</Text>}
          </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  contentContainer: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  content: { padding: 24 },
  avatarContainer: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#296959', justifyContent: 'center', alignItems: 'center', marginBottom: 12, position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarText: { fontSize: 40, color: 'white', fontWeight: 'bold' },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10b981', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#f8fafc' },
  emailText: { fontSize: 16, color: '#64748b' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#0f172a' },
  saveButton: { backgroundColor: '#296959', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
