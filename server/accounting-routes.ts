import { Express } from "express";
import { storage } from "./storage";

export function registerAccountingRoutes(app: Express) {
  
  // Chart of Accounts Routes
  app.get("/api/accounting/chart-of-accounts", async (req, res) => {
    try {
      const accounts = await storage.getChartOfAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching chart of accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounting/chart-of-accounts", async (req, res) => {
    try {
      const account = await storage.createAccount(req.body);
      res.json(account);
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.patch("/api/accounting/chart-of-accounts/:id", async (req, res) => {
    try {
      const account = await storage.updateAccount(req.params.id, req.body);
      res.json(account);
    } catch (error) {
      console.error("Error updating account:", error);
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  // Journal Entries Routes
  app.get("/api/accounting/journal-entries", async (req, res) => {
    try {
      const entries = await storage.getJournalEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/accounting/journal-entries", async (req, res) => {
    try {
      const entry = await storage.createJournalEntry(req.body);
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  // Deal Finalization Routes
  app.post("/api/accounting/finalize-deal/:dealId", async (req, res) => {
    try {
      const dealId = req.params.dealId;
      const finalizationData = req.body;
      
      // Create deal profitability record
      const profitability = await storage.createDealProfitability({
        dealId: parseInt(dealId),
        ...finalizationData
      });
      
      // Create journal entries for the deal
      await storage.createDealJournalEntries(dealId, finalizationData);
      
      // Mark deal as finalized
      await storage.updateDeal(dealId, { status: 'finalized', finalizedAt: new Date() });
      
      res.json(profitability);
    } catch (error) {
      console.error("Error finalizing deal:", error);
      res.status(500).json({ message: "Failed to finalize deal" });
    }
  });

  // Deal Profit Analysis
  app.get("/api/accounting/deal-profit/:dealId", async (req, res) => {
    try {
      const dealId = req.params.dealId;
      const profitAnalysis = await storage.getDealProfitAnalysis(dealId);
      res.json(profitAnalysis);
    } catch (error) {
      console.error("Error fetching deal profit analysis:", error);
      res.status(500).json({ message: "Failed to fetch profit analysis" });
    }
  });

  // Vehicle Profit Analysis
  app.get("/api/accounting/vehicle-profit/:vehicleId", async (req, res) => {
    try {
      const vehicleId = req.params.vehicleId;
      const profitAnalysis = await storage.getVehicleProfitAnalysis(vehicleId);
      res.json(profitAnalysis);
    } catch (error) {
      console.error("Error fetching vehicle profit analysis:", error);
      res.status(500).json({ message: "Failed to fetch vehicle profit analysis" });
    }
  });

  // Trial Balance
  app.get("/api/accounting/trial-balance", async (req, res) => {
    try {
      const trialBalance = await storage.getTrialBalance();
      res.json(trialBalance);
    } catch (error) {
      console.error("Error generating trial balance:", error);
      res.status(500).json({ message: "Failed to generate trial balance" });
    }
  });

  // Account Types
  app.get("/api/accounting/account-types", async (req, res) => {
    try {
      const accountTypes = [
        { id: "asset", name: "Asset", normalBalance: "debit" },
        { id: "liability", name: "Liability", normalBalance: "credit" },
        { id: "equity", name: "Equity", normalBalance: "credit" },
        { id: "revenue", name: "Revenue", normalBalance: "credit" },
        { id: "expense", name: "Expense", normalBalance: "debit" }
      ];
      res.json(accountTypes);
    } catch (error) {
      console.error("Error fetching account types:", error);
      res.status(500).json({ message: "Failed to fetch account types" });
    }
  });

  // Inventory Metrics
  app.get("/api/inventory/metrics", async (req, res) => {
    try {
      const metrics = await storage.getInventoryMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching inventory metrics:", error);
      res.status(500).json({ message: "Failed to fetch inventory metrics" });
    }
  });

  // Vehicle History
  app.get("/api/vehicles/history/:vehicleId", async (req, res) => {
    try {
      const vehicleId = req.params.vehicleId;
      const history = await storage.getVehicleHistory(vehicleId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching vehicle history:", error);
      res.status(500).json({ message: "Failed to fetch vehicle history" });
    }
  });

  // Market Comparison
  app.get("/api/vehicles/market-comparison/:vehicleId", async (req, res) => {
    try {
      const vehicleId = req.params.vehicleId;
      const comparison = await storage.getMarketComparison(vehicleId);
      res.json(comparison);
    } catch (error) {
      console.error("Error fetching market comparison:", error);
      res.status(500).json({ message: "Failed to fetch market comparison" });
    }
  });

  // Update Vehicle Costs
  app.patch("/api/vehicles/:vehicleId/costs", async (req, res) => {
    try {
      const vehicleId = req.params.vehicleId;
      const costData = req.body;
      const vehicle = await storage.updateVehicleCosts(vehicleId, costData);
      res.json(vehicle);
    } catch (error) {
      console.error("Error updating vehicle costs:", error);
      res.status(500).json({ message: "Failed to update vehicle costs" });
    }
  });

  // Update Vehicle Pricing
  app.patch("/api/vehicles/:vehicleId/pricing", async (req, res) => {
    try {
      const vehicleId = req.params.vehicleId;
      const pricingData = req.body;
      const vehicle = await storage.updateVehiclePricing(vehicleId, pricingData);
      res.json(vehicle);
    } catch (error) {
      console.error("Error updating vehicle pricing:", error);
      res.status(500).json({ message: "Failed to update vehicle pricing" });
    }
  });

  // Mark Vehicle Sold
  app.patch("/api/vehicles/:vehicleId/sold", async (req, res) => {
    try {
      const vehicleId = req.params.vehicleId;
      const saleData = req.body;
      const vehicle = await storage.markVehicleSold(vehicleId, saleData);
      res.json(vehicle);
    } catch (error) {
      console.error("Error marking vehicle sold:", error);
      res.status(500).json({ message: "Failed to mark vehicle sold" });
    }
  });

  // Customer Interactions
  app.get("/api/customer-interactions/:customerId", async (req, res) => {
    try {
      const customerId = req.params.customerId;
      const interactions = await storage.getCustomerInteractions(customerId);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching customer interactions:", error);
      res.status(500).json({ message: "Failed to fetch customer interactions" });
    }
  });

  // Customer Deals
  app.get("/api/deals/customer/:customerId", async (req, res) => {
    try {
      const customerId = req.params.customerId;
      const deals = await storage.getCustomerDeals(customerId);
      res.json(deals);
    } catch (error) {
      console.error("Error fetching customer deals:", error);
      res.status(500).json({ message: "Failed to fetch customer deals" });
    }
  });

  // eContract Integration
  app.post("/api/integrations/econtract/push/:dealId", async (req, res) => {
    try {
      const dealId = req.params.dealId;
      
      // Mock eContract push - in production this would integrate with actual eContract API
      const econtractResponse = {
        contractId: `ECON-${dealId}-${Date.now()}`,
        status: "sent",
        sentAt: new Date().toISOString(),
        signatureUrl: `https://econtract.example.com/sign/${dealId}`
      };
      
      // Update deal with eContract information
      await storage.updateDeal(dealId, {
        econtractId: econtractResponse.contractId,
        econtractStatus: econtractResponse.status,
        econtractSentAt: econtractResponse.sentAt
      });
      
      res.json(econtractResponse);
    } catch (error) {
      console.error("Error pushing to eContract:", error);
      res.status(500).json({ message: "Failed to push to eContract" });
    }
  });

  // Financial Reports
  app.get("/api/accounting/reports/income-statement", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const incomeStatement = await storage.generateIncomeStatement(startDate as string, endDate as string);
      res.json(incomeStatement);
    } catch (error) {
      console.error("Error generating income statement:", error);
      res.status(500).json({ message: "Failed to generate income statement" });
    }
  });

  app.get("/api/accounting/reports/balance-sheet", async (req, res) => {
    try {
      const { asOfDate } = req.query;
      const balanceSheet = await storage.generateBalanceSheet(asOfDate as string);
      res.json(balanceSheet);
    } catch (error) {
      console.error("Error generating balance sheet:", error);
      res.status(500).json({ message: "Failed to generate balance sheet" });
    }
  });

  app.get("/api/accounting/reports/cash-flow", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const cashFlow = await storage.generateCashFlowStatement(startDate as string, endDate as string);
      res.json(cashFlow);
    } catch (error) {
      console.error("Error generating cash flow statement:", error);
      res.status(500).json({ message: "Failed to generate cash flow statement" });
    }
  });

  // Monthly Financials
  app.get("/api/accounting/monthly-financials", async (req, res) => {
    try {
      const { month, year } = req.query;
      const monthlyFinancials = await storage.getMonthlyFinancials(
        parseInt(month as string), 
        parseInt(year as string)
      );
      res.json(monthlyFinancials);
    } catch (error) {
      console.error("Error fetching monthly financials:", error);
      res.status(500).json({ message: "Failed to fetch monthly financials" });
    }
  });

  // F&I Product Configurations
  app.get("/api/accounting/fi-products", async (req, res) => {
    try {
      const products = await storage.getFiProductConfigs();
      res.json(products);
    } catch (error) {
      console.error("Error fetching F&I products:", error);
      res.status(500).json({ message: "Failed to fetch F&I products" });
    }
  });

  app.post("/api/accounting/fi-products", async (req, res) => {
    try {
      const product = await storage.createFiProductConfig(req.body);
      res.json(product);
    } catch (error) {
      console.error("Error creating F&I product:", error);
      res.status(500).json({ message: "Failed to create F&I product" });
    }
  });

  // Dashboard Metrics
  app.get("/api/accounting/dashboard-metrics", async (req, res) => {
    try {
      const metrics = await storage.getAccountingDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });
}