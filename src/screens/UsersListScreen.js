import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const UsersListScreen = ({ onBack, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = [];
      querySnapshot.forEach((docSnap) => {
        if (docSnap.id !== auth.currentUser?.uid) {
          usersList.push({ id: docSnap.id, ...docSnap.data() });
        }
      });
      setUsers(usersList);
    } catch (e) {
      console.log('Error loading users', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = searchQuery.trim().length >= 2
    ? users.filter(u => 
        (u.nome || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const emptyMessage = searchQuery.trim().length < 2 
    ? "Digite um nome ou e-mail na barra acima para encontrar pessoas." 
    : "Nenhum usuário encontrado com esse nome ou e-mail.";

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => onSelectUser(item)}>
      <View style={styles.avatar}>
        {item.avatarUri ? (
          <Image source={{ uri: item.avatarUri }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{item.nome ? item.nome.charAt(0).toUpperCase() : item.email?.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nome || 'Usuário sem nome'}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <View style={styles.chatButton}>
        <Text style={styles.chatButtonText}>Conversar</Text>
        <Ionicons name="chevron-forward" size={16} color="white" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#296959" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>{emptyMessage}</Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', margin: 16, marginBottom: 0, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', height: 48 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#1f2937' },
  listContent: { padding: 16 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#296959', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarImage: { width: 50, height: 50, borderRadius: 25 },
  avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#64748b' },
  chatButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 4 },
  chatButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 16, fontSize: 15, lineHeight: 22 }
});
