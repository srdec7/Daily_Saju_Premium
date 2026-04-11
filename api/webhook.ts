import type { VercelRequest, VercelResponse } from '@vercel/node';
import type Stripe from 'stripe';
import type { createClient } from '@supabase/supabase-js';



// Disable body parsing for Stripe Webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to read raw body
const getRawBody = (req: VercelRequest): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    let body: Uint8Array[] = [];
    req.on('data', (chunk) => body.push(chunk));
    req.on('end', () => resolve(Buffer.concat(body)));
    req.on('error', reject);
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let event: Stripe.Event;
  let stripe: Stripe;
  let supabaseAdmin: ReturnType<typeof createClient>;
  let webhookSecret: string;

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() as string;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseKey) {
      console.error('[Webhook] Missing environment variables.');
      return res.status(500).json({ error: 'Internal Server Error: Missing ENV' });
    }

    const StripeModule = await import('stripe');
    const StripeClass = StripeModule.default || StripeModule;
    stripe = new StripeClass(stripeKey, {
      apiVersion: '2025-02-24.acacia' as any,
    }) as any;

    const SupbaseModule = await import('@supabase/supabase-js');
    supabaseAdmin = SupbaseModule.createClient(supabaseUrl, supabaseKey) as any;

    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'] as string;
    
    // Verify Stripe signature
    event = stripe.webhooks.constructEvent(
      rawBody.toString(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Get the email they entered at checkout or passed via metadata
    const customerEmail = session.customer_details?.email || session.metadata?.sajuPremiumEmail;
    const sajuUserId = session.metadata?.sajuUserId;
    const plan = session.metadata?.sajuPlan || 'premium';

    if (customerEmail) {
      // Calculate 1 Year from now
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      let targetUserId = sajuUserId;
      
      // If no explicit user ID was passed, lookup existing user by Email or generate a new UUID
      if (!targetUserId) {
        const { data: existingUser } = await (supabaseAdmin as any)
          .from('saju_users')
          .select('id')
          .eq('email', customerEmail)
          .single();
          
        targetUserId = existingUser?.id || require('crypto').randomUUID();
      }

      // Save purchase to Supabase (User Account-Based)
      const { error } = await (supabaseAdmin as any)
        .from('saju_users')
        .upsert({
          id: targetUserId,
          email: customerEmail,
          plan: plan,
          subscription_end_date: endDate.toISOString()
        }, { onConflict: 'id' });

      if (error) {
        console.error("Error inserting into Supabase saju_users:", error);
        return res.status(500).json({ error: "Failed to allocate premium securely" });
      }
      console.log(`Successfully unlocked premium for: ${customerEmail} (User ID: ${targetUserId})`);
    } else {
      console.warn("No customerEmail found in Stripe Checkout Session:", session.id);
    }
  }

  return res.status(200).json({ received: true });
}
