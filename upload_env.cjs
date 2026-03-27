const { execSync } = require('child_process');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  
  const [key, ...rest] = trimmed.split('=');
  const value = rest.join('=');
  if (key && value) {
    console.log(`Adding ${key}...`);
    try {
      const fn = `val_${key}.txt`;
      fs.writeFileSync(fn, value, 'utf8');
      // Use cmd standard input redirection which Vercel accepts
      execSync(`cmd.exe /c "npx vercel env add ${key} production < ${fn}"`, { stdio: 'inherit' });
      fs.unlinkSync(fn);
    } catch (e) {
      console.error(`Failed to add ${key}:`, e.message);
    }
  }
}
console.log('Finished uploading env vars');
