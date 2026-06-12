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
        id: docSnap.id,
        status: calcularStatusPorData(data.validade),
        cor: getCorPorStatus(calcularStatusPorData(data.validade)),
        sigla: getSigla(calcularStatusPorData(data.validade)),
      });
    });

    if (licencasCarregadas.length === 0 && initialLicencas && initialLicencas.length > 0) {
      for (const licenca of initialLicencas) {
        const docId = licenca.id || doc(collection(db, COLLECTION_NAME)).id;
        const novoItem = { ...licenca, id: docId };

        await setDoc(doc(db, COLLECTION_NAME, docId), novoItem);

        licencasCarregadas.push({
          ...novoItem,
          status: calcularStatusPorData(novoItem.validade),
          cor: getCorPorStatus(calcularStatusPorData(novoItem.validade)),
          sigla: getSigla(calcularStatusPorData(novoItem.validade)),
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
    const docRef = licenca.id
      ? doc(db, COLLECTION_NAME, licenca.id)
      : doc(collection(db, COLLECTION_NAME));

    const licencaParaSalvar = { ...licenca, id: docRef.id };

    // Remove propriedades calculadas antes de salvar
    delete licencaParaSalvar.status;
    delete licencaParaSalvar.cor;
    delete licencaParaSalvar.sigla;

    // Firebase rejeita valores 'undefined'
    Object.keys(licencaParaSalvar).forEach(key => {
      if (licencaParaSalvar[key] === undefined) {
        delete licencaParaSalvar[key];
      }
    });

    // Salva foto como base64 data URI no Firestore para evitar Firebase Storage
    if (licencaParaSalvar.fotoBase64) {
      licencaParaSalvar.fotoUri = `data:image/jpeg;base64,${licencaParaSalvar.fotoBase64}`;
      delete licencaParaSalvar.fotoBase64;
    } else if (licencaParaSalvar.fotoUri && licencaParaSalvar.fotoUri.startsWith('file://')) {
      try {
        const base64 = await FileSystem.readAsStringAsync(licencaParaSalvar.fotoUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        licencaParaSalvar.fotoUri = `data:image/jpeg;base64,${base64}`;
      } catch (readError) {
        console.error('Erro ao ler foto:', readError);
      }
    }

    delete licencaParaSalvar.fotoBase64;

    await setDoc(docRef, licencaParaSalvar);
    return licencaParaSalvar;
  } catch (e) {
    console.error('Erro ao salvar licença no Firebase:', e);
    return null;
  }
};

export const deleteLicenca = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return true;
  } catch (e) {
    console.error('Erro ao excluir licença no Firebase:', e);
    return false;
  }
};
