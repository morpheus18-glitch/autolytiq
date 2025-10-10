import type { Express } from "express";
import { DatabaseStorage } from "./database-storage";
import { insertDepartmentSchema, insertRoleSchema, insertPermissionSchema, insertUserSchema, insertEmployeeSchema, insertServiceOrderSchema, insertServicePartSchema, insertPayrollSchema, insertFinancialTransactionSchema, insertNotificationSchema } from "@shared/schema";
import { sendVerificationEmail } from "./services/email-service";
import { randomUUID } from "crypto";

const storage = new DatabaseStorage();

// In-memory storage for stub endpoints (until proper database tables are added)
const inMemoryStore = {
  parts: new Map<number, any>(),
  notifications: new Map<string, any>(),
  lotPositions: new Map<number, any>(),
  permissions: [] as any[],
  nextPartId: 1,
  nextLotPositionId: 1,
};

export function registerAdminRoutes(app: Express) {
  // Department routes
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (error) {
      res.status(400).json({ message: "Invalid department data" });
    }
  });

  app.put("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDepartmentSchema.partial().parse(req.body);
      const department = await storage.updateDepartment(id, validatedData);
      res.json(department);
    } catch (error) {
      res.status(400).json({ message: "Invalid department data" });
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDepartment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  // Role routes
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.get("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch role" });
    }
  });

  app.get("/api/departments/:id/roles", async (req, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      const roles = await storage.getRolesByDepartment(departmentId);
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles for department" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ message: "Invalid role data" });
    }
  });

  app.put("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(id, validatedData);
      res.json(role);
    } catch (error) {
      res.status(400).json({ message: "Invalid role data" });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRole(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Permission routes
  app.get("/api/permissions", async (req, res) => {
    try {
      const permissions = await storage.getPermissions();
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.get("/api/permissions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const permission = await storage.getPermission(id);
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }
      res.json(permission);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch permission" });
    }
  });

  app.post("/api/permissions", async (req, res) => {
    try {
      const validatedData = insertPermissionSchema.parse(req.body);
      const permission = await storage.createPermission(validatedData);
      res.status(201).json(permission);
    } catch (error) {
      res.status(400).json({ message: "Invalid permission data" });
    }
  });

  app.put("/api/permissions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPermissionSchema.partial().parse(req.body);
      const permission = await storage.updatePermission(id, validatedData);
      res.json(permission);
    } catch (error) {
      res.status(400).json({ message: "Invalid permission data" });
    }
  });

  app.delete("/api/permissions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePermission(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete permission" });
    }
  });

  // Role-Permission routes
  app.get("/api/roles/:id/permissions", async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const permissions = await storage.getRolePermissions(roleId);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.post("/api/roles/:id/permissions", async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const { permissionId } = req.body;
      await storage.addRolePermission(roleId, permissionId);
      res.status(201).json({ message: "Permission added to role" });
    } catch (error) {
      res.status(400).json({ message: "Failed to add permission to role" });
    }
  });

  app.delete("/api/roles/:roleId/permissions/:permissionId", async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);
      await storage.removeRolePermission(roleId, permissionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove permission from role" });
    }
  });

  // User management routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User creation route with email verification
  app.post("/api/admin/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Generate a temporary password and verification code
      const tempPassword = Math.random().toString(36).slice(-12);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Create user with temporary password
      const userData = {
        ...validatedData,
        // Combine firstName and lastName if provided separately, otherwise use name
        name: validatedData.firstName && validatedData.lastName 
          ? `${validatedData.firstName} ${validatedData.lastName}`
          : validatedData.name || validatedData.username,
        password: tempPassword, // This should be hashed in production
        isActive: false, // User inactive until email verified
      };
      
      const user = await storage.createUser(userData);
      
      // Send verification email
      try {
        const emailSent = await sendVerificationEmail(user.email, user.name, verificationCode, tempPassword);
        if (emailSent) {
          res.status(201).json({ 
            ...user, 
            message: "User created successfully. Verification email sent.",
            verificationRequired: true 
          });
        } else {
          res.status(201).json({ 
            ...user, 
            message: "User created but email could not be sent. Please manually activate.",
            verificationRequired: false 
          });
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        res.status(201).json({ 
          ...user, 
          message: "User created but email could not be sent. Please manually activate.",
          verificationRequired: false 
        });
      }
    } catch (error) {
      console.error("User creation error:", error);
      res.status(400).json({ message: "Invalid user data", error: error.message });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, validatedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, validatedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.get("/api/departments/:id/employees", async (req, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      const employees = await storage.getEmployeesByDepartment(departmentId);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees for department" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, validatedData);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmployee(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Service order routes
  app.get("/api/service-orders", async (req, res) => {
    try {
      const serviceOrders = await storage.getServiceOrders();
      res.json(serviceOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service orders" });
    }
  });

  app.get("/api/service-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceOrder = await storage.getServiceOrder(id);
      if (!serviceOrder) {
        return res.status(404).json({ message: "Service order not found" });
      }
      res.json(serviceOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service order" });
    }
  });

  app.post("/api/service-orders", async (req, res) => {
    try {
      const validatedData = insertServiceOrderSchema.parse(req.body);
      const serviceOrder = await storage.createServiceOrder(validatedData);
      res.status(201).json(serviceOrder);
    } catch (error) {
      res.status(400).json({ message: "Invalid service order data" });
    }
  });

  app.put("/api/service-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServiceOrderSchema.partial().parse(req.body);
      const serviceOrder = await storage.updateServiceOrder(id, validatedData);
      res.json(serviceOrder);
    } catch (error) {
      res.status(400).json({ message: "Invalid service order data" });
    }
  });

  app.delete("/api/service-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServiceOrder(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service order" });
    }
  });

  // Service parts routes
  app.get("/api/service-parts", async (req, res) => {
    try {
      const serviceParts = await storage.getServiceParts();
      res.json(serviceParts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service parts" });
    }
  });

  app.get("/api/service-parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const servicePart = await storage.getServicePart(id);
      if (!servicePart) {
        return res.status(404).json({ message: "Service part not found" });
      }
      res.json(servicePart);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service part" });
    }
  });

  app.post("/api/service-parts", async (req, res) => {
    try {
      const validatedData = insertServicePartSchema.parse(req.body);
      const servicePart = await storage.createServicePart(validatedData);
      res.status(201).json(servicePart);
    } catch (error) {
      res.status(400).json({ message: "Invalid service part data" });
    }
  });

  app.put("/api/service-parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServicePartSchema.partial().parse(req.body);
      const servicePart = await storage.updateServicePart(id, validatedData);
      res.json(servicePart);
    } catch (error) {
      res.status(400).json({ message: "Invalid service part data" });
    }
  });

  app.delete("/api/service-parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServicePart(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service part" });
    }
  });

  // Payroll routes
  app.get("/api/payroll", async (req, res) => {
    try {
      const payrollRecords = await storage.getPayroll();
      res.json(payrollRecords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payroll records" });
    }
  });

  app.get("/api/employees/:id/payroll", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const payrollRecords = await storage.getPayrollByEmployee(employeeId);
      res.json(payrollRecords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payroll records for employee" });
    }
  });

  app.post("/api/payroll", async (req, res) => {
    try {
      const validatedData = insertPayrollSchema.parse(req.body);
      const payroll = await storage.createPayroll(validatedData);
      res.status(201).json(payroll);
    } catch (error) {
      res.status(400).json({ message: "Invalid payroll data" });
    }
  });

  app.put("/api/payroll/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPayrollSchema.partial().parse(req.body);
      const payroll = await storage.updatePayroll(id, validatedData);
      res.json(payroll);
    } catch (error) {
      res.status(400).json({ message: "Invalid payroll data" });
    }
  });

  app.delete("/api/payroll/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePayroll(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payroll record" });
    }
  });

  // Financial transaction routes
  app.get("/api/financial-transactions", async (req, res) => {
    try {
      const transactions = await storage.getFinancialTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial transactions" });
    }
  });

  app.post("/api/financial-transactions", async (req, res) => {
    try {
      const validatedData = insertFinancialTransactionSchema.parse(req.body);
      const transaction = await storage.createFinancialTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid financial transaction data" });
    }
  });

  // Parts inventory routes (in-memory implementation)
  app.get("/api/parts", async (req, res) => {
    try {
      const parts = Array.from(inMemoryStore.parts.values());
      res.json(parts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parts" });
    }
  });

  app.get("/api/parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const part = inMemoryStore.parts.get(id);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }
      res.json(part);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch part" });
    }
  });

  app.post("/api/parts", async (req, res) => {
    try {
      const id = inMemoryStore.nextPartId++;
      const part = { id, ...req.body, createdAt: new Date().toISOString() };
      inMemoryStore.parts.set(id, part);
      res.status(201).json(part);
    } catch (error) {
      res.status(400).json({ message: "Invalid part data" });
    }
  });

  app.put("/api/parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingPart = inMemoryStore.parts.get(id);
      if (!existingPart) {
        return res.status(404).json({ message: "Part not found" });
      }
      const part = { ...existingPart, ...req.body, id, updatedAt: new Date().toISOString() };
      inMemoryStore.parts.set(id, part);
      res.json(part);
    } catch (error) {
      res.status(400).json({ message: "Invalid part data" });
    }
  });

  app.delete("/api/parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!inMemoryStore.parts.has(id)) {
        return res.status(404).json({ message: "Part not found" });
      }
      inMemoryStore.parts.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete part" });
    }
  });

  // Transactions alias (points to financial-transactions)
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getFinancialTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertFinancialTransactionSchema.parse(req.body);
      const transaction = await storage.createFinancialTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // Notifications routes (in-memory implementation)
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = Array.from(inMemoryStore.notifications.values());
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    try {
      const notifications = Array.from(inMemoryStore.notifications.values());
      const unreadCount = notifications.filter((n: any) => !n.isRead).length;
      res.json({ count: unreadCount });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.post("/api/notifications/read-all", async (req, res) => {
    try {
      const now = new Date();
      for (const [id, notification] of inMemoryStore.notifications) {
        inMemoryStore.notifications.set(id, { ...notification, isRead: true, readAt: now });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const id = randomUUID();
      const now = new Date();
      const notification = { 
        id, 
        ...validatedData, 
        isRead: false,
        readAt: null,
        createdAt: now
      };
      inMemoryStore.notifications.set(id, notification);
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification data" });
    }
  });

  app.patch("/api/notifications/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const existingNotification = inMemoryStore.notifications.get(id);
      if (!existingNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      const validatedData = insertNotificationSchema.partial().parse(req.body);
      
      // If marking as read, set readAt timestamp
      const updates = { ...validatedData };
      if (updates.isRead === true && !existingNotification.readAt) {
        updates.readAt = new Date();
      }
      
      const notification = { 
        ...existingNotification, 
        ...updates, 
        id 
      };
      inMemoryStore.notifications.set(id, notification);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification data" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/insights", async (req, res) => {
    try {
      // Stub: return empty insights until inventory insights is implemented
      const insights = {
        totalVehicles: 0,
        avgDaysOnLot: 0,
        topModels: [],
        agingInventory: []
      };
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory insights" });
    }
  });

  // Lot management routes (in-memory implementation)
  app.get("/api/lot/positions", async (req, res) => {
    try {
      const positions = Array.from(inMemoryStore.lotPositions.values());
      res.json(positions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lot positions" });
    }
  });

  app.post("/api/lot/positions", async (req, res) => {
    try {
      const id = inMemoryStore.nextLotPositionId++;
      const position = { id, ...req.body, createdAt: new Date().toISOString() };
      inMemoryStore.lotPositions.set(id, position);
      res.status(201).json(position);
    } catch (error) {
      res.status(400).json({ message: "Invalid lot position data" });
    }
  });

  app.put("/api/lot/positions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingPosition = inMemoryStore.lotPositions.get(id);
      if (!existingPosition) {
        return res.status(404).json({ message: "Lot position not found" });
      }
      const position = { ...existingPosition, ...req.body, id, updatedAt: new Date().toISOString() };
      inMemoryStore.lotPositions.set(id, position);
      res.json(position);
    } catch (error) {
      res.status(400).json({ message: "Invalid lot position data" });
    }
  });

  // Automotive data routes (stub implementation)
  app.get("/api/automotive/competition", async (req, res) => {
    try {
      // Stub: return empty array until automotive competition data is implemented
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch competition data" });
    }
  });

  app.get("/api/automotive/incentives", async (req, res) => {
    try {
      // Stub: return empty array until automotive incentives data is implemented
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incentives data" });
    }
  });

  app.get("/api/automotive/market-data", async (req, res) => {
    try {
      // Stub: return empty market data until implementation
      res.json({
        marketTrends: [],
        pricingData: [],
        inventoryLevels: {}
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Employee routes (stub implementation)
  app.get("/api/employees", async (req, res) => {
    try {
      // Stub: return empty array until employees storage is implemented
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });
}