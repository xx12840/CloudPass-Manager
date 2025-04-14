import React, { useState } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip,
  Typography,
  Avatar,
  Checkbox,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { SERVICE_ICONS } from '../config';

const PasswordList = ({ passwords, onEdit, onDelete }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSnackbarMessage(`${type}已复制到剪贴板`);
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('复制失败:', err);
        setSnackbarMessage('复制失败');
        setSnackbarOpen(true);
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getServiceIcon = (service) => {
    const iconKey = service.toLowerCase();
    return SERVICE_ICONS[iconKey] || SERVICE_ICONS.default;
  };

  return (
    <Box>
      {passwords.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          没有找到密码记录
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox disabled />
                </TableCell>
                <TableCell>名称</TableCell>
                <TableCell>用户名</TableCell>
                <TableCell>所有者</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {passwords.map((password) => (
                <TableRow key={password.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox 
                      checked={password.favorite || false}
                      icon={<FavoriteBorderIcon />}
                      checkedIcon={<FavoriteIcon color="error" />}
                      onChange={() => onEdit({ ...password, favorite: !password.favorite })}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={getServiceIcon(password.service)} 
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                      {password.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {password.username}
                      <Tooltip title="复制用户名">
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopy(password.username, '用户名')}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>{password.owner || '我'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="复制密码">
                      <IconButton 
                        onClick={() => handleCopy(password.password, '密码')}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="编辑">
                      <IconButton 
                        onClick={() => onEdit(password)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除">
                      <IconButton 
                        color="error" 
                        onClick={() => onDelete(password.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PasswordList;