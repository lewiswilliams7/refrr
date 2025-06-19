import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import axios from 'axios';
import config from '../../config';

interface Props {
  campaignId: string;
}

export default function ReferralShare({ campaignId }: Props) {
  const [email, setEmail] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
    }
  }, []);

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to generate a referral link');
        return;
      }

      const response = await axios.post(
        `${config.apiUrl}/api/referrals/generate/${campaignId}`,
        { referrerEmail: email },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const link = `${window.location.origin}/referral/${response.data.code}`;
      setReferralLink(link);
    } catch (err: any) {
      console.error('Error generating referral link:', err);
      setError(err.response?.data?.message || 'Failed to generate referral link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      alert('Referral link copied to clipboard!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setError('Failed to copy link to clipboard');
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Share Referral Link
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Your Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Box>

      <Button
        variant="contained"
        onClick={handleGenerateLink}
        disabled={loading || !email}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Link'}
      </Button>

      {referralLink && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Your Referral Link:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              value={referralLink}
              InputProps={{ readOnly: true }}
            />
            <Button
              variant="outlined"
              onClick={handleCopyLink}
              disabled={!referralLink}
            >
              Copy
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
