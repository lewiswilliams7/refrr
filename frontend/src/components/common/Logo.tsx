import React from 'react';
import { Box } from '@mui/material';

const Logo: React.FC = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        '& img': {
          height: { xs: '30px', sm: '40px', md: '50px' },
          width: 'auto'
        }
      }}
    >
      <img src="/logo.svg" alt="Refrr." />
    </Box>
  );
};

export default Logo;
