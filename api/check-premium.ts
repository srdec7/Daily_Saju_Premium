import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Missing email' });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!supabaseUrl || !supabaseKey) throw new Error('Supabase ENV missing');
    const SupabaseModule = await import('@supabase/supabase-js');
    const supabaseAdmin = SupabaseModule.createClient(supabaseUrl, supabaseKey);

    const { data, error } = await (supabaseAdmin as any)
      .from('saju_premiums')
      .select('email, created_at, plan')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(404).json({ isPremium: false, error: 'Premium record not found' });
    }

    return res.status(200).json({ isPremium: true, email: data.email, unlockedAt: data.created_at, plan: data.plan || 'premium' });
  } catch (err: any) {
    console.error('Check premium error:', err);
    return res.status(500).json({ isPremium: false, error: err.message });
  }
}
