/**
 * Pricing Calculator Utility
 *
 * Handles all pricing calculations for visits including:
 * - Base rate calculation
 * - Time-based modifiers (weekend, evening, night, holiday)
 * - Mileage reimbursement
 * - Rounding to billing increments
 * - Minimum charges
 */

import { mockPricingStrategies } from '@/api/mockData';

/**
 * Get service rate for a given pricing strategy and service type
 */
export function getServiceRate(pricingStrategyId, serviceType) {
  return mockPricingStrategies.serviceRates.find(
    sr => sr.pricing_strategy_id === pricingStrategyId &&
          sr.service_type === serviceType
  );
}

/**
 * Get active rate modifiers for a pricing strategy
 */
export function getRateModifiers(pricingStrategyId) {
  return mockPricingStrategies.rateModifiers.filter(
    rm => rm.pricing_strategy_id === pricingStrategyId && rm.is_active
  );
}

/**
 * Get mileage rate for a pricing strategy
 */
export function getMileageRate(pricingStrategyId) {
  return mockPricingStrategies.mileageRates.find(
    mr => mr.pricing_strategy_id === pricingStrategyId
  );
}

/**
 * Check if a date/time falls within a time range
 */
function isWithinTimeRange(dateTime, startTime, endTime) {
  if (!startTime || !endTime) return false;

  const hour = dateTime.getHours();
  const minute = dateTime.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startInMinutes = startHour * 60 + startMin;
  const endInMinutes = endHour * 60 + endMin;

  // Handle overnight time ranges (e.g., 22:00 to 06:00)
  if (endInMinutes < startInMinutes) {
    return timeInMinutes >= startInMinutes || timeInMinutes <= endInMinutes;
  }

  return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
}

/**
 * Check if a modifier applies to a given date/time
 */
function doesModifierApply(modifier, dateTime) {
  // Check day of week
  if (modifier.days_of_week && modifier.days_of_week.length > 0) {
    const dayOfWeek = dateTime.getDay();
    if (!modifier.days_of_week.includes(dayOfWeek)) {
      return false;
    }
  }

  // Check time range
  if (modifier.start_time && modifier.end_time) {
    if (!isWithinTimeRange(dateTime, modifier.start_time, modifier.end_time)) {
      return false;
    }
  }

  return true;
}

/**
 * Get all applicable modifiers for a visit
 */
export function getApplicableModifiers(pricingStrategyId, visitDateTime, serviceType) {
  const allModifiers = getRateModifiers(pricingStrategyId);
  const dateTime = new Date(visitDateTime);

  return allModifiers
    .filter(modifier => {
      // Check if modifier applies to this service type
      if (modifier.applies_to_service_types &&
          modifier.applies_to_service_types.length > 0) {
        if (!modifier.applies_to_service_types.includes(serviceType)) {
          return false;
        }
      }

      // Check if modifier applies to this date/time
      return doesModifierApply(modifier, dateTime);
    })
    .sort((a, b) => b.priority - a.priority); // Higher priority first
}

/**
 * Round hours to billing increment
 */
export function roundToBillingIncrement(hours, incrementMinutes) {
  const totalMinutes = hours * 60;
  const roundedMinutes = Math.ceil(totalMinutes / incrementMinutes) * incrementMinutes;
  return roundedMinutes / 60;
}

/**
 * Calculate base amount for a visit
 */
export function calculateBaseAmount(serviceRate, actualHours) {
  if (!serviceRate) return 0;

  // Round to billing increment
  const billableHours = roundToBillingIncrement(
    actualHours,
    serviceRate.billing_increment_minutes
  );

  // Apply minimum hours
  const hoursToCharge = Math.max(billableHours, serviceRate.minimum_hours || 0);

  // Calculate base amount
  let baseAmount = hoursToCharge * serviceRate.hourly_rate;

  // Apply minimum charge
  baseAmount = Math.max(baseAmount, serviceRate.minimum_charge || 0);

  return {
    billableHours: hoursToCharge,
    hourlyRate: serviceRate.hourly_rate,
    baseAmount: baseAmount
  };
}

/**
 * Apply rate modifiers to base amount
 */
export function applyModifiers(baseAmount, modifiers) {
  let modifiedAmount = baseAmount;
  const appliedModifiers = [];

  for (const modifier of modifiers) {
    let adjustment = 0;

    if (modifier.multiplier) {
      adjustment = baseAmount * (modifier.multiplier - 1);
      modifiedAmount += adjustment;
    } else if (modifier.flat_amount) {
      adjustment = modifier.flat_amount;
      modifiedAmount += adjustment;
    }

    appliedModifiers.push({
      name: modifier.modifier_name,
      type: modifier.modifier_type,
      multiplier: modifier.multiplier,
      flatAmount: modifier.flat_amount,
      adjustment: adjustment
    });
  }

  return {
    modifiedAmount,
    appliedModifiers
  };
}

/**
 * Calculate mileage reimbursement
 */
export function calculateMileageReimbursement(pricingStrategyId, miles) {
  const mileageRate = getMileageRate(pricingStrategyId);
  if (!mileageRate || !miles) return 0;

  // Apply minimum
  if (miles < mileageRate.minimum_billable_miles) {
    return 0;
  }

  // Apply maximum
  let billableMiles = miles;
  if (mileageRate.maximum_billable_miles) {
    billableMiles = Math.min(miles, mileageRate.maximum_billable_miles);
  }

  return billableMiles * mileageRate.rate_per_mile;
}

/**
 * Main function to calculate visit cost
 *
 * @param {Object} visit - Visit object with details
 * @param {string} visit.pricing_strategy_id - Pricing strategy ID
 * @param {string} visit.service_type - Service type (e.g., 'personal_care')
 * @param {Date|string} visit.scheduled_start - Start date/time
 * @param {Date|string} visit.scheduled_end - End date/time
 * @param {number} visit.mileage - Mileage (optional)
 * @returns {Object} Calculation details
 */
export function calculateVisitCost(visit) {
  const {
    pricing_strategy_id,
    service_type,
    scheduled_start,
    scheduled_end,
    mileage = 0
  } = visit;

  // Get service rate
  const serviceRate = getServiceRate(pricing_strategy_id, service_type);
  if (!serviceRate) {
    throw new Error(`No service rate found for strategy ${pricing_strategy_id} and service ${service_type}`);
  }

  // Calculate hours
  const startTime = new Date(scheduled_start);
  const endTime = new Date(scheduled_end);
  const actualHours = (endTime - startTime) / (1000 * 60 * 60);

  if (actualHours <= 0) {
    throw new Error('Invalid visit duration');
  }

  // Calculate base amount
  const baseCalc = calculateBaseAmount(serviceRate, actualHours);

  // Get applicable modifiers
  const applicableModifiers = getApplicableModifiers(
    pricing_strategy_id,
    scheduled_start,
    service_type
  );

  // Apply modifiers
  const modifierCalc = applyModifiers(baseCalc.baseAmount, applicableModifiers);

  // Calculate mileage
  const mileageCharge = calculateMileageReimbursement(pricing_strategy_id, mileage);

  // Calculate total
  const subtotal = modifierCalc.modifiedAmount;
  const total = subtotal + mileageCharge;

  return {
    serviceType: service_type,
    serviceRate: serviceRate.hourly_rate,
    actualHours: actualHours,
    billableHours: baseCalc.billableHours,
    billingIncrement: serviceRate.billing_increment_minutes,
    minimumHours: serviceRate.minimum_hours,
    minimumCharge: serviceRate.minimum_charge,

    baseAmount: baseCalc.baseAmount,

    modifiers: modifierCalc.appliedModifiers,
    modifiersTotal: modifierCalc.modifiedAmount - baseCalc.baseAmount,

    mileage: mileage,
    mileageRate: getMileageRate(pricing_strategy_id)?.rate_per_mile || 0,
    mileageCharge: mileageCharge,

    subtotal: subtotal,
    total: total,

    breakdown: {
      base: baseCalc.baseAmount,
      modifiers: modifierCalc.modifiedAmount - baseCalc.baseAmount,
      mileage: mileageCharge
    }
  };
}

/**
 * Format calculation result for display
 */
export function formatCalculation(calculation) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const lines = [
    `Service: ${calculation.serviceType.replace('_', ' ')}`,
    `Rate: ${formatCurrency(calculation.serviceRate)}/hr`,
    `Hours: ${calculation.actualHours.toFixed(2)} actual, ${calculation.billableHours.toFixed(2)} billable`,
    `Base: ${formatCurrency(calculation.baseAmount)}`,
    ``
  ];

  if (calculation.modifiers.length > 0) {
    lines.push('Modifiers:');
    calculation.modifiers.forEach(mod => {
      lines.push(`  - ${mod.name}: ${formatCurrency(mod.adjustment)}`);
    });
    lines.push('');
  }

  if (calculation.mileageCharge > 0) {
    lines.push(`Mileage: ${calculation.mileage} mi @ ${formatCurrency(calculation.mileageRate)}/mi = ${formatCurrency(calculation.mileageCharge)}`);
    lines.push('');
  }

  lines.push(`TOTAL: ${formatCurrency(calculation.total)}`);

  return lines.join('\n');
}

/**
 * Calculate cost estimate before visit is completed
 */
export function estimateVisitCost(pricingStrategyId, serviceType, estimatedHours, scheduledStart, mileage = 0) {
  const scheduledEnd = new Date(new Date(scheduledStart).getTime() + estimatedHours * 60 * 60 * 1000);

  return calculateVisitCost({
    pricing_strategy_id: pricingStrategyId,
    service_type: serviceType,
    scheduled_start: scheduledStart,
    scheduled_end: scheduledEnd,
    mileage: mileage
  });
}
