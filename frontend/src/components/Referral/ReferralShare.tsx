import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { campaignApi } from '../../services/api';

interface Campaign {
  _id: string;
  title: string;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ReferralShare({ open, onClose }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [referrerEmail, setReferrerEmail] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchCampaigns();
  }, [token]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      const data = await response.json();
      setCampaigns(data.filter((campaign: Campaign) => campaign.isActive));
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    }
  };

  const generateReferralLink = async () => {
    if (!selectedCampaign || !referrerEmail) {
      setError('Please select a campaign and provide your email');
      return;
    }

    try {
      const response = await campaignApi.generateReferralLink(selectedCampaign, {
        referrerEmail
      });

      if (!response?.code) {
        throw new Error('No referral code received');
      }

      setReferralLink(`${window.location.origin}/refer/${response.code}`);
    } catch (err: any) {
      console.error('Error generating referral link:', err);
      setError(err.response?.data?.message || 'Failed to generate referral link');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Referral Link</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <FormControl fullWidth>
            <InputLabel>Campaign</InputLabel>
            <Select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              label="Campaign"
              required
            >
              {campaigns.map((campaign) => (
                <MenuItem key={campaign._id} value={campaign._id}>
                  {campaign.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Referrer Email"
            value={referrerEmail}
            onChange={(e) => setReferrerEmail(e.target.value)}
            type="email"
            required
            fullWidth
          />

          {referralLink && (
            <Box bgcolor="grey.100" p={2} borderRadius={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {referralLink}
                </Typography>
                <IconButton onClick={copyToClipboard} size="small">
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>
          )}

          {error && (
            <Typography color="error">{error}</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          onClick={generateReferralLink}
          variant="contained" 
          color="primary"
          disabled={!selectedCampaign || !referrerEmail}
        >
          Generate Link
        </Button>
      </DialogActions>
    </Dialog>
  );
}
