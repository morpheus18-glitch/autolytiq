import type { Express } from "express";
import { storage } from "./storage";

export function registerAccountingRoutes(app: Express) {
  // Accounting home overview
  app.get("/api/accounting/home", async (_req, res) => {
    try {
      const lastCloseDate = new Date("2024-05-31T22:15:00.000Z");
      const nextCloseDate = new Date("2024-06-30T22:15:00.000Z");

      const accountingHome = {
        primaryRoute: "/accounting",
        hero: {
          title: "Accounting Control Center",
          subtitle: "Monitor close readiness, compliance tasks, and ledger activity in one workspace.",
        },
        quickLinks: [
          {
            id: "accounting-dashboard",
            label: "Accounting Dashboard",
            description: "Track KPIs, cash positions, and profitability trends in real time.",
            path: "/accounting",
          },
          {
            id: "journal-entries",
            label: "Journal Entries",
            description: "Review drafts, post entries, and reconcile recent transactions.",
            path: "/accounting/journal-entries",
          },
          {
            id: "financial-reports",
            label: "Financial Reports",
            description: "Generate balance sheet, P&L, and cash flow statements for leadership.",
            path: "/accounting/reports",
          },
          {
            id: "payroll-center",
            label: "Payroll Center",
            description: "Validate payroll liabilities and confirm funding before submission.",
            path: "/accounting/payroll",
          },
        ],
        metrics: {
          openTasks: 6,
          pendingApprovals: 3,
          unresolvedAlerts: 2,
          lastCloseDate: lastCloseDate.toISOString(),
          nextCloseDate: nextCloseDate.toISOString(),
        },
        upcoming: [
          {
            id: "state-sales-tax",
            label: "State sales tax filing",
            dueDate: new Date("2024-06-20T17:00:00.000Z").toISOString(),
            status: "AT_RISK" as const,
          },
          {
            id: "month-end-prep",
            label: "June month-end close preparation",
            dueDate: nextCloseDate.toISOString(),
            status: "ON_TRACK" as const,
          },
          {
            id: "quarterly-package",
            label: "Q2 financial package for leadership",
            dueDate: new Date("2024-07-05T17:00:00.000Z").toISOString(),
            status: "PLANNING" as const,
          },
        ],
      };

      res.json({ data: accountingHome });
    } catch (error) {
      console.error("Accounting home error:", error);
      res.status(500).json({ message: "Failed to fetch accounting home overview" });
    }
  });

  // Deal Finalization Endpoint
  app.post("/api/accounting/finalize-deal/:dealId", async (req, res) => {
    try {
      const { dealId } = req.params;
      const finalizationData = req.body;

      // Process deal finalization
      const result = {
        dealId,
        status: "finalized",
        finalizedAt: new Date().toISOString(),
        journalEntries: finalizationData.journalEntries || [],
        financeReserves: finalizationData.financeReserves || {},
        profitCalculation: finalizationData.profitCalculation || {},
        accountingPostings: [
          {
            account: "4100 - Vehicle Sales",
            debit: 0,
            credit: finalizationData.profitCalculation?.total || 0,
            description: `Sale of vehicle - Deal ${dealId}`
          },
          {
            account: "5000 - Cost of Goods Sold", 
            debit: finalizationData.vehicleCost || 0,
            credit: 0,
            description: `Cost of vehicle sold - Deal ${dealId}`
          },
          {
            account: "4200 - F&I Income",
            debit: 0,
            credit: Object.values(finalizationData.financeReserves || {}).reduce((sum: number, val: any) => sum + (val || 0), 0),
            description: `F&I reserves - Deal ${dealId}`
          }
        ]
      };

      res.json(result);
    } catch (error) {
      console.error("Deal finalization error:", error);
      res.status(500).json({ message: "Failed to finalize deal" });
    }
  });

  // Get Accounting Dashboard Data
  app.get("/api/accounting/dashboard", async (req, res) => {
    try {
      const dashboardData = {
        kpis: {
          totalRevenue: {
            current: 2450000,
            previous: 2285000,
            change: 7.2,
            trend: [2100000, 2185000, 2210000, 2330000, 2450000],
          },
          grossProfit: {
            current: 485000,
            previous: 462000,
            change: 5,
            trend: [410000, 425000, 438000, 462000, 485000],
            margin: 19.8,
          },
          netIncome: {
            current: 185000,
            previous: 164000,
            change: 12.8,
            trend: [138000, 147000, 155000, 164000, 185000],
            margin: 7.6,
          },
          operatingExpenses: {
            current: 300000,
            previous: 298000,
            change: 0.7,
            trend: [295000, 296000, 297000, 298000, 300000],
            percentOfRevenue: 52.6,
          },
        },
        revenueChart: [
          { date: "2024-01", revenue: 2120000 },
          { date: "2024-02", revenue: 2185000 },
          { date: "2024-03", revenue: 2260000 },
          { date: "2024-04", revenue: 2335000 },
          { date: "2024-05", revenue: 2450000 },
        ],
        profitBreakdown: [
          { name: "Vehicle Sales", value: 235000, percentage: 48 },
          { name: "F&I Products", value: 110000, percentage: 22 },
          { name: "Service & Parts", value: 82000, percentage: 17 },
          { name: "Protection Plans", value: 38000, percentage: 8 },
          { name: "Other", value: 20000, percentage: 5 },
        ],
        monthlyComparison: [
          { month: "Jan", revenue: 2120000, expenses: 1860000, profit: 260000 },
          { month: "Feb", revenue: 2185000, expenses: 1895000, profit: 290000 },
          { month: "Mar", revenue: 2260000, expenses: 1940000, profit: 320000 },
          { month: "Apr", revenue: 2335000, expenses: 1995000, profit: 340000 },
          { month: "May", revenue: 2450000, expenses: 2035000, profit: 415000 },
          { month: "Jun", revenue: 2485000, expenses: 2050000, profit: 435000 },
        ],
        departmentPerformance: [
          { department: "Sales", revenue: 1480000, cost: 1035000, margin: 30.1 },
          { department: "F&I", revenue: 245000, cost: 68000, margin: 45.7 },
          { department: "Service", revenue: 315000, cost: 198000, margin: 23.0 },
          { department: "Parts", revenue: 215000, cost: 126000, margin: 21.8 },
          { department: "Body Shop", revenue: 150000, cost: 98000, margin: 18.0 },
        ],
        recentTransactions: [
          {
            id: "JE-2024-1847",
            number: "1847",
            date: "2024-05-23",
            description: "Vehicle Sale - 2024 Toyota Camry",
            account: "4100 · Vehicle Sales",
            debit: 0,
            credit: 34500,
          },
          {
            id: "JE-2024-1848",
            number: "1848",
            date: "2024-05-23",
            description: "COGS - Toyota Camry",
            account: "5000 · Cost of Goods Sold",
            debit: 26000,
            credit: 0,
          },
          {
            id: "JE-2024-1850",
            number: "1850",
            date: "2024-05-24",
            description: "F&I Reserve Funding - Ally",
            account: "4200 · F&I Income",
            debit: 0,
            credit: 1250,
          },
          {
            id: "JE-2024-1852",
            number: "1852",
            date: "2024-05-24",
            description: "Payroll Accrual",
            account: "6100 · Salaries & Wages",
            debit: 148000,
            credit: 0,
          },
          {
            id: "JE-2024-1853",
            number: "1853",
            date: "2024-05-25",
            description: "Payroll Clearing",
            account: "2000 · Cash",
            debit: 0,
            credit: 148000,
          },
          {
            id: "JE-2024-1854",
            number: "1854",
            date: "2024-05-25",
            description: "Service Parts Usage",
            account: "6300 · Parts Expense",
            debit: 8200,
            credit: 0,
          },
          {
            id: "JE-2024-1855",
            number: "1855",
            date: "2024-05-26",
            description: "Extended Warranty Claim",
            account: "4300 · Warranty Income",
            debit: 0,
            credit: 980,
          },
          {
            id: "JE-2024-1856",
            number: "1856",
            date: "2024-05-27",
            description: "Insurance Expense",
            account: "6500 · Insurance",
            debit: 4500,
            credit: 0,
          },
          {
            id: "JE-2024-1857",
            number: "1857",
            date: "2024-05-27",
            description: "Floorplan Interest",
            account: "6200 · Floorplan Interest",
            debit: 8200,
            credit: 0,
          },
          {
            id: "JE-2024-1858",
            number: "1858",
            date: "2024-05-28",
            description: "Customer Payment",
            account: "1200 · Accounts Receivable",
            debit: 0,
            credit: 18400,
          },
        ],
      };

      res.json({ data: dashboardData });
    } catch (error) {
      console.error("Dashboard data error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Get Chart of Accounts
  app.get("/api/accounting/chart-of-accounts", async (req, res) => {
    try {
      const chartOfAccounts = [
        // Assets
        { accountNumber: "1000", accountName: "Cash", accountType: "Asset", balance: 485000 },
        { accountNumber: "1100", accountName: "Accounts Receivable", accountType: "Asset", balance: 127000 },
        { accountNumber: "1200", accountName: "Vehicle Inventory", accountType: "Asset", balance: 8750000 },
        { accountNumber: "1300", accountName: "Parts Inventory", accountType: "Asset", balance: 245000 },
        { accountNumber: "1400", accountName: "Equipment", accountType: "Asset", balance: 650000 },
        
        // Liabilities  
        { accountNumber: "2000", accountName: "Accounts Payable", accountType: "Liability", balance: 320000 },
        { accountNumber: "2100", accountName: "Floor Plan Payable", accountType: "Liability", balance: 7850000 },
        { accountNumber: "2200", accountName: "Accrued Expenses", accountType: "Liability", balance: 85000 },
        
        // Revenue
        { accountNumber: "4000", accountName: "New Vehicle Sales", accountType: "Revenue", balance: 18500000 },
        { accountNumber: "4100", accountName: "Used Vehicle Sales", accountType: "Revenue", balance: 6250000 },
        { accountNumber: "4200", accountName: "F&I Income", accountType: "Revenue", balance: 1475000 },
        { accountNumber: "4300", accountName: "Service Revenue", accountType: "Revenue", balance: 850000 },
        { accountNumber: "4400", accountName: "Parts Revenue", accountType: "Revenue", balance: 425000 },
        
        // Expenses
        { accountNumber: "5000", accountName: "Cost of Goods Sold", accountType: "Expense", balance: 21200000 },
        { accountNumber: "6000", accountName: "Salaries & Wages", accountType: "Expense", balance: 2850000 },
        { accountNumber: "6100", accountName: "Commissions", accountType: "Expense", balance: 485000 },
        { accountNumber: "6200", accountName: "Floor Plan Interest", accountType: "Expense", balance: 125000 },
        { accountNumber: "6300", accountName: "Advertising", accountType: "Expense", balance: 185000 },
        { accountNumber: "6400", accountName: "Utilities", accountType: "Expense", balance: 45000 },
        { accountNumber: "6500", accountName: "Insurance", accountType: "Expense", balance: 85000 }
      ];

      res.json(chartOfAccounts);
    } catch (error) {
      console.error("Chart of accounts error:", error);
      res.status(500).json({ message: "Failed to fetch chart of accounts" });
    }
  });

  // Get Financial Reports
  app.get("/api/accounting/reports", async (req, res) => {
    try {
      const { reportType, startDate, endDate } = req.query;
      
      const reports = {
        profit_loss: {
          title: "Profit & Loss Statement", 
          period: `${startDate} to ${endDate}`,
          revenue: {
            newVehicleSales: 18500000,
            usedVehicleSales: 6250000,
            fiIncome: 1475000,
            serviceRevenue: 850000,
            partsRevenue: 425000,
            total: 27500000
          },
          expenses: {
            costOfGoodsSold: 21200000,
            salariesWages: 2850000,
            commissions: 485000,
            floorPlanInterest: 125000,
            advertising: 185000,
            utilities: 45000,
            insurance: 85000,
            total: 24975000
          },
          netIncome: 2525000
        },
        balance_sheet: {
          title: "Balance Sheet",
          asOfDate: endDate,
          assets: {
            currentAssets: {
              cash: 485000,
              accountsReceivable: 127000,
              inventory: 8995000,
              total: 9607000
            },
            fixedAssets: {
              equipment: 650000,
              accumulatedDepreciation: -185000,
              total: 465000
            },
            totalAssets: 10072000
          },
          liabilities: {
            currentLiabilities: {
              accountsPayable: 320000,
              accruedExpenses: 85000,
              total: 405000
            },
            longTermLiabilities: {
              floorPlanPayable: 7850000,
              total: 7850000
            },
            totalLiabilities: 8255000
          },
          equity: {
            retainedEarnings: 1817000,
            totalEquity: 1817000
          }
        },
        cash_flow: {
          title: "Cash Flow Statement",
          period: `${startDate} to ${endDate}`,
          operatingActivities: {
            netIncome: 2525000,
            depreciation: 85000,
            accountsReceivableChange: -25000,
            inventoryChange: -450000,
            accountsPayableChange: 35000,
            netCashFromOperations: 2170000
          },
          investingActivities: {
            equipmentPurchases: -125000,
            netCashFromInvesting: -125000
          },
          financingActivities: {
            floorPlanBorrowing: 1250000,
            floorPlanPayments: -2850000,
            netCashFromFinancing: -1600000
          },
          netCashFlow: 445000
        }
      };

      res.json(reports[reportType as string] || reports.profit_loss);
    } catch (error) {
      console.error("Financial reports error:", error);
      res.status(500).json({ message: "Failed to generate financial reports" });
    }
  });

  // Get Journal Entries
  app.get("/api/accounting/journal-entries", async (req, res) => {
    try {
      const journalEntries = [
        {
          id: "JE-2024-0847",
          date: "2024-01-23",
          reference: "D-2024-1847",
          description: "Sale of 2024 Toyota Camry XLE",
          entries: [
            { account: "1100 - Accounts Receivable", debit: 34500, credit: 0 },
            { account: "4100 - Used Vehicle Sales", debit: 0, credit: 34500 }
          ],
          totalDebit: 34500,
          totalCredit: 34500,
          status: "posted"
        },
        {
          id: "JE-2024-0848", 
          date: "2024-01-23",
          reference: "D-2024-1847",
          description: "Cost of vehicle sold - Toyota Camry",
          entries: [
            { account: "5000 - Cost of Goods Sold", debit: 26000, credit: 0 },
            { account: "1200 - Vehicle Inventory", debit: 0, credit: 26000 }
          ],
          totalDebit: 26000,
          totalCredit: 26000,
          status: "posted"
        },
        {
          id: "JE-2024-0849",
          date: "2024-01-23",
          reference: "D-2024-1847", 
          description: "F&I commission - Extended warranty",
          entries: [
            { account: "1100 - Accounts Receivable", debit: 850, credit: 0 },
            { account: "4200 - F&I Income", debit: 0, credit: 850 }
          ],
          totalDebit: 850,
          totalCredit: 850,
          status: "posted"
        }
      ];

      res.json(journalEntries);
    } catch (error) {
      console.error("Journal entries error:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  // Create Journal Entry
  app.post("/api/accounting/journal-entries", async (req, res) => {
    try {
      const journalEntry = req.body;
      const newEntry = {
        id: `JE-2024-${Date.now()}`,
        date: journalEntry.date || new Date().toISOString().split('T')[0],
        reference: journalEntry.reference,
        description: journalEntry.description,
        entries: journalEntry.entries,
        totalDebit: journalEntry.entries.reduce((sum: number, entry: any) => sum + (entry.debit || 0), 0),
        totalCredit: journalEntry.entries.reduce((sum: number, entry: any) => sum + (entry.credit || 0), 0),
        status: "posted",
        createdAt: new Date().toISOString()
      };

      res.json(newEntry);
    } catch (error) {
      console.error("Create journal entry error:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  // Reconciliation endpoints
  app.get("/api/accounting/reconciliation", async (req, res) => {
    try {
      const reconciliationData = {
        bankAccounts: [
          {
            accountId: "1000",
            accountName: "Operating Account",
            bankBalance: 485250.00,
            bookBalance: 485000.00,
            difference: 250.00,
            lastReconciled: "2024-01-20",
            status: "pending"
          },
          {
            accountId: "1001", 
            accountName: "Floor Plan Account",
            bankBalance: 125000.00,
            bookBalance: 125000.00,
            difference: 0.00,
            lastReconciled: "2024-01-22",
            status: "reconciled"
          }
        ],
        outstandingItems: [
          {
            id: "CHK-8947",
            type: "check",
            date: "2024-01-22",
            description: "Parts supplier payment",
            amount: -850.00,
            status: "outstanding"
          },
          {
            id: "DEP-2847",
            type: "deposit", 
            date: "2024-01-23",
            description: "Customer payment",
            amount: 1100.00,
            status: "in_transit"
          }
        ]
      };

      res.json(reconciliationData);
    } catch (error) {
      console.error("Reconciliation data error:", error);
      res.status(500).json({ message: "Failed to fetch reconciliation data" });
    }
  });

  // Payroll endpoints
  app.get("/api/accounting/payroll", async (req, res) => {
    try {
      const payrollData = {
        currentPeriod: {
          startDate: "2024-01-16",
          endDate: "2024-01-31",
          status: "processing",
          totalGross: 125000,
          totalNet: 98500,
          totalTaxes: 26500,
          employeeCount: 24
        },
        employees: [
          {
            id: "EMP-001",
            name: "Sarah Chen",
            position: "Sales Manager",
            grossPay: 8500,
            commissions: 2400,
            taxes: 2850,
            netPay: 8050,
            hoursWorked: 80
          },
          {
            id: "EMP-002",
            name: "Mike Johnson", 
            position: "Sales Associate",
            grossPay: 4200,
            commissions: 1850,
            taxes: 1575,
            netPay: 4475,
            hoursWorked: 80
          },
          {
            id: "EMP-003",
            name: "Alex Williams",
            position: "F&I Manager",
            grossPay: 7200,
            commissions: 3200,
            taxes: 2750,
            netPay: 7650,
            hoursWorked: 82
          }
        ],
        taxSummary: {
          federalIncome: 15250,
          stateIncome: 4850,
          socialSecurity: 4200,
          medicare: 1200,
          unemployment: 1000
        }
      };

      res.json(payrollData);
    } catch (error) {
      console.error("Payroll data error:", error);
      res.status(500).json({ message: "Failed to fetch payroll data" });
    }
  });

  // Transaction history
  app.get("/api/accounting/transactions", async (req, res) => {
    try {
      const { startDate, endDate, accountId, transactionType } = req.query;
      
      const transactions = [
        {
          id: "TXN-2024-8947",
          date: "2024-01-23",
          account: "4100 - Used Vehicle Sales",
          description: "Vehicle Sale - 2024 Toyota Camry XLE",
          reference: "D-2024-1847",
          debit: 0,
          credit: 34500,
          balance: 6284500,
          type: "journal_entry"
        },
        {
          id: "TXN-2024-8948",
          date: "2024-01-23", 
          account: "5000 - Cost of Goods Sold",
          description: "Cost of vehicle sold",
          reference: "D-2024-1847",
          debit: 26000,
          credit: 0,
          balance: 21226000,
          type: "journal_entry"
        },
        {
          id: "TXN-2024-8949",
          date: "2024-01-23",
          account: "4200 - F&I Income", 
          description: "Extended warranty commission",
          reference: "D-2024-1847",
          debit: 0,
          credit: 850,
          balance: 1475850,
          type: "journal_entry"
        },
        {
          id: "TXN-2024-8950",
          date: "2024-01-22",
          account: "1000 - Cash",
          description: "Customer payment - Check #8472",
          reference: "PAY-8472",
          debit: 5500,
          credit: 0,
          balance: 485000,
          type: "bank_deposit"
        },
        {
          id: "TXN-2024-8951",
          date: "2024-01-22",
          account: "2000 - Accounts Payable",
          description: "Parts supplier payment",
          reference: "CHK-8947",
          debit: 850,
          credit: 0,
          balance: 319150,
          type: "check"
        }
      ];

      // Filter transactions based on query parameters
      let filteredTransactions = transactions;
      
      if (accountId) {
        filteredTransactions = filteredTransactions.filter(t => t.account.includes(accountId as string));
      }
      
      if (transactionType) {
        filteredTransactions = filteredTransactions.filter(t => t.type === transactionType);
      }

      res.json({
        transactions: filteredTransactions,
        summary: {
          totalTransactions: filteredTransactions.length,
          totalDebits: filteredTransactions.reduce((sum, t) => sum + t.debit, 0),
          totalCredits: filteredTransactions.reduce((sum, t) => sum + t.credit, 0),
          dateRange: { startDate, endDate }
        }
      });
    } catch (error) {
      console.error("Transaction history error:", error);
      res.status(500).json({ message: "Failed to fetch transaction history" });
    }
  });

  // Accounting alias (redirects to dashboard)
  app.get("/api/accounting", async (req, res) => {
    try {
      const dashboardData = {
        monthlyRevenue: 2450000,
        totalProfit: 485000,
        activeDeals: 84,
        pendingFinalization: 12
      };
      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounting data" });
    }
  });

  // Accounting dashboard metrics
  app.get("/api/accounting/dashboard/metrics", async (req, res) => {
    try {
      const metrics = {
        monthlyMetrics: {
          salesRevenue: 2450000,
          costOfSales: 1965000,
          grossProfit: 485000,
          fiIncome: 147000,
          totalProfit: 632000,
          profitMargin: 25.8
        },
        yearToDateMetrics: {
          totalSales: 24750000,
          totalProfit: 6385000,
          avgDealProfit: 5247,
          avgFiIncome: 1285,
          unitsRetailed: 1247
        },
        cashFlow: {
          operatingCash: 385000,
          investingCash: -125000,
          financingCash: -75000,
          netCashFlow: 185000
        }
      };
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });
}