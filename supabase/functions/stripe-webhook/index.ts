// ============================================================================
// STRIPE WEBHOOK HANDLER - Supabase Edge Function
// ============================================================================
// This Edge Function handles Stripe webhook events for subscription management
//
// Environment variables required:
// - STRIPE_WEBHOOK_SECRET: Webhook signing secret from Stripe dashboard
// - STRIPE_SECRET_KEY: Stripe secret key (for API calls if needed)
//
// Webhook URL: https://[project-ref].supabase.co/functions/v1/stripe-webhook
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    // Verify webhook signature
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Create Supabase client (service role for admin access)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Log the webhook event to database
    await logWebhookEvent(supabaseAdmin, event);

    // Process event based on type
    let processed = false;

    switch (event.type) {
      // Subscription events
      case "customer.subscription.created":
        processed = await handleSubscriptionCreated(supabaseAdmin, event);
        break;

      case "customer.subscription.updated":
        processed = await handleSubscriptionUpdated(supabaseAdmin, event);
        break;

      case "customer.subscription.deleted":
        processed = await handleSubscriptionDeleted(supabaseAdmin, event);
        break;

      case "customer.subscription.trial_will_end":
        processed = await handleTrialWillEnd(supabaseAdmin, event);
        break;

      // Invoice events
      case "invoice.payment_succeeded":
        processed = await handleInvoicePaymentSucceeded(supabaseAdmin, event);
        break;

      case "invoice.payment_failed":
        processed = await handleInvoicePaymentFailed(supabaseAdmin, event);
        break;

      case "invoice.upcoming":
        processed = await handleInvoiceUpcoming(supabaseAdmin, event);
        break;

      // Payment method events
      case "payment_method.attached":
        processed = await handlePaymentMethodAttached(supabaseAdmin, event);
        break;

      case "payment_method.detached":
        processed = await handlePaymentMethodDetached(supabaseAdmin, event);
        break;

      // Customer events
      case "customer.created":
        processed = await handleCustomerCreated(supabaseAdmin, event);
        break;

      case "customer.updated":
        processed = await handleCustomerUpdated(supabaseAdmin, event);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        processed = true; // Mark as processed even if not handled
    }

    // Mark webhook event as processed
    if (processed) {
      await markWebhookProcessed(supabaseAdmin, event.id);
    }

    return new Response(JSON.stringify({ received: true, processed }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("[Stripe Webhook] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function logWebhookEvent(supabaseAdmin: any, event: Stripe.Event) {
  const { error } = await supabaseAdmin.from("stripe_webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    api_version: event.api_version,
    event_data: event,
    livemode: event.livemode,
    processed: false,
  });

  if (error) {
    console.error("[Stripe Webhook] Error logging event:", error);
  }
}

async function markWebhookProcessed(supabaseAdmin: any, eventId: string) {
  const { error } = await supabaseAdmin
    .from("stripe_webhook_events")
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
    })
    .eq("stripe_event_id", eventId);

  if (error) {
    console.error("[Stripe Webhook] Error marking as processed:", error);
  }
}

// ============================================================================
// SUBSCRIPTION EVENT HANDLERS
// ============================================================================

async function handleSubscriptionCreated(
  supabaseAdmin: any,
  event: Stripe.Event
): Promise<boolean> {
  const subscription = event.data.object as Stripe.Subscription;

  const { error } = await supabaseAdmin.rpc("process_subscription_created", {
    p_stripe_event_id: event.id,
    p_subscription_data: subscription,
  });

  if (error) {
    console.error("[Subscription Created] Error:", error);
    return false;
  }

  console.log(`[Subscription Created] Processed: ${subscription.id}`);
  return true;
}

async function handleSubscriptionUpdated(
  supabaseAdmin: any,
  event: Stripe.Event
): Promise<boolean> {
  const subscription = event.data.object as Stripe.Subscription;

  const { error } = await supabaseAdmin.rpc("process_subscription_updated", {
    p_stripe_event_id: event.id,
    p_subscription_data: subscription,
  });

  if (error) {
    console.error("[Subscription Updated] Error:", error);
    return false;
  }

  console.log(`[Subscription Updated] Processed: ${subscription.id}`);
  return true;
}

async function handleSubscriptionDeleted(
  supabaseAdmin: any,
  event: Stripe.Event
): Promise<boolean> {
  const subscription = event.data.object as Stripe.Subscription;

  const { error } = await supabaseAdmin.rpc("process_subscription_deleted", {
    p_stripe_event_id: event.id,
    p_subscription_data: subscription,
  });

  if (error) {
    console.error("[Subscription Deleted] Error:", error);
    return false;
  }

  console.log(`[Subscription Deleted] Processed: ${subscription.id}`);
  return true;
}

async function handleTrialWillEnd(
  supabaseAdmin: any,
  event: Stripe.Event
): Promise<boolean> {
  const subscription = event.data.object as Stripe.Subscription;

  // Find organization
  const { data: org } = await supabaseAdmin
    .from("organizations")
    .select("id, name, email")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (!org) {
    console.error("[Trial Will End] Organization not found");
    return false;
  }

  // Log event
  await supabaseAdmin.from("subscription_events").insert({
    organization_id: org.id,
    event_type: "trial_ending_soon",
    new_state: subscription,
    stripe_event_id: event.id,
  });

  // TODO: Send email notification about trial ending
  console.log(`[Trial Will End] Notification needed for org: ${org.id}`);

  return true;
}

// ============================================================================
// INVOICE EVENT HANDLERS
// ============================================================================

async function handleInvoicePaymentSucceeded(
  supabaseAdmin: any,
  event: Stripe.Event
): Promise<boolean> {
  const invoice = event.data.object as Stripe.Invoice;

  const { error } = await supabaseAdmin.rpc("process_invoice_payment_succeeded", {
    p_stripe_event_id: event.id,
    p_invoice_data: invoice,
  });

  if (error) {
    console.error("[Invoice Payment Succeeded] Error:", error);
    return false;
  }

  console.log(`[Invoice Payment Succeeded] Processed: ${invoice.id}`);
  return true;
}

async function handleInvoicePaymentFailed(
  supabaseAdmin: any,
  event: Stripe.Event
): Promise<boolean> {
  const invoice = event.data.object as Stripe.Invoice;

  const { error } = await supabaseAdmin.rpc("process_invoice_payment_failed", {
    p_stripe_event_id: event.id,
    p_invoice_data: invoice,
  });

  if (error) {
    console.error("[Invoice Payment Failed] Error:", error);
    return false;
  }

  // TODO: Send email notification about failed payment
  console.log(`[Invoice Payment Failed] Processed: ${invoice.id}`);
  return true;
}

async function handleInvoiceUpcoming(
  supabaseAdmin: any,
  event: Stripe.Event
): Promise<boolean> {
  const invoice = event.data.object as Stripe.Invoice;

  // Find organization
  const { data: org } = await supabaseAdmin
    .from("organizations")
    .select("id, name, email")
    .eq("stripe_customer_id", invoice.customer)
    .single();

  if (!org) {
    console.error("[Invoice Upcoming] Organization not found");
    return false;
  }

  // Log event
  await supabaseAdmin.from("subscription_events").insert({
    organization_id: org.id,
    event_type: "invoice_upcoming",
    new_state: invoice,
    stripe_event_id: event.id,
  });

  // TODO: Send email notification about upcoming invoice
  console.log(`[Invoice Upcoming] Notification needed for org: ${org.id}`);

  return true;
}

// ============================================================================
// PAYMENT METHOD EVENT HANDLERS
// ============================================================================

async function handlePaymentMethodAttached(
  supabaseAdmin: any,
  event: Stripe.Event
): Promise<boolean> {
  const paymentMethod = event.data.object as Stripe.PaymentMethod;

  if (paymentMethod.customer) {
    // Find organization
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("stripe_customer_id", paymentMethod.customer)
      .single();

    if (!org) {
      return false;
    }

    // Store payment method
    const { error } = await supabaseAdmin.from("payment_methods").insert({
      organization_id: org.id,
      stripe_payment_method_id: paymentMethod.id,
      stripe_customer_id: paymentMethod.customer as string,
      type: paymentMethod.type,
      card_brand: paymentMethod.card?.brand,
      card_last4: paymentMethod.card?.last4,
      card_exp_month: paymentMethod.card?.exp_month,
      card_exp_year: paymentMethod.card?.exp_year,
      card_funding: paymentMethod.card?.funding,
      is_default: false,
      is_active: true,
    });

    if (error) {
      console.error("[Payment Method Attached] Error:", error);
      return false;
    }

    console.log(`[Payment Method Attached] Stored: ${paymentMethod.id}`);
  }

  return true;
}

async function handlePaymentMethodDetached(
  supabaseAdmin: any,
  event: Stripe.Event
): Promise<boolean> {
  const paymentMethod = event.data.object as Stripe.PaymentMethod;

  // Mark payment method as inactive
  const { error } = await supabaseAdmin
    .from("payment_methods")
    .update({ is_active: false })
    .eq("stripe_payment_method_id", paymentMethod.id);

  if (error) {
    console.error("[Payment Method Detached] Error:", error);
    return false;
  }

  console.log(`[Payment Method Detached] Deactivated: ${paymentMethod.id}`);
  return true;
}

// ============================================================================
// CUSTOMER EVENT HANDLERS
// ============================================================================

async function handleCustomerCreated(
  supabaseAdmin: any,
  event: Stripe.Event
): Promise<boolean> {
  const customer = event.data.object as Stripe.Customer;

  // If customer has email, try to find matching organization
  if (customer.email) {
    const { error } = await supabaseAdmin
      .from("organizations")
      .update({ stripe_customer_id: customer.id })
      .eq("email", customer.email)
      .is("stripe_customer_id", null);

    if (error) {
      console.error("[Customer Created] Error:", error);
      return false;
    }
  }

  console.log(`[Customer Created] Processed: ${customer.id}`);
  return true;
}

async function handleCustomerUpdated(
  supabaseAdmin: any,
  event: Stripe.Event
): Promise<boolean> {
  const customer = event.data.object as Stripe.Customer;

  // Update organization with customer details if needed
  const { error } = await supabaseAdmin
    .from("organizations")
    .update({
      stripe_payment_method_id: customer.invoice_settings?.default_payment_method,
    })
    .eq("stripe_customer_id", customer.id);

  if (error) {
    console.error("[Customer Updated] Error:", error);
    return false;
  }

  console.log(`[Customer Updated] Processed: ${customer.id}`);
  return true;
}
