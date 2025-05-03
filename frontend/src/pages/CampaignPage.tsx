import React, { useState } from 'react';
import { Container, Button, Box, Typography, Stack } from '@mui/material';
import { Add as AddIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CampaignList from '../components/Campaign/CampaignList';
import CampaignForm from '../components/Campaign/CampaignForm';

export default function CampaignPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Campaigns</Typography>
        <Stack direction="row" spacing={2} key="campaign-actions">
          <Button
            variant="outlined"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ 
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'primary.light',
              }
            }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsFormOpen(true)}
          >
            New Campaign
          </Button>
        </Stack>
      </Box>
      <CampaignList />
      <CampaignForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={() => {
          setIsFormOpen(false);
          // The CampaignList component will automatically refresh
        }}
      />
    </Container>
  );
}