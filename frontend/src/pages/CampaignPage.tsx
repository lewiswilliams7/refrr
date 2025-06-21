import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Button, 
  Box, 
  Typography, 
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import CampaignList from '../components/Campaign/CampaignList';
import CampaignForm from '../components/Campaign/CampaignForm';
import { campaignApi } from '../services/api';

export default function CampaignPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (data: any) => {
    try {
      console.log('Creating campaign with data:', data);
      await campaignApi.create(data);
      console.log('Campaign created successfully');
      setIsFormOpen(false);
      // The CampaignList component will automatically refresh
    } catch (error) {
      console.error('Error creating campaign:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
      {/* Enhanced Header */}
      <Box 
        sx={{ 
          mb: 6,
          p: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          borderRadius: 4,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.1),
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Campaigns
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Create and manage your referral campaigns
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ 
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: 'primary.dark',
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsFormOpen(true)}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3), 0 4px 10px rgba(0,0,0,0.1)',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(25, 118, 210, 0.4), 0 6px 15px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }
              }}
            >
              New Campaign
            </Button>
          </Stack>
        </Box>
      </Box>
      
      <CampaignList />
      <CampaignForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </Container>
  );
}