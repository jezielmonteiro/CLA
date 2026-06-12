<<<<<<< HEAD
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
=======
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system/legacy';
import { db } from '../config/firebase';
import { calcularStatusPorData, getCorPorStatus, getSigla } from '../utils/statusUtils';

const COLLECTION_NAME = 'licencas';

export const loadLicencas = async (initialLicencas) => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const licencasCarregadas = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      licencasCarregadas.push({
        ...data,
        id: docSnap.id, // O ID do documento se torna a chave
        status: calcularStatusPorData(data.validade),
        cor: getCorPorStatus(calcularStatusPorData(data.validade)),
        sigla: getSigla(calcularStatusPorData(data.validade))
      });
    });

    if (licencasCarregadas.length === 0 && initialLicencas && initialLicencas.length > 0) {
      for (const licenca of initialLicencas) {
         // Garante um ID, seja o fornecido ou um novo
         const docId = licenca.id || doc(collection(db, COLLECTION_NAME)).id;
         const novoItem = { ...licenca, id: docId };
         
         await setDoc(doc(db, COLLECTION_NAME, docId), novoItem);
         
         licencasCarregadas.push({
           ...novoItem,
           status: calcularStatusPorData(novoItem.validade),
           cor: getCorPorStatus(calcularStatusPorData(novoItem.validade)),
           sigla: getSigla(calcularStatusPorData(novoItem.validade))
         });
      }
    }

    return licencasCarregadas;
  } catch (e) {
    console.error('Erro ao carregar licenças do Firebase:', e);
    return initialLicencas || [];
  }
};

export const saveLicenca = async (licenca) => {
  try {
    // Se o item não tiver ID (novo), criamos uma referência nova para pegar o ID automático
    const docRef = licenca.id ? doc(db, COLLECTION_NAME, licenca.id) : doc(collection(db, COLLECTION_NAME));
    
    const licencaParaSalvar = { ...licenca, id: docRef.id };
    
    // Removemos propriedades calculadas antes de salvar para não duplicar dados
    delete licencaParaSalvar.status;
    delete licencaParaSalvar.cor;
    delete licencaParaSalvar.sigla;

    // Firebase rejeita valores 'undefined'. Removemos qualquer chave que seja undefined.
    Object.keys(licencaParaSalvar).forEach(key => {
      if (licencaParaSalvar[key] === undefined) {
        delete licencaParaSalvar[key];
      }
    });

    // Se temos base64 da câmera, salvamos diretamente no Firestore como data URI
    // Isso evita completamente o Firebase Storage e todos os problemas de Blob
    if (licencaParaSalvar.fotoBase64) {
      licencaParaSalvar.fotoUri = `data:image/jpeg;base64,${licencaParaSalvar.fotoBase64}`;
      delete licencaParaSalvar.fotoBase64; // Remove o campo temporário antes de salvar
    } else if (licencaParaSalvar.fotoUri && licencaParaSalvar.fotoUri.startsWith('file://')) {
      // Fallback: se não temos base64 mas temos file://, lemos o arquivo
      try {
        const base64 = await FileSystem.readAsStringAsync(licencaParaSalvar.fotoUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        licencaParaSalvar.fotoUri = `data:image/jpeg;base64,${base64}`;
      } catch (readError) {
        console.error('Erro ao ler foto:', readError);
        // Mantém o fotoUri original como fallback
      }
    }
    // Remove fotoBase64 se ainda existir
    delete licencaParaSalvar.fotoBase64;

    await setDoc(docRef, licencaParaSalvar);
    return licencaParaSalvar; // Retornamos o objeto com ID gerado
  } catch (e) {
    console.error('Erro ao salvar licença no Firebase:', e);
    alert('Erro Firebase: ' + e.message); // Temporário para debugar
    return null;
  }
};

export const deleteLicenca = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return true;
  } catch (e) {
    console.error('Erro ao excluir licença no Firebase:', e);
>>>>>>> feat/api-jwt-security
    return false;
  }
};