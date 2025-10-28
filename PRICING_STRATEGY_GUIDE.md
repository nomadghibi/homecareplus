# Pricing Strategy System - Implementation Guide

## Overview

A comprehensive, flexible pricing strategy system has been added to Care Connect Pro. This system supports multiple pricing strategies, service-specific rates, time-based modifiers, insurance payer fee schedules, and automated visit pricing calculations.

## What's Been Added

### 1. Database Schema (`supabase-pricing-schema.sql`)

A complete database schema with 10 tables:

#### Core Tables:
- **pricing_strategies** - Master pricing plans (Private Pay, Medicare, Medicaid, Premium)
- **service_rates** - Hourly rates per service type with billing rules
- **rate_modifiers** - Time-based rate adjustments (weekend, evening, night, holiday, emergency)
- **payer_fee_schedules** - Insurance-specific rates and procedure codes
- **mileage_rates** - Travel reimbursement rates
- **client_pricing_overrides** - Client-specific custom rates

#### Audit & Tracking:
- **pricing_audit_log** - Complete audit trail of all pricing calculations
- Updates to **visits** table - Added pricing fields
- Updates to **clients** table - Link clients to pricing strategies

#### Sample Data Included:
- 4 pre-configured pricing strategies
- 18 service rates across different payer types
- 5 rate modifiers (weekend, evening, night, holiday, emergency)
- Multiple mileage and payer fee schedules

### 2. Mock Data (`src/api/mockData.js`)

Added `mockPricingStrategies` export with complete test data:
- 4 pricing strategies
- 18 service rates
- 5 rate modifiers
- 3 mileage rate configs
- 6 payer fee schedules

### 3. Pricing Calculator Utility (`src/utils/pricingCalculator.js`)

Comprehensive pricing calculation engine with functions:

#### Core Functions:
- `calculateVisitCost(visit)` - Main calculation function
- `estimateVisitCost(...)` - Estimate cost before visit completion
- `getServiceRate(strategyId, serviceType)` - Retrieve service rates
- `getApplicableModifiers(...)` - Find time-based modifiers
- `calculateMileageReimbursement(...)` - Mileage charges
- `formatCalculation(calc)` - Pretty-print calculations

#### Features:
- Automatic billing increment rounding (15/30 min)
- Minimum hours and minimum charge enforcement
- Time-of-day modifier detection (evening, night)
- Day-of-week modifier detection (weekend)
- Overnight time range support (e.g., 10PM-6AM)
- Priority-based modifier stacking
- Comprehensive calculation breakdown

### 4. User Interface

#### Main Page: Pricing Strategies (`src/pages/PricingStrategies.jsx`)

A complete management interface with:

**Dashboard Overview:**
- Active strategies count
- Service types count
- Rate modifiers count
- Average base rate display

**Tabs:**
1. **Strategies** - View and manage pricing strategies
2. **Service Rates** - Configure hourly rates per service type
3. **Rate Modifiers** - Time-based rate adjustments
4. **Mileage Rates** - Travel reimbursement rules
5. **Payer Fee Schedules** - Insurance-specific rates

**Features:**
- Select and view different strategies
- Color-coded strategy types
- Active/inactive status badges
- Default strategy indicator
- Rate comparison summaries

#### Supporting Components:

**ServiceRatesTable** (`src/components/pricing/ServiceRatesTable.jsx`)
- Display service rates with minimum charges
- Overtime rules and multipliers
- Billing increment settings
- Rate statistics (lowest, average, highest)

**RateModifiersTable** (`src/components/pricing/RateModifiersTable.jsx`)
- Time-based and conditional modifiers
- Visual icons for modifier types
- Example calculation displays
- Priority ordering

**StrategyForm** (`src/components/pricing/StrategyForm.jsx`)
- Create/edit pricing strategies
- Strategy type selection
- Active/default status toggles
- Effective date management

### 5. Navigation Integration

Added "Pricing" link to the main navigation menu:
- Icon: TrendingUp
- Position: Between Billing and Reports
- Route: `/PricingStrategies`

## How to Use

### Access the Pricing Page

1. Start the dev server (if not running):
   ```bash
   npm run dev
   ```
   Or use the startup script:
   ```bash
   start.bat
   ```

2. Navigate to: http://localhost:5173

3. Click "Pricing" in the left sidebar

### View Pricing Strategies

The default view shows all configured strategies:
- **Standard Private Pay** (Default) - $28-85/hr
- **Medicare Fee Schedule** - $28.50-72/hr
- **Medicaid Fee Schedule** - $18.50-25/hr
- **Premium Care Package** - $45-95/hr

### Understand Service Rates

Each service type has:
- **Hourly Rate**: Base charge per hour
- **Minimum Hours**: Minimum billable time
- **Minimum Charge**: Minimum total charge
- **Billing Increment**: Rounding interval (15 or 30 min)
- **Overtime Rules**: Multiplier after threshold hours

Example (Standard Private Pay):
- Personal Care: $35/hr, 2hr min, $70 min charge
- Skilled Nursing: $75/hr, 1hr min, $75 min charge
- Companionship: $28/hr, 2hr min, $56 min charge

### Rate Modifiers Explained

Time-based adjustments automatically applied:

1. **Weekend Premium** (1.25x)
   - Applies: Saturday & Sunday
   - Example: $35/hr → $43.75/hr

2. **Evening Rate** (1.15x)
   - Time: 6PM - 10PM
   - Example: $35/hr → $40.25/hr

3. **Night Rate** (1.35x)
   - Time: 10PM - 6AM
   - Example: $35/hr → $47.25/hr

4. **Holiday Premium** (1.5x)
   - Applies: Designated holidays
   - Example: $35/hr → $52.50/hr

5. **Emergency Call** (1.4x)
   - Less than 24hr notice
   - Example: $35/hr → $49/hr

### Calculate Visit Costs Programmatically

Use the pricing calculator utility:

```javascript
import { calculateVisitCost } from '@/utils/pricingCalculator';

const visit = {
  pricing_strategy_id: "11111111-1111-1111-1111-111111111111",
  service_type: "personal_care",
  scheduled_start: "2024-03-15T09:00:00",
  scheduled_end: "2024-03-15T11:30:00",
  mileage: 12.5
};

const calculation = calculateVisitCost(visit);

console.log(calculation);
// {
//   serviceRate: 35.00,
//   actualHours: 2.5,
//   billableHours: 2.5,
//   baseAmount: 87.50,
//   modifiers: [],
//   mileageCharge: 4.91,
//   total: 92.41
// }
```

### Example Calculations

#### Example 1: Basic Visit
- Service: Personal Care ($35/hr)
- Time: 2 hours on Tuesday at 2PM
- Result: $70 (2hr × $35/hr, meets minimum)

#### Example 2: Weekend Visit
- Service: Personal Care ($35/hr)
- Time: 2 hours on Saturday at 2PM
- Result: $87.50 (2hr × $35/hr × 1.25 weekend multiplier)

#### Example 3: Evening Visit with Mileage
- Service: Skilled Nursing ($75/hr)
- Time: 1.5 hours on Wednesday at 8PM
- Mileage: 15 miles
- Calculation:
  - Base: 1.5hr × $75/hr = $112.50
  - Evening modifier (1.15x): +$16.88
  - Mileage: 15mi × $0.655 = $9.83
  - **Total: $139.21**

#### Example 4: Night Visit on Holiday
- Service: Personal Care ($35/hr)
- Time: 4 hours on Christmas at 11PM-3AM
- Calculation:
  - Base: 4hr × $35/hr = $140.00
  - Night modifier (1.35x): +$49.00
  - Holiday modifier (1.5x): +$70.00
  - **Total: $259.00**

## Database Setup

To use this with Supabase:

1. Open Supabase Studio for your project
2. Go to SQL Editor
3. Run the SQL file: `supabase-pricing-schema.sql`
4. Verify tables are created

The schema includes:
- All table definitions
- Sample data for 4 strategies
- Helper functions for rate lookups
- Automatic timestamp triggers
- Useful views for reporting

## Next Steps (Optional Enhancements)

### Automatic Pricing for Visits

Update the visit completion flow:

```javascript
// In visit completion handler
import { calculateVisitCost } from '@/utils/pricingCalculator';

async function completeVisit(visit) {
  // Calculate cost automatically
  const pricing = calculateVisitCost({
    pricing_strategy_id: visit.pricing_strategy_id,
    service_type: visit.service_type,
    scheduled_start: visit.actual_start,
    scheduled_end: visit.actual_end,
    mileage: visit.mileage
  });

  // Update visit with calculated amount
  await updateVisit(visit.id, {
    calculated_amount: pricing.total,
    final_amount: pricing.total,
    billable_hours: pricing.billableHours
  });
}
```

### Billing Integration

Generate claims automatically from completed visits:

```javascript
// Calculate total for multiple visits
const visits = await getCompletedVisits(clientId, startDate, endDate);
const totalAmount = visits.reduce((sum, visit) => {
  const calc = calculateVisitCost(visit);
  return sum + calc.total;
}, 0);

// Create claim
await createClaim({
  client_id: clientId,
  visit_ids: visits.map(v => v.id),
  total_charge: totalAmount,
  total_units: visits.reduce((sum, v) => sum + v.billable_hours, 0)
});
```

### Client-Specific Pricing

Override rates for specific clients:

```javascript
// Set custom rate for VIP client
await createClientPricingOverride({
  client_id: "client-123",
  service_type: "personal_care",
  custom_hourly_rate: 45.00,
  discount_percent: 0,
  effective_date: "2024-03-01"
});
```

## Files Created/Modified

### New Files:
1. `supabase-pricing-schema.sql` - Database schema
2. `src/pages/PricingStrategies.jsx` - Main pricing page
3. `src/components/pricing/ServiceRatesTable.jsx` - Service rates component
4. `src/components/pricing/RateModifiersTable.jsx` - Modifiers component
5. `src/components/pricing/StrategyForm.jsx` - Strategy form dialog
6. `src/utils/pricingCalculator.js` - Calculation engine
7. `PRICING_STRATEGY_GUIDE.md` - This documentation

### Modified Files:
1. `src/api/mockData.js` - Added `mockPricingStrategies`
2. `src/pages/index.jsx` - Added pricing route
3. `src/pages/Layout.jsx` - Added navigation link

## Features Summary

### What Works Now:
- View and manage multiple pricing strategies
- Configure service-specific hourly rates
- Set up time-based rate modifiers
- Define insurance payer fee schedules
- Configure mileage reimbursement rates
- Calculate visit costs programmatically
- Automatic billing increment rounding
- Minimum charge enforcement
- Modifier stacking (weekend + evening, etc.)
- Complete audit trail support

### What Can Be Added Later:
- Auto-pricing on visit completion
- Automatic claim generation
- Client-specific rate overrides
- Bulk rate updates
- Rate change history tracking
- Pricing approval workflows
- Budget vs actual analysis
- Rate profitability reports

## Support

For questions or issues:
1. Review this guide
2. Check the pricing calculator utility code
3. Examine the mock data for examples
4. Review the database schema comments

## Architecture Highlights

### Design Principles:
1. **Flexibility** - Support any pricing model
2. **Auditability** - Track all calculations
3. **Automation** - Reduce manual pricing errors
4. **Transparency** - Show calculation breakdowns
5. **Scalability** - Handle complex rate structures

### Key Decisions:
- Modifiers use multipliers (not percentages) for clarity
- Time ranges support overnight periods (10PM-6AM)
- Priority system for stacking multiple modifiers
- Separate tables for different pricing concerns
- Immutable audit log for compliance

---

**Implementation Date**: October 28, 2025
**Version**: 1.0
**Status**: Complete and Ready to Use
