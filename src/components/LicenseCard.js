import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export const LicenseCard = ({ item, onPress, onEdit, onDelete }) => {
  const swipeableRef = useRef(null);

  const renderRightActions = (progress, dragX) => {
    const scaleEdit = dragX.interpolate({
      inputRange: [-160, -80, 0],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });

    const scaleDelete = dragX.interpolate({
      inputRange: [-80, -40, 0],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.actionsContainer}>
        <Animated.View style={{ transform: [{ scale: scaleEdit }] }}>
          <TouchableOpacity 
            style={[styles.swipeActionButton, { backgroundColor: '#3b82f6' }]} 
            onPress={() => {
              swipeableRef.current?.close();
              onEdit();
            }}
          >
            <Icon name="edit" size={24} color="white" />
            <Text style={styles.swipeActionText}>Editar</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: scaleDelete }] }}>
          <TouchableOpacity 
            style={[styles.swipeActionButton, { backgroundColor: '#ef4444' }]} 
            onPress={() => {
              swipeableRef.current?.close();
              onDelete();
            }}
          >
            <Icon name="delete" size={24} color="white" />
            <Text style={styles.swipeActionText}>Excluir</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      containerStyle={styles.swipeableContainer}
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.95} onPress={onPress}>
        {item.fotoUri ? (
          <Image source={{ uri: item.fotoUri }} style={styles.cardImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialCommunityIcons name="image-off-outline" size={40} color="#cbd5e1" />
            <Text style={styles.placeholderText}>Sem foto</Text>
          </View>
        )}
        
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.projeto}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {item.numeroLicenca ? `Nº ${item.numeroLicenca} • ${item.nome}` : item.nome}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.cor + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: item.cor }]} />
              <Text style={[styles.statusBadgeText, { color: item.cor }]}>{item.sigla}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={16} color="#64748b" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.tipoLicenca || 'Não definido'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="domain" size={16} color="#64748b" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.empresa || 'Empresa N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar-check-outline" size={16} color="#64748b" />
                <Text style={styles.infoText}>{item.dataEmissao || '--/--/----'}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar-clock-outline" size={16} color="#ef4444" />
                <Text style={[styles.infoText, { color: '#ef4444', fontWeight: '600' }]}>
                  Vence: {item.validade}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardImage: { 
    width: '100%', 
    height: 180, 
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  placeholderText: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  cardContent: { 
    padding: 20,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#0f172a', 
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardSubtitle: { 
    fontSize: 14, 
    color: '#64748b', 
    fontWeight: '500',
  },
  statusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: { 
    fontWeight: '700', 
    fontSize: 12,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoColumn: {
    flex: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  swipeActionButton: {
    width: 75,
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  swipeActionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
});