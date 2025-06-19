import React, { useState } from 'react';
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
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  campaign?: any;
  onSubmit: (data: any) => void;
}

export default function CampaignForm({ open, onClose, campaign, onSubmit }: Props) {
  const [title, setTitle] = useState(campaign?.title || '');
  const [description, setDescription] = useState(campaign?.description || '');
  const [rewardType, setRewardType] = useState<'percentage' | 'fixed'>(campaign?.rewardType || 'percentage');
  const [rewardValue, setRewardValue] = useState(campaign?.rewardValue || '');
  const [rewardDescription, setRewardDescription] = useState(campaign?.rewardDescription || '');
  const [showRewardDisclaimer, setShowRewardDisclaimer] = useState(campaign?.showRewardDisclaimer || false);
  const [rewardDisclaimerText, setRewardDisclaimerText] = useState(campaign?.rewardDisclaimerText || '');
  const [startDate, setStartDate] = useState(campaign?.startDate ? new Date(campaign.startDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(campaign?.endDate ? new Date(campaign.endDate).toISOString().slice(0, 16) : '');
  const [maxReferrals, setMaxReferrals] = useState(campaign?.maxReferrals || '');
  const [tags, setTags] = useState(campaign?.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      rewardType,
      rewardValue: Number(rewardValue),
      rewardDescription,
      showRewardDisclaimer,
      rewardDisclaimerText,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      maxReferrals: maxReferrals ? Number(maxReferrals) : undefined,
      tags: tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{campaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Reward Type</InputLabel>
              <Select
                value={rewardType}
                label="Reward Type"
                onChange={(e) => setRewardType(e.target.value as 'percentage' | 'fixed')}
              >
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="fixed">Fixed Amount</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Reward Value"
              type="number"
              value={rewardValue}
              onChange={(e) => setRewardValue(e.target.value)}
              required
              InputProps={{
                endAdornment: rewardType === 'percentage' ? '%' : 'points',
              }}
            />
            <TextField
              fullWidth
              label="Reward Description"
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showRewardDisclaimer}
                  onChange={(e) => setShowRewardDisclaimer(e.target.checked)}
                />
              }
              label="Show Reward Disclaimer"
            />
            {showRewardDisclaimer && (
              <TextField
                fullWidth
                label="Reward Disclaimer Text"
                value={rewardDisclaimerText}
                onChange={(e) => setRewardDisclaimerText(e.target.value)}
                multiline
                rows={2}
              />
            )}
            <TextField
              fullWidth
              label="Start Date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="End Date (Optional)"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Maximum Referrals (Optional)"
              type="number"
              value={maxReferrals}
              onChange={(e) => setMaxReferrals(e.target.value)}
            />
            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              helperText="Enter tags separated by commas"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {campaign ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// At the end of CampaignForm.tsx and CampaignList.tsx
export {};