import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import PublicLayout from '../components/Layout/PublicLayout';
import {
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';

interface CampaignDetails {
  title: string;
  description: string;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  rewardDescription: string;
  businessName: string;
  businessType: string;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
}

export default function ReferralLanding() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails | null>(null);

  console.log('ReferralLanding component state:', {
    code,
    loading,
    error,
    success,
    hasCampaignDetails: !!campaignDetails
  });

  const fetchReferralDetails = useCallback(async () => {
    if (!code) {
      console.log('No referral code provided');
      setError('Invalid referral code');
      setLoading(false);
      return;
    }

    console.log('Fetching referral details for code:', code);
    console.log('API URL:', config.apiUrl);

    try {
      setLoading(true);
      setError('');
      const url = `${config.apiUrl}/api/referrals/code/${code}`;
      console.log('Making API call to:', url);
      
      const response = await axios.get(url);
      console.log('API response:', response.data);
      
      const referral = response.data;
      
      if (!referral || !referral.campaignId) {
        console.error('Invalid referral data:', referral);
        throw new Error('Invalid referral data received');
      }

      console.log('Setting campaign details:', {
        title: referral.campaignId.title,
        description: referral.campaignId.description || '',
        rewardType: referral.campaignId.rewardType,
        rewardValue: referral.campaignId.rewardValue,
        rewardDescription: referral.campaignId.rewardDescription || '',
        businessName: referral.businessId?.businessName || 'Unknown Business',
        businessType: referral.businessId?.businessType || 'Unknown Type',
        location: {
          address: referral.businessId?.location?.address || '',
          city: referral.businessId?.location?.city || '',
          postcode: referral.businessId?.location?.postcode || ''
        }
      });

      setCampaignDetails({
        title: referral.campaignId.title,
        description: referral.campaignId.description || '',
        rewardType: referral.campaignId.rewardType,
        rewardValue: referral.campaignId.rewardValue,
        rewardDescription: referral.campaignId.rewardDescription || '',
        businessName: referral.businessId?.businessName || 'Unknown Business',
        businessType: referral.businessId?.businessType || 'Unknown Type',
        location: {
          address: referral.businessId?.location?.address || '',
          city: referral.businessId?.location?.city || '',
          postcode: referral.businessId?.location?.postcode || ''
        }
      });
    } catch (err: any) {
      console.error('Error fetching referral:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      setError(err.response?.data?.message || 'Invalid or expired referral link');
      // Don't navigate away, just show the error
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchReferralDetails();
  }, [fetchReferralDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError('Invalid referral code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${config.apiUrl}/api/referrals/complete/${code}`, {
        referredEmail: email,
        referredName: name,
        referredPhone: phone
      });
      setSuccess(true);
      console.log('Referral completed:', response.data);
    } catch (err: any) {
      console.error('Error completing referral:', err);
      setError(err.response?.data?.message || 'Failed to complete referral');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </PublicLayout>
    );
  }

  if (error && !campaignDetails) {
    return (
      <PublicLayout>
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/')}
          >
            Go to Homepage
          </Button>
        </Container>
      </PublicLayout>
    );
  }

  if (success) {
    return (
      <PublicLayout>
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Alert severity="success" sx={{ mb: 4 }}>
            Thank you! Your referral has been successfully registered. The business will contact you shortly.
          </Alert>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/')}
          >
            Go to Homepage
          </Button>
        </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            You've Been Referred!
          </Typography>

          {campaignDetails && (
            <Card sx={{ mb: 4, mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {campaignDetails.title}
                </Typography>
                <Typography color="textSecondary" paragraph>
                  {campaignDetails.description}
                </Typography>
                <Typography variant="body1">
                  Reward: {campaignDetails.rewardValue}
                  {campaignDetails.rewardType === 'percentage' ? '%' : ' points'} - {campaignDetails.rewardDescription}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  {campaignDetails.businessName} - {campaignDetails.businessType}
                </Typography>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Complete your details below to redeem your referral reward:
            </Typography>
            <TextField
              label="Full Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Complete Referral'}
            </Button>
          </form>
        </Paper>
      </Container>
    </PublicLayout>
  );
}
