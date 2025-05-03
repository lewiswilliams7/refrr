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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PublicLayout from '../components/Layout/PublicLayout';

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

  const fetchReferralDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`http://localhost:5000/api/referrals/code/${code}`);
      setCampaignDetails(response.data.campaignDetails);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired referral link');
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchReferralDetails();
  }, [fetchReferralDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`http://localhost:5000/api/referrals/complete/${code}`, {
        referredEmail: email,
        referredName: name,
        referredPhone: phone
      });
      setSuccess(true);
      console.log('Referral completed:', response.data);
    } catch (err: any) {
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
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
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
              size="large"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Complete Referral'}
            </Button>
          </form>
        </Paper>
      </Container>
    </PublicLayout>
  );
}
