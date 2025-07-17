import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertCustomerSchema, insertLeadSchema, insertSaleSchema, insertVisitorSessionSchema, insertPageViewSchema, insertCustomerInteractionSchema, insertCompetitorAnalyticsSchema, insertCompetitivePricingSchema, insertPricingInsightsSchema, insertMerchandisingStrategiesSchema, insertMarketTrendsSchema } from "@shared/schema";
import { competitiveScraper } from "./services/competitive-scraper";
import { registerAdminRoutes } from "./admin-routes";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
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

  // Register admin routes
  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
