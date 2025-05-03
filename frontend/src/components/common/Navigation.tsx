import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => navigate('/')}
          >
            <Logo />
          </Box>
        </Box>
        {isHomePage && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" onClick={() => navigate('/register/customer')}>
              Register as Customer
            </Button>
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
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 