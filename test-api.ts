import handler from './api/create-checkout.js'; // .js extension is needed for ESM to resolve .ts file in tsx sometimes, or .ts

const req = {
  method: 'POST',
  body: { email: 'test@example.com' },
  headers: { host: 'localhost:3000' }
};

const res = {
  status: (code) => {
    console.log('[Res Status]', code);
    return res;
  },
  json: (data) => {
    console.log('[Res JSON]', data);
    return res;
  }
};

process.env.STRIPE_SECRET_KEY = 'sk_test_123';

handler(req as any, res as any).catch(e => console.error('[Handler Error]', e));
