import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  Alert,
  Dimensions,
  FlatList
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import OfflineStorageService from '../services/OfflineStorageService';
import AIRecommendationService from '../services/AIRecommendationService';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

const ProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [petProfiles, setPetProfiles] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);

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
      
      // Load pet profiles for recommendations
      const profiles = await OfflineStorageService.getAllPetProfiles();
      setPetProfiles(profiles);
      
      if (profiles.length > 0) {
        setSelectedPet(profiles[0]);
      }
      
      // Load products from cache or API
      await loadProducts();
      
      // Load recommendations if we have pets
      if (profiles.length > 0) {
        await loadRecommendations(profiles[0].id);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      // Try to load cached products first
      let cachedProducts = await OfflineStorageService.getCachedProducts();
      
      if (cachedProducts) {
        setProducts(cachedProducts);
        setFilteredProducts(cachedProducts);
        extractCategories(cachedProducts);
      }
      
      // If online, try to fetch fresh data
      if (isOnline) {
        try {
          // In a real app, this would be an API call
          const freshProducts = await fetchProductsFromAPI();
          
          if (freshProducts && freshProducts.length > 0) {
            setProducts(freshProducts);
            setFilteredProducts(freshProducts);
            extractCategories(freshProducts);
            
            // Cache the fresh data
            await OfflineStorageService.cacheProducts(freshProducts);
          }
        } catch (apiError) {
          console.log('API fetch failed, using cached data:', apiError);
          // Continue with cached data if API fails
        }
      }
      
      // If no cached data and offline, show fallback
      if (!cachedProducts && !isOnline) {
        const fallbackProducts = getFallbackProducts();
        setProducts(fallbackProducts);
        setFilteredProducts(fallbackProducts);
        extractCategories(fallbackProducts);
      }
      
    } catch (error) {
      console.error('Error loading products:', error);
      // Show fallback products
      const fallbackProducts = getFallbackProducts();
      setProducts(fallbackProducts);
      setFilteredProducts(fallbackProducts);
      extractCategories(fallbackProducts);
    }
  };

  const fetchProductsFromAPI = async () => {
    // Simulate API call - in real app, this would fetch from your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'Premium Dog Food',
            category: 'food',
            price: 49.99,
            rating: 4.8,
            image: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=Dog+Food',
            description: 'High-quality nutrition for adult dogs',
            ageGroup: ['adult', 'senior'],
            size: ['medium', 'large'],
            breed: ['labrador', 'golden_retriever']
          },
          {
            id: '2',
            name: 'Interactive Puzzle Toy',
            category: 'toys',
            price: 24.99,
            rating: 4.6,
            image: 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=Puzzle+Toy',
            description: 'Mental stimulation for intelligent dogs',
            ageGroup: ['young', 'adult'],
            size: ['small', 'medium', 'large'],
            breed: ['border_collie', 'poodle']
          },
          {
            id: '3',
            name: 'GPS Pet Tracker',
            category: 'accessories',
            price: 89.99,
            rating: 4.9,
            image: 'https://via.placeholder.com/200x200/45B7D1/FFFFFF?text=GPS+Tracker',
            description: 'Real-time location tracking for your pet',
            ageGroup: ['young', 'adult', 'senior'],
            size: ['small', 'medium', 'large'],
            breed: []
          },
          {
            id: '4',
            name: 'Joint Health Supplement',
            category: 'health',
            price: 34.99,
            rating: 4.7,
            image: 'https://via.placeholder.com/200x200/96CEB4/FFFFFF?text=Supplement',
            description: 'Support joint health and mobility',
            ageGroup: ['senior'],
            size: ['medium', 'large'],
            breed: ['german_shepherd', 'rottweiler']
          },
          {
            id: '5',
            name: 'Professional Grooming Kit',
            category: 'grooming',
            price: 59.99,
            rating: 4.5,
            image: 'https://via.placeholder.com/200x200/FECA57/FFFFFF?text=Grooming+Kit',
            description: 'Complete grooming solution for all coat types',
            ageGroup: ['young', 'adult', 'senior'],
            size: ['small', 'medium', 'large'],
            breed: ['poodle', 'yorkshire_terrier']
          },
          {
            id: '6',
            name: 'Training Clicker Set',
            category: 'training',
            price: 12.99,
            rating: 4.4,
            image: 'https://via.placeholder.com/200x200/A8E6CF/FFFFFF?text=Clicker+Set',
            description: 'Effective training tool for positive reinforcement',
            ageGroup: ['puppy', 'young'],
            size: ['small', 'medium', 'large'],
            breed: []
          }
        ]);
      }, 1000);
    });
  };

  const getFallbackProducts = () => [
    {
      id: 'fallback_1',
      name: 'Premium Pet Food',
      category: 'food',
      price: 45.99,
      rating: 4.5,
      image: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=Pet+Food',
      description: 'Nutritious food for your pet',
      ageGroup: ['adult'],
      size: ['medium'],
      breed: []
    },
    {
      id: 'fallback_2',
      name: 'Interactive Toy',
      category: 'toys',
      price: 19.99,
      rating: 4.3,
      image: 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=Toy',
      description: 'Fun toy for active pets',
      ageGroup: ['young', 'adult'],
      size: ['small', 'medium'],
      breed: []
    }
  ];

  const extractCategories = (productList) => {
    const uniqueCategories = [...new Set(productList.map(p => p.category))];
    setCategories(['all', ...uniqueCategories]);
  };

  const loadRecommendations = async (petId) => {
    try {
      const recs = await AIRecommendationService.getRecommendations(petId, { limit: 10 });
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterProducts(query, selectedCategory);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    filterProducts(searchQuery, category);
  };

  const filterProducts = (query, category) => {
    let filtered = products;
    
    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }
    
    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { 
      productId: product.id,
      product: product
    });
  };

  const handlePetChange = async (pet) => {
    setSelectedPet(pet);
    if (pet) {
      await loadRecommendations(pet.id);
    }
  };

  const getRecommendationScore = (productId) => {
    const rec = recommendations.find(r => r.productId === productId);
    return rec ? rec.confidence : 0;
  };

  const isRecommended = (productId) => {
    return recommendations.some(r => r.productId === productId);
  };

  const renderNetworkStatus = () => {
    if (isOnline) return null;
    
    return (
      <View style={styles.offlineBar}>
        <Icon name="wifi-off" size={16} color="white" />
        <Text style={styles.offlineText}>Offline Mode - Showing Cached Products</Text>
      </View>
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => handleSearch('')}>
          <Icon name="clear" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPetSelector = () => {
    if (petProfiles.length === 0) return null;
    
    return (
      <View style={styles.petSelectorContainer}>
        <Text style={styles.petSelectorLabel}>Recommendations for:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {petProfiles.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={[
                styles.petSelectorButton,
                selectedPet?.id === pet.id && styles.petSelectorButtonActive
              ]}
              onPress={() => handlePetChange(pet)}
            >
              <Text style={[
                styles.petSelectorText,
                selectedPet?.id === pet.id && styles.petSelectorTextActive
              ]}>
                {pet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProductItem = ({ item }) => {
    const recommended = isRecommended(item.id);
    const score = getRecommendationScore(item.id);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
      >
        {recommended && (
          <View style={styles.recommendedBadge}>
            <Icon name="star" size={12} color="white" />
            <Text style={styles.recommendedText}>AI Pick</Text>
          </View>
        )}
        
        <Image source={{ uri: item.image }} style={styles.productImage} />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>${item.price}</Text>
            
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          
          {recommended && (
            <View style={styles.matchContainer}>
              <View style={styles.matchBar}>
                <View 
                  style={[
                    styles.matchFill, 
                    { width: `${score * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.matchText}>
                {Math.round(score * 100)}% match
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="search-off" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'No products found' : 'No products available'}
      </Text>
      {searchQuery && (
        <TouchableOpacity
          style={styles.clearSearchButton}
          onPress={() => handleSearch('')}
        >
          <Text style={styles.clearSearchText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="shopping-cart" size={48} color="#007AFF" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderNetworkStatus()}
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {renderSearchBar()}
      {renderPetSelector()}
      {renderCategoryFilter()}
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  petSelectorContainer: {
    marginBottom: 16,
  },
  petSelectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 20,
    marginBottom: 8,
  },
  petSelectorButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  petSelectorButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  petSelectorText: {
    fontSize: 14,
    color: '#666',
  },
  petSelectorTextActive: {
    color: 'white',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  productList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 8,
    width: ITEM_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  recommendedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  matchContainer: {
    marginTop: 8,
  },
  matchBar: {
    height: 3,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 4,
  },
  matchFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  matchText: {
    fontSize: 10,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  clearSearchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearSearchText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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

export default ProductsScreen;