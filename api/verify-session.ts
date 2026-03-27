import type { VercelRequest, VercelResponse } from '@vercel/node';
import type Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { session_id } = req.query;
  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is missing');
    const StripeModule = await import('stripe');
    const Stripe = StripeModule.default || StripeModule;
    const stripe = new Stripe(stripeKey as any);

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      const email = session.customer_details?.email || session.metadata?.sajuPremiumEmail;
      const plan = session.metadata?.sajuPlan || 'premium';
      return res.status(200).json({ email, isPremium: true, plan });
    }
    return res.status(400).json({ error: 'Payment not completed or pending' });
  } catch (err: any) {
    console.error('Session verify error:', err);
    return res.status(500).json({ error: err.message });
  }
}
