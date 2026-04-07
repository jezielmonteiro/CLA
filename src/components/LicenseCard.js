import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const LicenseCard = ({ item, onPress, onEdit, onDelete }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
    {item.fotoUri && <Image source={{ uri: item.fotoUri }} style={styles.cardImage} />}
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.projeto}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.cor }]}>
          <Text style={styles.statusBadgeText}>{item.sigla}</Text>
        </View>
      </View>
      <Text style={styles.cardSubtitle} numberOfLines={1}>{item.nome}</Text>
      <View style={styles.cardDateContainer}>
        <Icon name="event" size={14} color="#9ca3af" />
        <Text style={styles.cardDate}> Validade: {item.validade}</Text>
      </View>
      <Text style={[styles.cardStatus, { color: item.cor }]}>{item.status}</Text>
    </View>
    <View style={styles.cardActions}>
      <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
        <Icon name="edit" size={20} color="#3b82f6" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
        <Icon name="delete" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: { width: '100%', height: 160, borderRadius: 16, marginBottom: 12 },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1, marginRight: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 11 },
  cardSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  cardDateContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardDate: { fontSize: 13, color: '#9ca3af', marginLeft: 4 },
  cardStatus: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  actionButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
});