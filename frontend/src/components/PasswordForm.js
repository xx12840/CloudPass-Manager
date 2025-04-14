import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Box,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { CATEGORIES, FOLDERS, COLLECTIONS } from '../config';

const PasswordForm = ({ open, onClose, onSubmit, password }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    service: '',
    url: '',
    category: 'login',
    folder: '',
    collection: '',
    notes: '',
    favorite: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (password) {
      setFormData({
        name: password.name || '',
        username: password.username || '',
        password: password.password || '',
        service: password.service || '',
        url: password.url || '',
        category: password.category || 'login',
        folder: password.folder || '',
        collection: password.collection || '',
        notes: password.notes || '',
        favorite: password.favorite || false
      });
    } else {
      setFormData({
        name: '',
        username: '',
        password: '',
        service: '',
        url: '',
        category: 'login',
        folder: '',
        collection: '',
        notes: '',
        favorite: false
      });
    }
    setErrors({});
  }, [password, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 清除错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '名称不能为空';
    }

    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    }

    if (!formData.password.trim()) {
      newErrors.password = '密码不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{password ? '编辑密码' : '添加新密码'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="名称"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="用户名"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="密码"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                label="服务"
                name="service"
                value={formData.service}
                onChange={handleChange}
                placeholder="例如: Google, Facebook"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                label="网址"
                name="url"
                value={formData.url}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>类别</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="类别"
                >
                  {CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'favorites').map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>文件夹</InputLabel>
                <Select
                  name="folder"
                  value={formData.folder}
                  onChange={handleChange}
                  label="文件夹"
                >
                  <MenuItem value="">
                    <em>无</em>
                  </MenuItem>
                  {FOLDERS.map(folder => (
                    <MenuItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>集合</InputLabel>
                <Select
                  name="collection"
                  value={formData.collection}
                  onChange={handleChange}
                  label="集合"
                >
                  <MenuItem value="">
                    <em>无</em>
                  </MenuItem>
                  {COLLECTIONS.map(collection => (
                    <MenuItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="normal"
                fullWidth
                label="备注"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="favorite"
                    checked={formData.favorite}
                    onChange={handleCheckboxChange}
                    icon={<FavoriteBorderIcon />}
                    checkedIcon={<FavoriteIcon color="error" />}
                  />
                }
                label="添加到收藏"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {password ? '更新' : '添加'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordForm;