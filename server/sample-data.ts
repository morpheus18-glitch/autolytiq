import { storage } from './storage';

// Create sample data for testing the professional deal desk
export async function createSampleData() {
  try {
    console.log('Creating sample data...');
    
    // Create sample vehicles
    const vehicles = [
      {
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        vin: '1HGBH41JXMN109186',
        stockNumber: 'TC23001',
        price: 28500,
        mileage: 15000,
        color: 'Silver',
        status: 'available',
        description: '2023 Toyota Camry LE - Excellent condition',
        category: 'sedan',
        condition: 'excellent',
        transmission: 'automatic',
        fuelType: 'gasoline',
        bodyStyle: 'sedan',
        cost: 24000,
        daysOnLot: 45
      },
      {
        make: 'Honda',
        model: 'Civic',
        year: 2024,
        vin: '2HGFC2F59NH123456',
        stockNumber: 'HC24002',
        price: 26900,
        mileage: 8000,
        color: 'White',
        status: 'available',
        description: '2024 Honda Civic Sport - Like new',
        category: 'sedan',
        condition: 'excellent',
        transmission: 'automatic',
        fuelType: 'gasoline',
        bodyStyle: 'sedan',
        cost: 22500,
        daysOnLot: 22
      },
      {
        make: 'Ford',
        model: 'F-150',
        year: 2023,
        vin: '1FTFW1ET5NFA12345',
        stockNumber: 'FF23003',
        price: 42500,
        mileage: 25000,
        color: 'Blue',
        status: 'available',
        description: '2023 Ford F-150 XLT - Work ready',
        category: 'truck',
        condition: 'good',
        transmission: 'automatic',
        fuelType: 'gasoline',
        bodyStyle: 'truck',
        cost: 36000,
        daysOnLot: 67
      }
    ];

    for (const vehicle of vehicles) {
      await storage.createVehicle(vehicle);
    }

    // Create sample customers
    const customers = [
      {
        firstName: 'John',
        lastName: 'Smith',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '555-0123',
        cellPhone: '555-0123',
        address: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        creditScore: 750,
        income: 85000,
        status: 'prospect',
        salesConsultant: 'Mike Johnson',
        leadSource: 'website',
        notes: 'Looking for a reliable sedan for commuting'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '555-0234',
        cellPhone: '555-0234',
        address: '456 Oak Ave',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        creditScore: 680,
        income: 65000,
        status: 'hot',
        salesConsultant: 'Lisa Chen',
        leadSource: 'referral',
        notes: 'Interested in fuel-efficient vehicles'
      },
      {
        firstName: 'Mike',
        lastName: 'Williams',
        name: 'Mike Williams',
        email: 'mike.williams@email.com',
        phone: '555-0345',
        cellPhone: '555-0345',
        address: '789 Pine Rd',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        creditScore: 620,
        income: 95000,
        status: 'warm',
        salesConsultant: 'Tom Rodriguez',
        leadSource: 'walk-in',
        notes: 'Needs a truck for work purposes'
      }
    ];

    for (const customer of customers) {
      await storage.createCustomer(customer);
    }

    // Create sample leads
    const leads = [
      {
        leadNumber: 'L24001',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        customerPhone: '555-0123',
        source: 'website',
        status: 'new',
        priority: 'high',
        temperature: 'hot',
        interestedIn: 'sedan',
        assignedTo: 'Mike Johnson',
        notes: 'Very interested in Toyota Camry'
      },
      {
        leadNumber: 'L24002',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.johnson@email.com',
        customerPhone: '555-0234',
        source: 'referral',
        status: 'contacted',
        priority: 'medium',
        temperature: 'warm',
        interestedIn: 'compact',
        assignedTo: 'Lisa Chen',
        notes: 'Scheduled for test drive'
      }
    ];

    for (const lead of leads) {
      await storage.createLead(lead);
    }

    console.log('Sample data created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating sample data:', error);
    return false;
  }
}