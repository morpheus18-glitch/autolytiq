import { DatabaseStorage } from "./database-storage";

export async function seedDefaultData() {
  const storage = new DatabaseStorage();
  
  try {
    // Check if departments already exist
    const existingDepartments = await storage.getDepartments();
    
    if (existingDepartments.length === 0) {
      console.log("Seeding default departments...");
      
      // Create default departments
      const salesDept = await storage.createDepartment({
        name: "Sales Department",
        description: "Manages vehicle sales, customer relationships, and lead generation",
        budget: 500000,
        managerId: null
      });
      
      const serviceDept = await storage.createDepartment({
        name: "Service Department", 
        description: "Handles vehicle maintenance, repairs, and parts inventory",
        budget: 300000,
        managerId: null
      });
      
      const accountingDept = await storage.createDepartment({
        name: "Accounting Department",
        description: "Manages financial records, payroll, and reporting",
        budget: 200000,
        managerId: null
      });
      
      const adminDept = await storage.createDepartment({
        name: "Administration",
        description: "Oversees system administration and user management",
        budget: 150000,
        managerId: null
      });
      
      // Create default roles
      await storage.createRole({
        name: "Sales Manager",
        description: "Manages sales team and operations",
        departmentId: salesDept.id,
        permissions: ["read", "write", "delete"]
      });
      
      await storage.createRole({
        name: "Sales Representative",
        description: "Handles customer interactions and sales",
        departmentId: salesDept.id,
        permissions: ["read", "write"]
      });
      
      await storage.createRole({
        name: "Service Manager",
        description: "Manages service operations and technicians",
        departmentId: serviceDept.id,
        permissions: ["read", "write", "delete"]
      });
      
      await storage.createRole({
        name: "Technician",
        description: "Performs vehicle maintenance and repairs",
        departmentId: serviceDept.id,
        permissions: ["read", "write"]
      });
      
      await storage.createRole({
        name: "Accountant",
        description: "Manages financial records and reporting",
        departmentId: accountingDept.id,
        permissions: ["read", "write"]
      });
      
      await storage.createRole({
        name: "System Administrator",
        description: "Manages system configuration and users",
        departmentId: adminDept.id,
        permissions: ["read", "write", "delete", "admin"]
      });
      
      // Create default permissions
      const permissions = [
        { name: "View Dashboard", description: "Access main dashboard", resource: "dashboard", action: "read" },
        { name: "Manage Inventory", description: "CRUD operations on vehicle inventory", resource: "vehicles", action: "write" },
        { name: "View Customers", description: "Access customer information", resource: "customers", action: "read" },
        { name: "Manage Customers", description: "CRUD operations on customers", resource: "customers", action: "write" },
        { name: "View Sales", description: "Access sales data", resource: "sales", action: "read" },
        { name: "Manage Sales", description: "CRUD operations on sales", resource: "sales", action: "write" },
        { name: "View Service Orders", description: "Access service order information", resource: "service_orders", action: "read" },
        { name: "Manage Service Orders", description: "CRUD operations on service orders", resource: "service_orders", action: "write" },
        { name: "View Reports", description: "Access financial and operational reports", resource: "reports", action: "read" },
        { name: "Manage Users", description: "CRUD operations on user accounts", resource: "users", action: "admin" },
        { name: "System Administration", description: "Full system administrative access", resource: "system", action: "admin" }
      ];
      
      for (const permission of permissions) {
        await storage.createPermission(permission);
      }
      
      console.log("Default data seeded successfully!");
      
      // Seed customers with enhanced data
      await seedCustomers(storage);
    }
  } catch (error) {
    console.error("Error seeding default data:", error);
  }
}

async function seedCustomers(storage: DatabaseStorage) {
  try {
    const customers = [
      {
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "555-123-4567",
        address: "123 Main St, Springfield, IL 62701",
        licenseNumber: "IL123456789",
        licenseState: "IL",
        licenseExpiry: new Date("2025-12-31"),
        dateOfBirth: new Date("1985-06-15"),
        creditScore: 750,
        notes: "Interested in SUVs, has good credit history",
        tags: ["high-priority", "repeat-customer"],
        leadSource: "website",
        preferredContactMethod: "email",
        isActive: true,
      },
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "555-987-6543",
        address: "456 Oak Ave, Springfield, IL 62702",
        licenseNumber: "IL987654321",
        licenseState: "IL",
        licenseExpiry: new Date("2026-03-15"),
        dateOfBirth: new Date("1990-12-08"),
        creditScore: 680,
        notes: "Looking for fuel-efficient compact car",
        tags: ["first-time-buyer"],
        leadSource: "referral",
        preferredContactMethod: "phone",
        isActive: true,
      },
      {
        name: "Michael Brown",
        email: "michael.brown@email.com",
        phone: "555-456-7890",
        address: "789 Pine Rd, Springfield, IL 62703",
        licenseNumber: "IL456789012",
        licenseState: "IL",
        licenseExpiry: new Date("2024-08-20"),
        dateOfBirth: new Date("1978-04-22"),
        creditScore: 820,
        notes: "Business owner, interested in luxury vehicles",
        tags: ["vip", "cash-buyer"],
        leadSource: "walk-in",
        preferredContactMethod: "phone",
        isActive: true,
      },
      {
        name: "Emily Davis",
        email: "emily.davis@email.com",
        phone: "555-321-0987",
        address: "321 Elm St, Springfield, IL 62704",
        licenseNumber: "IL321098765",
        licenseState: "IL",
        licenseExpiry: new Date("2025-11-10"),
        dateOfBirth: new Date("1993-09-30"),
        creditScore: 720,
        notes: "Recent graduate, needs reliable transportation",
        tags: ["recent-graduate", "budget-conscious"],
        leadSource: "social-media",
        preferredContactMethod: "email",
        isActive: true,
      },
      {
        name: "David Wilson",
        email: "david.wilson@email.com",
        phone: "555-654-3210",
        address: "654 Maple Dr, Springfield, IL 62705",
        licenseNumber: "IL654321098",
        licenseState: "IL",
        licenseExpiry: new Date("2026-01-05"),
        dateOfBirth: new Date("1982-11-12"),
        creditScore: 650,
        notes: "Has trade-in vehicle, interested in financing options",
        tags: ["trade-in", "financing"],
        leadSource: "phone",
        preferredContactMethod: "phone",
        isActive: true,
      },
      {
        name: "Jennifer Martinez",
        email: "jennifer.martinez@email.com",
        phone: "555-789-0123",
        address: "987 Cedar St, Springfield, IL 62706",
        licenseNumber: "IL789012345",
        licenseState: "IL",
        licenseExpiry: new Date("2025-07-18"),
        dateOfBirth: new Date("1988-03-25"),
        creditScore: 780,
        notes: "Family of 4, looking for minivan or large SUV",
        tags: ["family", "safety-focused"],
        leadSource: "website",
        preferredContactMethod: "email",
        isActive: true,
      },
      {
        name: "Robert Thompson",
        email: "robert.thompson@email.com",
        phone: "555-234-5678",
        address: "234 Birch Ave, Springfield, IL 62707",
        licenseNumber: "IL234567890",
        licenseState: "IL",
        licenseExpiry: new Date("2024-12-25"),
        dateOfBirth: new Date("1975-07-03"),
        creditScore: 710,
        notes: "Retired, interested in comfortable sedan",
        tags: ["senior", "comfort-focused"],
        leadSource: "referral",
        preferredContactMethod: "phone",
        isActive: true,
      },
      {
        name: "Lisa Anderson",
        email: "lisa.anderson@email.com",
        phone: "555-345-6789",
        address: "345 Willow Dr, Springfield, IL 62708",
        licenseNumber: "IL345678901",
        licenseState: "IL",
        licenseExpiry: new Date("2026-05-12"),
        dateOfBirth: new Date("1991-01-18"),
        creditScore: 690,
        notes: "Young professional, wants sporty coupe",
        tags: ["young-professional", "sporty"],
        leadSource: "social-media",
        preferredContactMethod: "email",
        isActive: true,
      },
    ];

    for (const customer of customers) {
      await storage.createCustomer(customer);
    }
    
    console.log("Customer data seeded successfully!");
  } catch (error) {
    console.error("Error seeding customer data:", error);
  }
}