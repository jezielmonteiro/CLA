import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const Header = ({ onProfilePress }) => {
  const [avatarUri, setAvatarUri] = useState(null);
  const [nome, setNome] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.avatarUri) setAvatarUri(data.avatarUri);
          if (data.nome) setNome(data.nome);
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchProfile();
  }, []);

  const getInitial = () => {
    if (nome) return nome.charAt(0).toUpperCase();
    if (auth.currentUser?.email) return auth.currentUser.email.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <LinearGradient colors={['#115E59', '#059669']} style={styles.header}>
      <View style={styles.headerContent}>
        <Icon name="eco" size={28} color="white" />

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>CLA</Text>
          <Text style={styles.headerSubtitle}>Controle de Licenças Ambientais</Text>
        </View>

        <View style={styles.actionsContainer}>
          {onProfilePress && (
            <TouchableOpacity testID="profileButton" onPress={onProfilePress} style={styles.profileButton}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{getInitial()}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginLeft: 8,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
