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

    if (!email || !email.includes('@')) {
      console.warn('[API] Invalid email provided:', email);
      return res.status(400).json({ error: 'Valid email is required to unlock premium' });
    }

    let unitAmount = 499; // Default to $4.99 Premium
    let productName = 'DAILY SAJU: 심층 프리미엄 패스 (1년 + 올해 사주운세)';
    let productDesc = '매일 무제한 생성되는 1년치 데일리 사주 + 올해의 재물, 직업, 연애 심층 분석 및 12개월 세운 로드맵';

    if (lang === 'en') {
      productName = 'DAILY SAJU: Premium Deep Pass (1-Year & This Year Fortune)';
      productDesc = '1-Year Daily Saju Access + This Year Deep Analysis & 12-Month Fortune Roadmap';
    }

    if (plan === 'standard') {
      unitAmount = 299; // $2.99 Standard
      productName = 'DAILY SAJU: 스탠다드 패스 (1년 + 올해 사주운세)';
      productDesc = '매일 무제한 생성되는 1년치 데일리 사주 + 올해 토정비결 총운 및 상/하반기 분석';
      
      if (lang === 'en') {
        productName = 'DAILY SAJU: Standard Pass (1-Year & This Year Fortune)';
        productDesc = '1-Year Daily Saju Access + This Year Basic Tojeong Analysis';
      }
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
      customer_email: email,
      metadata: {
        sajuPremiumEmail: email,
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
