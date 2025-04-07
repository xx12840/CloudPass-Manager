import CryptoJS from 'crypto-js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Simple admin authentication
    const authHeader = request.headers.get('Authorization');
    const expectedAuth = `Basic ${btoa(`${env.ADMIN_USERNAME}:${env.ADMIN_PASSWORD}`)}`;
    if (authHeader !== expectedAuth) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (path === '/api/vaults' && request.method === 'GET') {
      // Fetch vaults from KV
      const vaults = await env.KV.get('vaults', { type: 'json' }) || [];
      return new Response(JSON.stringify(vaults), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (path === '/api/vaults' && request.method === 'POST') {
      const body = await request.json();
      const { name, username, password, owner, tags, icon } = body;

      // Encrypt the password
      const encryptedPassword = CryptoJS.AES.encrypt(password, env.ENCRYPTION_KEY).toString();

      // Store icon in R2 if provided
      let iconUrl = '';
      if (icon) {
        const objectName = `${name}-${Date.now()}.png`;
        await env.R2.put(objectName, Buffer.from(icon, 'base64'));
        iconUrl = `https://your-r2-bucket.workers.dev/${objectName}`;
      }

      // Fetch existing vaults
      const vaults = (await env.KV.get('vaults', { type: 'json' })) || [];
      vaults.push({ name, username, password: encryptedPassword, owner, tags, iconUrl });

      // Save updated vaults to KV
      await env.KV.put('vaults', JSON.stringify(vaults));
      return new Response('Vault added', { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  },
};
