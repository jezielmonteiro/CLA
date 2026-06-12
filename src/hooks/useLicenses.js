import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
<<<<<<< HEAD
import { loadLicencas, saveLicencas } from '../services/storage';
import { calcularStatusPorData, getCorPorStatus, getSigla } from '../utils/statusUtils';

export const useLicenses = (initialLicencas) => {
=======
import { loadLicencas, saveLicenca, deleteLicenca } from '../services/storage';
import { calcularStatusPorData, getCorPorStatus, getSigla } from '../utils/statusUtils';

export const useLicenses = () => {
>>>>>>> feat/api-jwt-security
  const [licencas, setLicencas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
<<<<<<< HEAD
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
=======
    try {
      const data = await loadLicencas();
      setLicencas(data);
    } catch (e) {
      console.error('Erro ao carregar licenças:', e);
    } finally {
      setIsLoading(false);
    }
>>>>>>> feat/api-jwt-security
  }, []);

  const adicionarOuEditar = useCallback(async (novoItem, editingItem, selectedLocation) => {
    const statusCalculado = calcularStatusPorData(novoItem.validade);
    const novoItemCompleto = {
      ...novoItem,
      status: statusCalculado,
      cor: getCorPorStatus(statusCalculado),
      sigla: getSigla(statusCalculado),
    };
    
<<<<<<< HEAD
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
=======
    let itemParaSalvar;
    if (editingItem) {
      itemParaSalvar = { 
        ...editingItem, 
        ...novoItemCompleto, 
        coordinates: selectedLocation ?? editingItem.coordinates ?? null 
      };
      // Opcional: remover latitude/longitude antigos se existirem para limpar o banco
      delete itemParaSalvar.latitude;
      delete itemParaSalvar.longitude;
    } else {
      itemParaSalvar = {
        ...novoItemCompleto,
        coordinates: selectedLocation ?? null,
      };
    }

    const savedItem = await saveLicenca(itemParaSalvar);

    if (savedItem) {
      // Reconstroi os dados com as propriedades visuais
      const uiItem = {
        ...savedItem,
        status: calcularStatusPorData(savedItem.validade),
        cor: getCorPorStatus(calcularStatusPorData(savedItem.validade)),
        sigla: getSigla(calcularStatusPorData(savedItem.validade))
      };

      setLicencas(prev => {
        if (editingItem) {
          return prev.map(i => i.id === uiItem.id ? uiItem : i);
        } else {
          return [...prev, uiItem];
        }
      });
      return true;
    }
    
    Alert.alert('Erro', 'Não foi possível salvar as alterações');
    return false;
  }, [licencas]);
>>>>>>> feat/api-jwt-security

  const excluir = useCallback(async (id) => {
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
<<<<<<< HEAD
        const novaLista = licencas.filter(item => item.id !== id);
        await saveData(novaLista);
      }}
    ]);
  }, [licencas, saveData]);
=======
        const success = await deleteLicenca(id);
        if (success) {
          setLicencas(prev => prev.filter(item => item.id !== id));
        } else {
          Alert.alert('Erro', 'Não foi possível excluir o item do banco');
        }
      }}
    ]);
  }, []);
>>>>>>> feat/api-jwt-security

  return { licencas, isLoading, loadData, adicionarOuEditar, excluir };
};