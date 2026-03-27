import { spawn } from 'child_process';
import fs from 'fs';

fs.writeFileSync('vercel_debug.txt', '');

const child = spawn('npx.cmd', ['vercel', 'dev', '--yes'], {
  env: { ...process.env, PATH: process.env.PATH }
});

child.stdout.on('data', (data) => fs.appendFileSync('vercel_debug.txt', data));
child.stderr.on('data', (data) => fs.appendFileSync('vercel_debug.txt', data));

console.log('Started vercel dev. Waiting 15 seconds...');

setTimeout(() => {
  console.log('Sending request to API...');
  fetch('http://localhost:3000/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' })
  }).then(r => r.text()).then(text => {
    console.log('API Response:', text);
    setTimeout(() => {
      child.kill();
      console.log('Killed child, check vercel_debug.txt');
    }, 2000);
  }).catch(e => {
    console.log('Fetch error:', e.message);
    setTimeout(() => {
      child.kill();
    }, 2000);
  });
}, 15000);
