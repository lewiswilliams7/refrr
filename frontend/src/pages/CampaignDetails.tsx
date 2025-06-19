import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  Tag as TagIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

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
  startDate?: string;
  endDate?: string;
  terms?: string;
  requirements?: string[];
}

export default function CampaignDetails() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${config.apiUrl}/api/campaign/public/${id}`);
        setCampaign(response.data);
      } catch (err: any) {
        console.error('Error fetching campaign:', err);
        setError(err.response?.data?.message || 'Failed to load campaign details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const handleGenerateReferral = async () => {
    if (!campaign) return;
    
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/referrals/generate/${campaign.id}`,
        {},
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

  const formatLocation = (location: Campaign['location']): string => {
    if (typeof location === 'string') {
      return location;
    }
    return `${location.address}, ${location.city}, ${location.postcode}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  if (!campaign) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Campaign not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button
        variant="outlined"
        onClick={() => navigate('/customer/campaigns')}
        sx={{ mb: 3 }}
      >
        Back to Campaigns
      </Button>

      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {campaign.name}
          </Typography>
          
          <Typography variant="h6" color="primary" gutterBottom>
            {campaign.businessName}
          </Typography>

          <Typography variant="body1" paragraph>
            {campaign.description}
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Reward
              </Typography>
              <Typography variant="h5" color="primary">
                {campaign.reward}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Location
              </Typography>
              <Typography variant="body1">
                <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                {formatLocation(campaign.location)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Business Type
              </Typography>
              <Typography variant="body1">
                <BusinessIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                {campaign.businessType}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Campaign Period
              </Typography>
              <Typography variant="body1">
                <AccessTimeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
              </Typography>
            </Grid>
          </Grid>

          {campaign.tags && campaign.tags.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <TagIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Tags
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {campaign.tags.map((tag, index) => (
                  <Chip key={index} label={tag} />
                ))}
              </Stack>
            </Box>
          )}

          {campaign.terms && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Terms & Conditions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {campaign.terms}
              </Typography>
            </Box>
          )}

          {campaign.requirements && campaign.requirements.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Requirements
              </Typography>
              <Stack spacing={1}>
                {campaign.requirements.map((requirement, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    • {requirement}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGenerateReferral}
            >
              Generate Referral Link
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
} 