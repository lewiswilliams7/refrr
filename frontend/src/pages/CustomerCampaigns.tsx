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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/common/Logo';

interface Campaign {
  id: string;
  name: string;
  description: string;
  businessName: string;
  reward: string;
  status: string;
  location: {
    address: string;
    city: string;
    postcode: string;
  } | string;
  businessType: string;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  tags?: string[];
}

interface Analytics {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
}

interface FilterState {
  businessType: string;
  city: string;
  hasActiveCampaigns: boolean;
  rewardType: 'all' | 'percentage' | 'fixed';
  minRewardValue: number;
}

export default function CustomerCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
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
  const [sortBy, setSortBy] = useState<'name' | 'rewardValue' | 'businessName'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [bookmarkedCampaigns, setBookmarkedCampaigns] = useState<string[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        console.log('Token available:', !!token);
        
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }

        // Set the token in axios defaults for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        console.log('Fetching campaigns...');
        const campaignsRes = await axios.get(`${config.apiUrl}/api/campaign/public`);
        console.log('Campaigns response:', campaignsRes.data);
        setCampaigns(campaignsRes.data);

        // Try to fetch analytics, but don't fail if it's not available
        try {
          const analyticsRes = await axios.get(`${config.apiUrl}/api/campaign/analytics`);
          console.log('Analytics response:', analyticsRes.data);
          setAnalytics(analyticsRes.data);
        } catch (analyticsError) {
          console.log('Analytics not available:', analyticsError);
          // Set default analytics
          setAnalytics({
            totalReferrals: 0,
            successfulReferrals: 0,
            pendingReferrals: 0,
            totalRewards: 0
          });
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          console.log('Unauthorized, redirecting to login');
          navigate('/login', { replace: true });
        } else {
          setError(err.response?.data?.message || 'Failed to load data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedCampaigns');
    if (savedBookmarks) {
      setBookmarkedCampaigns(JSON.parse(savedBookmarks));
    }
  }, []);

  const handleGenerateReferral = async (campaignId: string) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        alert('Please log in to generate a referral link');
        return;
      }

      const response = await axios.post(
        `${config.apiUrl}/api/referrals/generate/${campaignId}`,
        { referrerEmail: userEmail },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      // Copy referral link to clipboard
      const referralLink = `${window.location.origin}/#/referral/${response.data.code}`;
      await navigator.clipboard.writeText(referralLink);
      alert('Referral link copied to clipboard!');
    } catch (err: any) {
      console.error('Error generating referral:', err);
      alert(err.response?.data?.message || 'Failed to generate referral link');
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopySuccess(link);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleShare = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShareDialogOpen(true);
  };

  const handleBookmark = (campaignId: string) => {
    const newBookmarks = bookmarkedCampaigns.includes(campaignId)
      ? bookmarkedCampaigns.filter(id => id !== campaignId)
      : [...bookmarkedCampaigns, campaignId];
    
    setBookmarkedCampaigns(newBookmarks);
    localStorage.setItem('bookmarkedCampaigns', JSON.stringify(newBookmarks));
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 80) return 'success';
    if (popularity >= 50) return 'warning';
    return 'error';
  };

  const formatLocation = (location: Campaign['location']): string => {
    if (typeof location === 'string') {
      return location;
    }
    return `${location.address}, ${location.city}, ${location.postcode}`;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      (campaign.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (campaign.businessName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = !filters.businessType || campaign.businessType === filters.businessType;
    
    // Handle location filtering based on type
    const matchesCity = !filters.city || (() => {
      if (typeof campaign.location === 'string') {
        return campaign.location.toLowerCase().includes(filters.city.toLowerCase());
      }
      return campaign.location?.city?.toLowerCase().includes(filters.city.toLowerCase()) || false;
    })();

    const matchesRewardType = filters.rewardType === 'all' || campaign.rewardType === filters.rewardType;
    const matchesRewardValue = (campaign.rewardValue || 0) >= filters.minRewardValue;
    const matchesTags = selectedTags.length === 0 || 
      (campaign.tags && selectedTags.every(tag => campaign.tags?.includes(tag)));

    return matchesSearch && matchesType && matchesCity && matchesRewardType && matchesRewardValue && matchesTags;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'rewardValue':
        return b.rewardValue - a.rewardValue;
      case 'businessName':
        return a.businessName.localeCompare(b.businessName);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box 
        sx={{ 
          mb: 4,
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
        onClick={() => navigate('/')}
      >
        <Logo />
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        Available Campaigns
      </Typography>

      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Referrals
                </Typography>
                <Typography variant="h3">
                  {analytics.totalReferrals}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Successful Referrals
                </Typography>
                <Typography variant="h3">
                  {analytics.successfulReferrals}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pending Referrals
                </Typography>
                <Typography variant="h3">
                  {analytics.pendingReferrals}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Rewards
                </Typography>
                <Typography variant="h3">
                  {analytics.totalRewards}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {showFilters && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Business Type</InputLabel>
                  <Select
                    value={filters.businessType}
                    onChange={(e) => setFilters({ ...filters, businessType: e.target.value })}
                    label="Business Type"
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
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Reward Type</InputLabel>
                  <Select
                    value={filters.rewardType}
                    onChange={(e) => setFilters({ ...filters, rewardType: e.target.value as FilterState['rewardType'] })}
                    label="Reward Type"
                  >
                    <MenuItem value="all">All Rewards</MenuItem>
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="fixed">Fixed Amount</MenuItem>
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
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        {sortedCampaigns.map((campaign) => (
          <Grid item xs={12} md={6} key={campaign.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {campaign.name}
                </Typography>
                <Typography color="textSecondary" paragraph>
                  {campaign.description}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Business: {campaign.businessName}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Reward: {campaign.reward}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                  {formatLocation(campaign.location)}
                </Typography>
                {campaign.tags && campaign.tags.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    {campaign.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Stack>
                )}
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleGenerateReferral(campaign.id)}
                  >
                    Generate Referral
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(`/customer/campaign/${campaign.id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 