import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, STRIPE_PRICING } from '@/api/stripeClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Lock,
  Check,
  ArrowLeft,
  Shield,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// Card element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
  hidePostalCode: false,
};

function CheckoutForm({ selectedPlan }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Form data
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleChange = (field, value) => {
    setBillingDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !cardComplete) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);

      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          phone: billingDetails.phone,
          address: {
            line1: billingDetails.address,
            city: billingDetails.city,
            state: billingDetails.state,
            postal_code: billingDetails.zip,
          },
        },
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      // TODO: Send payment method to your backend to create subscription
      console.log('Payment Method Created:', paymentMethod);

      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save subscription info to user
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.subscription = {
        plan: selectedPlan.id,
        status: 'active',
        paymentMethodId: paymentMethod.id,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      toast.success('Subscription activated!', {
        description: `Welcome to ${selectedPlan.name} plan. Your account is now active.`
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 1500);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      toast.error('Payment failed', {
        description: err.message || 'Please check your card details and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Billing Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={billingDetails.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                disabled={loading}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={billingDetails.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={loading}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={billingDetails.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={loading}
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={billingDetails.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
              disabled={loading}
              placeholder="123 Main St"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={billingDetails.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
                disabled={loading}
                placeholder="New York"
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={billingDetails.state}
                onChange={(e) => handleChange('state', e.target.value)}
                required
                disabled={loading}
                placeholder="NY"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input
                id="zip"
                value={billingDetails.zip}
                onChange={(e) => handleChange('zip', e.target.value)}
                required
                disabled={loading}
                placeholder="10001"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Method
        </h3>
        <div className="p-4 border-2 border-slate-200 rounded-lg bg-white">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardChange}
          />
        </div>
        {error && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Secure Payment</p>
            <p className="text-xs text-blue-700 mt-1">
              Your payment information is encrypted and secure. We use Stripe to process payments and never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || loading || !cardComplete || !billingDetails.name || !billingDetails.email}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay ${selectedPlan.price}/month
          </>
        )}
      </Button>

      <p className="text-xs text-center text-slate-500">
        By confirming your subscription, you allow Care Connect Pro to charge your card for this payment and future payments in accordance with their terms.
      </p>
    </form>
  );
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    // Get plan from URL parameter
    const planId = searchParams.get('plan');
    if (!planId || !STRIPE_PRICING[planId]) {
      toast.error('Invalid plan selected');
      navigate(createPageUrl('Pricing'));
      return;
    }

    setSelectedPlan({
      id: planId,
      ...STRIPE_PRICING[planId]
    });
  }, [searchParams, navigate]);

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Pricing'))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Button>
          <h1 className="text-4xl font-bold text-slate-900">Complete Your Purchase</h1>
          <p className="text-slate-600 mt-2">Start your journey with Care Connect Pro today</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form - Left Side */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="text-2xl">Payment Details</CardTitle>
                <CardDescription>
                  Enter your payment information to activate your subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Elements stripe={getStripe()}>
                  <CheckoutForm selectedPlan={selectedPlan} />
                </Elements>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl sticky top-8">
              <CardHeader className="border-b bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-slate-900">{selectedPlan.name}</span>
                    <Badge className="bg-purple-100 text-purple-700">
                      Popular
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Monthly subscription
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 py-4 border-y border-slate-200">
                  <div className="flex justify-between text-slate-700">
                    <span>Subscription</span>
                    <span className="font-medium">${selectedPlan.price}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Setup Fee</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t">
                    <span>Total Today</span>
                    <span>${selectedPlan.price}.00</span>
                  </div>
                </div>

                {/* Plan Features */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">What's Included:</h4>
                  <div className="space-y-2">
                    {selectedPlan.features.slice(0, 6).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                    {selectedPlan.features.length > 6 && (
                      <p className="text-xs text-slate-500 pl-6">
                        +{selectedPlan.features.length - 6} more features
                      </p>
                    )}
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Cancel anytime</span>
                  </div>
                </div>

                {/* Billing Info */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600">
                    You will be charged <strong>${selectedPlan.price}</strong> today. Your subscription will automatically renew on{' '}
                    <strong>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong> unless cancelled.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonial or Trust Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Join over 1,000+ home care agencies using Care Connect Pro
          </p>
        </div>
      </div>
    </div>
  );
}
