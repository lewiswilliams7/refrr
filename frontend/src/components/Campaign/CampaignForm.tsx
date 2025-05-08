import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { campaignApi, Campaign } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  onSubmit: () => void;
}

export default function CampaignForm({ open, onClose, campaign, onSubmit }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardType, setRewardType] = useState<'percentage' | 'fixed'>('percentage');
  const [rewardValue, setRewardValue] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [showRewardDisclaimer, setShowRewardDisclaimer] = useState(true);
  const [rewardDisclaimerText, setRewardDisclaimerText] = useState('Reward will be provided after the referred customer books with the business');
  const [requireBookingConfirmation, setRequireBookingConfirmation] = useState(true);
  const [expirationDate, setExpirationDate] = useState('');
  const [maxReferrals, setMaxReferrals] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title);
      setDescription(campaign.description || '');
      setRewardType(campaign.rewardType);
      setRewardValue(campaign.rewardValue.toString());
      setRewardDescription(campaign.rewardDescription || '');
      setShowRewardDisclaimer(campaign.showRewardDisclaimer ?? true);
      setRewardDisclaimerText(campaign.rewardDisclaimerText || 'Reward will be provided after the referred customer books with the business');
      setRequireBookingConfirmation(campaign.requireBookingConfirmation ?? true);
      setExpirationDate(campaign.expirationDate || '');
      setMaxReferrals(campaign.maxReferrals?.toString() || '');
    } else {
      resetForm();
    }
  }, [campaign]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRewardType('percentage');
    setRewardValue('');
    setRewardDescription('');
    setShowRewardDisclaimer(true);
    setRewardDisclaimerText('Reward will be provided after the referred customer books with the business');
    setRequireBookingConfirmation(true);
    setExpirationDate('');
    setMaxReferrals('');
    setError('');
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');

      const campaignData = {
        title,
        description,
        rewardType,
        rewardValue: Number(rewardValue),
        rewardDescription,
        showRewardDisclaimer,
        rewardDisclaimerText,
        requireBookingConfirmation,
        expirationDate: expirationDate || undefined,
        maxReferrals: maxReferrals ? Number(maxReferrals) : undefined,
        status: 'draft',
        analytics: {
          totalReferrals: 0,
          successfulReferrals: 0,
          conversionRate: 0,
          rewardRedemptions: 0,
          lastUpdated: new Date().toISOString()
        },
        startDate: new Date().toISOString(),
        tags: []
      };

      if (campaign?._id) {
        await campaignApi.update(campaign._id, campaignData);
      } else {
        await campaignApi.create(campaignData);
      }

      onSubmit();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error('Error saving campaign:', err);
      setError(err.response?.data?.message || 'Failed to save campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {campaign ? 'Edit Campaign' : 'Create New Campaign'}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} mt={1}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            label="Campaign Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            disabled={isLoading}
          />

          <TextField
            label="Campaign Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
            disabled={isLoading}
          />

          <FormControl fullWidth disabled={isLoading}>
            <InputLabel>Reward Type</InputLabel>
            <Select
              value={rewardType}
              onChange={(e) => setRewardType(e.target.value as 'percentage' | 'fixed')}
              label="Reward Type"
            >
              <MenuItem value="percentage" key="percentage">Percentage</MenuItem>
              <MenuItem value="fixed" key="fixed">Fixed Points</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Reward Value"
            type="number"
            value={rewardValue}
            onChange={(e) => setRewardValue(e.target.value)}
            required
            fullWidth
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <Typography color="textSecondary">
                  {rewardType === 'percentage' ? '%' : ' points'}
                </Typography>
              ),
            }}
          />

          <TextField
            label="Reward Description"
            value={rewardDescription}
            onChange={(e) => setRewardDescription(e.target.value)}
            required
            fullWidth
            multiline
            rows={2}
            disabled={isLoading}
            placeholder={`Example: ${
              rewardType === 'percentage' 
                ? '% off your next haircut'
                : 'points towards your next purchase'
            }`}
            helperText="Describe what the reward means (e.g., '% off next haircut', 'points towards next purchase')"
          />

          <Divider />

          <Typography variant="h6">Reward Settings</Typography>

          <FormControlLabel
            control={
              <Switch
                checked={showRewardDisclaimer}
                onChange={(e) => setShowRewardDisclaimer(e.target.checked)}
                disabled={isLoading}
              />
            }
            label="Show Reward Disclaimer"
          />

          {showRewardDisclaimer && (
            <TextField
              label="Reward Disclaimer Text"
              value={rewardDisclaimerText}
              onChange={(e) => setRewardDisclaimerText(e.target.value)}
              fullWidth
              multiline
              rows={2}
              disabled={isLoading}
            />
          )}

          <FormControlLabel
            control={
              <Switch
                checked={requireBookingConfirmation}
                onChange={(e) => setRequireBookingConfirmation(e.target.checked)}
                disabled={isLoading}
              />
            }
            label="Require Booking Confirmation"
          />

          <TextField
            label="Expiration Date"
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            fullWidth
            disabled={isLoading}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Maximum Referrals"
            type="number"
            value={maxReferrals}
            onChange={(e) => setMaxReferrals(e.target.value)}
            fullWidth
            disabled={isLoading}
            helperText="Leave empty for unlimited referrals"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!title || !rewardValue || !rewardDescription || isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : (campaign ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// At the end of CampaignForm.tsx and CampaignList.tsx
export {};