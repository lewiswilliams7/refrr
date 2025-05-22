import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  Container,
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../common/Avatar';
import Logo from '../common/Logo';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="fixed"
        sx={{
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <Box 
            sx={{
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center',
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
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1.5, mr: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/features')}
              sx={{ 
                fontWeight: 600,
                fontSize: '0.9rem',
                letterSpacing: '0.01em',
                px: 2,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                color: 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Features
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/pricing')}
              sx={{ 
                fontWeight: 600,
                fontSize: '0.9rem',
                letterSpacing: '0.01em',
                px: 2,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                color: 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Pricing
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/why-refrr')}
              sx={{ 
                fontWeight: 600,
                fontSize: '0.9rem',
                letterSpacing: '0.01em',
                px: 2,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                color: 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Why Refrr?
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/contact')}
              sx={{ 
                fontWeight: 600,
                fontSize: '0.9rem',
                letterSpacing: '0.01em',
                px: 2,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                color: 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Contact
            </Button>
          </Box>
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/dashboard')}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  letterSpacing: '0.01em',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                  }
                }}
              >
                Dashboard
              </Button>
              <Avatar
                src={user?.avatar}
                firstName={user?.firstName}
                lastName={user?.lastName}
                size="small"
                alt={`${user?.firstName} ${user?.lastName}'s avatar`}
                sx={{
                  border: '2px solid',
                  borderColor: 'primary.main',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }
                }}
              />
              <Button 
                variant="outlined" 
                color="primary"
                onClick={logout}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  letterSpacing: '0.01em',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  borderWidth: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/login')}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  letterSpacing: '0.01em',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  borderWidth: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/register')}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  letterSpacing: '0.01em',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                  }
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer for fixed AppBar */}
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
          borderTop: '1px solid',
          borderColor: 'divider'
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
}
