import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { loadLicencas, saveLicenca, deleteLicenca } from '../services/storage';
import { calcularStatusPorData, getCorPorStatus, getSigla } from '../utils/statusUtils';

export const useLicenses = () => {
  const [licencas, setLicencas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await loadLicencas();
    setLicencas(data);
    setIsLoading(false);
  }, []);

  const adicionarOuEditar = useCallback(async (novoItem, editingItem, selectedLocation) => {
    const statusCalculado = calcularStatusPorData(novoItem.validade);
    const novoItemCompleto = {
      ...novoItem,
      id: editingItem?.id || null,
      status: statusCalculado,
      cor: getCorPorStatus(statusCalculado),
      sigla: getSigla(statusCalculado),
    };

    // Trata localização: pode ser array de coordenadas (área) ou ponto único
    if (Array.isArray(selectedLocation) && selectedLocation.length > 0) {
      novoItemCompleto.coordinates = selectedLocation;
      novoItemCompleto.latitude = null;
      novoItemCompleto.longitude = null;
    } else if (selectedLocation?.latitude) {
      novoItemCompleto.latitude = selectedLocation.latitude;
      novoItemCompleto.longitude = selectedLocation.longitude;
      novoItemCompleto.coordinates = null;
    } else if (editingItem) {
      // Mantém localização existente se não foi alterada
      novoItemCompleto.coordinates = editingItem.coordinates ?? null;
      novoItemCompleto.latitude = editingItem.latitude ?? null;
      novoItemCompleto.longitude = editingItem.longitude ?? null;
    }

    const salvo = await saveLicenca(novoItemCompleto);
    if (!salvo) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
      return false;
    }

    const itemFinal = {
      ...salvo,
      status: calcularStatusPorData(salvo.validade),
      cor: getCorPorStatus(calcularStatusPorData(salvo.validade)),
      sigla: getSigla(calcularStatusPorData(salvo.validade)),
    };

    if (editingItem) {
      setLicencas(prev => prev.map(i => i.id === editingItem.id ? itemFinal : i));
    } else {
      setLicencas(prev => [...prev, itemFinal]);
    }

    return true;
  }, []);

  const excluir = useCallback(async (id) => {
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const ok = await deleteLicenca(id);
          if (ok) {
            setLicencas(prev => prev.filter(item => item.id !== id));
          } else {
            Alert.alert('Erro', 'Não foi possível excluir a licença');
          }
        },
      },
    ]);
  }, []);

  return { licencas, isLoading, loadData, adicionarOuEditar, excluir };
};
