import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

interface Referral {
  id: string;
  campaignName: string;
  referrerEmail: string;
  referredEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function ReferralList() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view referrals');
        return;
      }

      const response = await axios.get(`${config.apiUrl}/api/referrals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferrals(response.data);
    } catch (err: any) {
      console.error('Error fetching referrals:', err);
      setError(err.response?.data?.message || 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, referralId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedReferral(referralId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReferral(null);
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!selectedReferral) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to update referral status');
        return;
      }

      await axios.patch(
        `${config.apiUrl}/api/referrals/${selectedReferral}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReferrals(referrals.map(referral =>
        referral.id === selectedReferral
          ? { ...referral, status }
          : referral
      ));
    } catch (err: any) {
      console.error('Error updating referral status:', err);
      setError(err.response?.data?.message || 'Failed to update referral status');
    } finally {
      handleMenuClose();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Referrals
      </Typography>

      {referrals.length === 0 ? (
        <Typography color="text.secondary">
          No referrals found
        </Typography>
      ) : (
        <List>
          {referrals.map((referral) => (
            <ListItem key={referral.id}>
              <ListItemText
                primary={referral.campaignName}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Referrer: {referral.referrerEmail}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="text.primary">
                      Referred: {referral.referredEmail}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="text.secondary">
                      Created: {new Date(referral.createdAt).toLocaleDateString()}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Chip
                  icon={getStatusIcon(referral.status)}
                  label={referral.status}
                  color={getStatusColor(referral.status)}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <IconButton
                  edge="end"
                  onClick={(e) => handleMenuClick(e, referral.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusUpdate('approved')}>
          Approve
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('rejected')}>
          Reject
        </MenuItem>
      </Menu>
    </Box>
  );
}
