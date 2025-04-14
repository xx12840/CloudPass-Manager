import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export const usePasswords = () => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取认证令牌
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // 获取所有密码
  const fetchPasswords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/api/passwords`, getAuthHeader());
      setPasswords(response.data.passwords);
    } catch (err) {
      setError(err.response?.data?.error || '获取密码失败');
      console.error('获取密码失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 添加新密码
  const addPassword = async (passwordData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/passwords`, 
        passwordData, 
        getAuthHeader()
      );

      setPasswords(prev => [...prev, response.data.password]);
      return response.data.password;
    } catch (err) {
      setError(err.response?.data?.error || '添加密码失败');
      console.error('添加密码失败:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 更新密码
  const updatePassword = async (id, passwordData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_URL}/api/passwords/${id}`, 
        passwordData, 
        getAuthHeader()
      );

      setPasswords(prev => 
        prev.map(password => 
          password.id === id ? response.data.password : password
        )
      );

      return response.data.password;
    } catch (err) {
      setError(err.response?.data?.error || '更新密码失败');
      console.error('更新密码失败:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 删除密码
  const deletePassword = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_URL}/api/passwords/${id}`, getAuthHeader());
      setPasswords(prev => prev.filter(password => password.id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.error || '删除密码失败');
      console.error('删除密码失败:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 上传图标
  const uploadIcon = async (iconFile) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('icon', iconFile);

      const response = await axios.post(
        `${API_URL}/api/icons`, 
        formData, 
        {
          ...getAuthHeader(),
          headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || '上传图标失败');
      console.error('上传图标失败:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 标记为收藏
  const toggleFavorite = async (id, isFavorite) => {
    return updatePassword(id, { favorite: isFavorite });
  };

  // 按类别过滤密码
  const filterByCategory = (category) => {
    if (category === 'all') {
      return passwords;
    } else if (category === 'favorites') {
      return passwords.filter(password => password.favorite);
    } else {
      return passwords.filter(password => password.category === category);
    }
  };

  // 按文件夹过滤密码
  const filterByFolder = (folder) => {
    return passwords.filter(password => password.folder === folder);
  };

  // 按集合过滤密码
  const filterByCollection = (collection) => {
    return passwords.filter(password => password.collection === collection);
  };

  // 搜索密码
  const searchPasswords = (term) => {
    if (!term) return passwords;

    const searchTerm = term.toLowerCase();
    return passwords.filter(password => 
      password.name.toLowerCase().includes(searchTerm) ||
      password.username.toLowerCase().includes(searchTerm) ||
      password.service?.toLowerCase().includes(searchTerm) ||
      password.url?.toLowerCase().includes(searchTerm) ||
      password.notes?.toLowerCase().includes(searchTerm)
    );
  };

  return {
    passwords,
    loading,
    error,
    fetchPasswords,
    addPassword,
    updatePassword,
    deletePassword,
    uploadIcon,
    toggleFavorite,
    filterByCategory,
    filterByFolder,
    filterByCollection,
    searchPasswords
  };
};