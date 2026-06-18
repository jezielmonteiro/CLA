import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const InboxScreen = ({ onBack, onSelectChat, onGoToContacts }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsList = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (!data.lastMessage) continue;

        const otherUserId = data.participants.find(id => id !== currentUser.uid);
        let otherUserName = data.participantNames?.[otherUserId];
        
        if (!otherUserName) {
          const userSnap = await getDoc(doc(db, 'users', otherUserId));
          if (userSnap.exists()) {
            otherUserName = userSnap.data().nome || userSnap.data().email || 'Usuário';
          } else {
            otherUserName = 'Usuário Desconhecido';
          }
        }
        
        chatsList.push({
          id: docSnap.id,
          otherUserId,
          otherUserName,
          lastMessage: data.lastMessage || 'Nenhuma mensagem',
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      }
      
      chatsList.sort((a, b) => b.updatedAt - a.updatedAt);
      
      setChats(chatsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatCard} 
      onPress={() => onSelectChat({ id: item.otherUserId, nome: item.otherUserName })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.otherUserName.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.otherUserName}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.timeText}>{formatTime(item.updatedAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#296959" />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={60} color="#cbd5e1" />
              <Text style={styles.emptyText}>Você ainda não possui conversas ativas.</Text>
              <TouchableOpacity style={styles.contactsButton} onPress={onGoToContacts}>
                <Ionicons name="people" size={20} color="white" />
                <Text style={styles.contactsButtonText}>Ver Contatos</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  chatCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#296959', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  lastMessage: { fontSize: 14, color: '#64748b' },
  timeText: { fontSize: 12, color: '#9ca3af', marginLeft: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 16, fontSize: 16, marginBottom: 24 },
  contactsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, gap: 8 },
  contactsButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
