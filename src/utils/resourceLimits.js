/**
 * Resource Limit Utilities
 * Handles checking and enforcing subscription-based resource limits
 */

import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

// Plan configurations with resource limits
export const PLAN_LIMITS = {
  starter: {
    name: 'Starter',
    price: 199,
    limits: {
      clients: 50,
      caregivers: 15,
      visits_per_month: 500,
      users: 5,
      storage_gb: 10,
    },
    features: [
      'EVV tracking',
      'Billing & claims',
      'Family portal',
      'Mobile app',
      'Email support'
    ]
  },
  professional: {
    name: 'Professional',
    price: 399,
    limits: {
      clients: 200,
      caregivers: 50,
      visits_per_month: 2000,
      users: 15,
      storage_gb: 50,
    },
    features: [
      'Everything in Starter',
      'Advanced reporting',
      'API access',
      'Multi-location support',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 659,
    limits: {
      clients: 999999,  // Unlimited
      caregivers: 999999,
      visits_per_month: 999999,
      users: 999999,
      storage_gb: 999999,
    },
    features: [
      'Everything in Professional',
      'White-label branding',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 phone support'
    ]
  }
};

/**
 * Check if user can create a resource
 * @param {string} resourceType - Type of resource (clients, caregivers, visits, users)
 * @param {number} increment - Number of resources to add (default: 1)
 * @returns {Promise<{allowed: boolean, current: number, max: number, remaining: number}>}
 */
export async function checkResourceLimit(resourceType, increment = 1) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Call Supabase function to check limit
    const { data, error } = await supabase.rpc('check_resource_limit', {
      p_user_id: user.id,
      p_resource_type: resourceType,
      p_increment: increment
    });

    if (error) {
      console.error('Resource limit check error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to check resource limit:', error);
    // In case of error, allow the action but log it
    return {
      allowed: true,
      current: 0,
      max: 999999,
      remaining: 999999,
      error: error.message
    };
  }
}

/**
 * Increment resource usage count
 * @param {string} resourceType - Type of resource
 * @param {number} increment - Amount to increment (default: 1)
 */
export async function incrementResourceUsage(resourceType, increment = 1) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.rpc('increment_resource_usage', {
      p_user_id: user.id,
      p_resource_type: resourceType,
      p_increment: increment
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to increment resource usage:', error);
    return false;
  }
}

/**
 * Get current subscription details
 * @returns {Promise<Object>} Subscription object
 */
export async function getCurrentSubscription() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return null;
  }
}

/**
 * Check if trial has expired
 * @returns {Promise<{expired: boolean, daysRemaining: number}>}
 */
export async function checkTrialStatus() {
  try {
    const subscription = await getCurrentSubscription();

    if (!subscription || !subscription.is_trial) {
      return { expired: false, daysRemaining: 0, isTrial: false };
    }

    const now = new Date();
    const trialEnd = new Date(subscription.trial_end_date);
    const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));

    return {
      expired: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining),
      isTrial: true,
      trialEndDate: trialEnd
    };
  } catch (error) {
    console.error('Failed to check trial status:', error);
    return { expired: false, daysRemaining: 30, isTrial: true };
  }
}

/**
 * Show limit reached toast notification
 * @param {string} resourceType - Type of resource
 * @param {number} current - Current count
 * @param {number} max - Maximum allowed
 */
export function showLimitReachedNotification(resourceType, current, max) {
  const resourceNames = {
    clients: 'clients',
    caregivers: 'caregivers',
    visits: 'visits',
    users: 'users'
  };

  const resourceName = resourceNames[resourceType] || resourceType;

  toast.error(`Resource limit reached`, {
    description: `You've reached the maximum number of ${resourceName} (${max}) for your current plan. Please upgrade to add more.`,
    action: {
      label: 'Upgrade Plan',
      onClick: () => {
        window.location.href = '/Pricing';
      }
    },
    duration: 8000
  });
}

/**
 * Show trial expiring notification
 * @param {number} daysRemaining - Days until trial expires
 */
export function showTrialExpiringNotification(daysRemaining) {
  if (daysRemaining <= 0) {
    toast.error('Trial expired', {
      description: 'Your 30-day trial has expired. Please upgrade to continue using Care Connect Pro.',
      action: {
        label: 'Upgrade Now',
        onClick: () => {
          window.location.href = '/Pricing';
        }
      },
      duration: 10000
    });
  } else if (daysRemaining <= 7) {
    toast.warning(`Trial ending in ${daysRemaining} days`, {
      description: 'Your trial is ending soon. Upgrade now to continue using all features.',
      action: {
        label: 'View Plans',
        onClick: () => {
          window.location.href = '/Pricing';
        }
      },
      duration: 8000
    });
  }
}

/**
 * Check resource limit before creating entity
 * Use this wrapper in your create functions
 */
export async function withResourceLimitCheck(resourceType, createFunction) {
  const limitCheck = await checkResourceLimit(resourceType);

  if (!limitCheck.allowed) {
    if (limitCheck.trial_ended) {
      showTrialExpiringNotification(0);
      throw new Error('Trial period has expired. Please upgrade to continue.');
    } else {
      showLimitReachedNotification(
        resourceType,
        limitCheck.current,
        limitCheck.max
      );
      throw new Error(`Resource limit reached for ${resourceType}`);
    }
  }

  // Execute the create function
  const result = await createFunction();

  // Increment usage counter after successful creation
  await incrementResourceUsage(resourceType);

  return result;
}

/**
 * Get usage statistics for dashboard
 */
export async function getUsageStats() {
  try {
    const subscription = await getCurrentSubscription();

    if (!subscription) {
      return null;
    }

    return {
      clients: {
        current: subscription.current_clients,
        max: subscription.max_clients,
        percentage: Math.round((subscription.current_clients / subscription.max_clients) * 100)
      },
      caregivers: {
        current: subscription.current_caregivers,
        max: subscription.max_caregivers,
        percentage: Math.round((subscription.current_caregivers / subscription.max_caregivers) * 100)
      },
      visits: {
        current: subscription.current_visits_this_month,
        max: subscription.max_visits_per_month,
        percentage: Math.round((subscription.current_visits_this_month / subscription.max_visits_per_month) * 100)
      },
      users: {
        current: subscription.current_users,
        max: subscription.max_users,
        percentage: Math.round((subscription.current_users / subscription.max_users) * 100)
      },
      storage: {
        current: subscription.current_storage_gb,
        max: subscription.max_storage_gb,
        percentage: Math.round((subscription.current_storage_gb / subscription.max_storage_gb) * 100)
      },
      plan: subscription.plan_name,
      isTrial: subscription.is_trial,
      trialDaysRemaining: subscription.is_trial
        ? Math.max(0, Math.ceil((new Date(subscription.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)))
        : 0
    };
  } catch (error) {
    console.error('Failed to get usage stats:', error);
    return null;
  }
}

export default {
  checkResourceLimit,
  incrementResourceUsage,
  getCurrentSubscription,
  checkTrialStatus,
  showLimitReachedNotification,
  showTrialExpiringNotification,
  withResourceLimitCheck,
  getUsageStats,
  PLAN_LIMITS
};
