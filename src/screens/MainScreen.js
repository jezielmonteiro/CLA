import React, { useState } from 'react';
// ADICIONADO: Alert para o logout e Text para a lista vazia
import { View, FlatList, StyleSheet, Alert, Text } from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '../components/Header';
import { BottomTabBar } from '../components/BottomTabBar';
import { LicenseCard } from '../components/LicenseCard';
import { StatsScreen } from '../components/StatsScreen';
import { deletePassword } from '../services/auth';

export const MainScreen = ({ licencas, onEdit, onDelete, onLogout, onAddPress, onViewDetail }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive', 
        onPress: async () => { 
          await deletePassword(); 
          onLogout(); 
        } 
      }
    ]);
  };

  if (activeTab === 'stats') {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Header onLogout={handleLogout} />
        <StatsScreen licencas={licencas} insets={insets} />
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} onAddPress={onAddPress} insets={insets} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header onLogout={handleLogout} />
      <FlatList
        data={licencas}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma licença cadastrada</Text>
            <Text style={styles.emptySubText}>Toque no botão + para adicionar</Text>
          </View>
        }
        renderItem={({ item }) => (
          <LicenseCard
            item={item}
            onPress={() => onViewDetail(item)}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item.id)}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}
      />
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} onAddPress={onAddPress} insets={insets} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 100 },
  emptyText: { fontSize: 18, color: '#9ca3af', textAlign: 'center', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#cbd5e1', textAlign: 'center' },
});