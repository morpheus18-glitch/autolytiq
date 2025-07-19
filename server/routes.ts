import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertCustomerSchema, insertLeadSchema, insertSaleSchema, insertVisitorSessionSchema, insertPageViewSchema, insertCustomerInteractionSchema, insertCompetitorAnalyticsSchema, insertCompetitivePricingSchema, insertPricingInsightsSchema, insertMerchandisingStrategiesSchema, insertMarketTrendsSchema } from "@shared/schema";
import { competitiveScraper } from "./services/competitive-scraper";
import { registerAdminRoutes } from "./admin-routes";
import { decodeVINHandler } from "./services/vin-decoder";
import { mlBackend } from "./ml-integration";
import { valuationService } from './services/valuation-service';
import { photoService } from './services/photo-service';
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user ID based on provider
      let userId: string;
      if (user.provider === 'replit') {
        userId = user.claims?.sub;
      } else {
        userId = user.id || user.claims?.sub;
      }

      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      const dbUser = await storage.getUser(userId);
      if (!dbUser) {
        return res.status(404).json({ message: "User not found in database" });
      }

      res.json(dbUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, validatedData);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVehicle(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Enhanced VIN decoder route using free NHTSA API
  app.get("/api/decode-vin/:vin", async (req, res) => {
    try {
      const vin = req.params.vin;
      
      if (!vin || vin.length !== 17) {
        return res.status(400).json({ message: "Invalid VIN format" });
      }
      
      const { decodeVIN } = await import('./services/valuation-service');
      const vinData = await decodeVIN(vin);
      
      if (!vinData) {
        return res.status(404).json({ message: "VIN not found or invalid" });
      }
      
      res.json({
        vin: vin,
        decoded: vinData,
        source: 'NHTSA vPIC API (Free)',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('VIN decode error:', error);
      res.status(500).json({ message: "Failed to decode VIN", error: error.message });
    }
  });

  // Legacy VIN decoder for compatibility
  app.get("/api/legacy-decode-vin/:vin", decodeVINHandler);

  // Batch valuation endpoint for multiple vehicles
  app.post("/api/valuations/batch", async (req, res) => {
    try {
      const { vins } = req.body;
      
      if (!Array.isArray(vins) || vins.length === 0) {
        return res.status(400).json({ message: "VINs array is required" });
      }
      
      if (vins.length > 20) {
        return res.status(400).json({ message: "Maximum 20 VINs per batch request" });
      }
      
      const { getBatchValuations } = await import('./services/valuation-service');
      const results = await getBatchValuations(vins);
      
      res.json({
        processed: Object.keys(results).length,
        results: results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Batch valuation error:', error);
      res.status(500).json({ message: "Failed to process batch valuations", error: error.message });
    }
  });

  // Quick valuation by make/model/year (no VIN required)
  app.post("/api/valuations/quick", async (req, res) => {
    try {
      const { make, model, year, mileage } = req.body;
      
      if (!make || !model || !year) {
        return res.status(400).json({ message: "Make, model, and year are required" });
      }
      
      const { getQuickValuation } = await import('./services/valuation-service');
      const valuation = await getQuickValuation(make, model, year, mileage);
      
      if (!valuation) {
        return res.status(404).json({ message: "Unable to generate valuation" });
      }
      
      res.json(valuation);
    } catch (error) {
      console.error('Quick valuation error:', error);
      res.status(500).json({ message: "Failed to get quick valuation", error: error.message });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, twoFactorCode } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Master account bypass (for initial setup)
      if (username === "master_admin" && password === "AutolytiQ2025!Master") {
        const masterUser = {
          id: 0,
          username: "master_admin",
          role: "super_admin",
          permissions: ["all"],
          isMaster: true
        };

        // Set session
        req.session.user = masterUser;
        req.session.loginTime = new Date();
        
        // Save session explicitly
        console.log('🔑 Master account login successful');
        return res.json({
          success: true,
          user: masterUser,
          requiresTwoFactor: false,
          message: "Master account authenticated"
        });
      }

      // Regular user authentication
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password (in production, use bcrypt)
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if 2FA is required
      if (user.twoFactorEnabled && !twoFactorCode) {
        return res.json({
          success: false,
          requiresTwoFactor: true,
          message: "Two-factor authentication required"
        });
      }

      // Verify 2FA if provided
      if (user.twoFactorEnabled && twoFactorCode) {
        // In production, verify against actual 2FA secret
        if (twoFactorCode !== "123456") { // Demo code
          return res.status(401).json({ message: "Invalid 2FA code" });
        }
      }

      // Set session
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role || "user",
        permissions: user.permissions || []
      };
      req.session.loginTime = new Date();

      console.log(`🔑 User login successful: ${username}`);
      res.json({
        success: true,
        user: req.session.user,
        requiresTwoFactor: false
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.session.user) {
      res.json({
        authenticated: true,
        user: req.session.user,
        loginTime: req.session.loginTime
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Deal Management Routes
  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await storage.getAllDeals();
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const deal = await storage.getDeal(req.params.id);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      console.error("Error fetching deal:", error);
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const dealData = req.body;
      const deal = await storage.createDeal(dealData);
      res.status(201).json(deal);
    } catch (error) {
      console.error("Error creating deal:", error);
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  app.put("/api/deals/:id", async (req, res) => {
    try {
      const deal = await storage.updateDeal(req.params.id, req.body);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      console.error("Error updating deal:", error);
      res.status(500).json({ message: "Failed to update deal" });
    }
  });

  app.patch("/api/deals/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const deal = await storage.updateDealStatus(req.params.id, status);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      console.error("Error updating deal status:", error);
      res.status(500).json({ message: "Failed to update deal status" });
    }
  });

  app.get("/api/deals/:id/products", async (req, res) => {
    try {
      const products = await storage.getDealProducts(req.params.id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching deal products:", error);
      res.status(500).json({ message: "Failed to fetch deal products" });
    }
  });

  app.post("/api/deals/:id/products", async (req, res) => {
    try {
      const product = await storage.addDealProduct(req.params.id, req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error adding deal product:", error);
      res.status(500).json({ message: "Failed to add deal product" });
    }
  });

  app.get("/api/deals/:id/gross", async (req, res) => {
    try {
      const gross = await storage.getDealGross(req.params.id);
      res.json(gross);
    } catch (error) {
      console.error("Error fetching deal gross:", error);
      res.status(500).json({ message: "Failed to fetch deal gross" });
    }
  });

  app.get("/api/deals/:id/accounting", async (req, res) => {
    try {
      const entries = await storage.getDealAccountingEntries(req.params.id);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching deal accounting entries:", error);
      res.status(500).json({ message: "Failed to fetch deal accounting entries" });
    }
  });

  app.post("/api/deals/:id/finalize", async (req, res) => {
    try {
      const deal = await storage.finalizeDeal(req.params.id);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      console.error("Error finalizing deal:", error);
      res.status(500).json({ message: "Failed to finalize deal" });
    }
  });

  // VIN Decoder route
  app.post("/api/decode-vin", async (req, res) => {
    try {
      const { vin } = req.body;
      if (!vin) {
        return res.status(400).json({ message: "VIN is required" });
      }

      const { decodeVIN } = await import('./services/valuation-service');
      const decodedData = await decodeVIN(vin);
      
      if (!decodedData) {
        return res.status(404).json({ message: "Unable to decode VIN" });
      }

      // Map decoded data to vehicle fields
      const vehicleData = {
        make: decodedData.make,
        model: decodedData.model,
        year: decodedData.year,
        vin: vin.toUpperCase(),
        engine: decodedData.engine,
        transmission: decodedData.transmission,
        fuelType: decodedData.fuelType,
        bodyStyle: decodedData.bodyType,
        doors: decodedData.doors,
        drivetrain: decodedData.drivetrain,
        trim: decodedData.trim
      };

      res.json(vehicleData);
    } catch (error) {
      console.error('VIN decode error:', error);
      res.status(500).json({ message: "Failed to decode VIN" });
    }
  });

  // Real valuation routes using free APIs
  app.get("/api/valuations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      // Import valuation service
      const { getComprehensiveValuation, getQuickValuation } = await import('./services/valuation-service');
      
      let valuationResult;
      
      if (vehicle.vin) {
        // Use VIN for most accurate valuation
        valuationResult = await getComprehensiveValuation(vehicle.vin);
      } else {
        // Fallback to make/model/year valuation
        const quickVal = await getQuickValuation(
          vehicle.make, 
          vehicle.model, 
          vehicle.year, 
          vehicle.mileage || undefined
        );
        valuationResult = {
          vinData: null,
          valuations: quickVal ? [quickVal] : [],
          averageMarketValue: quickVal?.marketValue
        };
      }
      
      // Format response to match existing structure
      const response = {
        vehicleId: id,
        vin: vehicle.vin,
        vinData: valuationResult.vinData,
        sources: valuationResult.valuations,
        summary: {
          averageMarketValue: valuationResult.averageMarketValue,
          recommendedPrice: valuationResult.recommendedPrice,
          currentListPrice: vehicle.price,
          sourcesUsed: valuationResult.valuations.length,
          lastUpdated: new Date().toISOString()
        },
        // Legacy format for compatibility
        kbb: valuationResult.averageMarketValue || vehicle.price,
        mmr: valuationResult.valuations.find(v => v.source === 'VinCheck.info')?.marketValue || vehicle.price,
        blackBook: valuationResult.valuations.find(v => v.source === 'Market Estimation')?.tradeInValue || vehicle.price * 0.85,
        jdPower: valuationResult.recommendedPrice || vehicle.price,
        lastUpdated: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      console.error('Valuation API error:', error);
      res.status(500).json({ message: "Failed to fetch valuations", error: error.message });
    }
  });

  app.post("/api/valuations/refresh/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      // Force refresh from live APIs
      const { getComprehensiveValuation, getQuickValuation } = await import('./services/valuation-service');
      
      let valuationResult;
      
      if (vehicle.vin) {
        console.log(`🔄 Refreshing valuation for VIN: ${vehicle.vin}`);
        valuationResult = await getComprehensiveValuation(vehicle.vin);
      } else {
        console.log(`🔄 Refreshing valuation for ${vehicle.make} ${vehicle.model} ${vehicle.year}`);
        const quickVal = await getQuickValuation(
          vehicle.make, 
          vehicle.model, 
          vehicle.year, 
          vehicle.mileage || undefined
        );
        valuationResult = {
          vinData: null,
          valuations: quickVal ? [quickVal] : [],
          averageMarketValue: quickVal?.marketValue
        };
      }
      
      // Update vehicle's valuation cache in database
      if (valuationResult.averageMarketValue) {
        const valuationData = {
          kbb: valuationResult.averageMarketValue,
          mmr: valuationResult.valuations.find(v => v.source === 'VinCheck.info')?.marketValue,
          blackBook: valuationResult.valuations.find(v => v.source === 'Market Estimation')?.tradeInValue,
          jdPower: valuationResult.recommendedPrice,
          lastUpdated: new Date().toISOString(),
          sources: valuationResult.valuations.map(v => v.source)
        };
        
        await storage.updateVehicle(id, { valuations: valuationData });
        console.log(`✅ Valuation cache updated for vehicle ${id}`);
      }
      
      const response = {
        vehicleId: id,
        vin: vehicle.vin,
        refreshed: true,
        sourcesUsed: valuationResult.valuations.length,
        kbb: valuationResult.averageMarketValue || vehicle.price,
        mmr: valuationResult.valuations.find(v => v.source === 'VinCheck.info')?.marketValue || vehicle.price,
        blackBook: valuationResult.valuations.find(v => v.source === 'Market Estimation')?.tradeInValue || vehicle.price * 0.85,
        jdPower: valuationResult.recommendedPrice || vehicle.price,
        lastUpdated: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      console.error('Valuation refresh error:', error);
      res.status(500).json({ message: "Failed to refresh valuations", error: error.message });
    }
  });

  // Vehicle photo generation route
  app.post("/api/vehicles/:id/photos", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(vehicleId);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const photoService = await import('./services/photo-service');
      const photos = await photoService.generateVehiclePhotos(
        vehicleId, 
        vehicle.make, 
        vehicle.model, 
        vehicle.year
      );

      // Update vehicle with photos
      await storage.updateVehicle(vehicleId, { media: photos });

      res.json({ photos });
    } catch (error) {
      console.error('Error generating vehicle photos:', error);
      res.status(500).json({ message: "Failed to generate photos" });
    }
  });

  // Vehicle pricing update with history tracking
  app.put("/api/vehicles/:id/pricing", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const { price, reason, user } = req.body;
      
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Create price history entry
      const priceHistoryEntry = {
        price: price,
        user: user || 'System',
        timestamp: new Date().toISOString(),
        reason: reason || 'Price update'
      };

      // Add to existing price history or create new array
      const currentPriceHistory = vehicle.priceHistory || [];
      const updatedPriceHistory = [...currentPriceHistory, priceHistoryEntry];

      // Create audit log entry
      const auditLogEntry = {
        user: user || 'System',
        action: `Price updated from $${vehicle.price} to $${price}`,
        timestamp: new Date().toISOString(),
        details: reason
      };

      const currentAuditLogs = vehicle.auditLogs || [];
      const updatedAuditLogs = [...currentAuditLogs, auditLogEntry];

      // Update vehicle with new price and history
      const updatedVehicle = await storage.updateVehicle(vehicleId, {
        price: price,
        priceHistory: updatedPriceHistory,
        auditLogs: updatedAuditLogs
      });

      res.json({
        vehicle: updatedVehicle,
        priceHistory: updatedPriceHistory
      });
    } catch (error) {
      console.error('Error updating vehicle pricing:', error);
      res.status(500).json({ message: "Failed to update pricing" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers", error: error.message });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Customer management sub-routes
  app.get("/api/customers/:id/notes", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const notes = [];
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer notes" });
    }
  });

  app.post("/api/customers/:id/notes", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const note = { id: 1, ...req.body, customerId, createdAt: new Date() };
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.get("/api/customers/:id/calls", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const calls = [];
      res.json(calls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer calls" });
    }
  });

  app.post("/api/customers/:id/calls", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const call = { id: 1, ...req.body, customerId, createdAt: new Date() };
      res.status(201).json(call);
    } catch (error) {
      res.status(400).json({ message: "Invalid call data" });
    }
  });

  app.get("/api/customers/:id/documents", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const documents = [];
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer documents" });
    }
  });

  app.post("/api/customers/:id/documents", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const document = { id: 1, ...req.body, customerId, createdAt: new Date() };
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data" });
    }
  });

  app.get("/api/customers/:id/vehicles-of-interest", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const vehiclesOfInterest = [];
      res.json(vehiclesOfInterest);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles of interest" });
    }
  });

  app.post("/api/customers/:id/vehicles-of-interest", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const vehicleOfInterest = { id: 1, ...req.body, customerId, createdAt: new Date() };
      res.status(201).json(vehicleOfInterest);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle of interest data" });
    }
  });

  // Lead routes
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid lead data" });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(id, validatedData);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid lead data" });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLead(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Sale routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const validatedData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(validatedData);
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid sale data" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // ML Integration endpoints
  app.post("/api/ml/optimize-pricing/:vehicleId", async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const vehicle = await storage.getVehicleById(parseInt(vehicleId));
      
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      // Call ML backend for pricing optimization
      const mlResponse = await fetch('http://localhost:8000/analyze/pricing/' + vehicleId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vehicle.id.toString(),
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage || 0,
          price: vehicle.price,
          category: vehicle.category || 'sedan',
          vin: vehicle.vin,
          stock_number: vehicle.stockNumber || '',
          color: vehicle.color || '',
          transmission: vehicle.transmission || 'automatic',
          fuel_type: vehicle.fuelType || 'gasoline',
          body_style: vehicle.bodyStyle || 'sedan',
          condition: vehicle.condition || 'excellent',
          features: [],
          days_on_lot: vehicle.daysOnLot || 0,
          cost_basis: vehicle.cost || null,
          market_value: vehicle.price
        })
      });

      if (!mlResponse.ok) {
        throw new Error('ML service unavailable');
      }

      const mlData = await mlResponse.json();
      res.json(mlData);
    } catch (error) {
      console.error("Error optimizing pricing:", error);
      res.status(500).json({ error: "Failed to optimize pricing" });
    }
  });

  app.post("/api/ml/optimize-deal", async (req, res) => {
    try {
      const dealData = req.body;
      
      // Call ML backend for deal optimization
      const mlResponse = await fetch('http://localhost:8000/optimize/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      });

      if (!mlResponse.ok) {
        throw new Error('ML service unavailable');
      }

      const mlData = await mlResponse.json();
      res.json(mlData);
    } catch (error) {
      console.error("Error optimizing deal:", error);
      res.status(500).json({ error: "Failed to optimize deal" });
    }
  });

  // Visitor tracking routes
  app.post("/api/tracking/session", async (req, res) => {
    try {
      const validatedData = insertVisitorSessionSchema.parse(req.body);
      const session = await storage.createVisitorSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.put("/api/tracking/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const validatedData = insertVisitorSessionSchema.partial().parse(req.body);
      const session = await storage.updateVisitorSession(sessionId, validatedData);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.get("/api/tracking/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getVisitorSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.get("/api/tracking/sessions", async (req, res) => {
    try {
      const sessions = await storage.getVisitorSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Page view tracking
  app.post("/api/tracking/pageview", async (req, res) => {
    try {
      const validatedData = insertPageViewSchema.parse(req.body);
      const pageView = await storage.createPageView(validatedData);
      res.status(201).json(pageView);
    } catch (error) {
      res.status(400).json({ message: "Invalid page view data" });
    }
  });

  app.get("/api/tracking/pageviews", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      const pageViews = await storage.getPageViews(sessionId);
      res.json(pageViews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch page views" });
    }
  });

  // Customer interaction tracking
  app.post("/api/tracking/interaction", async (req, res) => {
    try {
      const validatedData = insertCustomerInteractionSchema.parse(req.body);
      const interaction = await storage.createCustomerInteraction(validatedData);
      res.status(201).json(interaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid interaction data" });
    }
  });

  app.get("/api/tracking/interactions", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      const interactions = await storage.getCustomerInteractions(sessionId);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  // Customer lifecycle and shopping history
  app.get("/api/customers/:id/lifecycle", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      
      // Get customer's page views and interactions across all sessions
      const pageViews = await storage.getCustomerPageViews(customerId);
      const interactions = await storage.getCustomerInteractionsByCustomerId(customerId);
      const sessions = await storage.getCustomerSessions(customerId);
      
      // Get customer's deals and sales history
      const deals = await storage.getDealsByCustomer(customerId);
      const sales = await storage.getSalesByCustomer(customerId);
      
      const lifecycle = {
        customerId,
        totalSessions: sessions.length,
        totalPageViews: pageViews.length,
        totalInteractions: interactions.length,
        totalDeals: deals.length,
        totalSales: sales.length,
        recentSessions: sessions.slice(0, 10),
        recentPageViews: pageViews.slice(0, 20),
        recentInteractions: interactions.slice(0, 15),
        deals,
        sales,
        shoppingJourney: {
          firstVisit: sessions[0]?.startTime || null,
          lastVisit: sessions[sessions.length - 1]?.endTime || null,
          averageSessionDuration: sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length || 0,
          mostViewedPages: pageViews.reduce((acc, pv) => {
            acc[pv.pagePath] = (acc[pv.pagePath] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          conversionStatus: sales.length > 0 ? 'converted' : deals.length > 0 ? 'in_progress' : 'browsing'
        }
      };
      
      res.json(lifecycle);
    } catch (error) {
      console.error('Customer lifecycle error:', error);
      res.status(500).json({ message: "Failed to fetch customer lifecycle" });
    }
  });

  // Create deal from customer
  app.post("/api/customers/:id/deals", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const customer = await storage.getCustomer(customerId);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const dealData = {
        buyerName: `${customer.firstName} ${customer.lastName}`,
        customerId: customerId,
        dealType: req.body.dealType || 'finance',
        status: 'open',
        salePrice: req.body.salePrice || 0,
        vehicleId: req.body.vehicleId || null,
        salesConsultant: req.body.salesConsultant || 'TBD',
        ...req.body
      };
      
      const deal = await storage.createDeal(dealData);
      res.status(201).json(deal);
    } catch (error) {
      console.error("Error creating deal from customer:", error);
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  // Competitor analytics
  app.post("/api/tracking/competitor", async (req, res) => {
    try {
      const validatedData = insertCompetitorAnalyticsSchema.parse(req.body);
      const analytics = await storage.createCompetitorAnalytics(validatedData);
      res.status(201).json(analytics);
    } catch (error) {
      res.status(400).json({ message: "Invalid competitor analytics data" });
    }
  });

  app.get("/api/tracking/competitor", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      const analytics = await storage.getCompetitorAnalytics(sessionId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch competitor analytics" });
    }
  });

  // Visitor analytics
  app.get("/api/analytics/visitors", async (req, res) => {
    try {
      const analytics = await storage.getVisitorAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visitor analytics" });
    }
  });

  // Competitive pricing routes
  app.post("/api/competitive-pricing", async (req, res) => {
    try {
      const validatedData = insertCompetitivePricingSchema.parse(req.body);
      const pricing = await storage.createCompetitivePricing(validatedData);
      res.status(201).json(pricing);
    } catch (error) {
      res.status(400).json({ message: "Invalid competitive pricing data" });
    }
  });

  app.get("/api/competitive-pricing", async (req, res) => {
    try {
      const filters = {
        make: req.query.make as string,
        model: req.query.model as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        source: req.query.source as string
      };
      const pricing = await storage.getCompetitivePricing(filters);
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch competitive pricing" });
    }
  });

  app.put("/api/competitive-pricing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCompetitivePricingSchema.partial().parse(req.body);
      const pricing = await storage.updateCompetitivePricing(id, validatedData);
      if (!pricing) {
        return res.status(404).json({ message: "Competitive pricing not found" });
      }
      res.json(pricing);
    } catch (error) {
      res.status(400).json({ message: "Invalid competitive pricing data" });
    }
  });

  app.delete("/api/competitive-pricing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCompetitivePricing(id);
      if (!success) {
        return res.status(404).json({ message: "Competitive pricing not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete competitive pricing" });
    }
  });

  // Pricing insights routes
  app.post("/api/pricing-insights", async (req, res) => {
    try {
      const validatedData = insertPricingInsightsSchema.parse(req.body);
      const insights = await storage.createPricingInsights(validatedData);
      res.status(201).json(insights);
    } catch (error) {
      res.status(400).json({ message: "Invalid pricing insights data" });
    }
  });

  app.get("/api/pricing-insights", async (req, res) => {
    try {
      const vehicleId = req.query.vehicleId ? parseInt(req.query.vehicleId as string) : undefined;
      const insights = await storage.getPricingInsights(vehicleId);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pricing insights" });
    }
  });

  app.put("/api/pricing-insights/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPricingInsightsSchema.partial().parse(req.body);
      const insights = await storage.updatePricingInsights(id, validatedData);
      if (!insights) {
        return res.status(404).json({ message: "Pricing insights not found" });
      }
      res.json(insights);
    } catch (error) {
      res.status(400).json({ message: "Invalid pricing insights data" });
    }
  });

  app.delete("/api/pricing-insights/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePricingInsights(id);
      if (!success) {
        return res.status(404).json({ message: "Pricing insights not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete pricing insights" });
    }
  });

  // Merchandising strategies routes
  app.post("/api/merchandising-strategies", async (req, res) => {
    try {
      const validatedData = insertMerchandisingStrategiesSchema.parse(req.body);
      const strategy = await storage.createMerchandisingStrategy(validatedData);
      res.status(201).json(strategy);
    } catch (error) {
      res.status(400).json({ message: "Invalid merchandising strategy data" });
    }
  });

  app.get("/api/merchandising-strategies", async (req, res) => {
    try {
      const vehicleId = req.query.vehicleId ? parseInt(req.query.vehicleId as string) : undefined;
      const strategies = await storage.getMerchandisingStrategies(vehicleId);
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchandising strategies" });
    }
  });

  app.put("/api/merchandising-strategies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMerchandisingStrategiesSchema.partial().parse(req.body);
      const strategy = await storage.updateMerchandisingStrategy(id, validatedData);
      if (!strategy) {
        return res.status(404).json({ message: "Merchandising strategy not found" });
      }
      res.json(strategy);
    } catch (error) {
      res.status(400).json({ message: "Invalid merchandising strategy data" });
    }
  });

  app.delete("/api/merchandising-strategies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMerchandisingStrategy(id);
      if (!success) {
        return res.status(404).json({ message: "Merchandising strategy not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete merchandising strategy" });
    }
  });

  // Market trends routes
  app.post("/api/market-trends", async (req, res) => {
    try {
      const validatedData = insertMarketTrendsSchema.parse(req.body);
      const trend = await storage.createMarketTrend(validatedData);
      res.status(201).json(trend);
    } catch (error) {
      res.status(400).json({ message: "Invalid market trend data" });
    }
  });

  app.get("/api/market-trends", async (req, res) => {
    try {
      const category = req.query.category as string;
      const trends = await storage.getMarketTrends(category);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market trends" });
    }
  });

  app.put("/api/market-trends/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMarketTrendsSchema.partial().parse(req.body);
      const trend = await storage.updateMarketTrend(id, validatedData);
      if (!trend) {
        return res.status(404).json({ message: "Market trend not found" });
      }
      res.json(trend);
    } catch (error) {
      res.status(400).json({ message: "Invalid market trend data" });
    }
  });

  app.delete("/api/market-trends/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMarketTrend(id);
      if (!success) {
        return res.status(404).json({ message: "Market trend not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete market trend" });
    }
  });

  // Scraping and ML Analysis routes
  app.post("/api/scrape-competitive-pricing", async (req, res) => {
    try {
      const { make, model, year } = req.body;
      if (!make || !model || !year) {
        return res.status(400).json({ message: "Make, model, and year are required" });
      }
      const data = await competitiveScraper.scrapeCompetitivePricing(make, model, year);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to scrape competitive pricing" });
    }
  });

  app.post("/api/generate-pricing-insights", async (req, res) => {
    try {
      const { vehicleId, make, model, year, currentPrice, mileage } = req.body;
      if (!vehicleId || !make || !model || !year || !currentPrice) {
        return res.status(400).json({ message: "VehicleId, make, model, year, and currentPrice are required" });
      }
      const insights = await competitiveScraper.generatePricingInsights(
        vehicleId, make, model, year, currentPrice, mileage
      );
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate pricing insights" });
    }
  });

  app.post("/api/generate-merchandising-strategies", async (req, res) => {
    try {
      const { vehicleId, pricingInsights } = req.body;
      if (!vehicleId || !pricingInsights) {
        return res.status(400).json({ message: "VehicleId and pricingInsights are required" });
      }
      await competitiveScraper.generateMerchandisingStrategies(vehicleId, pricingInsights);
      res.status(200).json({ message: "Merchandising strategies generated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate merchandising strategies" });
    }
  });

  app.post("/api/analyze-market-trends", async (req, res) => {
    try {
      await competitiveScraper.analyzeMarketTrends();
      res.status(200).json({ message: "Market trends analyzed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze market trends" });
    }
  });

  // ML Backend Integration Routes
  app.post("/api/ml/predict-price", async (req, res) => {
    try {
      const vehicleData = req.body;
      if (!vehicleData.make || !vehicleData.model || !vehicleData.year) {
        return res.status(400).json({ message: "Make, model, and year are required" });
      }
      
      const prediction = await mlBackend.getPricePrediction(vehicleData);
      res.json(prediction);
    } catch (error) {
      console.error("ML prediction error:", error);
      res.status(500).json({ message: "Failed to generate price prediction" });
    }
  });

  app.get("/api/ml/status", async (req, res) => {
    try {
      const status = await mlBackend.getMLBackendStatus();
      res.json(status);
    } catch (error) {
      console.error("ML status error:", error);
      res.status(500).json({ message: "Failed to get ML backend status" });
    }
  });

  app.post("/api/ml/scrape", async (req, res) => {
    try {
      const result = await mlBackend.runScraping();
      res.json(result);
    } catch (error) {
      console.error("ML scraping error:", error);
      res.status(500).json({ message: "Failed to run ML scraping" });
    }
  });

  app.post("/api/ml/train", async (req, res) => {
    try {
      const result = await mlBackend.runTraining();
      res.json(result);
    } catch (error) {
      console.error("ML training error:", error);
      res.status(500).json({ message: "Failed to run ML training" });
    }
  });

  app.post("/api/ml/start-dashboard", async (req, res) => {
    try {
      const port = req.body.port || 8501;
      await mlBackend.startDashboard(port);
      res.json({ message: `ML Dashboard started on port ${port}` });
    } catch (error) {
      console.error("ML dashboard error:", error);
      res.status(500).json({ message: "Failed to start ML dashboard" });
    }
  });

  // Showroom Session Routes
  app.get("/api/showroom-sessions", async (req, res) => {
    try {
      const date = req.query.date as string;
      const sessions = await storage.getShowroomSessions(date);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching showroom sessions:', error);
      res.status(500).json({ error: 'Failed to fetch showroom sessions' });
    }
  });

  app.get("/api/showroom-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getShowroomSession(id);
      if (!session) {
        return res.status(404).json({ error: 'Showroom session not found' });
      }
      res.json(session);
    } catch (error) {
      console.error('Error fetching showroom session:', error);
      res.status(500).json({ error: 'Failed to fetch showroom session' });
    }
  });

  app.post("/api/showroom-sessions", async (req, res) => {
    try {
      const session = await storage.createShowroomSession(req.body);
      res.json(session);
    } catch (error) {
      console.error('Error creating showroom session:', error);
      res.status(500).json({ error: 'Failed to create showroom session' });
    }
  });

  app.put("/api/showroom-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.updateShowroomSession(id, req.body);
      if (!session) {
        return res.status(404).json({ error: 'Showroom session not found' });
      }
      res.json(session);
    } catch (error) {
      console.error('Error updating showroom session:', error);
      res.status(500).json({ error: 'Failed to update showroom session' });
    }
  });

  app.put("/api/showroom-sessions/:id/end", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { endNotes, endReason } = req.body;
      
      // Get the existing session to preserve notes
      const existingSession = await storage.getShowroomSession(id);
      if (!existingSession) {
        return res.status(404).json({ error: 'Showroom session not found' });
      }

      // Combine existing notes with end visit notes
      let combinedNotes = existingSession.notes || '';
      if (endNotes) {
        combinedNotes += (combinedNotes ? '\n\n' : '') + `End Visit Notes: ${endNotes}`;
      }
      if (endReason) {
        combinedNotes += (combinedNotes ? '\n' : '') + `Visit Outcome: ${endReason}`;
      }

      // Update the session with exit time and notes
      const updateData = {
        timeExited: new Date().toISOString(),
        eventStatus: 'completed' as const,
        notes: combinedNotes,
      };

      const session = await storage.updateShowroomSession(id, updateData);
      res.json(session);
    } catch (error) {
      console.error('Error ending showroom session:', error);
      res.status(500).json({ error: 'Failed to end showroom session' });
    }
  });

  // Quick update showroom session field
  app.put("/api/showroom-sessions/:id/quick-update", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { field, value } = req.body;
      
      console.log('Quick update request received:', { id, field, value, body: req.body });
      
      if (!field || value === undefined) {
        console.log('Bad request - missing field or value:', { field, value });
        return res.status(400).json({ error: 'Field and value are required' });
      }

      const updateData = {
        [field]: value,
      };

      console.log('Updating session with data:', updateData);
      const session = await storage.updateShowroomSession(id, updateData);
      if (!session) {
        console.log('Session not found for id:', id);
        return res.status(404).json({ error: 'Showroom session not found' });
      }
      
      console.log('Session updated successfully:', session);
      res.json(session);
    } catch (error) {
      console.error('Error updating showroom session:', error);
      res.status(500).json({ error: 'Failed to update showroom session' });
    }
  });

  app.delete("/api/showroom-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteShowroomSession(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting showroom session:', error);
      res.status(500).json({ error: 'Failed to delete showroom session' });
    }
  });

  // Deal Desk Routes (Stub implementation)
  app.get("/api/deals", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const deal = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      res.status(201).json(deal);
    } catch (error) {
      res.status(400).json({ message: "Invalid deal data" });
    }
  });

  // Credit Applications endpoints
  app.get('/api/credit-applications/:customerId', async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const applications = await storage.getCreditApplications(customerId);
      res.json(applications);
    } catch (error) {
      console.error('Error fetching credit applications:', error);
      res.status(500).json({ error: 'Failed to fetch credit applications' });
    }
  });

  app.post('/api/credit-applications', async (req, res) => {
    try {
      const application = await storage.createCreditApplication(req.body);
      res.status(201).json(application);
    } catch (error) {
      console.error('Error creating credit application:', error);
      res.status(500).json({ error: 'Failed to create credit application' });
    }
  });

  app.put('/api/credit-applications/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.updateCreditApplication(id, req.body);
      if (!application) {
        return res.status(404).json({ error: 'Credit application not found' });
      }
      res.json(application);
    } catch (error) {
      console.error('Error updating credit application:', error);
      res.status(500).json({ error: 'Failed to update credit application' });
    }
  });

  // Co-Applicants endpoints
  app.get('/api/co-applicants/:customerId', async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const coApplicants = await storage.getCoApplicants(customerId);
      res.json(coApplicants);
    } catch (error) {
      console.error('Error fetching co-applicants:', error);
      res.status(500).json({ error: 'Failed to fetch co-applicants' });
    }
  });

  app.post('/api/co-applicants', async (req, res) => {
    try {
      const coApplicant = await storage.createCoApplicant(req.body);
      res.status(201).json(coApplicant);
    } catch (error) {
      console.error('Error creating co-applicant:', error);
      res.status(500).json({ error: 'Failed to create co-applicant' });
    }
  });

  // Trade Vehicles endpoints
  app.get('/api/trade-vehicles/:customerId', async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const tradeVehicles = await storage.getTradeVehicles(customerId);
      res.json(tradeVehicles);
    } catch (error) {
      console.error('Error fetching trade vehicles:', error);
      res.status(500).json({ error: 'Failed to fetch trade vehicles' });
    }
  });

  app.post('/api/trade-vehicles', async (req, res) => {
    try {
      const tradeVehicle = await storage.createTradeVehicle(req.body);
      res.status(201).json(tradeVehicle);
    } catch (error) {
      console.error('Error creating trade vehicle:', error);
      res.status(500).json({ error: 'Failed to create trade vehicle' });
    }
  });

  app.put('/api/trade-vehicles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tradeVehicle = await storage.updateTradeVehicle(id, req.body);
      if (!tradeVehicle) {
        return res.status(404).json({ error: 'Trade vehicle not found' });
      }
      res.json(tradeVehicle);
    } catch (error) {
      console.error('Error updating trade vehicle:', error);
      res.status(500).json({ error: 'Failed to update trade vehicle' });
    }
  });

  // Showroom Visits endpoints
  app.get('/api/showroom-visits/:customerId', async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const visits = await storage.getShowroomVisits(customerId);
      res.json(visits);
    } catch (error) {
      console.error('Error fetching showroom visits:', error);
      res.status(500).json({ error: 'Failed to fetch showroom visits' });
    }
  });

  app.post('/api/showroom-visits', async (req, res) => {
    try {
      const visit = await storage.createShowroomVisit(req.body);
      res.status(201).json(visit);
    } catch (error) {
      console.error('Error creating showroom visit:', error);
      res.status(500).json({ error: 'Failed to create showroom visit' });
    }
  });

  app.put('/api/showroom-visits/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const visit = await storage.updateShowroomVisit(id, req.body);
      if (!visit) {
        return res.status(404).json({ error: 'Showroom visit not found' });
      }
      res.json(visit);
    } catch (error) {
      console.error('Error updating showroom visit:', error);
      res.status(500).json({ error: 'Failed to update showroom visit' });
    }
  });

  // Salesperson Notes endpoints
  app.get('/api/salesperson-notes/:customerId', async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const notes = await storage.getSalespersonNotes(customerId);
      res.json(notes);
    } catch (error) {
      console.error('Error fetching salesperson notes:', error);
      res.status(500).json({ error: 'Failed to fetch salesperson notes' });
    }
  });

  app.post('/api/salesperson-notes', async (req, res) => {
    try {
      const note = await storage.createSalespersonNote(req.body);
      res.status(201).json(note);
    } catch (error) {
      console.error('Error creating salesperson note:', error);
      res.status(500).json({ error: 'Failed to create salesperson note' });
    }
  });

  app.put('/api/salesperson-notes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.updateSalespersonNote(id, req.body);
      if (!note) {
        return res.status(404).json({ error: 'Salesperson note not found' });
      }
      res.json(note);
    } catch (error) {
      console.error('Error updating salesperson note:', error);
      res.status(500).json({ error: 'Failed to update salesperson note' });
    }
  });

  // Register admin routes
  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
