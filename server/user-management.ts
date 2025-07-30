import type { Express } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { z } from "zod";

// User creation schema
const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  roleId: z.number().optional(),
  departmentId: z.number().optional(),
});

export function registerUserManagementRoutes(app: Express): void {
  // Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Don't send passwords in response
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create new user
  app.post("/api/admin/users", async (req, res) => {
    try {
      console.log("Creating user with data:", req.body);
      const validatedData = createUserSchema.parse(req.body);
      
      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, 10);
      
      // Create user object for database (let database auto-generate ID)
      const userData = {
        username: validatedData.username,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        password: passwordHash,
        name: validatedData.firstName && validatedData.lastName 
          ? `${validatedData.firstName} ${validatedData.lastName}`
          : validatedData.username,
        roleId: validatedData.roleId,
        departmentId: validatedData.departmentId,
        isActive: true,
        provider: "password",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const user = await storage.createUser(userData);
      console.log("User created successfully:", user.id);
      
      // Don't send password in response
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("User creation error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user", error: error.message });
      }
    }
  });

  // Update user
  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const updates = req.body;
      
      // Hash password if provided
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
      
      updates.updatedAt = new Date();
      
      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("User update error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      console.error("User deletion error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Get roles
  app.get("/api/admin/roles", async (req, res) => {
    try {
      // Return mock roles for now
      const roles = [
        { id: 1, name: "Administrator", description: "Full system access" },
        { id: 2, name: "Sales Manager", description: "Sales team management" },
        { id: 3, name: "Sales Consultant", description: "Customer and vehicle sales" },
        { id: 4, name: "Finance Manager", description: "F&I operations" },
        { id: 5, name: "Service Manager", description: "Service department" }
      ];
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  // Get departments
  app.get("/api/admin/departments", async (req, res) => {
    try {
      // Return mock departments for now
      const departments = [
        { id: 1, name: "Sales", description: "Vehicle sales department" },
        { id: 2, name: "Finance & Insurance", description: "F&I department" },
        { id: 3, name: "Service", description: "Service department" },
        { id: 4, name: "Parts", description: "Parts department" },
        { id: 5, name: "Administration", description: "Administrative operations" }
      ];
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });
}