import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key is not set. Payment features will not work.');
}

// Initialize Stripe
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Stripe pricing tiers (sync with your Stripe dashboard)
export const STRIPE_PRICING = {
  starter: {
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    name: 'Starter',
    price: 199,
    billingPeriod: 'month',
    features: [
      'Up to 50 clients',
      'Up to 15 caregivers',
      '500 visits/month',
      '5 user accounts',
      '10 GB storage',
      'EVV tracking',
      'Billing & claims',
      'Family portal',
      'Mobile app',
      'Role-based access',
      'Audit logs',
      'Email support'
    ]
  },
  professional: {
    priceId: import.meta.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID,
    name: 'Professional',
    price: 399,
    billingPeriod: 'month',
    features: [
      'Up to 200 clients',
      'Up to 50 caregivers',
      '2,000 visits/month',
      '15 user accounts',
      '50 GB storage',
      'Everything in Starter',
      'Advanced reporting',
      'API access',
      'Multi-location support',
      'Automated scheduling',
      'Payroll integration',
      'Priority support'
    ]
  },
  enterprise: {
    priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
    name: 'Enterprise',
    price: 659,
    billingPeriod: 'month',
    features: [
      'Unlimited clients',
      'Unlimited caregivers',
      'Unlimited visits',
      'Unlimited users',
      'Unlimited storage',
      'Everything in Professional',
      'White-label branding',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom training',
      'SLA guarantee',
      'Advanced security'
    ]
  }
};

// Stripe API helpers
export const stripeAPI = {
  // Create checkout session
  createCheckoutSession: async (priceId, customerEmail, metadata = {}) => {
    try {
      // In production, this should call your backend API
      // For now, return mock data
      console.log('Creating checkout session:', { priceId, customerEmail, metadata });

      // TODO: Replace with actual backend call
      // const response = await fetch('/api/stripe/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId, customerEmail, metadata })
      // });
      // return await response.json();

      return {
        error: 'Backend API not implemented. Please set up Stripe backend endpoints.'
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Create portal session
  createPortalSession: async (customerId) => {
    try {
      console.log('Creating portal session for customer:', customerId);

      // TODO: Replace with actual backend call
      // const response = await fetch('/api/stripe/create-portal-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ customerId })
      // });
      // return await response.json();

      return {
        error: 'Backend API not implemented. Please set up Stripe backend endpoints.'
      };
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  },

  // Get subscription status
  getSubscription: async (subscriptionId) => {
    try {
      // TODO: Replace with actual backend call
      // const response = await fetch(`/api/stripe/subscription/${subscriptionId}`);
      // return await response.json();

      return {
        error: 'Backend API not implemented. Please set up Stripe backend endpoints.'
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    try {
      // TODO: Replace with actual backend call
      // const response = await fetch(`/api/stripe/subscription/${subscriptionId}/cancel`, {
      //   method: 'POST'
      // });
      // return await response.json();

      return {
        error: 'Backend API not implemented. Please set up Stripe backend endpoints.'
      };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionId, newPriceId) => {
    try {
      // TODO: Replace with actual backend call
      // const response = await fetch(`/api/stripe/subscription/${subscriptionId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ newPriceId })
      // });
      // return await response.json();

      return {
        error: 'Backend API not implemented. Please set up Stripe backend endpoints.'
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
};

export default { getStripe, STRIPE_PRICING, stripeAPI };
