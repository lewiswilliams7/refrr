import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  LocalOffer as LocalOfferIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import PublicLayout from '../components/Layout/PublicLayout';
import { Link } from 'react-router-dom';

export default function WhyRefrr() {
  const theme = useTheme();

  const benefits = [
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Grow Your Business',
      description: 'Increase customer acquisition through word-of-mouth marketing.',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: 'Build Trust',
      description: 'Leverage existing customer relationships to build credibility.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Platform',
      description: 'Enterprise-grade security to protect your data and customers.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Quick Setup',
      description: 'Get started in minutes with our easy-to-use platform.',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Track Performance',
      description: 'Monitor campaign success with detailed analytics.',
    },
    {
      icon: <LocalOfferIcon sx={{ fontSize: 40 }} />,
      title: 'Flexible Rewards',
      description: 'Customize rewards to match your business goals.',
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
              Why Choose Refrr?
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                opacity: 0.9,
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              The smarter way to grow your business through referrals
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      {benefit.icon}
                    </Box>
                    <Typography variant="h5" component="h3">
                      {benefit.title}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box
        sx={{
          py: 8,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Typography variant="h2" color="primary" gutterBottom>
                  10x
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Higher Conversion
                </Typography>
                <Typography color="text.secondary">
                  Referred customers convert at a much higher rate
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Typography variant="h2" color="primary" gutterBottom>
                  25%
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Lower Cost
                </Typography>
                <Typography color="text.secondary">
                  Compared to traditional marketing channels
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Typography variant="h2" color="primary" gutterBottom>
                  3x
                </Typography>
                <Typography variant="h6" gutterBottom>
                  More Value
                </Typography>
                <Typography color="text.secondary">
                  Referred customers spend more and stay longer
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
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
            Ready to Grow Your Business?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
            Join thousands of businesses already using Refrr to grow their customer base through referrals.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Link
              to="/register"
              style={{
                textDecoration: 'none',
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Register Your Business
              </Paper>
            </Link>
            <Link
              to="/register/customer"
              style={{
                textDecoration: 'none',
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  border: `1px solid ${theme.palette.primary.main}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Register as Customer
              </Paper>
            </Link>
          </Stack>
        </Paper>
      </Container>
    </PublicLayout>
  );
} 