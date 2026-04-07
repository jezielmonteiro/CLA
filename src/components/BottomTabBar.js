import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const BottomTabBar = ({ activeTab, onTabChange, onAddPress, insets }) => (
  <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom }]}>
    <TouchableOpacity style={[styles.tabItem, activeTab === 'home' && styles.tabItemActive]} onPress={() => onTabChange('home')}>
      <Icon name="home" size={28} color={activeTab === 'home' ? '#10b981' : '#9ca3af'} />
      <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>Início</Text>
    </TouchableOpacity>
    
    <TouchableOpacity style={styles.tabItemCenter} onPress={onAddPress}>
      <View style={styles.addButton}>
        <Icon name="add" size={32} color="white" />
      </View>
      <Text style={styles.addButtonLabel}>Adicionar</Text>
    </TouchableOpacity>
    
    <TouchableOpacity style={[styles.tabItem, activeTab === 'stats' && styles.tabItemActive]} onPress={() => onTabChange('stats')}>
      <Icon name="bar-chart" size={28} color={activeTab === 'stats' ? '#10b981' : '#9ca3af'} />
      <Text style={[styles.tabLabel, activeTab === 'stats' && styles.tabLabelActive]}>Estatísticas</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
    alignItems: 'flex-end',
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  tabLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4, fontWeight: '500' },
  tabLabelActive: { color: '#10b981', fontWeight: '600' },
  tabItemCenter: { alignItems: 'center', justifyContent: 'center', marginTop: -20 },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#296959',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#296959',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonLabel: { fontSize: 11, color: '#296959', marginTop: 4, fontWeight: '600' },
});