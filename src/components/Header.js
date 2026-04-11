import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons'; 

export const Header = ({ onLogout }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Icon name="eco" size={28} color="white" />
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>CLA</Text>
          <Text style={styles.headerSubtitle}>Controle de Licenças Ambientais</Text>
        </View>

        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#296959',
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    elevation: 5, // Adicionado para aparecer sombra no Android também
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
  logoutButton: {
    padding: 8,
  },
});