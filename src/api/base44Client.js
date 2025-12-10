import { createClient } from '@base44/sdk';

const base44AppId = import.meta.env.VITE_BASE44_APP_ID;

if (!base44AppId) {
  throw new Error(
    'Missing VITE_BASE44_APP_ID. Add it to your Vite environment (.env, Netlify, Vercel, etc.) so the Base44 client can initialize.'
  );
}

export const base44 = createClient({
  appId: base44AppId,
  requiresAuth: true // Ensure authentication is required for all operations
});
