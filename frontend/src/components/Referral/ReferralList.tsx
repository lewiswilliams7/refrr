import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

interface Referral {
  _id: string;
  campaignId: {
    _id: string;
    title: string;
    rewardType: string;
    rewardValue: number;
  };
  referrerEmail: string;
  referredEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  code: string;
  createdAt: string;
}

export default function ReferralList() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchReferrals = useCallback(async () => {
    try {
      const response = await fetch('/api/referrals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch referrals');
      
      const data = await response.json();
      setReferrals(data);
    } catch (err) {
      setError('Failed to load referrals');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleStatusChange = async (referralId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/referrals/${referralId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Refresh the list
      fetchReferrals();
    } catch (err) {
      console.error(err);
      setError('Failed to update referral status');
    }
    setAnchorEl(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (isLoading) return <Box>Loading...</Box>;
  if (error) return <Box color="error.main">{error}</Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Referrals</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => {/* TODO: Implement share/create referral */}}
        >
          Share Referral Link
        </Button>
      </Box>

      <Grid container spacing={3}>
        {referrals.map((referral) => (
          <Grid item xs={12} key={referral._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">
                      Campaign: {referral.campaignId.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Code: {referral.code}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip 
                      label={referral.status.toUpperCase()} 
                      color={getStatusColor(referral.status) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedReferral(referral._id);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Box mt={2}>
                  <Typography>
                    Referrer: {referral.referrerEmail}
                  </Typography>
                  <Typography>
                    Referred: {referral.referredEmail}
                  </Typography>
                  <Typography>
                    Reward: {referral.campaignId.rewardValue}
                    {referral.campaignId.rewardType === 'percentage' ? '%' : ' points'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem 
          onClick={() => selectedReferral && handleStatusChange(selectedReferral, 'approved')}
        >
          Approve
        </MenuItem>
        <MenuItem 
          onClick={() => selectedReferral && handleStatusChange(selectedReferral, 'rejected')}
        >
          Reject
        </MenuItem>
      </Menu>
    </Box>
  );
}
