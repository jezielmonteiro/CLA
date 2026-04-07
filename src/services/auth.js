import * as SecureStore from 'expo-secure-store';
import { SENHA_KEY } from '../utils/constants';

export const savePassword = async (senha) => {
  await SecureStore.setItemAsync(SENHA_KEY, senha);
};

export const getPassword = async () => {
  return await SecureStore.getItemAsync(SENHA_KEY);
};

export const deletePassword = async () => {
  await SecureStore.deleteItemAsync(SENHA_KEY);
};