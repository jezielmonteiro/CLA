import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { loadLicencas, saveLicenca, deleteLicenca } from '../services/storage';
import { calcularStatusPorData, getCorPorStatus, getSigla } from '../utils/statusUtils';

export const useLicenses = () => {
  const [licencas, setLicencas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await loadLicencas();
      setLicencas(data);
    } catch (e) {
      console.error('Erro ao carregar licenças:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const adicionarOuEditar = useCallback(async (novoItem, editingItem, selectedLocation) => {
    const statusCalculado = calcularStatusPorData(novoItem.validade);
    const novoItemCompleto = {
      ...novoItem,
      status: statusCalculado,
      cor: getCorPorStatus(statusCalculado),
      sigla: getSigla(statusCalculado),
    };
    
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

  const excluir = useCallback(async (id) => {
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const success = await deleteLicenca(id);
        if (success) {
          setLicencas(prev => prev.filter(item => item.id !== id));
        } else {
          Alert.alert('Erro', 'Não foi possível excluir o item do banco');
        }
      }}
    ]);
  }, []);

  return { licencas, isLoading, loadData, adicionarOuEditar, excluir };
};