import { Router } from 'itty-router';
import bcrypt from 'bcryptjs';

// 创建路由器
const router = Router();

// 辅助函数：生成JWT令牌
function generateToken(username) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { 
    username, 
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
  };

  const headerBase64 = btoa(JSON.stringify(header));
  const payloadBase64 = btoa(JSON.stringify(payload));

  const signature = crypto.subtle.sign(
    'HMAC',
    JWT_SECRET,
    new TextEncoder().encode(`${headerBase64}.${payloadBase64}`)
  );

  return `${headerBase64}.${payloadBase64}.${signature}`;
}

// 辅助函数：验证JWT令牌
async function verifyToken(token) {
  try {
    const [headerBase64, payloadBase64, signature] = token.split('.');
    const payload = JSON.parse(atob(payloadBase64));

    // 检查令牌是否过期
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // 验证签名
    const isValid = await crypto.subtle.verify(
      'HMAC',
      JWT_SECRET,
      signature,
      new TextEncoder().encode(`${headerBase64}.${payloadBase64}`)
    );

    return isValid ? payload : null;
  } catch (error) {
    return null;
  }
}

// 中间件：身份验证
async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: '未授权' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return new Response(JSON.stringify({ error: '无效的令牌' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return null; // 认证成功
}

// 辅助函数：加密密码数据
async function encryptData(data, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(JSON.stringify(data));

  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encryptedData))
  };
}

// 辅助函数：解密密码数据
async function decryptData(encryptedObj, key) {
  const iv = new Uint8Array(encryptedObj.iv);
  const encryptedData = new Uint8Array(encryptedObj.data);

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  );

  return JSON.parse(new TextDecoder().decode(decryptedData));
}

// 辅助函数：从主密码派生加密密钥
async function deriveKey(password) {
  const salt = new TextEncoder().encode('cloudpass-salt');
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// 登录路由
router.post('/api/login', async (request, env) => {
  const { username, password } = await request.json();

  // 验证用户名和密码
  if (username !== env.ADMIN_USERNAME || 
      !await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH)) {
    return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 生成JWT令牌
  const token = generateToken(username);

  // 派生加密密钥并存储
  const encryptionKey = await deriveKey(password);

  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

// 获取所有密码
router.get('/api/passwords', async (request, env) => {
  const authError = await authenticate(request, env);
  if (authError) return authError;

  try {
    const passwordsObj = await env.STORAGE.get('passwords.json');
    if (!passwordsObj) {
      return new Response(JSON.stringify({ passwords: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const passwords = JSON.parse(await passwordsObj.text());

    return new Response(JSON.stringify({ passwords }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取密码失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// 添加新密码
router.post('/api/passwords', async (request, env) => {
  const authError = await authenticate(request, env);
  if (authError) return authError;

  try {
    const passwordData = await request.json();

    // 获取现有密码
    let passwords = [];
    const passwordsObj = await env.STORAGE.get('passwords.json');

    if (passwordsObj) {
      passwords = JSON.parse(await passwordsObj.text());
    }

    // 添加新密码
    const newPassword = {
      id: crypto.randomUUID(),
      ...passwordData,
      createdAt: new Date().toISOString()
    };

    passwords.push(newPassword);

    // 保存更新后的密码列表
    await env.STORAGE.put('passwords.json', JSON.stringify(passwords));

    return new Response(JSON.stringify({ success: true, password: newPassword }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '添加密码失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// 更新密码
router.put('/api/passwords/:id', async (request, env) => {
  const authError = await authenticate(request, env);
  if (authError) return authError;

  try {
    const { id } = request.params;
    const updatedData = await request.json();

    // 获取现有密码
    const passwordsObj = await env.STORAGE.get('passwords.json');
    if (!passwordsObj) {
      return new Response(JSON.stringify({ error: '密码不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let passwords = JSON.parse(await passwordsObj.text());

    // 查找并更新密码
    const index = passwords.findIndex(p => p.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: '密码不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    passwords[index] = {
      ...passwords[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    // 保存更新后的密码列表
    await env.STORAGE.put('passwords.json', JSON.stringify(passwords));

    return new Response(JSON.stringify({ success: true, password: passwords[index] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '更新密码失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// 删除密码
router.delete('/api/passwords/:id', async (request, env) => {
  const authError = await authenticate(request, env);
  if (authError) return authError;

  try {
    const { id } = request.params;

    // 获取现有密码
    const passwordsObj = await env.STORAGE.get('passwords.json');
    if (!passwordsObj) {
      return new Response(JSON.stringify({ error: '密码不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let passwords = JSON.parse(await passwordsObj.text());

    // 查找并删除密码
    const index = passwords.findIndex(p => p.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: '密码不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    passwords.splice(index, 1);

    // 保存更新后的密码列表
    await env.STORAGE.put('passwords.json', JSON.stringify(passwords));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '删除密码失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// 上传图标
router.post('/api/icons', async (request, env) => {
  const authError = await authenticate(request, env);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const icon = formData.get('icon');

    if (!icon) {
      return new Response(JSON.stringify({ error: '未提供图标' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const iconId = crypto.randomUUID();
    const iconKey = `icons/${iconId}`;

    await env.STORAGE.put(iconKey, icon);

    return new Response(JSON.stringify({ 
      success: true, 
      iconId, 
      iconUrl: `/api/icons/${iconId}` 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '上传图标失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// 获取图标
router.get('/api/icons/:id', async (request, env) => {
  try {
    const { id } = request.params;
    const iconKey = `icons/${id}`;

    const icon = await env.STORAGE.get(iconKey);
    if (!icon) {
      return new Response('图标不存在', { status: 404 });
    }

    return new Response(icon.body, {
      headers: { 'Content-Type': icon.httpMetadata.contentType || 'image/png' }
    });
  } catch (error) {
    return new Response('获取图标失败', { status: 500 });
  }
});

// 处理CORS预检请求
router.options('*', request => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
});

// 404处理
router.all('*', () => new Response('Not Found', { status: 404 }));

// 主处理函数
export default {
  async fetch(request, env, ctx) {
    // 添加CORS头
    const response = await router.handle(request, env, ctx);
    const newHeaders = new Headers(response.headers);

    newHeaders.set('Access-Control-Allow-Origin', env.CORS_ORIGIN);
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};