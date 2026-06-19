import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { StatusBar } from 'expo-status-bar';
import { auth, db } from '../config/firebase';

export const ChatScreen = ({ onBack, targetUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;
  
  // chatId compound
  const chatId = currentUser.uid > targetUser.id 
    ? `${currentUser.uid}_${targetUser.id}` 
    : `${targetUser.id}_${currentUser.uid}`;

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach(doc => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const msgText = text.trim();
    setText('');
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: msgText,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'chats', chatId), {
        participants: [currentUser.uid, targetUser.id],
        lastMessage: msgText,
        updatedAt: serverTimestamp(),
        participantNames: {
          [targetUser.id]: targetUser.nome || targetUser.email || 'Usuário',
        }
      }, { merge: true });
    } catch (e) {
      console.log('Error sending message', e);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser.uid;
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
        <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="white" />
      <View style={styles.header}>
        <TouchableOpacity testID="chatBackButton" onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{targetUser.nome || targetUser.email}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contentContainer}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          {loading ? (
            <View style={styles.center}><ActivityIndicator size="large" color="#296959" /></View>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              inverted
              contentContainerStyle={styles.messagesList}
            />
          )}
          <View style={styles.inputContainer}>
            <TextInput
              testID="chatMessageInput"
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Digite uma mensagem..."
              placeholderTextColor="#9ca3af"
              autoCapitalize="sentences"
              autoCorrect={true}
              multiline={false}
            />
            <TouchableOpacity testID="chatSendButton" style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  contentContainer: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  messageMe: { alignSelf: 'flex-end', backgroundColor: '#296959', borderBottomRightRadius: 4 },
  messageThem: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16 },
  messageTextMe: { color: 'white' },
  messageTextThem: { color: '#1f2937' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e2e8f0', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f1f5f9', height: 48, borderRadius: 24, paddingHorizontal: 16, fontSize: 16, marginRight: 12 },
  sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#296959', justifyContent: 'center', alignItems: 'center' }
});
