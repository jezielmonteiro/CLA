import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export const useBiometric = () => {
  const [isBiometricCompatible, setIsBiometricCompatible] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometry();
  }, []);

  const checkBiometry = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricCompatible(hasHardware && isEnrolled);
    } catch (err) {
      console.error('Erro ao verificar biometria:', err);
      setIsBiometricCompatible(false);
    }
  };

  const authenticateBiometry = async () => {
    if (!isBiometricCompatible) return true;
    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique para acessar o CLA',
        fallbackLabel: 'Usar senha',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (err) {
      console.error('Erro na biometria:', err);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  return { isBiometricCompatible, isAuthenticating, authenticateBiometry };
};