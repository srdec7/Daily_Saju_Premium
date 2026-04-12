import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is missing in environment variables');
    
    const StripeModule = await import('stripe');
    const Stripe = StripeModule.default || StripeModule;
    const stripe = new Stripe(stripeKey as any);
    
    const { email, plan, lang, userId } = req.body;
    console.log('[API] Creating checkout for:', email, 'Plan:', plan, 'Lang:', lang);
    console.log('[API] STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);

    if (email && !email.includes('@')) {
      console.warn('[API] Invalid email provided:', email);
      return res.status(400).json({ error: 'If an email is provided, it must be valid' });
    }

    let unitAmount = 199; // $1.99 Remove Ads
    let productName = 'DAILY SAJU: 평생 광고 제거';
    let productDesc = '모든 운세 결과의 프리미엄 영역을 평생 광고 없이 편안하게 이용하세요.';

    if (lang === 'en') {
      productName = 'DAILY SAJU: Remove Ads Forever';
      productDesc = 'Enjoy unlimited ad-free access to all detailed saju readings permanently.';
    }

    // Determine base URL dynamically or fallback to the Vercel URL
    const origin = req.headers.origin || `https://${req.headers.host}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDesc,
              images: [`${origin}/icon-192.png`],
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      locale: lang === 'ko' ? 'ko' : 'auto',
      success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      ...(email ? { customer_email: email } : {}),
      metadata: {
        sajuPremiumEmail: email || '',
        sajuUserId: userId || '',
        sajuPlan: plan || 'premium',
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({ error: err.message });
  }
}
