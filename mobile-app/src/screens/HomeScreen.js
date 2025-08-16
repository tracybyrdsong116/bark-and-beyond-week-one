import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import OfflineStorageService from '../services/OfflineStorageService';
import AIRecommendationService from '../services/AIRecommendationService';
import NotificationService from '../services/NotificationService';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [petProfiles, setPetProfiles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
      setupNetworkListener();
      
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const setupNetworkListener = () => {
    const unsubscribe = OfflineStorageService.addNetworkListener((networkInfo) => {
      setIsOnline(networkInfo.isOnline);
    });
    
    return unsubscribe;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pet profiles
      const profiles = await OfflineStorageService.getAllPetProfiles();
      setPetProfiles(profiles);
      
      // Load recommendations for the first pet (or all pets)
      if (profiles.length > 0) {
        await loadRecommendations(profiles[0].id);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async (petId) => {
    try {
      const recs = await AIRecommendationService.getRecommendations(petId, { limit: 5 });
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePetSelect = (pet) => {
    navigation.navigate('PetProfile', { petId: pet.id });
  };

  const handleRecommendationPress = (recommendation) => {
    navigation.navigate('ProductDetail', { 
      productId: recommendation.productId,
      fromRecommendation: true
    });
  };

  const handleAddPet = () => {
    navigation.navigate('AddPet');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'health':
        navigation.navigate('HealthTracking');
        break;
      case 'activity':
        navigation.navigate('ActivityTracking');
        break;
      case 'feeding':
        navigation.navigate('FeedingSchedule');
        break;
      case 'shop':
        navigation.navigate('Products');
        break;
      default:
        break;
    }
  };

  const renderNetworkStatus = () => {
    if (isOnline) return null;
    
    return (
      <View style={styles.offlineBar}>
        <Icon name="wifi-off" size={16} color="white" />
        <Text style={styles.offlineText}>Offline Mode</Text>
      </View>
    );
  };

  const renderPetProfiles = () => {
    if (petProfiles.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="pets" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No pets added yet</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
            <Text style={styles.addButtonText}>Add Your First Pet</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Pets</Text>
          <TouchableOpacity onPress={handleAddPet}>
            <Icon name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.petScrollView}
        >
          {petProfiles.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={styles.petCard}
              onPress={() => handlePetSelect(pet)}
            >
              <Image
                source={{ uri: pet.photo || 'https://via.placeholder.com/80' }}
                style={styles.petImage}
              />
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>{pet.breed}</Text>
              <View style={styles.petStats}>
                <View style={styles.statItem}>
                  <Icon name="favorite" size={12} color="#FF6B6B" />
                  <Text style={styles.statText}>{pet.healthScore || 85}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="directions-run" size={12} color="#4ECDC4" />
                  <Text style={styles.statText}>{pet.activityLevel || 'Medium'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      { id: 'health', icon: 'favorite', label: 'Health', color: '#FF6B6B' },
      { id: 'activity', icon: 'directions-run', label: 'Activity', color: '#4ECDC4' },
      { id: 'feeding', icon: 'restaurant', label: 'Feeding', color: '#45B7D1' },
      { id: 'shop', icon: 'shopping-cart', label: 'Shop', color: '#96CEB4' }
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={() => handleQuickAction(action.id)}
            >
              <Icon name={action.icon} size={24} color="white" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderRecommendations = () => {
    if (recommendations.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Recommendations')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.recommendationScrollView}
        >
          {recommendations.map((rec, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recommendationCard}
              onPress={() => handleRecommendationPress(rec)}
            >
              <Image
                source={{ uri: rec.product?.image || 'https://via.placeholder.com/120' }}
                style={styles.recommendationImage}
              />
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationName} numberOfLines={2}>
                  {rec.productName}
                </Text>
                <Text style={styles.recommendationReason} numberOfLines={2}>
                  {rec.reason}
                </Text>
                <View style={styles.recommendationFooter}>
                  <View style={styles.confidenceBar}>
                    <View 
                      style={[
                        styles.confidenceFill, 
                        { width: `${rec.confidence * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.confidenceText}>
                    {Math.round(rec.confidence * 100)}% match
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderHealthAlerts = () => {
    // This would show any health alerts or reminders
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health & Reminders</Text>
        <View style={styles.alertCard}>
          <Icon name="schedule" size={20} color="#FF9500" />
          <Text style={styles.alertText}>Feeding time in 2 hours</Text>
        </View>
        <View style={styles.alertCard}>
          <Icon name="local-hospital" size={20} color="#007AFF" />
          <Text style={styles.alertText}>Vet checkup due next week</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="pets" size={48} color="#007AFF" />
        <Text style={styles.loadingText}>Loading your pets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderNetworkStatus()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subtitle}>How are your pets doing today?</Text>
        </View>

        {renderPetProfiles()}
        {renderQuickActions()}
        {renderRecommendations()}
        {renderHealthAlerts()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  offlineBar: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  offlineText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  petScrollView: {
    paddingLeft: 20,
  },
  petCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  petBreed: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  petStats: {
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 60) / 4,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  recommendationScrollView: {
    paddingLeft: 20,
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recommendationContent: {
    padding: 12,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recommendationReason: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  recommendationFooter: {
    marginTop: 8,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 10,
    color: '#666',
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default HomeScreen;