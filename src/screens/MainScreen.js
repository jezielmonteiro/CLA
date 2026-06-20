import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'; 
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Header } from '../components/Header';
import { BottomTabBar } from '../components/BottomTabBar';
import { LicenseCard } from '../components/LicenseCard';
import { StatsScreen } from '../components/StatsScreen';
import { deletePassword } from '../services/auth';
import { signOut } from 'firebase/auth';

import { InboxScreen } from './InboxScreen';
import { UsersListScreen } from './UsersListScreen';

export const MainScreen = ({ initialTab = 'home', onTabChange, licencas, onEdit, onDelete, onLogout, onAddPress, onViewDetail, onProfilePress, onOpenChat }) => {
  const insets = useSafeAreaInsets();
  const activeTab = initialTab;
  const setActiveTab = onTabChange;
  const [chatSubTab, setChatSubTab] = useState('inbox');

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair de sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive', 
        onPress: async () => { 
          try {
            await deletePassword();
            await signOut(auth);
          } catch (e) {
            console.log('Erro ao deslogar:', e);
          } finally {
            onLogout();
          }
        } 
      }
    ]);
  };

  if (activeTab === 'stats') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Header onProfilePress={onProfilePress} />
        <StatsScreen licencas={licencas} insets={insets} />
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} onAddPress={onAddPress} onLogout={handleLogout} insets={insets} />
      </View>
    );
  }

  if (activeTab === 'chat') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Header onProfilePress={onProfilePress} />
        
        <View style={styles.chatTabSwitcher}>
          <TouchableOpacity 
            style={[styles.chatTabButton, chatSubTab === 'inbox' && styles.chatTabButtonActive]} 
            onPress={() => setChatSubTab('inbox')}
          >
            <Text style={[styles.chatTabText, chatSubTab === 'inbox' && styles.chatTabTextActive]}>Conversas</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chatTabButton, chatSubTab === 'users' && styles.chatTabButtonActive]} 
            onPress={() => setChatSubTab('users')}
          >
            <Text style={[styles.chatTabText, chatSubTab === 'users' && styles.chatTabTextActive]}>Contatos</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          {chatSubTab === 'inbox' ? (
            <InboxScreen onSelectChat={onOpenChat} onGoToContacts={() => setChatSubTab('users')} />
          ) : (
            <UsersListScreen onSelectUser={onOpenChat} />
          )}
        </View>

        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} onAddPress={onAddPress} onLogout={handleLogout} insets={insets} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header onProfilePress={onProfilePress} />
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
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} onAddPress={onAddPress} onLogout={handleLogout} insets={insets} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 100 },
  emptyText: { fontSize: 18, color: '#9ca3af', textAlign: 'center', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#cbd5e1', textAlign: 'center' },
  chatTabSwitcher: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  chatTabButton: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  chatTabButtonActive: { borderBottomColor: '#296959' },
  chatTabText: { fontSize: 16, color: '#64748b', fontWeight: '600' },
  chatTabTextActive: { color: '#296959' },
});