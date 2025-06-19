import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import config from '../../config';

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
}

export default function ReferralLinkGenerator({ open, onClose, campaignId }: Props) {
  const [email, setEmail] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
    }
  }, []);

  const handleGenerateLink = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setError('Failed to copy link to clipboard');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Referral Link</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Box>

        <Button
          variant="contained"
          onClick={handleGenerateLink}
          disabled={isLoading || !email}
          sx={{ mb: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Generate Link'}
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
                {copySuccess ? 'Copied!' : 'Copy'}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
