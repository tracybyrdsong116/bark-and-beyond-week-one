import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async initialize() {
    try {
      // Register for push notifications
      this.expoPushToken = await this.registerForPushNotificationsAsync();
      
      // Set up notification listeners
      this.setupNotificationListeners();
      
      // Schedule default notifications
      await this.scheduleDefaultNotifications();
      
      console.log('NotificationService initialized successfully');
    } catch (error) {
      console.error('NotificationService initialization failed:', error);
      throw error;
    }
  }

  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      })).data;
      
      // Store token for backend communication
      await AsyncStorage.setItem('expoPushToken', token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  setupNotificationListeners() {
    // Listen for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  handleNotificationReceived(notification) {
    const { data } = notification.request.content;
    
    // Handle different notification types
    switch (data?.type) {
      case 'health_alert':
        this.handleHealthAlert(data);
        break;
      case 'feeding_reminder':
        this.handleFeedingReminder(data);
        break;
      case 'product_recommendation':
        this.handleProductRecommendation(data);
        break;
      case 'activity_milestone':
        this.handleActivityMilestone(data);
        break;
      default:
        console.log('Unknown notification type:', data?.type);
    }
  }

  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    // Navigate to appropriate screen based on notification type
    // This would integrate with navigation service
    console.log('User tapped notification:', data);
  }

  async scheduleDefaultNotifications() {
    // Schedule daily feeding reminders
    await this.scheduleFeedingReminders();
    
    // Schedule weekly health check reminders
    await this.scheduleHealthCheckReminders();
    
    // Schedule activity goal notifications
    await this.scheduleActivityReminders();
  }

  async scheduleFeedingReminders() {
    const petProfiles = await AsyncStorage.getItem('petProfiles');
    if (!petProfiles) return;

    const pets = JSON.parse(petProfiles);
    
    for (const pet of pets) {
      if (pet.feedingSchedule) {
        for (const feedingTime of pet.feedingSchedule) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `🍽️ Feeding Time for ${pet.name}!`,
              body: `It's time to feed ${pet.name}. Don't forget their favorite treats!`,
              data: {
                type: 'feeding_reminder',
                petId: pet.id,
                feedingTime: feedingTime
              },
            },
            trigger: {
              hour: parseInt(feedingTime.split(':')[0]),
              minute: parseInt(feedingTime.split(':')[1]),
              repeats: true,
            },
          });
        }
      }
    }
  }

  async scheduleHealthCheckReminders() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏥 Weekly Health Check',
        body: 'Time to review your pet\'s health metrics and activity levels.',
        data: {
          type: 'health_check',
        },
      },
      trigger: {
        weekday: 1, // Monday
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  }

  async scheduleActivityReminders() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎾 Activity Time!',
        body: 'Your pet could use some exercise. How about a walk or playtime?',
        data: {
          type: 'activity_reminder',
        },
      },
      trigger: {
        hour: 17, // 5 PM
        minute: 0,
        repeats: true,
      },
    });
  }

  async sendHealthAlert(petId, alertType, message) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 Health Alert',
        body: message,
        data: {
          type: 'health_alert',
          petId: petId,
          alertType: alertType,
        },
      },
      trigger: null, // Send immediately
    });
  }

  async sendProductRecommendation(petId, productId, productName) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💡 Product Recommendation',
        body: `Based on your pet's profile, we recommend: ${productName}`,
        data: {
          type: 'product_recommendation',
          petId: petId,
          productId: productId,
        },
      },
      trigger: null,
    });
  }

  async sendActivityMilestone(petId, milestone) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏆 Activity Milestone!',
        body: `Great job! Your pet has achieved: ${milestone}`,
        data: {
          type: 'activity_milestone',
          petId: petId,
          milestone: milestone,
        },
      },
      trigger: null,
    });
  }

  handleHealthAlert(data) {
    // Store health alert for later review
    this.storeHealthAlert(data);
  }

  handleFeedingReminder(data) {
    // Log feeding reminder interaction
    console.log('Feeding reminder for pet:', data.petId);
  }

  handleProductRecommendation(data) {
    // Track recommendation engagement
    this.trackRecommendationEngagement(data);
  }

  handleActivityMilestone(data) {
    // Celebrate milestone achievement
    console.log('Activity milestone achieved:', data.milestone);
  }

  async storeHealthAlert(alertData) {
    try {
      const existingAlerts = await AsyncStorage.getItem('healthAlerts');
      const alerts = existingAlerts ? JSON.parse(existingAlerts) : [];
      
      alerts.push({
        ...alertData,
        timestamp: new Date().toISOString(),
        read: false
      });
      
      await AsyncStorage.setItem('healthAlerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Error storing health alert:', error);
    }
  }

  async trackRecommendationEngagement(data) {
    try {
      const engagementData = {
        productId: data.productId,
        petId: data.petId,
        timestamp: new Date().toISOString(),
        action: 'notification_received'
      };
      
      const existingEngagement = await AsyncStorage.getItem('recommendationEngagement');
      const engagement = existingEngagement ? JSON.parse(existingEngagement) : [];
      
      engagement.push(engagementData);
      await AsyncStorage.setItem('recommendationEngagement', JSON.stringify(engagement));
    } catch (error) {
      console.error('Error tracking recommendation engagement:', error);
    }
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async cancelNotification(identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();