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
  Container,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  IconButton,
  Collapse,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface CustomerStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  expiredReferrals: number;
  availableCampaigns: number;
  referralStats: {
    total: number;
    completed: number;
    pending: number;
    expired: number;
    completionRate: number;
  };
  recentReferrals: Array<{
    _id: string;
    code: string;
    campaignId: {
      title: string;
      rewardType: string;
      rewardValue: number;
      rewardDescription: string;
      businessName: string;
      businessType: string;
      location: {
        address?: string;
        city?: string;
        postcode?: string;
      };
    };
    referredEmail: string;
    referredName: string;
    referredPhone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    trackingData?: {
      lastViewed: string;
      viewCount: number;
    };
  }>;
  allReferrals: Array<{
    _id: string;
    code: string;
    campaignId: {
      title: string;
      rewardType: string;
      rewardValue: number;
      rewardDescription: string;
      businessName: string;
      businessType: string;
      location: {
        address?: string;
        city?: string;
        postcode?: string;
      };
    };
    referredEmail: string;
    referredName: string;
    referredPhone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    trackingData?: {
      lastViewed: string;
      viewCount: number;
    };
  }>;
}

const CustomerDashboard = () => {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetailedTable, setShowDetailedTable] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchCustomerStats();
  }, []);

  const fetchCustomerStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/customer/dashboard');
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
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
          Customer Dashboard
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          Welcome back, {user?.firstName || user?.email}!
        </Typography>
      </Box>

      {/* Enhanced Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              p: 3,
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
                <PeopleIcon sx={{ color: 'primary.main', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                Total Referrals
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {stats?.totalReferrals || 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              p: 3,
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
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                Completed
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
              {stats?.completedReferrals || 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              p: 3,
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
                Pending
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
              {stats?.pendingReferrals || 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              p: 3,
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
                <CampaignIcon sx={{ color: 'info.main', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                Available Campaigns
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
              {stats?.availableCampaigns || 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Completion Rate and Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              p: 4,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.1),
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                mb: 3
              }}
            >
              Completion Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mr: 2
                }}
              >
                {stats?.referralStats.completionRate || 0}%
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              of your referrals have been completed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats?.completedReferrals || 0} out of {stats?.totalReferrals || 0} referrals completed
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              p: 4,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.1),
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                mb: 3
              }}
            >
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<CampaignIcon />}
                onClick={() => navigate('/customer/campaigns')}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: '0 4px 14px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                Browse Campaigns
              </Button>
              <Button
                variant="outlined"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/referrals')}
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
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Referral Tracking Section */}
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.1),
        }}
      >
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
          Your Referral Tracking
        </Typography>
        <Button
          variant="outlined"
          startIcon={showDetailedTable ? <VisibilityOffIcon /> : <VisibilityIcon />}
          onClick={() => setShowDetailedTable(!showDetailedTable)}
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
          {showDetailedTable ? 'Hide Details' : 'Show Details'}
        </Button>
      </Box>

      {/* Detailed Referrals Table */}
      <Collapse in={showDetailedTable}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign</TableCell>
                    <TableCell>Business</TableCell>
                    <TableCell>Referred To</TableCell>
                    <TableCell>Contact Info</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Views</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.allReferrals
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((referral) => (
                    <TableRow key={referral._id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {referral.campaignId.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {referral.campaignId.rewardValue}
                            {referral.campaignId.rewardType === 'percentage' ? '%' : ' points'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {referral.campaignId.businessName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {referral.campaignId.businessType}
                          </Typography>
                          {referral.campaignId.location.city && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <LocationIcon sx={{ fontSize: 12, mr: 0.5 }} />
                              <Typography variant="caption" color="textSecondary">
                                {referral.campaignId.location.city}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {referral.referredName !== 'Not provided' ? referral.referredName : 'Anonymous'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {referral.referredEmail !== 'Not provided' ? referral.referredEmail : 'No email'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {referral.referredEmail !== 'Not provided' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 12, mr: 0.5 }} />
                              <Typography variant="caption" color="textSecondary">
                                {referral.referredEmail}
                              </Typography>
                            </Box>
                          )}
                          {referral.referredPhone !== 'Not provided' && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon sx={{ fontSize: 12, mr: 0.5 }} />
                              <Typography variant="caption" color="textSecondary">
                                {referral.referredPhone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(referral.status)}
                          color={getStatusColor(referral.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDate(referral.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {referral.trackingData?.viewCount || 0} views
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={stats?.allReferrals.length || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>
      </Collapse>

      {/* Recent Referrals Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Referrals
          </Typography>
          {stats?.recentReferrals && stats.recentReferrals.length > 0 ? (
            <List>
              {stats.recentReferrals.map((referral, index) => (
                <React.Fragment key={referral._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <CampaignIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={referral.campaignId.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {referral.campaignId.businessName} • {referral.campaignId.rewardValue}
                            {referral.campaignId.rewardType === 'percentage' ? '%' : ' points'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Referred: {referral.referredName !== 'Not provided' ? referral.referredName : 'Anonymous'} • {formatDate(referral.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={getStatusText(referral.status)}
                      color={getStatusColor(referral.status) as any}
                      size="small"
                    />
                  </ListItem>
                  {index < stats.recentReferrals.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                No referrals yet. Start by browsing available campaigns!
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate('/customer/campaigns')}
              >
                Browse Campaigns
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default CustomerDashboard; 