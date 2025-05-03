import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { campaignApi } from '../services/api';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import Navigation from '../components/common/Navigation';

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
  campaignId: string;
  referralLink: string;
  referrerEmail?: string;
}

export default function ReferralDetails() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      console.error('No campaign ID provided in URL');
      setError('Campaign ID is missing');
      setLoading(false);
      return;
    }
    console.log('Fetching campaign details for ID:', campaignId);
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    if (!campaignId) {
      console.error('No campaign ID provided in URL');
      setError('Campaign ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Making API request for campaign:', campaignId);
      
      const response = await campaignApi.getPublic(campaignId);
      console.log('Received campaign details:', response);
      
      if (!response?.title || !response?.businessName) {
        throw new Error('Invalid campaign data received');
      }
      
      setCampaignDetails(response);
    } catch (err: any) {
      console.error('Error fetching campaign details:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to load campaign details: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (campaignDetails?.referralLink) {
      navigator.clipboard.writeText(campaignDetails.referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
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
      <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {campaignDetails && (
            <>
              <Typography variant="h4" component="h1" gutterBottom>
                {campaignDetails.title}
              </Typography>
              
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {campaignDetails.businessName}
                  </Typography>
                  <Typography color="textSecondary" paragraph>
                    {campaignDetails.businessType}
                  </Typography>
                  <Typography color="textSecondary" paragraph>
                    {campaignDetails.location.address}
                  </Typography>
                  <Typography color="textSecondary">
                    {campaignDetails.location.city}, {campaignDetails.location.postcode}
                  </Typography>
                </CardContent>
              </Card>

              <Typography variant="h6" gutterBottom>
                Campaign Details
              </Typography>
              <Typography paragraph>
                {campaignDetails.description}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Referral Information
              </Typography>
              <Typography paragraph>
                Referred by: {campaignDetails.referrerEmail || 'Not specified'}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Reward
              </Typography>
              <Typography paragraph>
                {campaignDetails.rewardValue}
                {campaignDetails.rewardType === 'percentage' ? '%' : ' points'} - {campaignDetails.rewardDescription}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Referral Link
              </Typography>
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  value={campaignDetails.referralLink || 'Loading...'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={copySuccess ? "Copied!" : "Copy to clipboard"}>
                          <IconButton onClick={handleCopyLink}>
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/register/customer')}
                >
                  Register as Customer
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </>
  );
} 