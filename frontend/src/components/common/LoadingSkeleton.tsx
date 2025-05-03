import React from 'react';
import { Skeleton, Box, Grid } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'card', count = 1 }) => {
  if (variant === 'card') {
    return (
      <Grid container spacing={3}>
        {[...Array(count)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Skeleton variant="rectangular" height={140} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (variant === 'list') {
    return (
      <Box>
        {[...Array(count)].map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'table') {
    return (
      <Box>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
        {[...Array(count)].map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  return null;
};

export default LoadingSkeleton; 