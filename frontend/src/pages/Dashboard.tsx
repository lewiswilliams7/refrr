import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Container,
  Alert,
  Checkbox,
  Stack,
  TextField,
  InputAdornment,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Campaign as CampaignIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Navigation from '../components/common/Navigation';

interface DashboardStats {
  activeCampaigns: number;
  totalReferrals: number;
  pendingApprovals: number;
  recentActivity: Array<{
    _id: string;
    referrerEmail: string;
    referredEmail: string;
    referredName: string;
    referredPhone: string;
    status: string;
    campaignId: {
      title: string;
    };
    createdAt: string;
  }>;
  referralStats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  campaignStats: {
    total: number;
    active: number;
    completed: number;
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);
  const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, referralId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedReferral(referralId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReferral(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const handleStatusChange = async (referralId: string, newStatus: string) => {
    try {
      setLoading(true);
      await api.patch(`/api/referrals/${referralId}/status`, { status: newStatus });
      await fetchDashboardStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update referral status');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      await Promise.all(
        selectedReferrals.map(referralId =>
          api.patch(`/api/referrals/${referralId}/status`, { status: newStatus })
        )
      );
      setSelectedReferrals([]);
      await fetchDashboardStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update referral statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (referralId: string) => {
    setSelectedReferrals(prev =>
      prev.includes(referralId)
        ? prev.filter(id => id !== referralId)
        : [...prev, referralId]
    );
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="xl" sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Business Dashboard
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Welcome, {user?.businessName || 'Business Owner'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CampaignIcon />}
            onClick={() => navigate('/campaigns')}
            sx={{ 
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
          >
            View Campaigns
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" color="textSecondary">Active Campaigns</Typography>
              <Typography variant="h3">{stats?.activeCampaigns || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" color="textSecondary">Total Referrals</Typography>
              <Typography variant="h3">{stats?.referralStats?.total || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" color="textSecondary">Pending Approvals</Typography>
              <Typography variant="h3">{stats?.pendingApprovals || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" color="textSecondary">Approved Referrals</Typography>
              <Typography variant="h3">{stats?.referralStats?.approved || 0}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity Section */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {selectedReferrals.length > 0 && (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleBulkStatusChange('approved')}
                  disabled={loading}
                >
                  Approve Selected
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleBulkStatusChange('rejected')}
                  disabled={loading}
                >
                  Reject Selected
                </Button>
              </Stack>
            )}
          </Box>

          {stats?.recentActivity.map((activity) => (
            <Card key={activity._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Checkbox
                      checked={selectedReferrals.includes(activity._id)}
                      onChange={() => handleCheckboxChange(activity._id)}
                    />
                    <Box>
                      <Typography variant="subtitle1">
                        {activity.referrerEmail} → {activity.referredName} ({activity.referredEmail})
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Campaign: {activity.campaignId.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Phone: {activity.referredPhone}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Chip 
                      label={activity.status.toUpperCase()} 
                      color={getStatusColor(activity.status) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      onClick={(e) => handleMenuClick(e, activity._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            selectedReferral && handleStatusChange(selectedReferral, 'approved');
            handleMenuClose();
          }}
        >
          Approve
        </MenuItem>
        <MenuItem 
          onClick={() => {
            selectedReferral && handleStatusChange(selectedReferral, 'rejected');
            handleMenuClose();
          }}
        >
          Reject
        </MenuItem>
      </Menu>
    </>
  );
};

export default Dashboard;