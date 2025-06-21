import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  TrendingUp as TrendingUpIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  businessName: string;
  reward: string;
  status: string;
}

interface Referral {
  id: string;
  campaignName: string;
  referrerEmail: string;
  referredEmail: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [value, setValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: string } | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const [usersRes, campaignsRes, referralsRes] = await Promise.all([
        axios.get(`${config.apiUrl}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.apiUrl}/api/campaign`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.apiUrl}/api/referrals`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUsers(usersRes.data);
      setCampaigns(campaignsRes.data);
      setReferrals(referralsRes.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, id: string, type: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem({ id, type });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      await axios.delete(`${config.apiUrl}/api/${selectedItem.type}/${selectedItem.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting item');
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      await axios.patch(`${config.apiUrl}/api/${selectedItem.type}/${selectedItem.id}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating status');
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
      {/* Enhanced Header */}
      <Box 
        sx={{ 
          mb: 6,
          p: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          borderRadius: 4,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.1),
        }}
      >
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
          Admin Dashboard
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          Manage your platform and monitor system activity
        </Typography>
      </Box>

      {/* Enhanced Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              p: 4,
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  mr: 2
                }}
              >
                <PeopleIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Users
              </Typography>
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
              {users.length}
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/admin/users')}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              View All Users
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              p: 4,
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  mr: 2
                }}
              >
                <CampaignIcon sx={{ color: 'success.main', fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Campaigns
              </Typography>
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'success.main', mb: 3 }}>
              {campaigns.length}
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/admin/campaigns')}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              View All Campaigns
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              p: 4,
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  mr: 2
                }}
              >
                <TrendingUpIcon sx={{ color: 'info.main', fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Referrals
              </Typography>
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'info.main', mb: 3 }}>
              {referrals.length}
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/admin/referrals')}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              View All Referrals
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 