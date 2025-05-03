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
  Store as StoreIcon,
  Diamond as DiamondIcon,
} from '@mui/icons-material';
import PublicLayout from '../components/Layout/PublicLayout';

export default function Pricing() {
  const theme = useTheme();

  const plans = [
    {
      name: 'Business',
      price: '£10',
      period: '/month',
      description: 'Ideal for growing businesses with multiple campaigns',
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
      popular: true,
    },
    {
      name: 'Enterprise',
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
      popular: false,
      disabled: true,
    },
  ];

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
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("/pattern.svg")',
            opacity: 0.1,
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            <Typography 
              variant="h2" 
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2,
              }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                opacity: 0.9,
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              Choose the plan that's right for your business
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Pricing Plans */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4} alignItems="stretch">
          {plans.map((plan, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  ...(plan.popular && {
                    border: `2px solid ${theme.palette.primary.main}`,
                  }),
                  ...(plan.disabled && {
                    opacity: 0.7,
                  })
                }}
              >
                {plan.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      zIndex: 1,
                    }}
                  >
                    Most Popular
                  </Box>
                )}
                {plan.disabled && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'grey.500',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      zIndex: 1,
                    }}
                  >
                    Coming Soon
                  </Box>
                )}
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mb: 2,
                      }}
                    >
                      {plan.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 1 }}>
                      <Typography variant="h3" component="span" sx={{ fontWeight: 700 }}>
                        {plan.price}
                      </Typography>
                      {plan.period && (
                        <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                          {plan.period}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.description}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 3 }} />
                  <List sx={{ mb: 3 }}>
                    {plan.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.95rem',
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                      variant={plan.buttonVariant as 'contained' | 'outlined'}
                      size="large"
                      fullWidth
                      disabled={plan.disabled}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        ...(plan.popular && {
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                          }
                        })
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </Box>
                </CardContent>
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
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Can I change plans later?
                </Typography>
                <Typography color="text.secondary">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Is there a free trial?
                </Typography>
                <Typography color="text.secondary">
                  Yes, all paid plans come with a 14-day free trial. No credit card required to start.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  What payment methods do you accept?
                </Typography>
                <Typography color="text.secondary">
                  We accept all major credit cards, PayPal, and bank transfers for annual plans.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
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

      {/* Demo CTA Section */}
      <Box
        sx={{
          py: 8,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: 'white',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="h4" gutterBottom>
              Want to Learn More?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
              Schedule a personalized demo to see how Refrr can help grow your business through referrals.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                }
              }}
            >
              Book a Demo
            </Button>
          </Paper>
        </Container>
      </Box>
    </PublicLayout>
  );
} 