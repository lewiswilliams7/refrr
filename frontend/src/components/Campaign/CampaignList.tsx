import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  TextField,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Paper,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { campaignApi, Campaign } from '../../services/api';
import CampaignForm from './CampaignForm';
import ReferralLinkGenerator from '../Referral/ReferralLinkGenerator';

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [referralGeneratorOpen, setReferralGeneratorOpen] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching campaigns...');
      const data = await campaignApi.list();
      console.log('Campaigns API response:', data);
      if (!Array.isArray(data)) {
        console.error('Invalid campaigns data:', data);
        setError('Invalid response from server');
        return;
      }
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDelete = async (id: string) => {
    console.log('Starting delete process for campaign ID:', id);
    try {
      console.log('Calling campaignApi.delete...');
      const response = await campaignApi.delete(id);
      console.log('Delete API response:', response);
      
      console.log('Updating campaigns state...');
      setCampaigns(prevCampaigns => {
        console.log('Previous campaigns:', prevCampaigns);
        const newCampaigns = prevCampaigns.filter(campaign => campaign._id !== id);
        console.log('New campaigns after filter:', newCampaigns);
        return newCampaigns;
      });
      
      console.log('Closing delete dialog...');
      setDeleteConfirmOpen(false);
      setCampaignToDelete(null);
      console.log('Delete process completed successfully');
    } catch (err) {
      console.error('Error in handleDelete:', err);
      setError('Failed to delete campaign. Please try again.');
      setDeleteConfirmOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    console.log('Delete button clicked for campaign ID:', id);
    if (!id) {
      console.error('No campaign ID provided for deletion');
      setError('Invalid campaign ID');
      return;
    }
    setCampaignToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Delete confirmation button clicked, campaignToDelete:', campaignToDelete);
    if (campaignToDelete) {
      handleDelete(campaignToDelete);
    } else {
      console.error('No campaign ID to delete');
      setError('No campaign selected for deletion');
    }
  };

  const handleCloseDeleteDialog = () => {
    console.log('Closing delete dialog, current campaignToDelete:', campaignToDelete);
    setDeleteConfirmOpen(false);
    setCampaignToDelete(null);
  };

  if (isLoading) {
    return <Box>Loading campaigns...</Box>;
  }

  if (error) {
    return <Box color="error.main">{error}</Box>;
  }

  if (campaigns.length === 0) {
    return <Box>No campaigns yet. Create your first campaign!</Box>;
  }

  return (
    <>
      <Grid container spacing={3} key="campaigns-grid">
        {campaigns.map((campaign, index) => {
          console.log('Rendering campaign:', campaign);
          const campaignId = campaign._id || `temp-${index}`;
          if (!campaignId) {
            console.error('Campaign missing ID:', campaign);
            return null;
          }
          return (
            <Grid item xs={12} md={6} key={`campaign-${campaignId}-${index}`}>
              <Card key={`card-${campaignId}`}>
                <CardContent key={`card-content-${campaignId}`}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" key={`main-box-${campaignId}`}>
                    <Box key={`content-box-${campaignId}`}>
                      <Typography variant="h6" gutterBottom key={`title-${campaignId}`}>
                        {campaign.title}
                      </Typography>
                      <Typography color="textSecondary" paragraph key={`desc-${campaignId}`}>
                        {campaign.description}
                      </Typography>
                      <Typography key={`reward-${campaignId}`}>
                        Reward: {campaign.rewardValue}
                        {campaign.rewardType === 'percentage' ? '%' : ' points'} 
                        {campaign.rewardDescription && ` - ${campaign.rewardDescription}`}
                      </Typography>
                      {campaign.showRewardDisclaimer && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }} key={`disclaimer-${campaignId}`}>
                          {campaign.rewardDisclaimerText}
                        </Typography>
                      )}
                      {campaign.expirationDate && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} key={`expiry-${campaignId}`}>
                          Expires: {new Date(campaign.expirationDate).toLocaleDateString()}
                        </Typography>
                      )}
                      {campaign.maxReferrals && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} key={`max-refs-${campaignId}`}>
                          Maximum Referrals: {campaign.maxReferrals}
                        </Typography>
                      )}
                    </Box>
                    <Box key={`actions-box-${campaignId}`}>
                      <IconButton 
                        size="small"
                        onClick={() => setEditingCampaign(campaign)}
                        key={`edit-${campaignId}`}
                        aria-label={`Edit campaign ${campaign.title}`}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => {
                          console.log('Delete icon clicked, campaign:', campaign);
                          if (!campaignId) {
                            console.error('Campaign missing ID:', campaign);
                            setError('Invalid campaign ID');
                            return;
                          }
                          handleDeleteClick(campaignId);
                        }}
                        color="error"
                        key={`delete-${campaignId}`}
                        aria-label={`Delete campaign ${campaign.title}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          if (campaign._id) {
                            setSelectedCampaign(campaign._id);
                            setReferralGeneratorOpen(true);
                          } else {
                            console.error('Campaign missing ID:', campaign);
                            setError('Invalid campaign ID');
                          }
                        }}
                        sx={{ ml: 1 }}
                        key={`generate-${campaignId}`}
                      >
                        Generate Referral
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Campaign Dialog */}
      <CampaignForm
        open={!!editingCampaign}
        onClose={() => setEditingCampaign(null)}
        campaign={editingCampaign as Campaign | undefined}
        onSubmit={() => {
          fetchCampaigns();
          setEditingCampaign(null);
        }}
        key={`edit-form-${editingCampaign?._id || 'new'}`}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={handleCloseDeleteDialog}
        key={`delete-dialog-${campaignToDelete || 'none'}`}
      >
        <DialogTitle>Delete Campaign</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this campaign?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Referral Link Generator Dialog */}
      <ReferralLinkGenerator
        open={referralGeneratorOpen}
        onClose={() => {
          setReferralGeneratorOpen(false);
          setSelectedCampaign(null);
        }}
        campaignId={selectedCampaign || ''}
        key={`referral-generator-${selectedCampaign || 'none'}`}
      />
    </>
  );
}