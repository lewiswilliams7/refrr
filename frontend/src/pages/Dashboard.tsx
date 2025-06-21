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
  alpha,
  useTheme,
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
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'rejected'>('all');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

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
      case 'completed':
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

  // Filter activities based on status
  const filteredActivities = stats?.recentActivity.filter(activity => {
    if (statusFilter === 'all') return true;
    return activity.status === statusFilter;
  }) || [];

  // Get filtered counts
  const getFilteredCount = (status: string) => {
    return stats?.recentActivity.filter(activity => activity.status === status).length || 0;
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
        {/* Enhanced Header */}
        <Box 
          sx={{ 
            mb: 6, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Box>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Business Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Welcome back, {user?.businessName || 'Business Owner'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CampaignIcon />}
            onClick={() => navigate('/campaigns')}
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3), 0 4px 10px rgba(0,0,0,0.1)',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(25, 118, 210, 0.4), 0 6px 15px rgba(0,0,0,0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}
          >
            View Campaigns
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Enhanced Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    mr: 2
                  }}
                >
                  <CampaignIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Active Campaigns
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {stats?.activeCampaigns || 0}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                border: '1px solid',
                borderColor: alpha(theme.palette.success.main, 0.2),
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(76, 175, 80, 0.15)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    mr: 2
                  }}
                >
                  <PeopleIcon sx={{ color: 'success.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Total Referrals
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats?.referralStats?.total || 0}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                border: '1px solid',
                borderColor: alpha(theme.palette.warning.main, 0.2),
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(255, 152, 0, 0.15)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    mr: 2
                  }}
                >
                  <ScheduleIcon sx={{ color: 'warning.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Pending Approvals
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {stats?.pendingApprovals || 0}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                border: '1px solid',
                borderColor: alpha(theme.palette.info.main, 0.2),
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(3, 169, 244, 0.15)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    mr: 2
                  }}
                >
                  <CheckCircleIcon sx={{ color: 'info.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Approved Referrals
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                {stats?.referralStats?.approved || 0}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced Recent Activity Section */}
        <Card 
          sx={{ 
            p: 4,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1),
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Recent Activity
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setStatusFilter('all')}
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  minWidth: 'auto',
                  ...(statusFilter === 'all' && {
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                  }),
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                All ({stats?.recentActivity.length || 0})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setStatusFilter('pending')}
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  minWidth: 'auto',
                  color: statusFilter === 'pending' ? 'white' : 'warning.main',
                  borderColor: 'warning.main',
                  ...(statusFilter === 'pending' && {
                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                    boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                  }),
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                Pending ({getFilteredCount('pending')})
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setStatusFilter('completed')}
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  minWidth: 'auto',
                  color: statusFilter === 'completed' ? 'white' : 'success.main',
                  borderColor: 'success.main',
                  ...(statusFilter === 'completed' && {
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                  }),
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                Completed ({getFilteredCount('completed')})
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setStatusFilter('rejected')}
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  minWidth: 'auto',
                  color: statusFilter === 'rejected' ? 'white' : 'error.main',
                  borderColor: 'error.main',
                  ...(statusFilter === 'rejected' && {
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                    boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                  }),
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                Rejected ({getFilteredCount('rejected')})
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            {selectedReferrals.length > 0 && (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleBulkStatusChange('completed')}
                  disabled={loading}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  Complete Selected ({selectedReferrals.length})
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleBulkStatusChange('rejected')}
                  disabled={loading}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(244, 67, 54, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  Reject Selected ({selectedReferrals.length})
                </Button>
              </Stack>
            )}
          </Box>

          {filteredActivities.map((activity) => (
            <Card 
              key={activity._id} 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Checkbox
                      checked={selectedReferrals.includes(activity._id)}
                      onChange={() => handleCheckboxChange(activity._id)}
                      sx={{
                        color: alpha(theme.palette.primary.main, 0.3),
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        }
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {activity.referrerEmail} → {activity.referredName} ({activity.referredEmail})
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Campaign: {activity.campaignId.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Phone: {activity.referredPhone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={activity.status.toUpperCase()} 
                      color={getStatusColor(activity.status) as any}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        borderRadius: 1.5,
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
                    />
                    <IconButton
                      onClick={(e) => handleMenuClick(e, activity._id)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        }
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Card>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            selectedReferral && handleStatusChange(selectedReferral, 'completed');
            handleMenuClose();
          }}
        >
          Complete
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