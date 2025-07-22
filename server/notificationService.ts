import { storage } from './storage';

// Notification Service for generating real-time notifications
export class NotificationService {
  
  // Create a new notification
  async createNotification(data: {
    userId?: string;
    type: 'lead' | 'sale' | 'inventory' | 'system' | 'message' | 'alert';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    title: string;
    message: string;
    actionUrl?: string;
    actionData?: any;
    expiresAt?: Date;
  }) {
    try {
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        isRead: false,
        createdAt: new Date().toISOString(),
        expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined,
      };

      // In a real system, this would save to database
      // For now, we'll use in-memory storage if available
      if (storage.createNotification) {
        return await storage.createNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Generate sample notifications for demo
  async generateSampleNotifications(userId?: string) {
    const sampleNotifications = [
      {
        userId,
        type: 'lead' as const,
        priority: 'high' as const,
        title: 'New High-Value Lead',
        message: 'Sarah Johnson interested in 2024 BMW X5 - Budget: $75K',
        actionUrl: '/leads',
        actionData: { leadId: 'lead_001', customerName: 'Sarah Johnson' }
      },
      {
        userId,
        type: 'message' as const,
        priority: 'normal' as const,
        title: 'Customer Message',
        message: 'Mike Wilson asking about financing options for Honda Civic',
        actionUrl: '/communication-demo',
        actionData: { customerId: 'cust_002', customerName: 'Mike Wilson' }
      },
      {
        userId,
        type: 'inventory' as const,
        priority: 'normal' as const,
        title: 'Low Inventory Alert',
        message: '2024 Toyota Camry stock is running low (3 units remaining)',
        actionUrl: '/inventory',
        actionData: { vehicleId: 'veh_003', make: 'Toyota', model: 'Camry' }
      },
      {
        userId,
        type: 'alert' as const,
        priority: 'urgent' as const,
        title: 'Price Alert',
        message: 'Competitor dropped price on similar 2024 Honda Accord by 12%',
        actionUrl: '/competitive-pricing',
        actionData: { vehicleType: 'Honda Accord', priceDropPercentage: 12 }
      },
      {
        userId,
        type: 'system' as const,
        priority: 'low' as const,
        title: 'Daily Report Ready',
        message: 'Your daily sales and inventory report has been generated',
        actionUrl: '/analytics',
        actionData: { reportType: 'daily', date: new Date().toISOString() }
      }
    ];

    const createdNotifications = [];
    for (const notificationData of sampleNotifications) {
      try {
        const notification = await this.createNotification(notificationData);
        createdNotifications.push(notification);
      } catch (error) {
        console.error('Failed to create sample notification:', error);
      }
    }

    return createdNotifications;
  }

  // Simulate real-time notifications
  async simulateRealTimeNotifications(userId?: string) {
    const realTimeNotifications = [
      {
        userId,
        type: 'lead' as const,
        priority: 'urgent' as const,
        title: 'Hot Lead Alert!',
        message: 'David Chen just submitted inquiry for luxury vehicle - responds within 5 minutes!',
        actionUrl: '/leads',
        actionData: { leadId: `lead_${Date.now()}`, urgency: 'hot' }
      },
      {
        userId,
        type: 'sale' as const,
        priority: 'high' as const,
        title: 'Deal Closed!',
        message: 'Jennifer Martinez completed purchase of 2024 Tesla Model Y',
        actionUrl: '/deals',
        actionData: { dealId: `deal_${Date.now()}`, amount: 58500 }
      }
    ];

    // Create one random notification
    const randomNotification = realTimeNotifications[Math.floor(Math.random() * realTimeNotifications.length)];
    return await this.createNotification(randomNotification);
  }
}

export const notificationService = new NotificationService();