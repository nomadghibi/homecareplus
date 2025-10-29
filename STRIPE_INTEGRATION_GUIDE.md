# Stripe Integration Guide

## Table of Contents
1. [Setup](#setup)
2. [Environment Variables](#environment-variables)
3. [Backend API Endpoints](#backend-api-endpoints)
4. [Webhook Handler](#webhook-handler)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)

---

## Setup

### 1. Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Verify your business information
3. Get your API keys from the Dashboard

### 2. Create Products and Prices
In your Stripe Dashboard:
1. Go to **Products** → **Add Product**
2. Create three products:
   - **Starter** - $49/month
   - **Professional** - $149/month
   - **Enterprise** - $299/month
3. Copy the **Price ID** for each product (starts with `price_...`)

---

## Environment Variables

Create a `.env` file in your project root:

```env
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key

# Stripe Webhook Secret (get from https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Price IDs (get from Products page)
VITE_STRIPE_STARTER_PRICE_ID=price_starter_id
VITE_STRIPE_PROFESSIONAL_PRICE_ID=price_professional_id
VITE_STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_id

# Your domain
VITE_APP_URL=http://localhost:5173
```

**Production Environment Variables:**
- Use your **live** keys (starts with `pk_live_` and `sk_live_`)
- Update the webhook secret for production webhooks
- Set proper domain URL

---

## Backend API Endpoints

You'll need to create these endpoints in your backend (Node.js/Express example):

### Setup Express Server

```javascript
// server.js
const express = require('express');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// Important: Use raw body for webhook signature verification
app.post('/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Use JSON parser for other routes
app.use(express.json());

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 1. Create Checkout Session

```javascript
// POST /api/stripe/create-checkout-session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { priceId, customerEmail, metadata } = req.body;

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: metadata
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.VITE_APP_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/billing?canceled=true`,
      metadata: metadata,
      subscription_data: {
        metadata: metadata
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Create Portal Session

```javascript
// POST /api/stripe/create-portal-session
app.post('/api/stripe/create-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.VITE_APP_URL}/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Get Subscription

```javascript
// GET /api/stripe/subscription/:subscriptionId
app.get('/api/stripe/subscription/:subscriptionId', async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(
      req.params.subscriptionId
    );

    res.json(subscription);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 4. Cancel Subscription

```javascript
// POST /api/stripe/subscription/:subscriptionId/cancel
app.post('/api/stripe/subscription/:subscriptionId/cancel', async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.update(
      req.params.subscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    res.json(subscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 5. Update Subscription

```javascript
// PUT /api/stripe/subscription/:subscriptionId
app.put('/api/stripe/subscription/:subscriptionId', async (req, res) => {
  try {
    const { newPriceId } = req.body;

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(
      req.params.subscriptionId
    );

    // Update subscription
    const updatedSubscription = await stripe.subscriptions.update(
      req.params.subscriptionId,
      {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations',
      }
    );

    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## Webhook Handler

### Setup Webhook Endpoint

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for (see below)
5. Copy the **Webhook signing secret**

### Events to Listen For

```javascript
const relevantEvents = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'payment_method.attached',
  'payment_method.detached',
];
```

### Webhook Handler Implementation

```javascript
// POST /api/stripe/webhook
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

// Handle checkout completed
async function handleCheckoutCompleted(session) {
  console.log('Checkout completed:', session.id);

  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const metadata = session.metadata;

  // Update user in your database
  // await updateUserSubscription(metadata.userId, {
  //   customerId,
  //   subscriptionId,
  //   status: 'active'
  // });

  // TODO: Update Supabase with subscription details
  console.log('User subscription activated:', {
    userId: metadata.userId,
    customerId,
    subscriptionId
  });
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  console.log('Subscription updated:', subscription.id);

  const customerId = subscription.customer;
  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  const priceId = subscription.items.data[0].price.id;

  // Determine plan tier
  let planTier = 'starter';
  if (priceId === process.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID) {
    planTier = 'professional';
  } else if (priceId === process.env.VITE_STRIPE_ENTERPRISE_PRICE_ID) {
    planTier = 'enterprise';
  }

  // TODO: Update user in Supabase
  console.log('Updating user subscription:', {
    customerId,
    status,
    planTier,
    currentPeriodEnd
  });
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);

  const customerId = subscription.customer;

  // TODO: Update user in Supabase - set to free tier
  console.log('User subscription canceled:', {
    customerId,
    status: 'canceled'
  });
}

// Handle successful payment
async function handleInvoicePaid(invoice) {
  console.log('Invoice paid:', invoice.id);

  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;
  const amountPaid = invoice.amount_paid / 100; // Convert from cents

  // TODO: Record payment in Supabase
  console.log('Payment recorded:', {
    customerId,
    subscriptionId,
    amountPaid,
    invoiceId: invoice.id
  });

  // Send receipt email
  // await sendReceiptEmail(customerId, invoice);
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);

  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  // TODO: Update subscription status in Supabase
  console.log('Payment failed for customer:', {
    customerId,
    subscriptionId,
    attemptCount: invoice.attempt_count
  });

  // Send payment failure notification
  // await sendPaymentFailedEmail(customerId, invoice);

  // If this is the final attempt, cancel subscription
  if (invoice.attempt_count >= 3) {
    console.log('Final payment attempt failed. Subscription will be canceled.');
    // TODO: Downgrade user to free tier
  }
}

// Handle payment method attached
async function handlePaymentMethodAttached(paymentMethod) {
  console.log('Payment method attached:', paymentMethod.id);

  // TODO: Update user's payment method in Supabase
  console.log('Payment method updated:', {
    customerId: paymentMethod.customer,
    last4: paymentMethod.card.last4,
    brand: paymentMethod.card.brand
  });
}
```

---

## Testing

### Test Mode
Use Stripe's test mode for development:

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

### Test Webhooks Locally

Install Stripe CLI:
```bash
# Install Stripe CLI
scoop install stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Trigger Test Events

```bash
# Test successful payment
stripe trigger checkout.session.completed

# Test failed payment
stripe trigger invoice.payment_failed

# Test subscription cancellation
stripe trigger customer.subscription.deleted
```

---

## Production Deployment

### 1. Switch to Live Mode
- Get your **live** API keys from Stripe Dashboard
- Update environment variables with live keys
- Update Price IDs with live product prices

### 2. Configure Webhooks
- Add production webhook endpoint in Stripe Dashboard
- Use HTTPS endpoint (required)
- Save webhook signing secret

### 3. Enable Payment Methods
- Configure accepted payment methods in Stripe Dashboard
- Enable 3D Secure for fraud prevention
- Set up email receipts

### 4. Security Checklist
- ✅ Never expose secret keys in frontend code
- ✅ Always verify webhook signatures
- ✅ Use HTTPS for all API endpoints
- ✅ Implement rate limiting on API endpoints
- ✅ Log all webhook events for auditing
- ✅ Handle failed payments gracefully
- ✅ Test error scenarios thoroughly

### 5. Monitoring
- Set up Stripe Dashboard alerts
- Monitor failed payments
- Track subscription churn
- Review webhook delivery status

---

## Next Steps

1. **Implement backend API** using the code examples above
2. **Test thoroughly** in Stripe test mode
3. **Deploy backend** to production server (Vercel, Railway, etc.)
4. **Update frontend** `stripeClient.js` with actual API URLs
5. **Configure webhooks** in Stripe Dashboard
6. **Test end-to-end** subscription flow
7. **Monitor** payments and subscriptions

---

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe API Reference: https://stripe.com/docs/api
- Stripe Support: https://support.stripe.com
- Test Card Numbers: https://stripe.com/docs/testing

---

Generated with ❤️ by Claude Code
