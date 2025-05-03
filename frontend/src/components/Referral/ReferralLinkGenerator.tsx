import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { campaignApi } from '../../services/api';

interface Props {
  campaignId: string;
  open: boolean;
  onClose: () => void;
}

export default function ReferralLinkGenerator({ campaignId, open, onClose }: Props) {
  const [referrerEmail, setReferrerEmail] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { user } = useAuth();

  const generateLink = async () => {
    if (!referrerEmail) {
      setError('Please enter a referrer email');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await campaignApi.generateReferralLink(campaignId, {
        referrerEmail
      });

      console.log('API Response:', response);
      setReferralLink(`${window.location.origin}/refer/${response.code}`);
    } catch (err: any) {
      console.error('Error generating referral:', err);
      setError(err.response?.data?.message || 'Failed to generate referral link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleClose = () => {
    setReferrerEmail('');
    setReferralLink('');
    setError('');
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth key="referral-dialog">
        <DialogTitle key="dialog-title">Generate Referral Link</DialogTitle>
        <DialogContent key="dialog-content">
          <Box display="flex" flexDirection="column" gap={2} mt={1} key="dialog-box">
            {error && (
              <Alert severity="error" onClose={() => setError('')} key="error-alert">
                {error}
              </Alert>
            )}
            
            <TextField
              label="Referrer Email"
              type="email"
              value={referrerEmail}
              onChange={(e) => setReferrerEmail(e.target.value)}
              required
              fullWidth
              helperText="Enter the email of the person who will share this referral link"
              key="email-field"
            />

            {referralLink && (
              <Box bgcolor="grey.100" p={2} borderRadius={1} key="link-box">
                <Box display="flex" justifyContent="space-between" alignItems="center" key="link-content">
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', flex: 1 }} key="link-text">
                    {referralLink}
                  </Typography>
                  <IconButton 
                    onClick={copyToClipboard} 
                    size="small" 
                    sx={{ ml: 1 }}
                    color="primary"
                    key="copy-button"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions key="dialog-actions">
          <Button onClick={handleClose} key="close-button">Close</Button>
          <Button
            onClick={generateLink}
            variant="contained"
            color="primary"
            disabled={!referrerEmail || isLoading}
            key="generate-button"
          >
            {isLoading ? 'Generating...' : 'Generate Link'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Referral link copied to clipboard!"
        key="copy-snackbar"
      />
    </>
  );
}
