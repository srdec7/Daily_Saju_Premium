import handler from './api/create-checkout.js';

const mockReq = {
  method: 'POST',
  body: { email: 'test@example.com' },
};

const mockRes = {
  status: (code) => {
    console.log('STATUS:', code);
    return {
      json: (data) => console.log('JSON:', data),
    };
  },
};

process.env.STRIPE_SECRET_KEY = 'sk_test_123';

handler(mockReq, mockRes).catch(console.error);
