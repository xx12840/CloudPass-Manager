// API配置
export const API_URL = 'https://cloudpass-api.your-account.workers.dev';

// 密码类型图标映射
export const SERVICE_ICONS = {
  'google': '/icons/google.png',
  'facebook': '/icons/facebook.png',
  'twitter': '/icons/twitter.png',
  'instagram': '/icons/instagram.png',
  'github': '/icons/github.png',
  'linkedin': '/icons/linkedin.png',
  'amazon': '/icons/amazon.png',
  'apple': '/icons/apple.png',
  'microsoft': '/icons/microsoft.png',
  'default': '/icons/default.png'
};

// 密码分类
export const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'favorites', name: '收藏' },
  { id: 'login', name: '登录' },
  { id: 'card', name: '卡片' },
  { id: 'identity', name: '身份' },
  { id: 'note', name: '笔记' }
];

// 文件夹
export const FOLDERS = [
  { id: 'finances', name: '财务' },
  { id: 'health', name: '健康' },
  { id: 'entertainment', name: '娱乐' }
];

// 集合
export const COLLECTIONS = [
  { id: 'marketing', name: '营销' },
  { id: 'product', name: '产品' },
  { id: 'sales', name: '销售' }
];