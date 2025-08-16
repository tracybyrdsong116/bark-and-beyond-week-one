import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import OfflineStorageService from '../services/OfflineStorageService';
import AIRecommendationService from '../services/AIRecommendationService';

const { width } = Dimensions.get('window');

const PetProfileScreen = ({ route, navigation }) => {
  const { petId } = route.params || {};
  const isEditing = !!petId;
  
  const [petData, setPetData] = useState({
    id: petId || Date.now().toString(),
    name: '',
    breed: '',
    age: '',
    size: 'medium',
    weight: '',
    gender: 'male',
    photo: null,
    activityLevel: 'medium',
    healthConditions: [],
    allergies: [],
    medications: [],
    feedingSchedule: ['08:00', '18:00'],
    specialNeeds: false,
    microchipId: '',
    vetInfo: {
      name: '',
      phone: '',
      address: ''
    },
    preferences: {
      food: 0.5,
      toys: 0.5,
      treats: 0.5
    },
    coatType: 'short',
    trainingLevel: 0.5,
    budget: 100
  });
  
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (isEditing) {
      loadPetProfile();
    }
  }, [petId]);

  const loadPetProfile = async () => {
    try {
      const profile = await OfflineStorageService.getPetProfile(petId);
      if (profile) {
        setPetData(profile);
        // Load recommendations for this pet
        loadRecommendations();
      }
    } catch (error) {
      console.error('Error loading pet profile:', error);
      Alert.alert('Error', 'Failed to load pet profile');
    }
  };

  const loadRecommendations = async () => {
    try {
      const recs = await AIRecommendationService.getRecommendations(petId, { limit: 3 });
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleSave = async () => {
    if (!petData.name.trim()) {
      Alert.alert('Error', 'Please enter your pet\'s name');
      return;
    }

    if (!petData.breed.trim()) {
      Alert.alert('Error', 'Please enter your pet\'s breed');
      return;
    }

    if (!petData.age || isNaN(petData.age)) {
      Alert.alert('Error', 'Please enter a valid age');
      return;
    }

    setLoading(true);
    
    try {
      await OfflineStorageService.storePetProfile(petData);
      
      // Generate initial recommendations for new pets
      if (!isEditing) {
        await AIRecommendationService.getRecommendations(petData.id);
      }
      
      Alert.alert(
        'Success',
        isEditing ? 'Pet profile updated!' : 'Pet profile created!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving pet profile:', error);
      Alert.alert('Error', 'Failed to save pet profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = () => {
    setShowImagePicker(true);
  };

  const selectImage = (useCamera = false) => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    const callback = (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setPetData(prev => ({
          ...prev,
          photo: response.assets[0].uri
        }));
      }
    };

    if (useCamera) {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
    
    setShowImagePicker(false);
  };

  const updateField = (field, value) => {
    setPetData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent, field, value) => {
    setPetData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addToArray = (field, value) => {
    if (value.trim()) {
      setPetData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeFromArray = (field, index) => {
    setPetData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const renderImagePicker = () => (
    <Modal
      visible={showImagePicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowImagePicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Photo</Text>
          
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => selectImage(true)}
          >
            <Icon name="camera-alt" size={24} color="#007AFF" />
            <Text style={styles.modalButtonText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => selectImage(false)}
          >
            <Icon name="photo-library" size={24} color="#007AFF" />
            <Text style={styles.modalButtonText}>Choose from Library</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowImagePicker(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <TouchableOpacity style={styles.photoContainer} onPress={handleImagePicker}>
        {petData.photo ? (
          <Image source={{ uri: petData.photo }} style={styles.petPhoto} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Icon name="add-a-photo" size={32} color="#ccc" />
            <Text style={styles.photoPlaceholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={petData.name}
          onChangeText={(value) => updateField('name', value)}
          placeholder="Enter your pet's name"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Breed *</Text>
        <TextInput
          style={styles.input}
          value={petData.breed}
          onChangeText={(value) => updateField('breed', value)}
          placeholder="e.g., Golden Retriever, Persian Cat"
        />
      </View>
      
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Age (years) *</Text>
          <TextInput
            style={styles.input}
            value={petData.age.toString()}
            onChangeText={(value) => updateField('age', parseFloat(value) || '')}
            placeholder="Age"
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            value={petData.weight.toString()}
            onChangeText={(value) => updateField('weight', parseFloat(value) || '')}
            placeholder="Weight"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderSelectionGroup = (title, field, options, currentValue) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.selectionRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectionButton,
              currentValue === option.value && styles.selectionButtonActive
            ]}
            onPress={() => updateField(field, option.value)}
          >
            <Text style={[
              styles.selectionButtonText,
              currentValue === option.value && styles.selectionButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCharacteristics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Characteristics</Text>
      
      {renderSelectionGroup('Size', 'size', [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'extra_large', label: 'X-Large' }
      ], petData.size)}
      
      {renderSelectionGroup('Gender', 'gender', [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
      ], petData.gender)}
      
      {renderSelectionGroup('Activity Level', 'activityLevel', [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ], petData.activityLevel)}
      
      {renderSelectionGroup('Coat Type', 'coatType', [
        { value: 'short', label: 'Short' },
        { value: 'medium', label: 'Medium' },
        { value: 'long', label: 'Long' },
        { value: 'curly', label: 'Curly' }
      ], petData.coatType)}
    </View>
  );

  const renderHealthInfo = () => {
    const [newCondition, setNewCondition] = useState('');
    const [newAllergy, setNewAllergy] = useState('');
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Health Conditions</Text>
          {petData.healthConditions.map((condition, index) => (
            <View key={index} style={styles.tagContainer}>
              <Text style={styles.tagText}>{condition}</Text>
              <TouchableOpacity onPress={() => removeFromArray('healthConditions', index)}>
                <Icon name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addTagContainer}>
            <TextInput
              style={styles.tagInput}
              value={newCondition}
              onChangeText={setNewCondition}
              placeholder="Add health condition"
              onSubmitEditing={() => {
                addToArray('healthConditions', newCondition);
                setNewCondition('');
              }}
            />
            <TouchableOpacity
              onPress={() => {
                addToArray('healthConditions', newCondition);
                setNewCondition('');
              }}
            >
              <Icon name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Allergies</Text>
          {petData.allergies.map((allergy, index) => (
            <View key={index} style={styles.tagContainer}>
              <Text style={styles.tagText}>{allergy}</Text>
              <TouchableOpacity onPress={() => removeFromArray('allergies', index)}>
                <Icon name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addTagContainer}>
            <TextInput
              style={styles.tagInput}
              value={newAllergy}
              onChangeText={setNewAllergy}
              placeholder="Add allergy"
              onSubmitEditing={() => {
                addToArray('allergies', newAllergy);
                setNewAllergy('');
              }}
            />
            <TouchableOpacity
              onPress={() => {
                addToArray('allergies', newAllergy);
                setNewAllergy('');
              }}
            >
              <Icon name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Microchip ID</Text>
          <TextInput
            style={styles.input}
            value={petData.microchipId}
            onChangeText={(value) => updateField('microchipId', value)}
            placeholder="Enter microchip ID"
          />
        </View>
      </View>
    );
  };

  const renderVetInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Veterinarian Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vet Name</Text>
        <TextInput
          style={styles.input}
          value={petData.vetInfo.name}
          onChangeText={(value) => updateNestedField('vetInfo', 'name', value)}
          placeholder="Dr. Smith"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={petData.vetInfo.phone}
          onChangeText={(value) => updateNestedField('vetInfo', 'phone', value)}
          placeholder="(555) 123-4567"
          keyboardType="phone-pad"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={petData.vetInfo.address}
          onChangeText={(value) => updateNestedField('vetInfo', 'address', value)}
          placeholder="123 Main St, City, State"
          multiline
        />
      </View>
    </View>
  );

  const renderRecommendations = () => {
    if (!isEditing || recommendations.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        {recommendations.map((rec, index) => (
          <TouchableOpacity key={index} style={styles.recommendationItem}>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationName}>{rec.productName}</Text>
              <Text style={styles.recommendationReason}>{rec.reason}</Text>
              <Text style={styles.recommendationConfidence}>
                {Math.round(rec.confidence * 100)}% match
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Pet Profile' : 'Add New Pet'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {renderBasicInfo()}
        {renderCharacteristics()}
        {renderHealthInfo()}
        {renderVetInfo()}
        {renderRecommendations()}
      </ScrollView>
      
      {renderImagePicker()}
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
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  saveButtonDisabled: {
    color: '#ccc',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  petPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
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
  row: {
    flexDirection: 'row',
  },
  selectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectionButtonTextActive: {
    color: 'white',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  recommendationReason: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  recommendationConfidence: {
    fontSize: 12,
    color: '#4ECDC4',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 12,
  },
  cancelButton: {
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
});

export default PetProfileScreen;