import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerUserRoutes } from "./userRoutes";
import { storage } from "./storage";
import { insertVehicleSchema, insertCustomerSchema, insertLeadSchema, insertSaleSchema, insertVisitorSessionSchema, insertPageViewSchema, insertCustomerInteractionSchema, insertCompetitorAnalyticsSchema, insertCompetitivePricingSchema, insertPricingInsightsSchema, insertMerchandisingStrategiesSchema, insertMarketTrendsSchema } from "@shared/schema";
import { competitiveScraper } from "./services/competitive-scraper";
import { registerAdminRoutes } from "./admin-routes";
import { decodeVINHandler } from "./services/vin-decoder";
import { mlBackend } from "./ml-integration";
import { valuationService } from './services/valuation-service';
import { photoService } from './services/photo-service';
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";

// XML Lead parsing utility
function parseXmlLead(xmlString: string) {
  try {
    // Simple XML parsing for demo - in production would use proper XML parser
    const customerName = xmlString.match(/<Name>(.*?)<\/Name>/)?.[1] || '';
    const email = xmlString.match(/<Email>(.*?)<\/Email>/)?.[1] || '';
    const phone = xmlString.match(/<Phone>(.*?)<\/Phone>/)?.[1] || '';
    const year = xmlString.match(/<Year>(.*?)<\/Year>/)?.[1] || '';
    const make = xmlString.match(/<Make>(.*?)<\/Make>/)?.[1] || '';
    const model = xmlString.match(/<Model>(.*?)<\/Model>/)?.[1] || '';
    const trim = xmlString.match(/<Trim>(.*?)<\/Trim>/)?.[1] || '';
    const comments = xmlString.match(/<Comments>(.*?)<\/Comments>/)?.[1] || '';
    
    // Format phone number
    const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    
    return {
      customerName,
      customerEmail: email,
      customerPhone: formattedPhone,
      interestedIn: `${year} ${make} ${model}`.trim(),
      vehicleOfInterest: `${year} ${make} ${model} ${trim}`.trim(),
      message: comments,
      appointmentRequested: xmlString.includes('<RequestDate>'),
      financingPreferred: comments.toLowerCase().includes('financing'),
      tradeInVehicle: xmlString.includes('<TradeIn>') ? 'Trade-in available' : null
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    return {
      customerName: 'Unknown',
      customerEmail: '',
      customerPhone: '',
      interestedIn: '',
      message: 'XML parsing error'
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Register explicit OAuth routes FIRST before any other middleware
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log("Registering Google OAuth routes in main router");
    
    // Direct route registration to ensure highest priority
    app.get("/api/auth/google", (req, res) => {
      console.log("Direct Google OAuth route hit");
      const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${encodeURIComponent('https://autolytiq.com/api/auth/google/callback')}&scope=profile%20email&client_id=${process.env.GOOGLE_CLIENT_ID}`;
      console.log("Redirecting to:", redirectUrl);
      res.redirect(redirectUrl);
    });
    
    app.get("/api/auth/google/callback", async (req, res) => {
      console.log("Direct Google OAuth callback hit");
      console.log("Query params:", req.query);
      
      const { code, error } = req.query;
      
      if (error) {
        console.error("Google OAuth error:", error);
        return res.redirect("/login?error=oauth_failed");
      }
      
      if (!code) {
        console.error("No authorization code received");
        return res.redirect("/login?error=no_code");
      }
      
      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            code: code as string,
            grant_type: 'authorization_code',
            redirect_uri: 'https://autolytiq.com/api/auth/google/callback',
          }),
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
          console.error("Failed to get access token:", tokenData);
          return res.redirect("/login?error=token_failed");
        }
        
        // Get user info from Google
        const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
        const userData = await userResponse.json();
        
        console.log("Google user data:", userData);
        
        // Create user session (simplified for testing)
        const user = {
          id: `google_${userData.id}`,
          email: userData.email,
          firstName: userData.given_name,
          lastName: userData.family_name,
          profileImageUrl: userData.picture,
          provider: 'google'
        };
        
        // Store in session
        (req.session as any).user = user;
        
        console.log("Google OAuth successful, redirecting to dashboard");
        res.redirect("/");
        
      } catch (error) {
        console.error("Google OAuth callback error:", error);
        res.redirect("/login?error=callback_failed");
      }
    });
  }

  // Auth middleware
  await setupAuth(app);
  
  // System user management routes
  registerUserRoutes(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check both Passport authentication and direct session
      const passportUser = req.user;
      const sessionUser = (req.session as any)?.user;
      
      const user = passportUser || sessionUser;
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Handle different authentication formats
      let userId: string;
      let userData: any;
      
      if (sessionUser) {
        // Direct session authentication (like our Google OAuth)
        userId = sessionUser.id;
        userData = sessionUser;
      } else if (user.provider === 'replit') {
        userId = user.claims?.sub;
        userData = user;
      } else {
        userId = user.id || user.claims?.sub;
        userData = user;
      }

      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      // Try to get user from storage, if not found use session data
      let dbUser;
      try {
        dbUser = await storage.getUser(userId);
      } catch (error) {
        console.log("User not in storage, using session data");
      }
      
      if (!dbUser && sessionUser) {
        // Return session user data directly for OAuth users not yet in storage
        res.json({
          id: sessionUser.id,
          email: sessionUser.email,
          firstName: sessionUser.firstName,
          lastName: sessionUser.lastName,
          profileImageUrl: sessionUser.profileImageUrl,
          provider: sessionUser.provider
        });
        return;
      }
      
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
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

  // Get single customer by ID
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
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

  // Create demo pixel tracking data endpoint
  app.post("/api/customers/:id/demo-tracking", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      
      // Create demo session for customer
      const demoSessionId = `demo_session_${customerId}_${Date.now()}`;
      
      const demoSession = await storage.createVisitorSession({
        sessionId: demoSessionId,
        userId: customerId.toString(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.100',
        referrer: 'https://google.com',
        landingPage: '/',
        startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        lastActivity: new Date(),
        sessionDuration: 45 * 60, // 45 minutes
        pageViews: 12,
        deviceType: 'desktop',
        browser: 'Chrome',
        screenResolution: '1920x1080',
        language: 'en-US',
        timezone: 'America/New_York'
      });

      // Create demo page views
      const demoPages = [
        { url: '/', title: 'AutolytiQ - Home', timeOnPage: 180 },
        { url: '/inventory', title: 'Vehicle Inventory', timeOnPage: 420 },
        { url: '/vehicles/1', title: '2023 Honda Accord', timeOnPage: 300 },
        { url: '/vehicles/3', title: '2024 Toyota Camry', timeOnPage: 240 },
        { url: '/contact', title: 'Contact Us', timeOnPage: 150 },
      ];

      for (let i = 0; i < demoPages.length; i++) {
        const page = demoPages[i];
        await storage.createPageView({
          sessionId: demoSessionId,
          pageUrl: page.url,
          pageTitle: page.title,
          userId: customerId.toString(),
          timestamp: new Date(Date.now() - (40 - i * 5) * 60 * 1000),
          timeOnPage: page.timeOnPage,
          deviceType: 'desktop',
          exitPage: i === demoPages.length - 1
        });
      }

      // Create demo interactions
      const demoInteractions = [
        { type: 'vehicle_view', vehicleId: '1', description: 'Viewed 2023 Honda Accord details' },
        { type: 'button_click', elementId: 'contact-btn', description: 'Clicked Contact Dealer button' },
        { type: 'vehicle_view', vehicleId: '3', description: 'Viewed 2024 Toyota Camry details' },
        { type: 'form_field_focus', elementId: 'email-input', description: 'Started filling contact form' },
        { type: 'phone_click', data: { phoneNumber: '(555) 123-4567' }, description: 'Clicked dealer phone number' }
      ];

      for (let i = 0; i < demoInteractions.length; i++) {
        const interaction = demoInteractions[i];
        await storage.createCustomerInteraction({
          sessionId: demoSessionId,
          customerId: customerId.toString(),
          interactionType: interaction.type,
          timestamp: new Date(Date.now() - (35 - i * 5) * 60 * 1000),
          elementId: interaction.elementId || null,
          vehicleId: interaction.vehicleId || null,
          data: interaction.data || { description: interaction.description }
        });
      }

      res.json({ 
        success: true, 
        message: 'Demo tracking data created',
        sessionId: demoSessionId,
        pageViews: demoPages.length,
        interactions: demoInteractions.length
      });
    } catch (error) {
      console.error('Demo tracking data creation error:', error);
      res.status(500).json({ message: "Failed to create demo tracking data" });
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
      
      // Create timeline events from all activities
      const timelineEvents: any[] = [];

      // Add page views as events
      pageViews.forEach((pv: any) => {
        timelineEvents.push({
          type: 'page_view',
          timestamp: pv.createdAt,
          pageTitle: pv.pageTitle,
          pageUrl: pv.pageUrl,
          timeOnPage: pv.timeOnPage,
          deviceType: pv.deviceType || 'unknown',
          metadata: {
            scrollDepth: pv.scrollDepth,
            exitPage: pv.exitPage
          }
        });
      });

      // Add customer interactions as events
      interactions.forEach((interaction: any) => {
        const vehicleInfo = interaction.vehicleId ? `Vehicle ${interaction.vehicleId}` : null;
        timelineEvents.push({
          type: interaction.interactionType,
          timestamp: interaction.createdAt,
          vehicleInfo,
          elementId: interaction.elementId,
          data: interaction.data,
          metadata: interaction
        });
      });

      // Add deals as events
      deals.forEach((deal: any) => {
        timelineEvents.push({
          type: 'deal_created',
          timestamp: deal.createdAt,
          vehicleInfo: deal.vehicleDetails,
          amount: deal.salePrice,
          salesperson: deal.salesConsultant,
          metadata: deal
        });
      });

      // Add sales as events
      sales.forEach((sale: any) => {
        timelineEvents.push({
          type: 'sale_completed',
          timestamp: sale.createdAt,
          vehicleInfo: sale.vehicleDetails,
          amount: sale.finalPrice,
          salesperson: sale.salesConsultant,
          metadata: sale
        });
      });

      // Sort events by timestamp (newest first)
      timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const lifecycle = {
        customerId,
        totalEvents: timelineEvents.length,
        stats: {
          totalSessions: sessions.length,
          totalPageViews: pageViews.length,
          totalInteractions: interactions.length,
          totalDeals: deals.length,
          totalSales: sales.length,
          vehicleViews: interactions.filter((i: any) => i.interactionType === 'vehicle_view').length,
          avgSessionDuration: sessions.reduce((acc, s) => acc + (s.sessionDuration || 0), 0) / sessions.length || 0,
          conversionStatus: sales.length > 0 ? 'converted' : deals.length > 0 ? 'in_progress' : 'browsing'
        },
        events: timelineEvents,
        recentSessions: sessions.slice(0, 10),
        shoppingJourney: {
          firstVisit: sessions[0]?.createdAt || null,
          lastVisit: sessions[sessions.length - 1]?.lastActivity || null,
          averageSessionDuration: sessions.reduce((acc, s) => acc + (s.sessionDuration || 0), 0) / sessions.length || 0,
          mostViewedPages: pageViews.reduce((acc, pv) => {
            acc[pv.pageUrl] = (acc[pv.pageUrl] || 0) + 1;
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

  // XML Lead Processing Routes
  app.get("/api/xml-leads", async (req, res) => {
    try {
      // Mock XML leads for demo - in production would fetch from database
      const mockXmlLeads = [
        {
          id: 1,
          customerName: "John Smith",
          customerEmail: "john.smith@email.com",
          customerPhone: "(555) 123-4567",
          interestedIn: "2023 Honda Civic",
          status: "new",
          priority: "high",
          source: "AutoTrader",
          leadType: "inquiry",
          vehicleOfInterest: "2023 Honda Civic LX",
          appointmentRequested: true,
          createdAt: "2025-01-21T14:30:00Z",
          rawXml: `<?xml version="1.0" encoding="UTF-8"?>
<ADF>
  <Prospect>
    <Customer>
      <Name>John Smith</Name>
      <Email>john.smith@email.com</Email>
      <Phone>5551234567</Phone>
    </Customer>
    <Vehicle interest="buy" status="new">
      <Year>2023</Year>
      <Make>Honda</Make>
      <Model>Civic</Model>
      <Trim>LX</Trim>
    </Vehicle>
    <Comments>Looking for financing options. Interested in test drive this weekend.</Comments>
  </Prospect>
</ADF>`
        }
      ];
      res.json(mockXmlLeads);
    } catch (error) {
      console.error("Error fetching XML leads:", error);
      res.status(500).json({ message: "Failed to fetch XML leads" });
    }
  });

  app.post("/api/xml-leads", async (req, res) => {
    try {
      const { rawXml, source } = req.body;
      
      // Parse XML and extract lead information
      const parsedLead = parseXmlLead(rawXml);
      
      // Mock response - in production would save to database
      const lead = {
        id: Date.now(),
        ...parsedLead,
        rawXml,
        source: source || 'Unknown',
        status: 'new',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString()
      };
      
      res.status(201).json(lead);
    } catch (error) {
      console.error("Error processing XML lead:", error);
      res.status(500).json({ message: "Failed to process XML lead" });
    }
  });

  // Lead Distribution Rules Routes
  app.get("/api/lead-distribution-rules", async (req, res) => {
    try {
      // Mock distribution rules for demo
      const mockRules = [
        {
          id: 1,
          ruleName: "High Priority AutoTrader",
          source: "AutoTrader",
          leadType: "inquiry",
          priority: "high",
          vehicleType: "new",
          assignmentMethod: "skill_based",
          assignToRole: "Senior Sales Rep",
          maxLeadsPerUser: 5,
          businessHoursOnly: true,
          weekendsIncluded: false,
          isActive: true,
          createdAt: "2025-01-21T08:00:00Z"
        }
      ];
      res.json(mockRules);
    } catch (error) {
      console.error("Error fetching distribution rules:", error);
      res.status(500).json({ message: "Failed to fetch distribution rules" });
    }
  });

  app.post("/api/lead-distribution-rules", async (req, res) => {
    try {
      // Mock response - in production would save to database
      const rule = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating distribution rule:", error);
      res.status(500).json({ message: "Failed to create distribution rule" });
    }
  });

  // Lead Sources API
  app.get("/api/lead-sources", async (req, res) => {
    try {
      // Mock lead sources for demo
      const mockSources = [
        {
          id: 1,
          name: "AutoTrader",
          type: "xml_feed",
          isActive: true,
          apiEndpoint: "https://api.autotrader.com/leads",
          xmlFormat: "adf",
          defaultPriority: "high",
          averageLeadsPerDay: 45,
          conversionRate: 12.5
        },
        {
          id: 2,
          name: "Cars.com",
          type: "xml_feed", 
          isActive: true,
          apiEndpoint: "https://api.cars.com/leads",
          xmlFormat: "adf",
          defaultPriority: "medium",
          averageLeadsPerDay: 32,
          conversionRate: 10.8
        },
        {
          id: 3,
          name: "Website Forms",
          type: "web_form",
          isActive: true,
          defaultPriority: "medium",
          averageLeadsPerDay: 18,
          conversionRate: 22.3
        }
      ];
      res.json(mockSources);
    } catch (error) {
      console.error("Error fetching lead sources:", error);
      res.status(500).json({ message: "Failed to fetch lead sources" });
    }
  });

  app.post("/api/lead-sources", async (req, res) => {
    try {
      // Mock response for demo
      const newSource = {
        id: Math.floor(Math.random() * 10000),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      res.status(201).json(newSource);
    } catch (error) {
      console.error("Error creating lead source:", error);
      res.status(500).json({ message: "Failed to create lead source" });
    }
  });

  // System Configuration Routes
  app.get("/api/system-settings", async (req, res) => {
    try {
      // Mock system settings for demo
      const mockSettings = {
        general: {
          defaultTimeZone: "America/New_York",
          defaultCurrency: "USD",
          businessHours: {
            start: "08:00",
            end: "18:00",
            workDays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
          }
        },
        leadDefaults: {
          defaultPriority: "medium",
          autoAssignment: true,
          followUpDays: 3,
          maxLeadsPerRep: 10,
          distributionMethod: "round_robin"
        },
        salesConfig: {
          requireManagerApproval: true,
          discountLimit: 15,
          holdPeriod: 24,
          financingRequired: false,
          tradeInRequired: false
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          reminderHours: [24, 4, 1]
        },
        roleHierarchy: {
          autoEscalation: true,
          escalationTime: 2,
          managerOverride: true,
          departmentIsolation: false
        }
      };
      res.json(mockSettings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.put("/api/system-settings", async (req, res) => {
    try {
      // Mock response - in production would save to database
      const updatedSettings = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating system settings:", error);
      res.status(500).json({ message: "Failed to update system settings" });
    }
  });

  // System Roles Routes
  app.get("/api/system-roles", async (req, res) => {
    try {
      // Mock system roles for demo
      const mockRoles = [
        {
          id: 1,
          name: "super_admin",
          displayName: "Super Administrator",
          description: "Full system access with all administrative privileges",
          permissions: ["*"],
          hierarchy: 100,
          isSystem: true,
          userCount: 2,
          createdAt: "2025-01-21T08:00:00Z"
        },
        {
          id: 2,
          name: "sales_manager",
          displayName: "Sales Manager",
          description: "Manages sales team, leads, and deals",
          permissions: ["leads.view", "leads.assign", "deals.edit", "reports.view", "team.manage"],
          hierarchy: 80,
          isSystem: false,
          userCount: 3,
          createdAt: "2025-01-20T14:30:00Z"
        }
      ];
      res.json(mockRoles);
    } catch (error) {
      console.error("Error fetching system roles:", error);
      res.status(500).json({ message: "Failed to fetch system roles" });
    }
  });

  app.post("/api/system-roles", async (req, res) => {
    try {
      // Mock response - in production would save to database
      const role = {
        id: Date.now(),
        ...req.body,
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating system role:", error);
      res.status(500).json({ message: "Failed to create system role" });
    }
  });

  // Register admin routes
  registerAdminRoutes(app);

  // Import and use notification routes
  const notificationRoutes = (await import('./notificationRoutes')).default;
  app.use('/api/notifications', isAuthenticated, notificationRoutes);

  // Communication API Routes - Text Messages
  app.get('/api/customers/:id/messages', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const result = await db.execute({
        sql: 'SELECT * FROM text_messages WHERE customer_id = ? ORDER BY created_at DESC',
        args: [customerId]
      });
      res.json(result.rows || []);
    } catch (error) {
      console.error('Error fetching text messages:', error);
      res.status(500).json({ error: 'Failed to fetch text messages' });
    }
  });

  app.post('/api/customers/:id/messages', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const { direction, phoneNumber, messageBody, messageType = 'sms', senderId } = req.body;
      
      const result = await db.execute({
        sql: `INSERT INTO text_messages 
              (customer_id, sender_id, direction, phone_number, message_body, message_type, status, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, 'sent', NOW()) RETURNING *`,
        args: [customerId, senderId, direction, phoneNumber, messageBody, messageType]
      });
      
      res.status(201).json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error sending text message:', error);
      res.status(500).json({ error: 'Failed to send text message' });
    }
  });

  // Showroom session routes
  app.get("/api/showroom/sessions", async (req, res) => {
    try {
      // Mock showroom sessions data for now
      const mockSessions = [
        {
          id: 'session-1',
          customerId: 1,
          status: 'active',
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          salesConsultant: 'Mike Johnson',
          interestLevel: 'high',
          vehiclesViewed: ['2024 Toyota Camry', '2024 Honda Accord'],
          notes: 'Very interested in hybrid options, discussing financing',
          estimatedValue: 28000,
          nextAction: 'Schedule test drive',
          customerName: 'John Smith'
        },
        {
          id: 'session-2',
          customerId: 2,
          status: 'active',
          startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          salesConsultant: 'Sarah Wilson',
          interestLevel: 'medium',
          vehiclesViewed: ['2023 Ford F-150'],
          notes: 'Looking for work truck, price sensitive',
          estimatedValue: 35000,
          nextAction: 'Review trade-in value',
          customerName: 'David Johnson'
        },
        {
          id: 'session-3',
          customerId: 8,
          status: 'active',
          startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          salesConsultant: 'Tom Mitchell',
          interestLevel: 'high',
          vehiclesViewed: ['2024 Lexus RX'],
          notes: 'Ready to purchase, just finalizing details',
          estimatedValue: 52000,
          nextAction: 'Complete paperwork',
          customerName: 'Maria Garcia'
        },
        {
          id: 'session-4',
          customerId: 3,
          status: 'completed',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          salesConsultant: 'David Chen',
          interestLevel: 'high',
          vehiclesViewed: ['2024 BMW X5', '2024 Audi Q7'],
          notes: 'Completed visit, scheduling follow-up',
          estimatedValue: 65000,
          nextAction: 'Follow up tomorrow',
          customerName: 'Robert Williams'
        },
        {
          id: 'session-5',
          customerId: 5,
          status: 'completed',
          startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          salesConsultant: 'Jennifer Walsh',
          interestLevel: 'medium',
          vehiclesViewed: ['2024 Subaru Outback'],
          notes: 'Customer needs time to think',
          estimatedValue: 32000,
          nextAction: 'Call back in 3 days',
          customerName: 'Lisa Brown'
        },
        {
          id: 'session-6',
          customerId: 4,
          status: 'sold',
          startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
          salesConsultant: 'Lisa Rodriguez',
          interestLevel: 'high',
          vehiclesViewed: ['2024 Mercedes C-Class'],
          notes: 'SOLD! Customer purchased Mercedes C-Class',
          estimatedValue: 45000,
          nextAction: 'Schedule delivery',
          customerName: 'Michael Davis'
        },
        {
          id: 'session-7',
          customerId: 6,
          status: 'sold',
          startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          salesConsultant: 'Mark Stevens',
          interestLevel: 'high',
          vehiclesViewed: ['2024 Chevrolet Silverado'],
          notes: 'SOLD! Excellent deal on Silverado',
          estimatedValue: 38000,
          nextAction: 'Delivery scheduled for Friday',
          customerName: 'Jennifer Wilson'
        }
      ];
      
      res.json(mockSessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch showroom sessions" });
    }
  });

  app.patch("/api/showroom/sessions/:id", async (req, res) => {
    try {
      const sessionId = req.params.id;
      const updateData = req.body;
      
      console.log(`Updating showroom session ${sessionId}:`, updateData);
      
      // Mock response for now - in production this would update the database
      res.json({ 
        id: sessionId, 
        ...updateData,
        updated: true 
      });
    } catch (error) {
      console.error('Error updating showroom session:', error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.post("/api/showroom/sessions/:id/close", async (req, res) => {
    try {
      const sessionId = req.params.id;
      
      console.log(`Closing showroom session ${sessionId}`);
      
      // Mock response for now - in production this would update the database
      res.json({ 
        id: sessionId, 
        status: 'completed',
        endTime: new Date().toISOString(),
        closed: true 
      });
    } catch (error) {
      console.error('Error closing showroom session:', error);
      res.status(500).json({ message: "Failed to close session" });
    }
  });

  // Communication API Routes - Phone Calls
  app.get('/api/customers/:id/calls', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const result = await db.execute({
        sql: 'SELECT * FROM phone_calls WHERE customer_id = ? ORDER BY created_at DESC',
        args: [customerId]
      });
      res.json(result.rows || []);
    } catch (error) {
      console.error('Error fetching phone calls:', error);
      res.status(500).json({ error: 'Failed to fetch phone calls' });
    }
  });

  app.post('/api/customers/:id/calls', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const { 
        direction, phoneNumber, status, duration, callNotes, 
        followUpRequired = false, followUpDate, callPurpose, outcome, userId 
      } = req.body;
      
      const result = await db.execute({
        sql: `INSERT INTO phone_calls 
              (customer_id, user_id, direction, phone_number, status, duration, call_notes, 
               follow_up_required, follow_up_date, call_purpose, outcome, started_at, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) RETURNING *`,
        args: [customerId, userId, direction, phoneNumber, status, duration, callNotes, 
               followUpRequired, followUpDate, callPurpose, outcome]
      });
      
      res.status(201).json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error logging phone call:', error);
      res.status(500).json({ error: 'Failed to log phone call' });
    }
  });

  // Message Templates
  app.get('/api/message-templates', async (req, res) => {
    try {
      const { category } = req.query;
      let sql = 'SELECT * FROM message_templates WHERE is_active = true';
      const args = [];
      
      if (category) {
        sql += ' AND category = ?';
        args.push(category);
      }
      
      sql += ' ORDER BY name';
      
      const result = await db.execute({ sql, args });
      res.json(result.rows || []);
    } catch (error) {
      console.error('Error fetching message templates:', error);
      res.status(500).json({ error: 'Failed to fetch message templates' });
    }
  });

  app.post('/api/message-templates', async (req, res) => {
    try {
      const { name, category, subject, body, variables, createdBy } = req.body;
      
      const result = await db.execute({
        sql: `INSERT INTO message_templates 
              (name, category, subject, body, variables, created_by, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW()) RETURNING *`,
        args: [name, category, subject, body, JSON.stringify(variables || {}), createdBy]
      });
      
      res.status(201).json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error creating message template:', error);
      res.status(500).json({ error: 'Failed to create message template' });
    }
  });

  // Communication Settings
  app.get('/api/communication-settings', async (req, res) => {
    try {
      const { category } = req.query;
      let sql = 'SELECT * FROM communication_settings WHERE is_active = true';
      const args = [];
      
      if (category) {
        sql += ' AND category = ?';
        args.push(category);
      }
      
      sql += ' ORDER BY category, setting_key';
      
      const result = await db.execute({ sql, args });
      res.json(result.rows || []);
    } catch (error) {
      console.error('Error fetching communication settings:', error);
      res.status(500).json({ error: 'Failed to fetch communication settings' });
    }
  });

  app.post('/api/communication-settings', async (req, res) => {
    try {
      const { settingKey, settingValue, displayName, description, category, dataType, isRequired } = req.body;
      
      const result = await db.execute({
        sql: `INSERT INTO communication_settings 
              (setting_key, setting_value, display_name, description, category, data_type, is_required, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) 
              ON CONFLICT (setting_key) DO UPDATE SET 
              setting_value = EXCLUDED.setting_value, 
              display_name = EXCLUDED.display_name,
              description = EXCLUDED.description,
              updated_at = NOW() 
              RETURNING *`,
        args: [settingKey, JSON.stringify(settingValue), displayName, description, category, dataType, isRequired]
      });
      
      res.status(201).json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error saving communication setting:', error);
      res.status(500).json({ error: 'Failed to save communication setting' });
    }
  });

  // Advanced Enterprise Features API Routes

  // Customer 360° Intelligence
  app.get('/api/customers/:id/timeline', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const timeline = await storage.getCustomerTimeline(customerId);
      res.json(timeline);
    } catch (error) {
      console.error('Error fetching customer timeline:', error);
      res.status(500).json({ message: 'Failed to fetch customer timeline' });
    }
  });

  app.post('/api/customers/timeline', async (req, res) => {
    try {
      const timelineEvent = await storage.createCustomerTimelineEvent(req.body);
      res.json(timelineEvent);
    } catch (error) {
      console.error('Error creating timeline event:', error);
      res.status(500).json({ message: 'Failed to create timeline event' });
    }
  });

  // AI-Powered Decision Support
  app.get('/api/ai-insights/:entityType?/:entityId?', async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const insights = await storage.getAiInsights(entityType, entityId ? parseInt(entityId) : undefined);
      res.json(insights);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      res.status(500).json({ message: 'Failed to fetch AI insights' });
    }
  });

  app.post('/api/ai-insights', async (req, res) => {
    try {
      const insight = await storage.createAiInsight(req.body);
      res.json(insight);
    } catch (error) {
      console.error('Error creating AI insight:', error);
      res.status(500).json({ message: 'Failed to create AI insight' });
    }
  });

  app.patch('/api/ai-insights/:id/review', async (req, res) => {
    try {
      const insightId = parseInt(req.params.id);
      const { status, reviewedBy } = req.body;
      const updatedInsight = await storage.updateAiInsightStatus(insightId, status, reviewedBy);
      res.json(updatedInsight);
    } catch (error) {
      console.error('Error updating insight status:', error);
      res.status(500).json({ message: 'Failed to update insight status' });
    }
  });

  // Real-Time Collaboration
  app.get('/api/collaboration/threads', async (req, res) => {
    try {
      const { entityType, entityId } = req.query;
      const threads = await storage.getCollaborationThreads(
        entityType as string, 
        entityId ? parseInt(entityId as string) : undefined
      );
      res.json(threads);
    } catch (error) {
      console.error('Error fetching collaboration threads:', error);
      res.status(500).json({ message: 'Failed to fetch collaboration threads' });
    }
  });

  app.post('/api/collaboration/threads', async (req, res) => {
    try {
      const thread = await storage.createCollaborationThread(req.body);
      res.json(thread);
    } catch (error) {
      console.error('Error creating collaboration thread:', error);
      res.status(500).json({ message: 'Failed to create collaboration thread' });
    }
  });

  app.get('/api/collaboration/messages/:threadId', async (req, res) => {
    try {
      const threadId = parseInt(req.params.threadId);
      const messages = await storage.getCollaborationMessages(threadId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching collaboration messages:', error);
      res.status(500).json({ message: 'Failed to fetch collaboration messages' });
    }
  });

  app.post('/api/collaboration/messages', async (req, res) => {
    try {
      const message = await storage.createCollaborationMessage(req.body);
      res.json(message);
    } catch (error) {
      console.error('Error creating collaboration message:', error);
      res.status(500).json({ message: 'Failed to create collaboration message' });
    }
  });

  // Advanced Analytics & KPIs
  app.get('/api/kpi-metrics', async (req, res) => {
    try {
      const { metricType, period } = req.query;
      const metrics = await storage.getKpiMetrics(metricType as string, period as string);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching KPI metrics:', error);
      res.status(500).json({ message: 'Failed to fetch KPI metrics' });
    }
  });

  app.post('/api/kpi-metrics', async (req, res) => {
    try {
      const metric = await storage.createKpiMetric(req.body);
      res.json(metric);
    } catch (error) {
      console.error('Error creating KPI metric:', error);
      res.status(500).json({ message: 'Failed to create KPI metric' });
    }
  });

  // Smart Deduplication System
  app.get('/api/duplicate-customers', async (req, res) => {
    try {
      const { status } = req.query;
      const duplicates = await storage.getDuplicateCustomers(status as string);
      res.json(duplicates);
    } catch (error) {
      console.error('Error fetching duplicate customers:', error);
      res.status(500).json({ message: 'Failed to fetch duplicate customers' });
    }
  });

  app.post('/api/duplicate-customers', async (req, res) => {
    try {
      const duplicate = await storage.createDuplicateCustomerDetection(req.body);
      res.json(duplicate);
    } catch (error) {
      console.error('Error creating duplicate customer detection:', error);
      res.status(500).json({ message: 'Failed to create duplicate customer detection' });
    }
  });

  // Workflow Automation System
  app.get('/api/workflow-templates', async (req, res) => {
    try {
      const templates = await storage.getWorkflowTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching workflow templates:', error);
      res.status(500).json({ message: 'Failed to fetch workflow templates' });
    }
  });

  app.post('/api/workflow-templates', async (req, res) => {
    try {
      const template = await storage.createWorkflowTemplate(req.body);
      res.json(template);
    } catch (error) {
      console.error('Error creating workflow template:', error);
      res.status(500).json({ message: 'Failed to create workflow template' });
    }
  });

  app.get('/api/workflow-executions', async (req, res) => {
    try {
      const { templateId } = req.query;
      const executions = await storage.getWorkflowExecutions(
        templateId ? parseInt(templateId as string) : undefined
      );
      res.json(executions);
    } catch (error) {
      console.error('Error fetching workflow executions:', error);
      res.status(500).json({ message: 'Failed to fetch workflow executions' });
    }
  });

  app.post('/api/workflow-executions', async (req, res) => {
    try {
      const execution = await storage.createWorkflowExecution(req.body);
      res.json(execution);
    } catch (error) {
      console.error('Error creating workflow execution:', error);
      res.status(500).json({ message: 'Failed to create workflow execution' });
    }
  });

  // Predictive Analytics
  app.get('/api/predictive-scores', async (req, res) => {
    try {
      const { entityType, entityId, scoreType } = req.query;
      const scores = await storage.getPredictiveScores(
        entityType as string,
        entityId ? parseInt(entityId as string) : undefined,
        scoreType as string
      );
      res.json(scores);
    } catch (error) {
      console.error('Error fetching predictive scores:', error);
      res.status(500).json({ message: 'Failed to fetch predictive scores' });
    }
  });

  app.post('/api/predictive-scores', async (req, res) => {
    try {
      const score = await storage.createPredictiveScore(req.body);
      res.json(score);
    } catch (error) {
      console.error('Error creating predictive score:', error);
      res.status(500).json({ message: 'Failed to create predictive score' });
    }
  });

  // Market Benchmarking
  app.get('/api/market-benchmarks', async (req, res) => {
    try {
      const { metricName, timeframe } = req.query;
      const benchmarks = await storage.getMarketBenchmarks(metricName as string, timeframe as string);
      res.json(benchmarks);
    } catch (error) {
      console.error('Error fetching market benchmarks:', error);
      res.status(500).json({ message: 'Failed to fetch market benchmarks' });
    }
  });

  app.post('/api/market-benchmarks', async (req, res) => {
    try {
      const benchmark = await storage.createMarketBenchmark(req.body);
      res.json(benchmark);
    } catch (error) {
      console.error('Error creating market benchmark:', error);
      res.status(500).json({ message: 'Failed to create market benchmark' });
    }
  });

  // Additional convenience endpoints for enterprise features
  app.get('/api/customers/recent', async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      // Return recent 10 customers sorted by creation date
      const recent = customers.slice(0, 10);
      res.json(recent);
    } catch (error) {
      console.error('Error fetching recent customers:', error);
      res.status(500).json({ message: 'Failed to fetch recent customers' });
    }
  });

  app.get('/api/deals/active', async (req, res) => {
    try {
      const deals = await storage.getAllDeals();
      // Filter active deals
      const active = deals.filter((deal: any) => deal.status === 'pending' || deal.status === 'in_progress');
      res.json(active);
    } catch (error) {
      console.error('Error fetching active deals:', error);
      res.status(500).json({ message: 'Failed to fetch active deals' });
    }
  });

  app.get('/api/ai-insights/urgent', async (req, res) => {
    try {
      const insights = await storage.getAiInsights();
      // Filter urgent insights
      const urgent = insights.filter((insight: any) => 
        insight.status === 'pending' && insight.confidence > 0.8
      );
      res.json(urgent);
    } catch (error) {
      console.error('Error fetching urgent insights:', error);
      res.status(500).json({ message: 'Failed to fetch urgent insights' });
    }
  });

  app.get('/api/collaboration/recent-activity', async (req, res) => {
    try {
      const threads = await storage.getCollaborationThreads();
      // Return recent activity from threads
      const recentActivity = threads
        .filter((thread: any) => thread.status === 'active')
        .slice(0, 5);
      res.json(recentActivity);
    } catch (error) {
      console.error('Error fetching recent collaboration activity:', error);
      res.status(500).json({ message: 'Failed to fetch recent collaboration activity' });
    }
  });

  // ============================================
  // F&I (Finance & Insurance) Routes
  // ============================================

  // Credit pull routes
  app.get('/api/fi/credit-pulls', async (req, res) => {
    try {
      const creditPulls = await storage.getCreditPulls();
      res.json(creditPulls);
    } catch (error) {
      console.error('Error fetching credit pulls:', error);
      res.status(500).json({ message: 'Failed to fetch credit pulls' });
    }
  });

  app.get('/api/fi/credit-pulls/:id', async (req, res) => {
    try {
      const creditPull = await storage.getCreditPull(parseInt(req.params.id));
      if (!creditPull) {
        return res.status(404).json({ message: 'Credit pull not found' });
      }
      res.json(creditPull);
    } catch (error) {
      console.error('Error fetching credit pull:', error);
      res.status(500).json({ message: 'Failed to fetch credit pull' });
    }
  });

  app.post('/api/fi/credit-pulls', async (req, res) => {
    try {
      const creditPull = await storage.createCreditPull(req.body);
      res.status(201).json(creditPull);
    } catch (error) {
      console.error('Error creating credit pull:', error);
      res.status(500).json({ message: 'Failed to create credit pull' });
    }
  });

  app.put('/api/fi/credit-pulls/:id', async (req, res) => {
    try {
      const creditPull = await storage.updateCreditPull(parseInt(req.params.id), req.body);
      if (!creditPull) {
        return res.status(404).json({ message: 'Credit pull not found' });
      }
      res.json(creditPull);
    } catch (error) {
      console.error('Error updating credit pull:', error);
      res.status(500).json({ message: 'Failed to update credit pull' });
    }
  });

  // Lender application routes
  app.get('/api/fi/lender-applications', async (req, res) => {
    try {
      const applications = await storage.getLenderApplications();
      res.json(applications);
    } catch (error) {
      console.error('Error fetching lender applications:', error);
      res.status(500).json({ message: 'Failed to fetch lender applications' });
    }
  });

  app.post('/api/fi/lender-applications', async (req, res) => {
    try {
      const application = await storage.createLenderApplication(req.body);
      res.status(201).json(application);
    } catch (error) {
      console.error('Error creating lender application:', error);
      res.status(500).json({ message: 'Failed to create lender application' });
    }
  });

  // F&I Product routes
  app.get('/api/fi/products', async (req, res) => {
    try {
      const products = await storage.getFiProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching F&I products:', error);
      res.status(500).json({ message: 'Failed to fetch F&I products' });
    }
  });

  app.post('/api/fi/products', async (req, res) => {
    try {
      const product = await storage.createFiProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating F&I product:', error);
      res.status(500).json({ message: 'Failed to create F&I product' });
    }
  });

  // Finance menu routes
  app.get('/api/fi/finance-menus', async (req, res) => {
    try {
      const menus = await storage.getFinanceMenus();
      res.json(menus);
    } catch (error) {
      console.error('Error fetching finance menus:', error);
      res.status(500).json({ message: 'Failed to fetch finance menus' });
    }
  });

  app.post('/api/fi/finance-menus', async (req, res) => {
    try {
      const menu = await storage.createFinanceMenu(req.body);
      res.status(201).json(menu);
    } catch (error) {
      console.error('Error creating finance menu:', error);
      res.status(500).json({ message: 'Failed to create finance menu' });
    }
  });

  // F&I Audit log routes
  app.get('/api/fi/audit-logs', async (req, res) => {
    try {
      const { entityType, entityId } = req.query;
      const logs = await storage.getFiAuditLogs(
        entityType as string,
        entityId ? parseInt(entityId as string) : undefined
      );
      res.json(logs);
    } catch (error) {
      console.error('Error fetching F&I audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch F&I audit logs' });
    }
  });

  app.post('/api/fi/audit-logs', async (req, res) => {
    try {
      const log = await storage.createFiAuditLog(req.body);
      res.status(201).json(log);
    } catch (error) {
      console.error('Error creating F&I audit log:', error);
      res.status(500).json({ message: 'Failed to create F&I audit log' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
