import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatarData, validarData, converterDataParaDate } from '../utils/dateUtils';

export const FormScreen = ({ item, onSave, onCancel, onOpenCamera, onOpenMap, selectedLocation, setSelectedLocation, tempData }) => {
  const insets = useSafeAreaInsets();

  const [projeto, setProjeto] = useState(tempData?.projeto || item?.projeto || '');
  const [nome, setNome] = useState(tempData?.nome || item?.nome || '');
  const [numeroLicenca, setNumeroLicenca] = useState(tempData?.numeroLicenca || item?.numeroLicenca || '');
  const [tipoLicenca, setTipoLicenca] = useState(tempData?.tipoLicenca || item?.tipoLicenca || '');
  const [dataEmissao, setDataEmissao] = useState(tempData?.dataEmissao || item?.dataEmissao || '');
  const [empresa, setEmpresa] = useState(tempData?.empresa || item?.empresa || '');
  const [validade, setValidade] = useState(tempData?.validade || item?.validade || '');

  const [fotoUri, setFotoUri] = useState(tempData?.fotoUri || item?.fotoUri || null);
  const [fotoBase64, setFotoBase64] = useState(tempData?.fotoBase64 || null);

  const [showPickerEmissao, setShowPickerEmissao] = useState(false);
  const [showPickerValidade, setShowPickerValidade] = useState(false);

  useEffect(() => {
    if (tempData?.fotoUri) setFotoUri(tempData.fotoUri);
    if (tempData?.fotoBase64) setFotoBase64(tempData.fotoBase64);
  }, [tempData?.fotoUri, tempData?.fotoBase64]);

  const salvar = () => {
    if (!projeto.trim()) { Alert.alert('Erro', 'Empreendimento é obrigatório'); return; }
    if (!validade.trim()) { Alert.alert('Erro', 'Validade é obrigatória'); return; }
    if (!validarData(validade)) { Alert.alert('Erro', 'Data de Validade inválida. Use dd/mm/aaaa'); return; }
    if (dataEmissao && !validarData(dataEmissao)) { Alert.alert('Erro', 'Data de Emissão inválida. Use dd/mm/aaaa'); return; }
    onSave({ projeto, nome, numeroLicenca, tipoLicenca, dataEmissao, empresa, validade, fotoUri, fotoBase64 });
  };

  const prepararSaida = (acao) => {
    const dadosAtuais = { projeto, nome, numeroLicenca, tipoLicenca, dataEmissao, empresa, validade, fotoUri, fotoBase64 };
    acao(dadosAtuais);
  };

  const handleDateChange = (event, selectedDate, setter, setPickerState) => {
    if (Platform.OS !== 'ios') {
      setPickerState(false);
    }
    if (event.type === 'dismissed') {
      return;
    }
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setter(`${day}/${month}/${year}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Icon name="close" size={24} color="#6b7280" />
          </TouchableOpacity>

          <Text style={styles.title}>{item ? 'Editar Licença' : 'Nova Licença'}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Empreendimento / Atividade *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Loteamento Bosque Verde"
              placeholderTextColor="#9ca3af"
              value={projeto}
              onChangeText={setProjeto}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Órgão Emissor</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: IBAMA, CETESB, FEPAM"
              placeholderTextColor="#9ca3af"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8, marginHorizontal: 0 }]}>
              <Text style={styles.label}>Fase da Licença</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: LP, LI, LO"
                placeholderTextColor="#9ca3af"
                value={tipoLicenca}
                onChangeText={setTipoLicenca}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8, marginHorizontal: 0 }]}>
              <Text style={styles.label}>Nº do Processo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 12345/2023"
                placeholderTextColor="#9ca3af"
                value={numeroLicenca}
                onChangeText={setNumeroLicenca}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Condicionantes / Observações</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Descreva as condicionantes ou restrições pendentes..."
              placeholderTextColor="#9ca3af"
              value={empresa}
              onChangeText={setEmpresa}
              multiline
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8, marginHorizontal: 0 }]}>
              <Text style={styles.label}>Data de Emissão</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickerEmissao(true)}>
                 <Text style={styles.dateText}>{dataEmissao || "dd/mm/aaaa"}</Text>
                 <Icon name="calendar-today" size={20} color="#6b7280" />
              </TouchableOpacity>
              {showPickerEmissao && (
                <DateTimePicker
                  value={converterDataParaDate(dataEmissao) || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => handleDateChange(event, date, setDataEmissao, setShowPickerEmissao)}
                />
              )}
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8, marginHorizontal: 0 }]}>
              <Text style={styles.label}>Data de Validade *</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickerValidade(true)}>
                 <Text style={styles.dateText}>{validade || "dd/mm/aaaa"}</Text>
                 <Icon name="event" size={20} color="#296959" />
              </TouchableOpacity>
              {showPickerValidade && (
                <DateTimePicker
                  value={converterDataParaDate(validade) || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => handleDateChange(event, date, setValidade, setShowPickerValidade)}
                />
              )}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.mapButton} onPress={() => prepararSaida(onOpenMap)}>
              <Icon name="map" size={20} color="#4338ca" />
              <Text style={styles.mapButtonText}>Localização</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cameraButton} onPress={() => prepararSaida(onOpenCamera)}>
              <Icon name="camera-alt" size={20} color="#296959" />
              <Text style={styles.cameraButtonText}>Documento</Text>
            </TouchableOpacity>
          </View>

          {fotoUri && (
            <View style={styles.photoPreview}>
              <Image source={{ uri: fotoUri }} style={styles.previewImage} />
              <TouchableOpacity onPress={() => setFotoUri(null)} style={styles.removePhotoButton}>
                <Icon name="delete" size={20} color="#ef4444" />
                <Text style={styles.removePhotoText}>Remover foto</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedLocation && (
            <View style={styles.locationInfo}>
              <Icon name="location-on" size={20} color="#4338ca" />
              <Text style={styles.locationText}>
                {Array.isArray(selectedLocation) ? 'Área selecionada no mapa' : 'Localização selecionada'}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={salvar}>
            <Icon name="check" size={20} color="white" />
            <Text style={styles.buttonText}> Salvar Licença</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  closeButton: { alignSelf: 'flex-end', padding: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 24, paddingHorizontal: 24 },
  row: { flexDirection: 'row', marginHorizontal: 24 },
  inputContainer: { marginBottom: 16, marginHorizontal: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 16, color: '#1e293b' },
  dateInput: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 16, color: '#1e293b' },
  buttonRow: { flexDirection: 'row', gap: 12, marginHorizontal: 24, marginBottom: 16, marginTop: 8 },
  mapButton: { flex: 1, backgroundColor: '#e0e7ff', padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  mapButtonText: { color: '#4338ca', fontSize: 16, fontWeight: '600' },
  cameraButton: { flex: 1, backgroundColor: '#6ee7b7', padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  cameraButtonText: { color: '#065f46', fontSize: 16, fontWeight: '600' },
  photoPreview: { alignItems: 'center', marginVertical: 16, marginHorizontal: 24 },
  previewImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 8 },
  removePhotoButton: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  removePhotoText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  locationInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 8, marginHorizontal: 24, backgroundColor: '#e0e7ff', padding: 12, borderRadius: 12 },
  locationText: { color: '#4338ca', fontSize: 14, fontWeight: '500' },
  saveButton: { backgroundColor: '#296959', marginHorizontal: 24, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 24, flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: '#296959', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});
