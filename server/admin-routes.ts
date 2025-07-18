import type { Express } from "express";
import { DatabaseStorage } from "./database-storage";
import { insertDepartmentSchema, insertRoleSchema, insertPermissionSchema, insertUserSchema, insertEmployeeSchema, insertServiceOrderSchema, insertServicePartSchema, insertPayrollSchema, insertFinancialTransactionSchema } from "@shared/schema";

const storage = new DatabaseStorage();

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
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
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

  // User management routes
  app.get("/api/admin/users", async (req, res) => {
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

  app.post("/api/admin/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, validatedData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
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
}