import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const BottomTabBar = ({ activeTab, onTabChange, onAddPress, onLogout, insets }) => (
  <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom }]}>
    <TouchableOpacity
      style={[styles.tabItem, activeTab === 'home' && styles.tabItemActive]}
      onPress={() => onTabChange('home')}
    >
      <Icon name="home" size={26} color={activeTab === 'home' ? '#059669' : '#9ca3af'} />
      <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>Início</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.tabItem, activeTab === 'chat' && styles.tabItemActive]}
      onPress={() => onTabChange('chat')}
    >
      <Icon name="chat" size={26} color={activeTab === 'chat' ? '#059669' : '#9ca3af'} />
      <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>Mensagens</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={onAddPress} testID="addButton" accessibilityLabel="Adicionar">
      <View style={styles.addButton}>
        <Icon name="add" size={28} color="white" />
      </View>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.tabItem, activeTab === 'stats' && styles.tabItemActive]}
      onPress={() => onTabChange('stats')}
    >
      <Icon name="bar-chart" size={26} color={activeTab === 'stats' ? '#059669' : '#9ca3af'} />
      <Text style={[styles.tabLabel, activeTab === 'stats' && styles.tabLabelActive]}>Gráficos</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.tabItem}
      onPress={onLogout}
    >
      <Icon name="logout" size={26} color="#9ca3af" />
      <Text style={[styles.tabLabel, { color: '#9ca3af' }]}>Sair</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4, fontWeight: '500' },
  tabLabelActive: { color: '#059669', fontWeight: '700' },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
