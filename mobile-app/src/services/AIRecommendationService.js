import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import OfflineStorageService from './OfflineStorageService';
import NotificationService from './NotificationService';

class AIRecommendationService {
  constructor() {
    this.model = null;
    this.isInitialized = false;
    this.productCategories = {
      'food': 0,
      'toys': 1,
      'health': 2,
      'accessories': 3,
      'grooming': 4,
      'training': 5
    };
    this.petBreeds = {};
    this.ageGroups = {
      'puppy': 0,
      'young': 1,
      'adult': 2,
      'senior': 3
    };
  }

  async initialize() {
    try {
      // Initialize TensorFlow.js
      await tf.ready();
      console.log('TensorFlow.js initialized');
      
      // Load or create recommendation model
      await this.loadModel();
      
      // Load breed mappings
      await this.loadBreedMappings();
      
      this.isInitialized = true;
      console.log('AIRecommendationService initialized successfully');
    } catch (error) {
      console.error('AIRecommendationService initialization failed:', error);
      throw error;
    }
  }

  async loadModel() {
    try {
      // Try to load existing model from storage
      const modelData = await OfflineStorageService.getData('ai_recommendation_model');
      
      if (modelData) {
        // Load model from stored data
        this.model = await tf.loadLayersModel(tf.io.fromMemory(modelData));
        console.log('Loaded existing recommendation model');
      } else {
        // Create new model
        await this.createModel();
        console.log('Created new recommendation model');
      }
    } catch (error) {
      console.error('Error loading model:', error);
      // Fallback to creating new model
      await this.createModel();
    }
  }

  async createModel() {
    // Create a simple neural network for recommendations
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [10], // Pet features: breed, age, size, activity, health, preferences
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: Object.keys(this.productCategories).length,
          activation: 'softmax' // Output probabilities for each product category
        })
      ]
    });

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    // Train with initial synthetic data
    await this.trainWithSyntheticData();
  }

  async trainWithSyntheticData() {
    // Generate synthetic training data for initial model training
    const trainingData = this.generateSyntheticTrainingData(1000);
    
    const xs = tf.tensor2d(trainingData.features);
    const ys = tf.tensor2d(trainingData.labels);
    
    try {
      await this.model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0
      });
      
      console.log('Model trained with synthetic data');
    } catch (error) {
      console.error('Error training model:', error);
    } finally {
      xs.dispose();
      ys.dispose();
    }
  }

  generateSyntheticTrainingData(numSamples) {
    const features = [];
    const labels = [];
    
    for (let i = 0; i < numSamples; i++) {
      // Generate random pet features
      const petFeatures = [
        Math.random(), // breed (normalized)
        Math.random(), // age group (normalized)
        Math.random(), // size (normalized)
        Math.random(), // activity level
        Math.random(), // health score
        Math.random(), // food preference
        Math.random(), // toy preference
        Math.random(), // training needs
        Math.random(), // grooming needs
        Math.random()  // special requirements
      ];
      
      // Generate corresponding product category preferences
      const categoryPrefs = new Array(Object.keys(this.productCategories).length).fill(0);
      
      // Simple rules for synthetic data
      if (petFeatures[1] < 0.3) { // Young pets
        categoryPrefs[1] = 0.8; // Toys
        categoryPrefs[5] = 0.6; // Training
      } else if (petFeatures[1] > 0.7) { // Senior pets
        categoryPrefs[2] = 0.9; // Health
        categoryPrefs[0] = 0.7; // Special food
      } else { // Adult pets
        categoryPrefs[0] = 0.6; // Food
        categoryPrefs[3] = 0.5; // Accessories
      }
      
      if (petFeatures[3] > 0.7) { // High activity
        categoryPrefs[1] = Math.max(categoryPrefs[1], 0.7); // Toys
      }
      
      if (petFeatures[4] < 0.5) { // Health issues
        categoryPrefs[2] = Math.max(categoryPrefs[2], 0.8); // Health products
      }
      
      // Normalize to sum to 1
      const sum = categoryPrefs.reduce((a, b) => a + b, 0);
      if (sum > 0) {
        for (let j = 0; j < categoryPrefs.length; j++) {
          categoryPrefs[j] /= sum;
        }
      }
      
      features.push(petFeatures);
      labels.push(categoryPrefs);
    }
    
    return { features, labels };
  }

  async loadBreedMappings() {
    // Common dog and cat breeds with normalized values
    this.petBreeds = {
      // Dogs
      'labrador': 0.1,
      'golden_retriever': 0.15,
      'german_shepherd': 0.2,
      'bulldog': 0.25,
      'poodle': 0.3,
      'beagle': 0.35,
      'rottweiler': 0.4,
      'yorkshire_terrier': 0.45,
      'dachshund': 0.5,
      'siberian_husky': 0.55,
      'chihuahua': 0.6,
      'border_collie': 0.65,
      'boxer': 0.7,
      'cocker_spaniel': 0.75,
      'australian_shepherd': 0.8,
      
      // Cats
      'persian': 0.85,
      'maine_coon': 0.87,
      'siamese': 0.89,
      'ragdoll': 0.91,
      'british_shorthair': 0.93,
      'abyssinian': 0.95,
      'russian_blue': 0.97,
      'bengal': 0.99,
      
      // Default
      'mixed': 0.5,
      'unknown': 0.5
    };
  }

  async getRecommendations(petId, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      // Get pet profile
      const petProfile = await OfflineStorageService.getPetProfile(petId);
      if (!petProfile) {
        throw new Error('Pet profile not found');
      }
      
      // Get pet activity and health data
      const activityData = await OfflineStorageService.getActivityData(petId, 30);
      const healthData = await OfflineStorageService.getHealthData(petId, 10);
      
      // Extract features from pet data
      const features = this.extractPetFeatures(petProfile, activityData, healthData);
      
      // Get model predictions
      const predictions = await this.predict(features);
      
      // Get cached products
      const products = await OfflineStorageService.getCachedProducts();
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(
        predictions,
        products,
        petProfile,
        options
      );
      
      // Store recommendations for analytics
      await this.storeRecommendations(petId, recommendations);
      
      // Send notification for high-confidence recommendations
      await this.sendRecommendationNotifications(petId, recommendations);
      
      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return this.getFallbackRecommendations(petId);
    }
  }

  extractPetFeatures(petProfile, activityData, healthData) {
    // Extract and normalize features
    const breed = this.petBreeds[petProfile.breed?.toLowerCase()] || 0.5;
    const ageGroup = this.normalizeAge(petProfile.age);
    const size = this.normalizeSize(petProfile.size);
    const activityLevel = this.calculateActivityLevel(activityData);
    const healthScore = this.calculateHealthScore(healthData);
    
    // Preferences from profile
    const foodPreference = petProfile.preferences?.food || 0.5;
    const toyPreference = petProfile.preferences?.toys || 0.5;
    const trainingNeeds = petProfile.trainingLevel || 0.5;
    const groomingNeeds = this.calculateGroomingNeeds(petProfile);
    const specialRequirements = petProfile.specialNeeds ? 1.0 : 0.0;
    
    return [
      breed,
      ageGroup,
      size,
      activityLevel,
      healthScore,
      foodPreference,
      toyPreference,
      trainingNeeds,
      groomingNeeds,
      specialRequirements
    ];
  }

  normalizeAge(age) {
    if (age < 1) return this.ageGroups.puppy / 3;
    if (age < 3) return this.ageGroups.young / 3;
    if (age < 8) return this.ageGroups.adult / 3;
    return this.ageGroups.senior / 3;
  }

  normalizeSize(size) {
    const sizeMap = {
      'small': 0.2,
      'medium': 0.5,
      'large': 0.8,
      'extra_large': 1.0
    };
    return sizeMap[size?.toLowerCase()] || 0.5;
  }

  calculateActivityLevel(activityData) {
    if (!activityData || activityData.length === 0) return 0.5;
    
    const avgSteps = activityData.reduce((sum, data) => sum + (data.steps || 0), 0) / activityData.length;
    const avgPlaytime = activityData.reduce((sum, data) => sum + (data.playtime || 0), 0) / activityData.length;
    
    // Normalize based on typical ranges
    const stepsScore = Math.min(avgSteps / 10000, 1.0);
    const playtimeScore = Math.min(avgPlaytime / 120, 1.0); // 2 hours max
    
    return (stepsScore + playtimeScore) / 2;
  }

  calculateHealthScore(healthData) {
    if (!healthData || healthData.length === 0) return 0.8; // Assume healthy
    
    const latestHealth = healthData[0];
    const weight = latestHealth.weight || 0;
    const temperature = latestHealth.temperature || 0;
    const heartRate = latestHealth.heartRate || 0;
    
    // Simple health scoring (would be more sophisticated in production)
    let score = 1.0;
    
    if (temperature > 102.5 || temperature < 99.5) score -= 0.2;
    if (heartRate > 140 || heartRate < 60) score -= 0.2;
    if (latestHealth.symptoms && latestHealth.symptoms.length > 0) score -= 0.3;
    
    return Math.max(score, 0.0);
  }

  calculateGroomingNeeds(petProfile) {
    const coatType = petProfile.coatType?.toLowerCase();
    const groomingMap = {
      'short': 0.2,
      'medium': 0.5,
      'long': 0.8,
      'curly': 0.9,
      'double': 0.7
    };
    return groomingMap[coatType] || 0.5;
  }

  async predict(features) {
    const inputTensor = tf.tensor2d([features]);
    
    try {
      const prediction = this.model.predict(inputTensor);
      const probabilities = await prediction.data();
      return Array.from(probabilities);
    } finally {
      inputTensor.dispose();
    }
  }

  generateRecommendations(predictions, products, petProfile, options) {
    if (!products) {
      return this.getFallbackRecommendations(petProfile.id);
    }
    
    const recommendations = [];
    const maxRecommendations = options.limit || 10;
    
    // Sort categories by prediction confidence
    const categoryScores = Object.keys(this.productCategories).map((category, index) => ({
      category,
      score: predictions[index],
      index
    })).sort((a, b) => b.score - a.score);
    
    // Generate recommendations for top categories
    for (const categoryScore of categoryScores) {
      if (recommendations.length >= maxRecommendations) break;
      
      const categoryProducts = products.filter(product => 
        product.category?.toLowerCase() === categoryScore.category
      );
      
      // Score products within category
      const scoredProducts = categoryProducts.map(product => ({
        ...product,
        recommendationScore: this.scoreProduct(product, petProfile, categoryScore.score)
      })).sort((a, b) => b.recommendationScore - a.recommendationScore);
      
      // Add top products from this category
      const categoryLimit = Math.ceil(maxRecommendations / categoryScores.length);
      const topProducts = scoredProducts.slice(0, categoryLimit);
      
      recommendations.push(...topProducts.map(product => ({
        productId: product.id,
        productName: product.name,
        category: categoryScore.category,
        confidence: categoryScore.score,
        score: product.recommendationScore,
        reason: this.generateRecommendationReason(product, petProfile, categoryScore.category),
        product
      })));
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations);
  }

  scoreProduct(product, petProfile, categoryScore) {
    let score = categoryScore;
    
    // Adjust score based on pet-specific factors
    if (product.ageGroup && product.ageGroup.includes(this.getAgeGroup(petProfile.age))) {
      score += 0.2;
    }
    
    if (product.size && product.size.includes(petProfile.size)) {
      score += 0.15;
    }
    
    if (product.breed && product.breed.includes(petProfile.breed)) {
      score += 0.25;
    }
    
    // Price consideration
    if (product.price && petProfile.budget) {
      if (product.price <= petProfile.budget) {
        score += 0.1;
      } else {
        score -= 0.2;
      }
    }
    
    // Rating boost
    if (product.rating) {
      score += (product.rating - 3) * 0.05; // Boost for ratings above 3
    }
    
    return Math.min(score, 1.0);
  }

  getAgeGroup(age) {
    if (age < 1) return 'puppy';
    if (age < 3) return 'young';
    if (age < 8) return 'adult';
    return 'senior';
  }

  generateRecommendationReason(product, petProfile, category) {
    const reasons = [];
    
    if (category === 'health' && petProfile.age > 7) {
      reasons.push('Great for senior pets');
    }
    
    if (category === 'toys' && petProfile.activityLevel === 'high') {
      reasons.push('Perfect for active pets');
    }
    
    if (product.rating > 4.5) {
      reasons.push('Highly rated by other pet owners');
    }
    
    if (product.breed && product.breed.includes(petProfile.breed)) {
      reasons.push(`Specifically designed for ${petProfile.breed}s`);
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Recommended based on your pet\'s profile';
  }

  async storeRecommendations(petId, recommendations) {
    const recommendationData = {
      petId,
      recommendations,
      timestamp: new Date().toISOString(),
      modelVersion: '1.0'
    };
    
    await OfflineStorageService.storeData(
      `recommendations_${petId}_${Date.now()}`,
      recommendationData
    );
  }

  async sendRecommendationNotifications(petId, recommendations) {
    // Send notification for high-confidence recommendations
    const highConfidenceRecs = recommendations.filter(rec => rec.confidence > 0.8);
    
    if (highConfidenceRecs.length > 0) {
      const topRec = highConfidenceRecs[0];
      await NotificationService.sendProductRecommendation(
        petId,
        topRec.productId,
        topRec.productName
      );
    }
  }

  getFallbackRecommendations(petId) {
    // Fallback recommendations when AI model fails
    return [
      {
        productId: 'fallback_1',
        productName: 'Premium Pet Food',
        category: 'food',
        confidence: 0.7,
        score: 0.7,
        reason: 'Essential nutrition for your pet'
      },
      {
        productId: 'fallback_2',
        productName: 'Interactive Toy',
        category: 'toys',
        confidence: 0.6,
        score: 0.6,
        reason: 'Great for mental stimulation'
      }
    ];
  }

  async updateModelWithFeedback(petId, productId, feedback) {
    // Store feedback for future model training
    const feedbackData = {
      petId,
      productId,
      feedback, // 'liked', 'disliked', 'purchased', 'ignored'
      timestamp: new Date().toISOString()
    };
    
    await OfflineStorageService.storeData(
      `feedback_${petId}_${Date.now()}`,
      feedbackData,
      { needsSync: true }
    );
  }

  async getRecommendationHistory(petId, limit = 50) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const recommendationKeys = keys
        .filter(key => key.startsWith(`recommendations_${petId}_`))
        .sort((a, b) => {
          const timestampA = parseInt(a.split('_').pop());
          const timestampB = parseInt(b.split('_').pop());
          return timestampB - timestampA;
        })
        .slice(0, limit);
      
      const history = [];
      for (const key of recommendationKeys) {
        const data = await OfflineStorageService.getData(key);
        if (data) {
          history.push(data);
        }
      }
      
      return history;
    } catch (error) {
      console.error('Error getting recommendation history:', error);
      return [];
    }
  }
}

export default new AIRecommendationService();