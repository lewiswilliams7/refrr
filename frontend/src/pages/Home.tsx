import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/Layout/PublicLayout';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

interface FilterState {
  businessType: string;
  city: string;
  hasActiveCampaigns: boolean;
  rewardType: 'all' | 'percentage' | 'fixed';
  minRewardValue: number;
}

interface Business {
  id: string;
  name: string;
  description: string;
  type: string;
  location: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  businessName: string;
  reward: string;
  status: string;
}

const Home: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Only fetch businesses if user is not logged in
      if (!user) {
        try {
          const businessesRes = await axios.get(`${config.apiUrl}/api/businesses/public`);
          setBusinesses(businessesRes.data);
        } catch (err) {
          console.log('Businesses not available:', err);
      setBusinesses([]);
        }
      }
      
      // Fetch campaigns
      const campaignsRes = await axios.get(`${config.apiUrl}/api/campaign/public`);
      setCampaigns(campaignsRes.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filters.businessType || business.type.toLowerCase().includes(filters.businessType.toLowerCase());
    const matchesCity = !filters.city || business.location.toLowerCase().includes(filters.city.toLowerCase());
    const matchesActiveCampaigns = !filters.hasActiveCampaigns || campaigns.some(campaign => campaign.businessName === business.name);
    const matchesRewardType = filters.rewardType === 'all' || 
      campaigns.some(campaign => campaign.businessName === business.name && campaign.reward.toLowerCase().includes(filters.rewardType.toLowerCase()));
    const matchesRewardValue = campaigns.some(campaign => campaign.businessName === business.name && Number(campaign.reward.split(' ')[0]) >= filters.minRewardValue);

    return matchesSearch && matchesType && matchesCity && matchesActiveCampaigns && 
           matchesRewardType && matchesRewardValue;
  });

  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    switch (sortBy) {
      case 'rewards':
        return b.name.localeCompare(a.name);
      case 'location':
        return a.location.localeCompare(b.location);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <PublicLayout>
      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Beta Feedback Alert */}
        <Alert 
          severity="info" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: 28
            }
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            We're in Beta!
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Help us improve Refrr by sharing your feedback.
            <Button
              variant="text"
              color="inherit"
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
              onClick={() => navigate('/feedback')}
            >
              Click here to share your thoughts
            </Button>
          </Typography>
        </Alert>

        {/* Hero Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
            color: 'white',
            py: { xs: 8, md: 12 },
            mb: 6,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url(/pattern.svg)',
              opacity: 0.1,
              zIndex: 0
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
              zIndex: 1
            }
          }}
        >
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                mb: 3
              }}
            >
              Grow Your Business Through Referrals
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 6, 
                opacity: 0.9,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                maxWidth: '800px'
              }}
            >
              The affordable referral platform built for small businesses. Turn your customers into your best marketers.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/register/customer')}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                Register as Customer (Free)
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  bgcolor: 'white',
                  color: 'primary.main',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                Register as Business
              </Button>
            </Stack>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => navigate('/contact')}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                Book a Demo
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Stats Section */}
        <Box 
          sx={{ 
            mb: 8,
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 4, md: 8 },
            flexWrap: 'wrap',
            px: 2
          }}
        >
          <Box sx={{ textAlign: 'center', minWidth: { xs: '140px', sm: '200px' } }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              94%
              <TrendingUpIcon sx={{ fontSize: '1.5rem' }} />
            </Typography>
            <Typography variant="body1" color="text.secondary">
              of businesses saw increased customer retention
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: { xs: '140px', sm: '200px' } }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              87%
              <PeopleIcon sx={{ fontSize: '1.5rem' }} />
            </Typography>
            <Typography variant="body1" color="text.secondary">
              of customers earned rewards through referrals
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: { xs: '140px', sm: '200px' } }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              4.8
              <StarIcon sx={{ fontSize: '1.5rem' }} />
            </Typography>
            <Typography variant="body1" color="text.secondary">
              average customer satisfaction rating
            </Typography>
          </Box>
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
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      bgcolor: 'background.default',
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
                    sx={{ 
                      borderRadius: 2,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                      }
                    }}
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
                  bgcolor: 'background.default',
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
                        onChange={(e) => setFilters({ ...filters, businessType: e.target.value })}
                        label="Business Type"
                        sx={{ 
                          borderRadius: 2,
                          bgcolor: 'background.paper'
                        }}
                      >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="restaurant">Restaurant</MenuItem>
                        <MenuItem value="retail">Retail</MenuItem>
                        <MenuItem value="service">Service</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="City"
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      sx={{ 
                        borderRadius: 2,
                        bgcolor: 'background.paper'
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Reward Type</InputLabel>
                      <Select
                        value={filters.rewardType}
                        onChange={(e) => setFilters({ ...filters, rewardType: e.target.value as FilterState['rewardType'] })}
                        label="Reward Type"
                        sx={{ 
                          borderRadius: 2,
                          bgcolor: 'background.paper'
                        }}
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
                      sx={{ 
                        borderRadius: 2,
                        bgcolor: 'background.paper'
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>

          {/* Business Cards */}
          <Box sx={{ mt: 6 }}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                mb: 4,
                color: 'text.primary'
              }}
            >
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
                  <Grid item xs={12} md={6} key={business.id}>
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
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                              {business.name}
                            </Typography>
                            <Typography color="textSecondary" paragraph>
                              <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                              {business.location}
                            </Typography>
                          </Box>
                          <Box>
                            {campaigns.some(campaign => campaign.businessName === business.name) ? (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/register/customer')}
                                sx={{ 
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 500
                                }}
                              >
                                Register to Refer
                              </Button>
                            ) : (
                              <Button
                                variant="outlined"
                                color="primary"
                                disabled
                                sx={{ 
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 500
                                }}
                              >
                                No Active Campaigns
                              </Button>
                            )}
                          </Box>
                        </Box>
                        {campaigns.some(campaign => campaign.businessName === business.name) && (
                          <Box mt={2}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                              Active Campaigns:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {campaigns.filter(campaign => campaign.businessName === business.name).map((campaign, index) => (
                                <Chip
                                  key={index}
                                  label={campaign.name}
                                  color="primary"
                                  size="small"
                                  sx={{ 
                                    borderRadius: 1,
                                    fontWeight: 500
                                  }}
                                />
                              ))}
                            </Stack>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => navigate(`/business/${business.id}`)}
                              sx={{ 
                                mt: 1,
                                fontWeight: 500,
                                color: 'primary.main'
                              }}
                            >
                              View Details
                            </Button>
                          </Box>
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
};

export default Home;
