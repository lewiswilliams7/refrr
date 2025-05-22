import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/Layout/PublicLayout';

const benefits = [
  {
    title: 'Built for Small Businesses',
    description: 'Unlike enterprise solutions costing £100+/month, Refrr is specifically designed for small businesses like barber shops, salons, and local services.',
    icon: <LocalOfferIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: 'Affordable Pricing',
    description: 'At just £9.99/month, Refrr is the most cost-effective referral solution for small businesses. No hidden fees or complex pricing tiers.',
    icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: 'Industry-Specific Features',
    description: 'Tailored features for service-based businesses like appointment tracking, customer management, and easy reward distribution.',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: 'Simple Setup',
    description: 'Get started in minutes with our intuitive platform. No technical expertise required - perfect for busy business owners.',
    icon: <SpeedIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: 'Local Business Focus',
    description: 'Unlike generic referral platforms, Refrr understands the unique needs of local service businesses and their customers.',
    icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: 'Dedicated Support',
    description: 'Our team specializes in helping small businesses succeed with their referral programs. Get personalized support when you need it.',
    icon: <SupportIcon sx={{ fontSize: 40 }} />,
  },
];

const WhyRefrr: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              letterSpacing: '0.01em',
              fontSize: { xs: '2.5rem', md: '3rem' }
            }}
          >
            Why Choose Refrr?
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            paragraph
            sx={{ 
              fontWeight: 500,
              letterSpacing: '0.01em',
              fontSize: { xs: '1.25rem', md: '1.5rem' }
            }}
          >
            The only referral platform built specifically for small businesses
          </Typography>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 8, 
            bgcolor: 'primary.main', 
            color: 'white',
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              letterSpacing: '0.01em'
            }}
          >
            Most referral platforms are built for large enterprises
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9,
              fontWeight: 500,
              letterSpacing: '0.01em'
            }}
          >
            They charge £100+ per month and include features you'll never use.
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9, 
              mt: 2,
              fontWeight: 500,
              letterSpacing: '0.01em'
            }}
          >
            Refrr is different. We're built for businesses like yours.
          </Typography>
        </Paper>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {benefit.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom 
                    align="center"
                    sx={{ 
                      fontWeight: 600,
                      letterSpacing: '0.01em'
                    }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography 
                    color="text.secondary" 
                    align="center"
                    sx={{ 
                      letterSpacing: '0.01em'
                    }}
                  >
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              fontWeight: 600,
              letterSpacing: '0.01em',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Start Your 14-Day Free Trial
          </Button>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 2,
              letterSpacing: '0.01em'
            }}
          >
            No credit card required. Cancel anytime.
          </Typography>
        </Box>
      </Container>
    </PublicLayout>
  );
};

export default WhyRefrr; 