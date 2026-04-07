import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { loadLicencas, saveLicencas } from '../services/storage';
import { calcularStatusPorData, getCorPorStatus, getSigla } from '../utils/statusUtils';

export const useLicenses = (initialLicencas) => {
  const [licencas, setLicencas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await loadLicencas(initialLicencas);
    setLicencas(data);
    setIsLoading(false);
  }, [initialLicencas]);

  const saveData = useCallback(async (novaLista) => {
    const success = await saveLicencas(novaLista);
    if (success) {
      setLicencas(novaLista);
      return true;
    }
    Alert.alert('Erro', 'Não foi possível salvar as alterações');
    return false;
  }, []);

  const adicionarOuEditar = useCallback(async (novoItem, editingItem, selectedLocation) => {
    const statusCalculado = calcularStatusPorData(novoItem.validade);
    const novoItemCompleto = {
      ...novoItem,
      status: statusCalculado,
      cor: getCorPorStatus(statusCalculado),
      sigla: getSigla(statusCalculado),
    };
    
    let novaLista;
    if (editingItem) {
      novaLista = licencas.map(i => 
        i.id === editingItem.id ? { 
          ...i, 
          ...novoItemCompleto, 
          latitude: selectedLocation?.latitude ?? i.latitude, 
          longitude: selectedLocation?.longitude ?? i.longitude 
        } : i
      );
    } else {
      novaLista = [...licencas, {
        ...novoItemCompleto,
        id: Date.now().toString(),
        latitude: selectedLocation?.latitude ?? null,
        longitude: selectedLocation?.longitude ?? null,
      }];
    }
    return await saveData(novaLista);
  }, [licencas, saveData]);

  const excluir = useCallback(async (id) => {
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const novaLista = licencas.filter(item => item.id !== id);
        await saveData(novaLista);
      }}
    ]);
  }, [licencas, saveData]);

  return { licencas, isLoading, loadData, adicionarOuEditar, excluir };
};