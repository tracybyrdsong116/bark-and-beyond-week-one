import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit';
import OfflineStorageService from '../services/OfflineStorageService';
import NotificationService from '../services/NotificationService';

const { width } = Dimensions.get('window');

const HealthTrackingScreen = ({ navigation }) => {
  const [petProfiles, setPetProfiles] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [healthData, setHealthData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHealthEntry, setNewHealthEntry] = useState({
    weight: '',
    temperature: '',
    heartRate: '',
    symptoms: [],
    medications: [],
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('weight');

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
        await loadHealthData(firstPet.id);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthData = async (petId) => {
    try {
      const data = await OfflineStorageService.getHealthData(petId, 30);
      setHealthData(data);
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  };

  const handlePetChange = async (pet) => {
    setSelectedPet(pet);
    await loadHealthData(pet.id);
  };

  const handleAddHealthEntry = async () => {
    if (!selectedPet) {
      Alert.alert('Error', 'Please select a pet first');
      return;
    }

    if (!newHealthEntry.weight && !newHealthEntry.temperature && !newHealthEntry.heartRate) {
      Alert.alert('Error', 'Please enter at least one health metric');
      return;
    }

    try {
      const healthEntry = {
        ...newHealthEntry,
        petId: selectedPet.id,
        timestamp: new Date().toISOString(),
        weight: parseFloat(newHealthEntry.weight) || null,
        temperature: parseFloat(newHealthEntry.temperature) || null,
        heartRate: parseInt(newHealthEntry.heartRate) || null
      };

      await OfflineStorageService.storeHealthData(selectedPet.id, healthEntry);
      
      // Check for health alerts
      await checkHealthAlerts(healthEntry);
      
      // Reload health data
      await loadHealthData(selectedPet.id);
      
      // Reset form
      setNewHealthEntry({
        weight: '',
        temperature: '',
        heartRate: '',
        symptoms: [],
        medications: [],
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      setShowAddModal(false);
      Alert.alert('Success', 'Health entry added successfully');
      
    } catch (error) {
      console.error('Error adding health entry:', error);
      Alert.alert('Error', 'Failed to add health entry');
    }
  };

  const checkHealthAlerts = async (healthEntry) => {
    const alerts = [];
    
    // Temperature alerts
    if (healthEntry.temperature) {
      if (healthEntry.temperature > 102.5) {
        alerts.push('High temperature detected');
      } else if (healthEntry.temperature < 99.5) {
        alerts.push('Low temperature detected');
      }
    }
    
    // Heart rate alerts (assuming dog)
    if (healthEntry.heartRate) {
      if (healthEntry.heartRate > 140) {
        alerts.push('High heart rate detected');
      } else if (healthEntry.heartRate < 60) {
        alerts.push('Low heart rate detected');
      }
    }
    
    // Weight change alerts
    if (healthEntry.weight && healthData.length > 0) {
      const lastEntry = healthData[0];
      if (lastEntry.weight) {
        const weightChange = Math.abs(healthEntry.weight - lastEntry.weight);
        const percentChange = (weightChange / lastEntry.weight) * 100;
        
        if (percentChange > 10) {
          alerts.push(`Significant weight change detected (${percentChange.toFixed(1)}%)`);
        }
      }
    }
    
    // Send notifications for alerts
    for (const alert of alerts) {
      await NotificationService.sendHealthAlert(selectedPet.id, 'metric_alert', alert);
    }
  };

  const getChartData = (metric) => {
    const filteredData = healthData
      .filter(entry => entry[metric] !== null && entry[metric] !== undefined)
      .slice(0, 10)
      .reverse();
    
    if (filteredData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          strokeWidth: 2
        }]
      };
    }
    
    return {
      labels: filteredData.map(entry => {
        const date = new Date(entry.timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [{
        data: filteredData.map(entry => entry[metric]),
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`
      }]
    };
  };

  const getMetricUnit = (metric) => {
    switch (metric) {
      case 'weight': return 'lbs';
      case 'temperature': return '°F';
      case 'heartRate': return 'bpm';
      default: return '';
    }
  };

  const getLatestValue = (metric) => {
    const latestEntry = healthData.find(entry => entry[metric] !== null && entry[metric] !== undefined);
    return latestEntry ? latestEntry[metric] : 'N/A';
  };

  const getHealthStatus = () => {
    if (healthData.length === 0) return { status: 'unknown', color: '#ccc' };
    
    const latest = healthData[0];
    let issues = 0;
    
    if (latest.temperature && (latest.temperature > 102.5 || latest.temperature < 99.5)) issues++;
    if (latest.heartRate && (latest.heartRate > 140 || latest.heartRate < 60)) issues++;
    if (latest.symptoms && latest.symptoms.length > 0) issues++;
    
    if (issues === 0) return { status: 'excellent', color: '#4ECDC4' };
    if (issues === 1) return { status: 'good', color: '#96CEB4' };
    if (issues === 2) return { status: 'fair', color: '#FECA57' };
    return { status: 'poor', color: '#FF6B6B' };
  };

  const addSymptom = (symptom) => {
    if (symptom.trim() && !newHealthEntry.symptoms.includes(symptom.trim())) {
      setNewHealthEntry(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptom.trim()]
      }));
    }
  };

  const removeSymptom = (index) => {
    setNewHealthEntry(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
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

  const renderHealthOverview = () => {
    if (!selectedPet) return null;
    
    const healthStatus = getHealthStatus();
    
    return (
      <View style={styles.overviewContainer}>
        <View style={styles.overviewHeader}>
          <Text style={styles.sectionTitle}>Health Overview</Text>
          <View style={[styles.statusBadge, { backgroundColor: healthStatus.color }]}>
            <Text style={styles.statusText}>{healthStatus.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Icon name="monitor-weight" size={24} color="#4ECDC4" />
            <Text style={styles.metricValue}>{getLatestValue('weight')}</Text>
            <Text style={styles.metricLabel}>Weight (lbs)</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Icon name="thermostat" size={24} color="#FF6B6B" />
            <Text style={styles.metricValue}>{getLatestValue('temperature')}</Text>
            <Text style={styles.metricLabel}>Temp (°F)</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Icon name="favorite" size={24} color="#FECA57" />
            <Text style={styles.metricValue}>{getLatestValue('heartRate')}</Text>
            <Text style={styles.metricLabel}>Heart Rate</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderChart = () => {
    if (!selectedPet || healthData.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Health Trends</Text>
          <View style={styles.noDataContainer}>
            <Icon name="show-chart" size={48} color="#ccc" />
            <Text style={styles.noDataText}>No health data available</Text>
            <Text style={styles.noDataSubtext}>Add some health entries to see trends</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>Health Trends</Text>
          <View style={styles.metricSelector}>
            {['weight', 'temperature', 'heartRate'].map((metric) => (
              <TouchableOpacity
                key={metric}
                style={[
                  styles.metricButton,
                  selectedMetric === metric && styles.metricButtonActive
                ]}
                onPress={() => setSelectedMetric(metric)}
              >
                <Text style={[
                  styles.metricButtonText,
                  selectedMetric === metric && styles.metricButtonTextActive
                ]}>
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <LineChart
          data={getChartData(selectedMetric)}
          width={width - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
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

  const renderRecentEntries = () => {
    if (!selectedPet || healthData.length === 0) return null;
    
    return (
      <View style={styles.entriesContainer}>
        <Text style={styles.sectionTitle}>Recent Entries</Text>
        {healthData.slice(0, 5).map((entry, index) => (
          <View key={index} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>
                {new Date(entry.timestamp).toLocaleDateString()}
              </Text>
              <Text style={styles.entryTime}>
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            
            <View style={styles.entryMetrics}>
              {entry.weight && (
                <Text style={styles.entryMetric}>Weight: {entry.weight} lbs</Text>
              )}
              {entry.temperature && (
                <Text style={styles.entryMetric}>Temp: {entry.temperature}°F</Text>
              )}
              {entry.heartRate && (
                <Text style={styles.entryMetric}>HR: {entry.heartRate} bpm</Text>
              )}
            </View>
            
            {entry.symptoms && entry.symptoms.length > 0 && (
              <View style={styles.symptomsContainer}>
                <Text style={styles.symptomsLabel}>Symptoms:</Text>
                <Text style={styles.symptomsText}>{entry.symptoms.join(', ')}</Text>
              </View>
            )}
            
            {entry.notes && (
              <Text style={styles.entryNotes}>{entry.notes}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderAddModal = () => {
    const [newSymptom, setNewSymptom] = useState('');
    
    return (
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Health Entry</Text>
            <TouchableOpacity onPress={handleAddHealthEntry}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={newHealthEntry.weight}
                onChangeText={(value) => setNewHealthEntry(prev => ({ ...prev, weight: value }))}
                placeholder="Enter weight"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Temperature (°F)</Text>
              <TextInput
                style={styles.input}
                value={newHealthEntry.temperature}
                onChangeText={(value) => setNewHealthEntry(prev => ({ ...prev, temperature: value }))}
                placeholder="Enter temperature"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Heart Rate (bpm)</Text>
              <TextInput
                style={styles.input}
                value={newHealthEntry.heartRate}
                onChangeText={(value) => setNewHealthEntry(prev => ({ ...prev, heartRate: value }))}
                placeholder="Enter heart rate"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Symptoms</Text>
              {newHealthEntry.symptoms.map((symptom, index) => (
                <View key={index} style={styles.symptomTag}>
                  <Text style={styles.symptomText}>{symptom}</Text>
                  <TouchableOpacity onPress={() => removeSymptom(index)}>
                    <Icon name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.addSymptomContainer}>
                <TextInput
                  style={styles.symptomInput}
                  value={newSymptom}
                  onChangeText={setNewSymptom}
                  placeholder="Add symptom"
                  onSubmitEditing={() => {
                    addSymptom(newSymptom);
                    setNewSymptom('');
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    addSymptom(newSymptom);
                    setNewSymptom('');
                  }}
                >
                  <Icon name="add" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={newHealthEntry.notes}
                onChangeText={(value) => setNewHealthEntry(prev => ({ ...prev, notes: value }))}
                placeholder="Additional notes..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="favorite" size={48} color="#007AFF" />
        <Text style={styles.loadingText}>Loading health data...</Text>
      </View>
    );
  }

  if (petProfiles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="pets" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No pets found</Text>
        <Text style={styles.emptySubtext}>Add a pet profile to start tracking health</Text>
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
        <Text style={styles.headerTitle}>Health Tracking</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Icon name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {renderPetSelector()}
        {renderHealthOverview()}
        {renderChart()}
        {renderRecentEntries()}
      </ScrollView>
      
      {renderAddModal()}
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
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
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
  chartContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  chartHeader: {
    marginBottom: 16,
  },
  metricSelector: {
    flexDirection: 'row',
    marginTop: 12,
  },
  metricButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  metricButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  metricButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  metricButtonTextActive: {
    color: 'white',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  entriesContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  entryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  entryTime: {
    fontSize: 12,
    color: '#666',
  },
  entryMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  entryMetric: {
    fontSize: 12,
    color: '#666',
    marginRight: 16,
    marginBottom: 4,
  },
  symptomsContainer: {
    marginBottom: 8,
  },
  symptomsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  symptomsText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  entryNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  symptomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  symptomText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  addSymptomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  symptomInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
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

export default HealthTrackingScreen;