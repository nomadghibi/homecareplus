import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Calendar,
  DollarSign,
  Shield,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { STRIPE_PRICING, stripeAPI } from '@/api/stripeClient';

export default function SubscriptionManager() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');

  useEffect(() => {
    // Load current subscription from localStorage or API
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const subscription = currentUser.subscription || {
      plan: 'starter',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customerId: null,
      subscriptionId: null
    };

    setCurrentPlan(subscription.plan);
    setSubscriptionStatus(subscription.status);
  }, []);

  const handleUpgrade = (planKey) => {
    // Navigate to checkout page with selected plan
    navigate(createPageUrl('Checkout') + `?plan=${planKey}`);
  };

  const handleManageBilling = async () => {
    setLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const customerId = currentUser.subscription?.customerId;

      if (!customerId) {
        toast.error('No billing account found', {
          description: 'Please subscribe to a plan first'
        });
        setLoading(false);
        return;
      }

      // Create portal session
      const { url, error } = await stripeAPI.createPortalSession(customerId);

      if (error) {
        throw new Error(error);
      }

      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Unable to open billing portal', {
        description: error.message || 'Please try again or contact support'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadgeColor = (planKey) => {
    const colors = {
      starter: 'bg-blue-100 text-blue-700 border-blue-200',
      professional: 'bg-purple-100 text-purple-700 border-purple-200',
      enterprise: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return colors[planKey] || colors.starter;
  };

  const getStatusBadge = () => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Active' },
      trialing: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Trial' },
      past_due: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Past Due' },
      canceled: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Canceled' },
      unpaid: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Unpaid' }
    };

    const status = statusConfig[subscriptionStatus] || statusConfig.active;
    return (
      <Badge className={`${status.color} border`}>
        {status.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      {currentPlan && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Current Plan
                  {getStatusBadge()}
                </CardTitle>
                <CardDescription className="mt-2">
                  Manage your subscription and billing details
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Manage Billing
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${getPlanBadgeColor(currentPlan)} text-lg px-4 py-1`}>
                    {STRIPE_PRICING[currentPlan]?.name || 'Starter'} Plan
                  </Badge>
                  <span className="text-3xl font-bold">
                    ${STRIPE_PRICING[currentPlan]?.price || 49}
                    <span className="text-lg text-slate-500 font-normal">/month</span>
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Renews on: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Visa ending in 4242</span>
                  </div>
                </div>

                {subscriptionStatus === 'past_due' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">Payment Failed</p>
                        <p className="text-xs text-red-700 mt-1">
                          Your last payment failed. Please update your payment method to avoid service interruption.
                        </p>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="mt-3"
                          onClick={handleManageBilling}
                        >
                          Update Payment Method
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Plan Features:</p>
                  <div className="grid gap-2">
                    {STRIPE_PRICING[currentPlan]?.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Upgrade Your Plan</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(STRIPE_PRICING).map(([key, plan]) => {
            const isCurrentPlan = key === currentPlan;
            const isUpgrade = key !== currentPlan;

            return (
              <Card
                key={key}
                className={`relative ${
                  key === 'professional'
                    ? 'border-2 border-purple-300 shadow-lg'
                    : 'border border-slate-200'
                }`}
              >
                {key === 'professional' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-slate-500">/{plan.billingPeriod}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full ${
                      key === 'professional'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : ''
                    }`}
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan}
                    onClick={() => isUpgrade && handleUpgrade(key)}
                  >
                    {isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Security Notice */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">Secure Payment Processing</p>
              <p className="text-xs text-slate-600 mt-1">
                All payments are processed securely through Stripe. We never store your credit card information on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
