import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  Container,
  useTheme,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ p: 2 }}>
        <Logo />
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/features')}>
            <ListItemText primary="Features" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/pricing')}>
            <ListItemText primary="Pricing" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/why-refrr')}>
            <ListItemText primary="Why Refrr?" />
          </ListItemButton>
        </ListItem>
        {!isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/login')}>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/register')}>
                <ListItemText primary="Register Business" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate(user?.businessName ? '/dashboard' : '/customer/campaigns')}>
                <ListItemText primary={user?.businessName ? "Dashboard" : "My Campaigns"} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={logout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer' 
            }}
            onClick={() => navigate('/')}
          >
            <Logo />
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, mr: 2 }}>
            <Button color="inherit" onClick={() => navigate('/features')}>
              Features
            </Button>
            <Button color="inherit" onClick={() => navigate('/pricing')}>
              Pricing
            </Button>
            <Button color="inherit" onClick={() => navigate('/why-refrr')}>
              Why Refrr?
            </Button>
          </Box>
          
          {!isAuthenticated ? (
            <>
              <Button 
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ mr: { xs: 0, sm: 2 } }}
              >
                Login
              </Button>
              <Button 
                variant="contained"
                color="primary"
                onClick={() => navigate('/register')}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                Register Business
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isAuthenticated && (
                <>
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
                  <Button 
                    color="primary"
                    onClick={() => navigate(user?.businessName ? '/dashboard' : '/customer/campaigns')}
                    sx={{ mr: { xs: 0, sm: 2 } }}
                  >
                    {user?.businessName ? "Dashboard" : "My Campaigns"}
                  </Button>
                  <Button 
                    variant="outlined"
                    color="primary"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: { xs: 6, sm: 8 },
          backgroundColor: 'background.default',
          px: { xs: 2, sm: 3 },
        }}
      >
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.grey[100],
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            © {new Date().getFullYear()} Refrr. All rights reserved.
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;
