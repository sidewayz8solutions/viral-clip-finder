import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "69374a644f967292747c3c70", 
  requiresAuth: true // Ensure authentication is required for all operations
});
