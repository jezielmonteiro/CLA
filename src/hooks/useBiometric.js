<<<<<<< HEAD
import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
=======
import { useState, useEffect } from "react";
import * as LocalAuthentication from "expo-local-authentication";
>>>>>>> feat/api-jwt-security

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
<<<<<<< HEAD
      console.error('Erro ao verificar biometria:', err);
=======
      console.error("Erro ao verificar biometria:", err);
>>>>>>> feat/api-jwt-security
      setIsBiometricCompatible(false);
    }
  };

  const authenticateBiometry = async () => {
    if (!isBiometricCompatible) return true;
    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
<<<<<<< HEAD
        promptMessage: 'Autentique para acessar o CLA',
        fallbackLabel: 'Usar senha',
=======
        promptMessage: "Autentique para acessar o CLA",
        fallbackLabel: "Usar senha",
>>>>>>> feat/api-jwt-security
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (err) {
<<<<<<< HEAD
      console.error('Erro na biometria:', err);
=======
      console.error("Erro na biometria:", err);
>>>>>>> feat/api-jwt-security
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  return { isBiometricCompatible, isAuthenticating, authenticateBiometry };
<<<<<<< HEAD
};
=======
};
>>>>>>> feat/api-jwt-security
