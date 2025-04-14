import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Divider, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import Sidebar from '../components/Sidebar';
import PasswordList from '../components/PasswordList';
import PasswordForm from '../components/PasswordForm';
import { useAuth } from '../contexts/AuthContext';
import { usePasswords } from '../hooks/usePasswords';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';

const DashboardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflow: 'auto',
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const Dashboard = () => {
  const { logout } = useAuth();
  const { passwords, loading, error, fetchPasswords, addPassword, updatePassword, deletePassword } = usePasswords();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);

  useEffect(() => {
    fetchPasswords();
  }, [fetchPasswords]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedFolder(null);
    setSelectedCollection(null);
  };

  const handleFolderSelect = (folderId) => {
    setSelectedFolder(folderId);
    setSelectedCategory(null);
    setSelectedCollection(null);
  };

  const handleCollectionSelect = (collectionId) => {
    setSelectedCollection(collectionId);
    setSelectedCategory(null);
    setSelectedFolder(null);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddPassword = () => {
    setEditingPassword(null);
    setIsFormOpen(true);
  };

  const handleEditPassword = (password) => {
    setEditingPassword(password);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPassword(null);
  };

  const handleFormSubmit = async (passwordData) => {
    if (editingPassword) {
      await updatePassword(editingPassword.id, passwordData);
    } else {
      await addPassword(passwordData);
    }
    setIsFormOpen(false);
    setEditingPassword(null);
  };

  // 过滤密码
  const filteredPasswords = passwords.filter(password => {
    // 搜索过滤
    if (searchTerm && !password.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !password.username.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // 分类过滤
    if (selectedCategory === 'all') {
      return true;
    } else if (selectedCategory === 'favorites' && password.favorite) {
      return true;
    } else if (selectedCategory && password.category === selectedCategory) {
      return true;
    }

    // 文件夹过滤
    if (selectedFolder && password.folder === selectedFolder) {
      return true;
    }

    // 集合过滤
    if (selectedCollection && password.collection === selectedCollection) {
      return true;
    }

    return false;
  });

  return (
    <DashboardContainer>
      <Sidebar 
        onCategorySelect={handleCategorySelect}
        onFolderSelect={handleFolderSelect}
        onCollectionSelect={handleCollectionSelect}
        onSearch={handleSearch}
        selectedCategory={selectedCategory}
        selectedFolder={selectedFolder}
        selectedCollection={selectedCollection}
      />
      <MainContent>
        <Header>
          <Typography variant="h5" component="h1">
            {selectedCategory === 'all' ? '全部密码' : 
             selectedCategory === 'favorites' ? '收藏' : 
             selectedCategory === 'login' ? '登录' :
             selectedCategory === 'card' ? '卡片' :
             selectedCategory === 'identity' ? '身份' :
             selectedCategory === 'note' ? '笔记' :
             selectedFolder ? `文件夹: ${selectedFolder}` :
             selectedCollection ? `集合: ${selectedCollection}` : '全部密码'}
          </Typography>
          <Box>
            <Tooltip title="添加密码">
              <IconButton color="primary" onClick={handleAddPassword}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="退出登录">
              <IconButton color="error" onClick={logout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Header>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ mt: 2 }}>
            加载密码时出错: {error}
          </Typography>
        ) : (
          <PasswordList 
            passwords={filteredPasswords} 
            onEdit={handleEditPassword}
            onDelete={deletePassword}
          />
        )}

        <PasswordForm 
          open={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          password={editingPassword}
        />
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;