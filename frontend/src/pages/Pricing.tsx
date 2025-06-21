import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  alpha,
  useTheme,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Check as CheckIcon,
  Business as BusinessIcon,
  Diamond as DiamondIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/Layout/PublicLayout';

const tiers = [
  {
    title: 'Business',
    price: '£9.99',
    period: '/month',
    description: 'Perfect for businesses of all sizes',
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    features: [
      'Unlimited campaigns',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Bulk referral management',
      'API access',
      'Team collaboration',
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'contained',
    highlighted: true,
    hasDemoButton: true,
  },
  {
    title: 'Enterprise',
    price: 'Coming Soon',
    description: 'For large organizations with specific needs',
    icon: <DiamondIcon sx={{ fontSize: 40 }} />,
    features: [
      'Everything in Business plan',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Advanced security features',
      'Custom reporting',
      'Training & onboarding',
    ],
    buttonText: 'Coming Soon',
    buttonVariant: 'outlined',
    disabled: true,
    hasDemoButton: false,
  },
];

const Pricing: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("/pattern.svg")',
            opacity: 0.1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            <Typography 
              variant="h2" 
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                mb: 3
              }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                opacity: 0.9,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                maxWidth: '800px'
              }}
            >
              Choose the plan that's right for your business
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Pricing Plans */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Grid container spacing={4} alignItems="stretch" justifyContent="center">
          {tiers.map((tier) => (
            <Grid item xs={12} md={6} key={tier.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  ...(tier.highlighted && {
                    border: '2px solid',
                    borderColor: 'primary.main',
                  }),
                  ...(tier.disabled && {
                    opacity: 0.7,
                  }),
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    {tier.icon}
                  </Box>
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    gutterBottom 
                    align="center"
                    sx={{ fontWeight: 600 }}
                  >
                    {tier.title}
                  </Typography>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography 
                      variant="h3" 
                      component="div"
                      sx={{ 
                        fontWeight: 700,
                        color: 'primary.main'
                      }}
                    >
                      {tier.price}
                    </Typography>
                    {tier.period && (
                      <Typography variant="subtitle1" color="text.secondary">
                        {tier.period}
                      </Typography>
                    )}
                  </Box>
                  <Typography 
                    color="text.secondary" 
                    paragraph 
                    align="center"
                    sx={{ mb: 4 }}
                  >
                    {tier.description}
                  </Typography>
                  <List>
                    {tier.features.map((feature) => (
                      <ListItem key={feature} sx={{ py: 1 }}>
                        <ListItemIcon>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{
                            sx: { fontWeight: 500 }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Button
                    variant={tier.buttonVariant as 'outlined' | 'contained'}
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={tier.disabled}
                    onClick={() => !tier.disabled && navigate('/register')}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      boxShadow: tier.buttonVariant === 'contained' ? '0 4px 14px rgba(0,0,0,0.1)' : 'none',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: tier.buttonVariant === 'contained' ? '0 6px 20px rgba(0,0,0,0.15)' : 'none',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    {tier.buttonText}
                  </Button>
                  {tier.hasDemoButton && (
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      size="large"
                      onClick={() => navigate('/contact')}
                      sx={{ 
                        mt: 2,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 500,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    >
                      Book a Demo
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Box
        sx={{
          py: 8,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 4,
          mt: 8
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              mb: 4
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 4, 
                  height: '100%',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Can I change plans later?
                </Typography>
                <Typography color="text.secondary">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 4, 
                  height: '100%',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Is there a free trial?
                </Typography>
                <Typography color="text.secondary">
                  Yes, all paid plans come with a 14-day free trial. No credit card required to start.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 4, 
                  height: '100%',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  What payment methods do you accept?
                </Typography>
                <Typography color="text.secondary">
                  We accept all major credit cards, PayPal, and bank transfers for annual plans.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 4, 
                  height: '100%',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Do you offer refunds?
                </Typography>
                <Typography color="text.secondary">
                  Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default Pricing; 