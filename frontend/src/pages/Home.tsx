import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Stack,
  alpha,
  Alert,
  CircularProgress,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/Layout/PublicLayout';
import axios from 'axios';
import config from '../config';
import { BUSINESS_TYPES, Business, BusinessType } from '../types/business';
import { useAuth } from '../context/AuthContext';

interface FilterState {
  businessType: BusinessType | '';
  city: string;
  hasActiveCampaigns: boolean;
  rewardType: 'all' | 'percentage' | 'fixed';
  minRewardValue: number;
}

export default function Home() {
  const { user, isLoading: isAuthLoading, error: authError } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    businessType: '',
    city: '',
    hasActiveCampaigns: false,
    rewardType: 'all',
    minRewardValue: 0,
  });
  const [sortBy, setSortBy] = useState<'name' | 'rewards' | 'location'>('name');
  const [showFilters, setShowFilters] = useState(false);
  
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading) {
      fetchBusinesses();
    }
  }, [isAuthLoading]);

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${config.apiUrl}/api/businesses/public`);
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError('Failed to load businesses. Please try again later.');
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filters.businessType || business.businessType === filters.businessType;
    const matchesCity = !filters.city || business.location.city.toLowerCase().includes(filters.city.toLowerCase());
    const matchesActiveCampaigns = !filters.hasActiveCampaigns || business.activeCampaigns.count > 0;
    const matchesRewardType = filters.rewardType === 'all' || 
      business.activeCampaigns.rewards.some(reward => reward.type === filters.rewardType);
    const matchesRewardValue = business.activeCampaigns.rewards.some(reward => reward.value >= filters.minRewardValue);

    return matchesSearch && matchesType && matchesCity && matchesActiveCampaigns && 
           matchesRewardType && matchesRewardValue;
  });

  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    switch (sortBy) {
      case 'rewards':
        return b.activeCampaigns.count - a.activeCampaigns.count;
      case 'location':
        return a.location.city.localeCompare(b.location.city);
      default:
        return a.businessName.localeCompare(b.businessName);
    }
  });

  if (isAuthLoading) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        </Container>
      </PublicLayout>
    );
  }

  const handleNavigation = () => {
    if (!user) return '/register/customer';
    return user.businessName ? '/dashboard' : '/customer/campaigns';
  };

  const getNavigationText = () => {
    if (!user) return 'Register as Customer';
    return user.businessName ? 'Dashboard' : 'My Campaigns';
  };

  return (
    <PublicLayout>
      <Container maxWidth="lg">
        <Alert 
          severity="info" 
          sx={{ 
            mb: 4,
            '& a': {
              color: 'inherit',
              textDecoration: 'underline',
              '&:hover': {
                color: 'primary.main'
              }
            }
          }}
        >
          This is a beta version of Refrr. Please report any issues or provide feedback{' '}
          <a href="mailto:support@refrr.com" target="_blank" rel="noopener noreferrer">
            here
          </a>
          .
        </Alert>

        {authError && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {authError}
            <Button 
              size="small" 
              onClick={() => window.location.reload()}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
            <Button 
              size="small" 
              onClick={fetchBusinesses}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}

        {/* Hero Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
            color: 'white',
            py: { xs: 8, md: 12 },
            mb: 6,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("/pattern.svg")',
              opacity: 0.1,
            }
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography 
                  variant="h2" 
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {user ? 'Welcome Back!' : 'Earn Rewards Through Referrals'}
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4,
                    opacity: 0.9,
                    fontSize: { xs: '1.2rem', md: '1.5rem' }
                  }}
                >
                  {user 
                    ? `Start referring your friends to earn rewards, ${user.firstName}!`
                    : 'Discover local businesses and earn rewards by referring your friends'
                  }
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 4, 
                    maxWidth: '600px',
                    opacity: 0.8,
                    fontSize: { xs: '1rem', md: '1.1rem' }
                  }}
                >
                  {user
                    ? 'Browse businesses below to find ones you want to refer. Click on a business to view their campaigns and generate your referral link.'
                    : 'Register as a customer to start referring your friends to local businesses. Earn rewards for every successful referral you make. It\'s completely free to sign up!'
                  }
                </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      minWidth: '250px',
                      py: 1.5,
                      fontSize: '1.1rem',
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                    onClick={() => navigate(handleNavigation())}
                  >
                    {getNavigationText()}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      minWidth: '250px',
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'grey.100',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                    onClick={() => navigate('/register')}
                  >
                    Register Your Business
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{
                    p: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                  }}
                >
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TrendingUpIcon sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6">Grow Your Business</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Increase customer acquisition through referrals
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PeopleIcon sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6">Build Your Network</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Connect with local businesses and customers
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocalOfferIcon sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6">Earn Rewards</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Get discounts and points for successful referrals
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Search and Filter Section */}
        <Container maxWidth="lg">
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search for businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ borderRadius: 2 }}
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {showFilters && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 3, 
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Business Type</InputLabel>
                      <Select
                        value={filters.businessType}
                        onChange={(e) => setFilters({ 
                          ...filters, 
                          businessType: e.target.value as BusinessType | '' 
                        })}
                        label="Business Type"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">All Types</MenuItem>
                        {BUSINESS_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="City"
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Reward Type</InputLabel>
                      <Select
                        value={filters.rewardType}
                        onChange={(e) => setFilters({ ...filters, rewardType: e.target.value as FilterState['rewardType'] })}
                        label="Reward Type"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="all">All Rewards</MenuItem>
                        <MenuItem value="percentage">Percentage Discount</MenuItem>
                        <MenuItem value="fixed">Fixed Points</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Min Reward Value"
                      type="number"
                      value={filters.minRewardValue}
                      onChange={(e) => setFilters({ ...filters, minRewardValue: Number(e.target.value) })}
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>

          {/* Business Cards */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom>
              Featured Businesses
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : businesses.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No businesses found. Check back later for updates!
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {sortedBusinesses.map((business) => (
                  <Grid item xs={12} md={6} key={business._id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[8],
                        }
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {business.businessName}
                            </Typography>
                            <Chip
                              label={business.businessType}
                              color="primary"
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            <Typography color="textSecondary" paragraph>
                              <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                              {business.location.city}
                            </Typography>
                          </Box>
                          <Box>
                            {business.activeCampaigns.count > 0 ? (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/register/customer')}
                                sx={{ borderRadius: 2 }}
                              >
                                Register to Refer
                              </Button>
                            ) : (
                              <Button
                                variant="outlined"
                                color="primary"
                                disabled
                                sx={{ borderRadius: 2 }}
                              >
                                No Active Campaigns
                              </Button>
                            )}
                          </Box>
                        </Box>
                        {business.activeCampaigns.rewards.length > 0 ? (
                          <Box mt={2}>
                            <Typography variant="subtitle1" gutterBottom>
                              Active Rewards:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {business.activeCampaigns.rewards.map((reward, index) => (
                                <Chip
                                  key={index}
                                  label={`${reward.value}${reward.type === 'percentage' ? '%' : ' points'} - ${reward.description}`}
                                  color="primary"
                                  size="small"
                                  sx={{ borderRadius: 1 }}
                                />
                              ))}
                            </Stack>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => navigate(`/business/${business._id}`)}
                              sx={{ mt: 1 }}
                            >
                              View Details
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            No active campaigns
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Container>
      </Container>
    </PublicLayout>
  );
}
