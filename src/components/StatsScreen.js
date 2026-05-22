import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { converterDataParaDate } from '../utils/dateUtils';

export const StatsScreen = ({ licencas, insets }) => {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  
  const validas = licencas.filter(l => {
    const data = converterDataParaDate(l.validade);
    if (!data) return false;
    data.setHours(0, 0, 0, 0);
    return Math.ceil((data - hoje) / (1000 * 60 * 60 * 24)) > 30;
  }).length;
  
  const vencendo = licencas.filter(l => {
    const data = converterDataParaDate(l.validade);
    if (!data) return false;
    data.setHours(0, 0, 0, 0);
    const diff = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  }).length;
  
  const vencidas = licencas.filter(l => {
    const data = converterDataParaDate(l.validade);
    if (!data) return false;
    data.setHours(0, 0, 0, 0);
    return Math.ceil((data - hoje) / (1000 * 60 * 60 * 24)) < 0;
  }).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80 }}>
      <Text style={styles.title}>Estatísticas</Text>
      
      <View style={styles.totalCard}>
        <MaterialCommunityIcons name="file-document" size={50} color="#296959" />
        <Text style={styles.totalNumber}>{licencas.length}</Text>
        <Text style={styles.totalLabel}>Total de Licenças</Text>
      </View>
      
      <View style={styles.grid}>
        <View style={[styles.statBox, { backgroundColor: '#10b98115' }]}>
          <MaterialCommunityIcons name="check-circle" size={40} color="#296959" />
          <Text style={[styles.statNumber, { color: '#296959' }]}>{validas}</Text>
          <Text style={styles.statLabel}>Válidas</Text>
          <Text style={styles.statSubLabel}>(+30 dias)</Text>
        </View>
        
        <View style={[styles.statBox, { backgroundColor: '#f59e0b15' }]}>
          <MaterialCommunityIcons name="clock-alert" size={40} color="#f59e0b" />
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{vencendo}</Text>
          <Text style={styles.statLabel}>Vencem breve</Text>
          <Text style={styles.statSubLabel}>(até 30 dias)</Text>
        </View>
        
        <View style={[styles.statBox, { backgroundColor: '#ef444415' }]}>
          <MaterialCommunityIcons name="alert-circle" size={40} color="#ef4444" />
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>{vencidas}</Text>
          <Text style={styles.statLabel}>Vencidas</Text>
          <Text style={styles.statSubLabel}>(data passada)</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 24 },
  totalCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  totalNumber: { fontSize: 56, fontWeight: 'bold', color: '#296959', marginVertical: 12 },
  totalLabel: { fontSize: 18, color: '#6b7280' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  statBox: { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
  statLabel: { fontSize: 12, color: '#4b5563', textAlign: 'center', fontWeight: '600' },
  statSubLabel: { fontSize: 10, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
});