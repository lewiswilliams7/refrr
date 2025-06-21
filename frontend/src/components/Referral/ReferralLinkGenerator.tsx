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
      // Try the modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        return;
      }
      
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
        setError('Failed to copy link. Please copy it manually.');
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setError('Failed to copy link. Please copy it manually.');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={window.innerWidth < 600} // Full screen on mobile
    >
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
          sx={{ mb: 2, width: '100%' }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Generate Link'}
        </Button>

        {referralLink && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your Referral Link:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                fullWidth
                value={referralLink}
                InputProps={{ readOnly: true }}
                sx={{ mb: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleCopyLink}
                disabled={!referralLink}
                sx={{ width: '100%' }}
              >
                {copySuccess ? 'Copied!' : 'Copy Link'}
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
