import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Campaign,
  People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';
import Avatar from '../common/Avatar';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const businessMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Campaigns', icon: <Campaign />, path: '/campaigns' },
    { text: 'Referrals', icon: <People />, path: '/referrals' },
  ];

  const customerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/customer/dashboard' },
    { text: 'Campaigns', icon: <Campaign />, path: '/customer/campaigns' },
    { text: 'Referrals', icon: <People />, path: '/referrals' },
  ];

  const menuItems = user?.role === 'customer' ? customerMenuItems : businessMenuItems;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed"
        sx={{
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => navigate('/')}
            >
              <Logo />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={user?.avatar}
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="small"
              alt={`${user?.firstName} ${user?.lastName}'s avatar`}
              sx={{
                border: '2px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.2s ease-in-out',
                }
              }}
            />
            {user?.businessName && (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user.businessName}
              </Typography>
            )}
            <Button 
              color="primary"
              onClick={logout}
              variant="outlined"
              size="small"
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2, pb: 2 }}>
          <Box 
            sx={{ 
              px: 2, 
              mb: 3,
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
            onClick={() => {
              navigate('/');
              setDrawerOpen(false);
            }}
          >
            <Logo />
          </Box>
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container>{children}</Container>
      </Box>
    </Box>
  );
};

export default MainLayout;