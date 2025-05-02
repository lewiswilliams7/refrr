import React from 'react';
import {
  Grid as MuiGrid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  styled,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Create a styled Grid component with proper typing
const Grid = styled(MuiGrid)({}) as typeof MuiGrid;

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/campaigns/new')}
        >
          New Campaign
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Active Campaigns</Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              0
            </Typography>
          </Paper>
        </Grid>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Referrals</Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              0
            </Typography>
          </Paper>
        </Grid>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Pending Approvals</Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              0
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Recent Activity
        </Typography>
        <Card>
          <CardContent>
            <Typography color="textSecondary">
              No recent activity to show
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard; 