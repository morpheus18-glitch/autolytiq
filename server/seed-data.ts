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
    }
  } catch (error) {
    console.error("Error seeding default data:", error);
  }
}