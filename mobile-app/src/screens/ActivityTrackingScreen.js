import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Switch
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import OfflineStorageService from '../services/OfflineStorageService';
import NotificationService from '../services/NotificationService';
import AIRecommendationService from '../services/AIRecommendationService';

const { width } = Dimensions.get('window');

const ActivityTrackingScreen = ({ navigation }) => {
  const [petProfiles, setPetProfiles] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [todayActivity, setTodayActivity] = useState({
    steps: 0,
    distance: 0,
    calories: 0,
    activeMinutes: 0,
    sleepHours: 0
  });
  const [weeklyGoals, setWeeklyGoals] = useState({
    steps: 10000,
    activeMinutes: 60,
    sleepHours: 12
  });
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [autoTracking, setAutoTracking] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pet profiles
      const profiles = await OfflineStorageService.getAllPetProfiles();
      setPetProfiles(profiles);
      
      if (profiles.length > 0) {
        const firstPet = profiles[0];
        setSelectedPet(firstPet);
        await loadActivityData(firstPet.id);
        await loadRecommendations(firstPet.id);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityData = async (petId) => {
    try {
      const data = await OfflineStorageService.getActivityData(petId, 30);
      setActivityData(data);
      
      // Calculate today's activity
      const today = new Date().toDateString();
      const todayData = data.find(entry => 
        new Date(entry.timestamp).toDateString() === today
      );
      
      if (todayData) {
        setTodayActivity(todayData);
      } else {
        // Generate simulated activity data for demo
        const simulatedActivity = generateSimulatedActivity();
        setTodayActivity(simulatedActivity);
        
        // Store simulated data
        await OfflineStorageService.storeActivityData(petId, {
          ...simulatedActivity,
          petId,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('Error loading activity data:', error);
    }
  };

  const loadRecommendations = async (petId) => {
    try {
      const recs = await AIRecommendationService.getRecommendations(petId, 'activity');
      setRecommendations(recs.slice(0, 3)); // Show top 3 recommendations
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const generateSimulatedActivity = () => {
    const baseSteps = 5000 + Math.random() * 8000;
    const baseDistance = baseSteps * 0.0005; // Rough conversion
    const baseCalories = baseSteps * 0.04;
    const baseActiveMinutes = 30 + Math.random() * 60;
    const baseSleepHours = 10 + Math.random() * 4;
    
    return {
      steps: Math.round(baseSteps),
      distance: Math.round(baseDistance * 10) / 10,
      calories: Math.round(baseCalories),
      activeMinutes: Math.round(baseActiveMinutes),
      sleepHours: Math.round(baseSleepHours * 10) / 10
    };
  };

  const handlePetChange = async (pet) => {
    setSelectedPet(pet);
    await loadActivityData(pet.id);
    await loadRecommendations(pet.id);
  };

  const getGoalProgress = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getActivityLevel = () => {
    const stepsProgress = getGoalProgress(todayActivity.steps, weeklyGoals.steps);
    const activeProgress = getGoalProgress(todayActivity.activeMinutes, weeklyGoals.activeMinutes);
    
    const averageProgress = (stepsProgress + activeProgress) / 2;
    
    if (averageProgress >= 80) return { level: 'High', color: '#4ECDC4' };
    if (averageProgress >= 50) return { level: 'Moderate', color: '#FECA57' };
    return { level: 'Low', color: '#FF6B6B' };
  };

  const getChartData = (metric, timeframe) => {
    let filteredData = [];
    const now = new Date();
    
    if (timeframe === 'week') {
      // Get last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const dayData = activityData.find(entry => 
          new Date(entry.timestamp).toDateString() === dateStr
        );
        
        filteredData.push({
          label: date.toLocaleDateString('en', { weekday: 'short' }),
          value: dayData ? dayData[metric] : Math.random() * 1000 + 500
        });
      }
    } else if (timeframe === 'month') {
      // Get last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7));
        
        const weekData = activityData.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return entryDate >= weekStart && entryDate <= weekEnd;
        });
        
        const weekAverage = weekData.length > 0 
          ? weekData.reduce((sum, entry) => sum + (entry[metric] || 0), 0) / weekData.length
          : Math.random() * 1000 + 500;
        
        filteredData.push({
          label: `W${4-i}`,
          value: weekAverage
        });
      }
    }
    
    return {
      labels: filteredData.map(item => item.label),
      datasets: [{
        data: filteredData.map(item => item.value),
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`
      }]
    };
  };

  const getActivityDistribution = () => {
    const total = todayActivity.activeMinutes;
    const walking = total * 0.4;
    const playing = total * 0.3;
    const running = total * 0.2;
    const other = total * 0.1;
    
    return [
      {
        name: 'Walking',
        minutes: Math.round(walking),
        color: '#4ECDC4',
        legendFontColor: '#333',
        legendFontSize: 12
      },
      {
        name: 'Playing',
        minutes: Math.round(playing),
        color: '#96CEB4',
        legendFontColor: '#333',
        legendFontSize: 12
      },
      {
        name: 'Running',
        minutes: Math.round(running),
        color: '#FECA57',
        legendFontColor: '#333',
        legendFontSize: 12
      },
      {
        name: 'Other',
        minutes: Math.round(other),
        color: '#FF6B6B',
        legendFontColor: '#333',
        legendFontSize: 12
      }
    ];
  };

  const renderPetSelector = () => {
    if (petProfiles.length === 0) return null;
    
    return (
      <View style={styles.petSelectorContainer}>
        <Text style={styles.sectionTitle}>Select Pet</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {petProfiles.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={[
                styles.petButton,
                selectedPet?.id === pet.id && styles.petButtonActive
              ]}
              onPress={() => handlePetChange(pet)}
            >
              <Text style={[
                styles.petButtonText,
                selectedPet?.id === pet.id && styles.petButtonTextActive
              ]}>
                {pet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderActivityOverview = () => {
    if (!selectedPet) return null;
    
    const activityLevel = getActivityLevel();
    
    return (
      <View style={styles.overviewContainer}>
        <View style={styles.overviewHeader}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <View style={styles.activityLevelContainer}>
            <View style={[styles.activityLevelDot, { backgroundColor: activityLevel.color }]} />
            <Text style={styles.activityLevelText}>{activityLevel.level}</Text>
          </View>
        </View>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Icon name="directions-walk" size={24} color="#4ECDC4" />
            <Text style={styles.metricValue}>{todayActivity.steps.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Steps</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getGoalProgress(todayActivity.steps, weeklyGoals.steps)}%`,
                    backgroundColor: '#4ECDC4'
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.metricCard}>
            <Icon name="schedule" size={24} color="#96CEB4" />
            <Text style={styles.metricValue}>{todayActivity.activeMinutes}</Text>
            <Text style={styles.metricLabel}>Active Min</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getGoalProgress(todayActivity.activeMinutes, weeklyGoals.activeMinutes)}%`,
                    backgroundColor: '#96CEB4'
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.metricCard}>
            <Icon name="local-fire-department" size={24} color="#FECA57" />
            <Text style={styles.metricValue}>{todayActivity.calories}</Text>
            <Text style={styles.metricLabel}>Calories</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Icon name="hotel" size={24} color="#A8E6CF" />
            <Text style={styles.metricValue}>{todayActivity.sleepHours}h</Text>
            <Text style={styles.metricLabel}>Sleep</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getGoalProgress(todayActivity.sleepHours, weeklyGoals.sleepHours)}%`,
                    backgroundColor: '#A8E6CF'
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderActivityChart = () => {
    if (!selectedPet) return null;
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>Activity Trends</Text>
          <View style={styles.timeframeSelector}>
            {['week', 'month'].map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.timeframeButton,
                  selectedTimeframe === timeframe && styles.timeframeButtonActive
                ]}
                onPress={() => setSelectedTimeframe(timeframe)}
              >
                <Text style={[
                  styles.timeframeButtonText,
                  selectedTimeframe === timeframe && styles.timeframeButtonTextActive
                ]}>
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <LineChart
          data={getChartData('steps', selectedTimeframe)}
          width={width - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#4ECDC4'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderActivityDistribution = () => {
    if (!selectedPet || todayActivity.activeMinutes === 0) return null;
    
    const distributionData = getActivityDistribution();
    
    return (
      <View style={styles.distributionContainer}>
        <Text style={styles.sectionTitle}>Activity Breakdown</Text>
        <PieChart
          data={distributionData}
          width={width - 40}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="minutes"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  const renderRecommendations = () => {
    if (recommendations.length === 0) return null;
    
    return (
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        {recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Icon name="lightbulb" size={20} color="#FECA57" />
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
            </View>
            <Text style={styles.recommendationDescription}>{rec.description}</Text>
            {rec.action && (
              <TouchableOpacity style={styles.recommendationAction}>
                <Text style={styles.recommendationActionText}>{rec.action}</Text>
                <Icon name="arrow-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderSettings = () => {
    return (
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto Activity Tracking</Text>
            <Text style={styles.settingDescription}>Automatically track your pet's activity</Text>
          </View>
          <Switch
            value={autoTracking}
            onValueChange={setAutoTracking}
            trackColor={{ false: '#ccc', true: '#4ECDC4' }}
            thumbColor={autoTracking ? '#fff' : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => setShowGoalsModal(true)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Activity Goals</Text>
            <Text style={styles.settingDescription}>Set daily activity targets</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderGoalsModal = () => {
    return (
      <Modal
        visible={showGoalsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGoalsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGoalsModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Activity Goals</Text>
            <TouchableOpacity onPress={() => setShowGoalsModal(false)}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.goalCard}>
              <Text style={styles.goalLabel}>Daily Steps Goal</Text>
              <Text style={styles.goalValue}>{weeklyGoals.steps.toLocaleString()}</Text>
              <Text style={styles.goalDescription}>Recommended: 8,000-12,000 steps</Text>
            </View>
            
            <View style={styles.goalCard}>
              <Text style={styles.goalLabel}>Active Minutes Goal</Text>
              <Text style={styles.goalValue}>{weeklyGoals.activeMinutes} minutes</Text>
              <Text style={styles.goalDescription}>Recommended: 60-90 minutes</Text>
            </View>
            
            <View style={styles.goalCard}>
              <Text style={styles.goalLabel}>Sleep Hours Goal</Text>
              <Text style={styles.goalValue}>{weeklyGoals.sleepHours} hours</Text>
              <Text style={styles.goalDescription}>Recommended: 12-14 hours</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="directions-run" size={48} color="#007AFF" />
        <Text style={styles.loadingText}>Loading activity data...</Text>
      </View>
    );
  }

  if (petProfiles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="pets" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No pets found</Text>
        <Text style={styles.emptySubtext}>Add a pet profile to start tracking activity</Text>
        <TouchableOpacity
          style={styles.addPetButton}
          onPress={() => navigation.navigate('AddPet')}
        >
          <Text style={styles.addPetButtonText}>Add Pet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Tracking</Text>
        <TouchableOpacity onPress={() => setShowGoalsModal(true)}>
          <Icon name="settings" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {renderPetSelector()}
        {renderActivityOverview()}
        {renderActivityChart()}
        {renderActivityDistribution()}
        {renderRecommendations()}
        {renderSettings()}
      </ScrollView>
      
      {renderGoalsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  petSelectorContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  petButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  petButtonActive: {
    backgroundColor: '#007AFF',
  },
  petButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  petButtonTextActive: {
    color: 'white',
  },
  overviewContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityLevelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activityLevelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e1e1e1',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeframeSelector: {
    flexDirection: 'row',
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
    backgroundColor: '#f0f0f0',
  },
  timeframeButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  timeframeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeframeButtonTextActive: {
    color: 'white',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  distributionContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  recommendationsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  recommendationDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  recommendationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendationActionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  settingsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  goalCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  goalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 12,
    color: '#666',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  addPetButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  addPetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ActivityTrackingScreen;