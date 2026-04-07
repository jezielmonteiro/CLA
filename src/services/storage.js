import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY } from '../utils/constants';
import { calcularStatusPorData, getCorPorStatus, getSigla } from '../utils/statusUtils';

export const loadLicencas = async (initialLicencas) => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      const licencasCarregadas = JSON.parse(json);
      return licencasCarregadas.map(licenca => ({
        ...licenca,
        status: calcularStatusPorData(licenca.validade),
        cor: getCorPorStatus(calcularStatusPorData(licenca.validade)),
        sigla: getSigla(calcularStatusPorData(licenca.validade))
      }));
    }
    const licencasIniciais = initialLicencas.map(licenca => ({
      ...licenca,
      status: calcularStatusPorData(licenca.validade),
      cor: getCorPorStatus(calcularStatusPorData(licenca.validade)),
      sigla: getSigla(calcularStatusPorData(licenca.validade))
    }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(licencasIniciais));
    return licencasIniciais;
  } catch (e) {
    console.error('Erro ao carregar licenças:', e);
    return initialLicencas;
  }
};

export const saveLicencas = async (novaLista) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
    return true;
  } catch (e) {
    console.error('Erro ao salvar licenças:', e);
    return false;
  }
};