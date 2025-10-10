# Comprehensive Deal Desk - User Guide

## Overview
The Deal Desk is a fully-featured, mobile-optimized deal structuring tool that allows you to create accurate vehicle deals with automatic tax calculations, multiple payment options, and comprehensive financial structuring.

## Key Features

### 1. **Stock Number Lookup**
- Enter any stock number, VIN, or vehicle UUID
- Automatically populates vehicle information and pricing
- Displays year, make, model, and current list price
- Visual confirmation with highlighted vehicle card

### 2. **Automatic Sales Tax & Fees by ZIP Code**
- Enter customer ZIP code
- Automatically determines state
- Loads state-specific:
  - Sales tax rate
  - Title fees
  - Registration fees
- Covers all 50 states with accurate, up-to-date rates

### 3. **Trade-In Management**
- Trade value input
- Trade payoff calculation
- Automatic net equity calculation
- Visual display of net trade equity

### 4. **Customizable Dealer Fees**
- Adjustable dealer documentation fees
- Pre-set to $699 (customizable)
- Included in total price calculation

### 5. **Multiple Payment Options**

#### **Cash Payment**
- Total cash due at delivery
- Includes all taxes and fees
- Down payment option
- Clear visual display

#### **Finance Payment**
- Finance company selection
- Adjustable interest rate (APR)
- Flexible loan terms:
  - 24 months
  - 36 months
  - 48 months
  - 60 months
  - 72 months
  - 84 months
- Down payment options
- Real-time monthly payment calculation
- Amount financed display

#### **Lease Payment**
- Money factor input (with APR conversion)
- Residual value percentage
- Residual dollar amount calculation
- Lease terms:
  - 24 months
  - 36 months
  - 39 months
  - 48 months
- Monthly lease payment calculation

### 6. **Comprehensive Deal Summary**
The right-side summary panel displays:
- Vehicle price
- Sales tax (with rate percentage)
- Title & registration fees
- Dealer doc fee
- Total price
- Trade equity (deducted)
- Down payment (deducted)
- Final payment amount (cash/finance/lease)
- Selected vehicle details
- Customer information

## How to Structure a Deal

### Step 1: Lookup Vehicle
1. Enter stock number in "Stock Number" field
2. Click "Lookup" button
3. Vehicle information auto-populates
4. Vehicle price loads automatically

### Step 2: Set Customer & Tax Information
1. Select customer from dropdown (or enter ZIP manually)
2. Enter customer ZIP code
3. Click "Get Taxes" button
4. State, tax rate, and fees load automatically
5. Verify state is correct (can manually select if needed)

### Step 3: Add Trade-In (Optional)
1. Enter trade-in value
2. Enter payoff amount (if applicable)
3. Net equity calculates automatically

### Step 4: Choose Payment Structure
Select one of three tabs:

#### For Cash Deals:
1. Select "Cash" tab
2. Enter down payment (if any)
3. View total cash due

#### For Finance Deals:
1. Select "Finance" tab
2. Enter down payment
3. Enter finance company name
4. Set interest rate (APR)
5. Select loan term
6. View monthly payment

#### For Lease Deals:
1. Select "Lease" tab
2. Enter money factor (e.g., 0.00125)
3. Set residual percentage (e.g., 60%)
4. Select lease term
5. View monthly lease payment

### Step 5: Review & Save
1. Check deal summary on right panel
2. Verify all calculations
3. Click "Save Deal" to store
4. Click "Print" for customer worksheet

## Mobile Optimization

The Deal Desk is fully responsive and mobile-optimized:

### Mobile Features (Small Screens)
- Single-column layout for easy scrolling
- Large touch-friendly buttons
- Optimized input fields
- Tabbed payment options
- Sticky summary at bottom
- Full-width cards for readability

### Desktop Features (Large Screens)
- 3-column grid layout
- Sticky summary panel (stays visible while scrolling)
- Side-by-side comparison of options
- Larger data display areas
- Enhanced visual hierarchy

## Tax & Fee Database

### Included States (All 50)
The system includes complete tax and fee data for:
- Sales tax rates
- Title fees  
- Registration fees

### State Examples:
- **California**: 7.25% tax, $65 title, $60 registration
- **Texas**: 6.25% tax, $33 title, $50.75 registration
- **Florida**: 6% tax, $75.25 title, $225 registration
- **New York**: 4% tax, $50 title, $32.50 registration

*Note: Local county/city taxes may apply. The system uses state base rates.*

## Finance Calculations

### Finance Formula
```
Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]

Where:
P = Amount Financed
r = Monthly Interest Rate (APR / 12 / 100)
n = Number of Payments
```

### Lease Formula
```
Monthly Payment = Depreciation + Finance Charge

Depreciation = (Vehicle Price - Residual Value) / Lease Term
Finance Charge = (Vehicle Price + Residual Value) × Money Factor
```

## Best Practices

### For Accurate Deals:
1. Always verify vehicle price is current
2. Confirm customer ZIP code for accurate taxes
3. Double-check trade payoff amounts
4. Review finance rates with lender
5. Verify money factor and residual with leasing company

### For Customer Presentation:
1. Start with stock number lookup (builds confidence)
2. Show tax calculation based on their ZIP (transparency)
3. Present all three payment options (choice)
4. Use summary panel to review total deal
5. Print for customer records

## Troubleshooting

### Vehicle Not Found
- Verify stock number is correct
- Try searching by VIN
- Check if vehicle is in inventory system

### State Not Loading from ZIP
- Manually select state from dropdown
- Verify ZIP code is valid
- Check that ZIP is in supported range

### Payment Not Calculating
- Ensure vehicle price > 0
- Verify interest rate is entered for finance
- Check money factor is correct format (0.00XXX)
- Confirm residual is percentage (0-100)

## Future Enhancements

### Planned Features:
- Integration with live tax API (TaxJar/Avalara)
- Lender integration for real-time rates
- Digital signature for deal approval
- Automated document generation
- Deal archiving and retrieval
- Multi-deal comparison
- F&I product integration
- Service contract pricing
- GAP insurance calculations

---

## Technical Details

**Framework**: React with TypeScript
**UI Library**: shadcn/ui with Tailwind CSS
**State Management**: React hooks
**Responsive Design**: Mobile-first approach
**Data Validation**: Real-time calculation updates
**Browser Support**: All modern browsers

**Routes**:
- `/deals` - Main deal desk
- `/finance/structuring` - Alias to deal desk
- `/deal-desk` - Legacy route (redirects)

---

*Last Updated: October 2025*
*AutolytiQ Dealership Management System*
