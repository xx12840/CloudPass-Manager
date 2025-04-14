import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  TextField,
  Typography,
  Collapse,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LoginIcon from '@mui/icons-material/Login';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import FolderIcon from '@mui/icons-material/Folder';
import CollectionsIcon from '@mui/icons-material/Collections';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import { CATEGORIES, FOLDERS, COLLECTIONS } from '../config';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const SearchBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const CategoryHeader = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1),
  fontSize: '0.75rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  backgroundColor: selected ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const getCategoryIcon = (categoryId) => {
  switch (categoryId) {
    case 'all':
      return <AllInboxIcon />;
    case 'favorites':
      return <FavoriteIcon />;
    case 'login':
      return <LoginIcon />;
    case 'card':
      return <CreditCardIcon />;
    case 'identity':
      return <PersonIcon />;
    case 'note':
      return <NoteIcon />;
    default:
      return <AllInboxIcon />;
  }
};

const Sidebar = ({ 
  onCategorySelect, 
  onFolderSelect, 
  onCollectionSelect, 
  onSearch,
  selectedCategory,
  selectedFolder,
  selectedCollection
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const toggleFolders = () => {
    setFoldersOpen(!foldersOpen);
  };

  const toggleCollections = () => {
    setCollectionsOpen(!collectionsOpen);
  };

  return (
    <StyledDrawer variant="permanent" anchor="left">
      <Box sx={{ overflow: 'auto' }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
          CloudPass Manager
        </Typography>

        <SearchBox>
          <TextField
            fullWidth
            placeholder="搜索..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              sx: { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }
            }}
          />
        </SearchBox>

        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

        <CategoryHeader>类型</CategoryHeader>
        <List>
          {CATEGORIES.map((category) => (
            <StyledListItem
              button
              key={category.id}
              selected={selectedCategory === category.id}
              onClick={() => onCategorySelect(category.id)}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {getCategoryIcon(category.id)}
              </ListItemIcon>
              <ListItemText primary={category.name} />
            </StyledListItem>
          ))}
        </List>

        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

        <ListItem button onClick={toggleFolders}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary="文件夹" />
          {foldersOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

        <Collapse in={foldersOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {FOLDERS.map((folder) => (
              <StyledListItem
                button
                key={folder.id}
                selected={selectedFolder === folder.id}
                onClick={() => onFolderSelect(folder.id)}
                sx={{ pl: 4 }}
              >
                <ListItemText primary={folder.name} />
              </StyledListItem>
            ))}
          </List>
        </Collapse>

        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

        <ListItem button onClick={toggleCollections}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <CollectionsIcon />
          </ListItemIcon>
          <ListItemText primary="集合" />
          {collectionsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

        <Collapse in={collectionsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {COLLECTIONS.map((collection) => (
              <StyledListItem
                button
                key={collection.id}
                selected={selectedCollection === collection.id}
                onClick={() => onCollectionSelect(collection.id)}
                sx={{ pl: 4 }}
              >
                <ListItemText primary={collection.name} />
              </StyledListItem>
            ))}
          </List>
        </Collapse>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;