import React from 'react';
import { Typography, Box } from '@mui/material';

const Logo: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          color: 'inherit',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          '& .dot': {
            color: '#2196f3',
            marginLeft: '2px',
          }
        }}
      >
        Refrr<span className="dot">.</span>
      </Typography>
    </Box>
  );
};

export default Logo;
