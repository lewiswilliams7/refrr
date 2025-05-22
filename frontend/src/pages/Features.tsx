import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  LocalOffer as LocalOfferIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/Layout/PublicLayout';

const Features: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <PublicLayout>
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        {/* Business Benefits Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 700, 
              mb: 6,
              letterSpacing: '0.01em',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Powerful Features for Your Business
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    align="center"
                    sx={{ 
                      fontWeight: 600,
                      letterSpacing: '0.01em'
                    }}
                  >
                    Smart Analytics
                  </Typography>
                  <Typography 
                    color="text.secondary" 
                    align="center"
                    sx={{ 
                      letterSpacing: '0.01em'
                    }}
                  >
                    Track referral performance, customer engagement, and ROI with detailed analytics and insights.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    align="center"
                    sx={{ 
                      fontWeight: 600,
                      letterSpacing: '0.01em'
                    }}
                  >
                    Customer Management
                  </Typography>
                  <Typography 
                    color="text.secondary" 
                    align="center"
                    sx={{ 
                      letterSpacing: '0.01em'
                    }}
                  >
                    Manage your customer base, track referrals, and automate reward distribution all in one place.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <LocalOfferIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    align="center"
                    sx={{ 
                      fontWeight: 600,
                      letterSpacing: '0.01em'
                    }}
                  >
                    Custom Rewards
                  </Typography>
                  <Typography 
                    color="text.secondary" 
                    align="center"
                    sx={{ 
                      letterSpacing: '0.01em'
                    }}
                  >
                    Create and manage custom rewards, discounts, and incentives to motivate your customers to refer.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Customer Benefits Section */}
        <Box sx={{ mb: 8, bgcolor: 'grey.50', py: 6, borderRadius: 4 }}>
          <Container maxWidth="md">
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              align="center"
              sx={{ 
                fontWeight: 700, 
                mb: 6,
                letterSpacing: '0.01em',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Customer Experience
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <LocalOfferIcon />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        letterSpacing: '0.01em'
                      }}
                    >
                      Easy Rewards
                    </Typography>
                    <Typography 
                      color="text.secondary"
                      sx={{ 
                        letterSpacing: '0.01em'
                      }}
                    >
                      Get discounts, free services, or cash rewards when you refer friends to your favorite local businesses.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PeopleIcon />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        letterSpacing: '0.01em'
                      }}
                    >
                      Simple Sharing
                    </Typography>
                    <Typography 
                      color="text.secondary"
                      sx={{ 
                        letterSpacing: '0.01em'
                      }}
                    >
                      Share your favorite local businesses with friends and family through our simple referral system.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUpIcon />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        letterSpacing: '0.01em'
                      }}
                    >
                      Reward Tracking
                    </Typography>
                    <Typography 
                      color="text.secondary"
                      sx={{ 
                        letterSpacing: '0.01em'
                      }}
                    >
                      Keep track of all your referrals and rewards in one place. No more lost vouchers or forgotten discounts.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <LocationIcon />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        letterSpacing: '0.01em'
                      }}
                    >
                      Local Discovery
                    </Typography>
                    <Typography 
                      color="text.secondary"
                      sx={{ 
                        letterSpacing: '0.01em'
                      }}
                    >
                      Find and support great local businesses in your area while earning rewards for your recommendations.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              letterSpacing: '0.01em'
            }}
          >
            Ready to Get Started?
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: 4,
              fontWeight: 500,
              letterSpacing: '0.01em'
            }}
          >
            Join Refrr today and start growing your business through referrals
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/register/customer')}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                fontWeight: 600,
                letterSpacing: '0.01em'
              }}
            >
              Register as Customer (Free)
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                fontWeight: 600,
                letterSpacing: '0.01em',
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                }
              }}
            >
              Register as Business
            </Button>
          </Box>
        </Box>
      </Container>
    </PublicLayout>
  );
};

export default Features; 