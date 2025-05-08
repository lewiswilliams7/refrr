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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { campaignApi } from '../services/api';
import Navigation from '../components/common/Navigation';

interface Campaign {
  _id: string;
  title: string;
  description: string;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  rewardDescription: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  businessName: string;
  businessType: string;
  location: {
    address?: string;
    city: string;
    postcode: string;
  };
  referralLink?: string;
  tags?: string[];
  referralCount?: number;
  expirationDate?: string;
  popularity?: number;
  showRewardDisclaimer?: boolean;
  rewardDisclaimerText?: string;
}

interface Analytics {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  recentActivity: Array<{
    _id: string;
    campaignId: {
      title: string;
      businessName: string;
      rewardType: string;
      rewardValue: number;
    };
    status: string;
    createdAt: string;
  }>;
}

interface FilterState {
  businessType: string;
  city: string;
  rewardType: 'all' | 'percentage' | 'fixed';
  minRewardValue: number;
}

export default function CustomerCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'rewardValue' | 'businessName'>('title');
  const [filters, setFilters] = useState<FilterState>({
    businessType: '',
    city: '',
    rewardType: 'all',
    minRewardValue: 0,
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [bookmarkedCampaigns, setBookmarkedCampaigns] = useState<string[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    fetchCampaigns();
    fetchAnalytics();
  }, [user]);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedCampaigns');
    if (savedBookmarks) {
      setBookmarkedCampaigns(JSON.parse(savedBookmarks));
    }
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await campaignApi.getAnalytics();
      setAnalytics(response.data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignApi.listPublic();
      const validatedCampaigns = data.map((campaign: any) => ({
        ...campaign,
        _id: campaign._id || campaign.id
      }));
      setCampaigns(validatedCampaigns);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      setError(err.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async (campaignId: string) => {
    if (!campaignId) {
      setError('Invalid campaign ID');
      return;
    }

    if (!user?.email) {
      setError('Please log in to generate referral links');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await campaignApi.generateReferralLink(campaignId, {
        referrerEmail: user.email
      });
      
      if (!response?.code) {
        throw new Error('No referral code received from server');
      }

      const referralLink = `${window.location.origin}/refer/${response.code}`;
      
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => 
          campaign._id === campaignId 
            ? { ...campaign, referralLink }
            : campaign
        )
      );
    } catch (err: any) {
      console.error('Error generating referral link:', err);
      if (err.response?.status === 401) {
        setError('Please log in to generate referral links');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to generate referral link');
      }
    } finally {
      setLoading(false);
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

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filters.businessType || campaign.businessType === filters.businessType;
    const matchesCity = !filters.city || campaign.location.city.toLowerCase().includes(filters.city.toLowerCase());
    const matchesRewardType = filters.rewardType === 'all' || campaign.rewardType === filters.rewardType;
    const matchesRewardValue = campaign.rewardValue >= filters.minRewardValue;
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
        return a.title.localeCompare(b.title);
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

  if (loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="xl" sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Customer Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Welcome, {user?.firstName} {user?.lastName}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Analytics Section - Left Side */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <Typography variant="h5" gutterBottom>
                My Analytics
              </Typography>
              
              {/* Analytics Cards */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" color="textSecondary">Total Referrals</Typography>
                    <Typography variant="h3" sx={{ mt: 1 }}>
                      {analytics?.totalReferrals || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" color="textSecondary">Successful</Typography>
                    <Typography variant="h3" sx={{ mt: 1 }}>
                      {analytics?.successfulReferrals || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" color="textSecondary">Pending</Typography>
                    <Typography variant="h3" sx={{ mt: 1 }}>
                      {analytics?.pendingReferrals || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" color="textSecondary">Total Rewards</Typography>
                    <Typography variant="h3" sx={{ mt: 1 }}>
                      {analytics?.totalRewards || 0}
                      {analytics?.totalRewards ? ' points' : ''}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Recent Activity */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  {analytics?.recentActivity.map((activity) => (
                    <Card key={activity._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1">
                              {activity.campaignId.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {activity.campaignId.businessName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Chip 
                            label={activity.status.toUpperCase()} 
                            color={getStatusColor(activity.status) as any}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Campaigns Section - Right Side */}
          <Grid item xs={12} md={8}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Available Campaigns
              </Typography>
              
              {/* Search and Filter Bar */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <IconButton 
                  onClick={() => setShowFilters(!showFilters)}
                  color={showFilters ? 'primary' : 'default'}
                >
                  <FilterIcon />
                </IconButton>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="rewardValue">Reward Value</MenuItem>
                    <MenuItem value="businessName">Business Name</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Filters */}
              {showFilters && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Business Type</InputLabel>
                        <Select
                          value={filters.businessType}
                          label="Business Type"
                          onChange={(e) => setFilters({ ...filters, businessType: e.target.value })}
                        >
                          <MenuItem value="">All Types</MenuItem>
                          <MenuItem value="restaurant">Restaurant</MenuItem>
                          <MenuItem value="retail">Retail</MenuItem>
                          <MenuItem value="service">Service</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        value={filters.city}
                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Reward Type</InputLabel>
                        <Select
                          value={filters.rewardType}
                          label="Reward Type"
                          onChange={(e) => setFilters({ ...filters, rewardType: e.target.value as any })}
                        >
                          <MenuItem value="all">All Types</MenuItem>
                          <MenuItem value="percentage">Percentage</MenuItem>
                          <MenuItem value="fixed">Fixed</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Min Reward Value"
                        type="number"
                        value={filters.minRewardValue}
                        onChange={(e) => setFilters({ ...filters, minRewardValue: Number(e.target.value) })}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Tags Filter */}
              <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Array.from(new Set(campaigns.flatMap(c => c.tags || []))).map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagClick(tag)}
                    color={selectedTags.includes(tag) ? 'primary' : 'default'}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>

              {/* Campaigns Grid */}
              <Grid container spacing={3}>
                {sortedCampaigns.map((campaign) => (
                  <Grid item xs={12} key={campaign._id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {campaign.title}
                            </Typography>
                            <Typography color="textSecondary" paragraph>
                              {campaign.businessName} - {campaign.businessType}
                            </Typography>
                            <Typography color="textSecondary" paragraph>
                              {campaign.location.address ? `${campaign.location.address}, ` : ''}{campaign.location.city}, {campaign.location.postcode}
                            </Typography>
                            <Typography paragraph>
                              {campaign.description}
                            </Typography>
                            
                            {/* Tags */}
                            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {campaign.tags?.map(tag => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  onClick={() => handleTagClick(tag)}
                                  color={selectedTags.includes(tag) ? 'primary' : 'default'}
                                />
                              ))}
                            </Box>

                            {/* Campaign Stats */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                              {campaign.referralCount && (
                                <Chip
                                  icon={<PeopleIcon />}
                                  label={`${campaign.referralCount} referrals`}
                                  size="small"
                                />
                              )}
                              {campaign.popularity && (
                                <Chip
                                  icon={<TrendingUpIcon />}
                                  label={`${campaign.popularity}% popular`}
                                  size="small"
                                  color={getPopularityColor(campaign.popularity) as any}
                                />
                              )}
                              {campaign.expirationDate && (
                                <Chip
                                  icon={<AccessTimeIcon />}
                                  label={`Expires ${new Date(campaign.expirationDate).toLocaleDateString()}`}
                                  size="small"
                                />
                              )}
                            </Box>

                            <Typography variant="body1" sx={{ mb: 2 }}>
                              Reward: {campaign.rewardValue}
                              {campaign.rewardType === 'percentage' ? '%' : ' points'} - {campaign.rewardDescription}
                            </Typography>

                            {campaign.showRewardDisclaimer && (
                              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                {campaign.rewardDisclaimerText || 'Reward will be provided after the referred customer books with the business'}
                              </Typography>
                            )}
                          </Box>
                          <Box>
                            <IconButton onClick={() => handleShare(campaign)}>
                              <ShareIcon />
                            </IconButton>
                            <IconButton onClick={() => handleBookmark(campaign._id)}>
                              {bookmarkedCampaigns.includes(campaign._id) ? (
                                <BookmarkIcon color="primary" />
                              ) : (
                                <BookmarkBorderIcon />
                              )}
                            </IconButton>
                          </Box>
                        </Box>

                        {campaign.referralLink ? (
                          <Box sx={{ mt: 2 }}>
                            <TextField
                              fullWidth
                              value={campaign.referralLink}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Tooltip title={copySuccess === campaign.referralLink ? "Copied!" : "Copy to clipboard"}>
                                      <IconButton onClick={() => handleCopyLink(campaign.referralLink!)}>
                                        <CopyIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </InputAdornment>
                                ),
                              }}
                              variant="outlined"
                            />
                          </Box>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => handleGenerateLink(campaign._id)}
                            disabled={loading}
                          >
                            Generate Referral Link
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Campaign</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShareIcon />}
              onClick={() => {
                window.open(
                  `https://twitter.com/intent/tweet?text=Check out this amazing campaign: ${selectedCampaign?.title}&url=${selectedCampaign?.referralLink}`,
                  '_blank'
                );
              }}
            >
              Share on Twitter
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShareIcon />}
              onClick={() => {
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${selectedCampaign?.referralLink}`,
                  '_blank'
                );
              }}
            >
              Share on Facebook
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 