import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
// Run before any build containing public environment values. Never prints key contents.
try {
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
  if(key.startsWith('sb_secret_')) throw new Error('Secret key in NEXT_PUBLIC variable.');
  if(key.startsWith('eyJ')) {
    const claim=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString());
    if(claim.role !== 'anon') throw new Error('Only a legacy anon key may be public; prefer a publishable key.');
  }
  if((process.env.APP_ENV === 'production' || process.env.VERCEL_ENV === 'production')) {
    for(const name of ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','APP_ORIGIN']) if(!process.env[name]) throw new Error(`Missing ${name}`);
    if(new URL(process.env.APP_ORIGIN).protocol!=='https:') throw new Error('Production origin must use HTTPS.');
    if(process.env.ENABLE_DEMO==='true') throw new Error('Demo cannot run in production.');
    if(process.env.RELEASE_APPROVED!=='true') throw new Error('Production release gate not approved.');
    if((process.env.READINESS_TOKEN ?? '').length < 32) throw new Error('READINESS_TOKEN must contain at least 32 characters in production.');
  }
  console.log('Environment shape checked; no secret values displayed.');
} catch(error) { console.error(error.message); process.exitCode=1; }
