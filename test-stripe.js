import Stripe from 'stripe';
console.log('Stripe Default Export Type:', typeof Stripe);
console.log('Stripe Default Export Keys:', Object.keys(Stripe || {}));
try {
  const stripe = new Stripe('sk_test_123');
  console.log('Stripe initialized successfully!');
} catch (e) {
  console.error('Stripe initialization failed:', e.message);
  console.error(e);
}
