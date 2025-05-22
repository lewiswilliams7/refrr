import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tabs,
  Tab,
  CircularProgress,
  Link,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { BUSINESS_TYPES, BusinessType } from '../types/business';
import PublicLayout from '../components/Layout/PublicLayout';
import { RegisterData } from '../types/auth';
import axios from 'axios';
import config from '../config';
import Logo from '../components/common/Logo';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`register-tabpanel-${index}`}
      aria-labelledby={`register-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  businessType: BusinessType | '';
  customBusinessType: string;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
}

const Register: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: '',
    customBusinessType: '',
    location: {
      address: '',
      city: '',
      postcode: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleBusinessTypeChange = (event: SelectChangeEvent<BusinessType>) => {
    setFormData({
      ...formData,
      businessType: event.target.value as BusinessType,
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (tabValue === 0) {
        // Business registration
        if (!formData.businessType) {
          setError('Please select a business type');
          setLoading(false);
          return;
        }

        if (formData.businessType === 'Other' && !formData.customBusinessType) {
          setError('Please specify your business type');
          setLoading(false);
          return;
        }

        const businessPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          businessType: formData.businessType === 'Other' ? formData.customBusinessType : formData.businessType,
          location: {
            address: formData.location.address,
            city: formData.location.city,
            postcode: formData.location.postcode
          }
        };

        // Debug log the payload
        console.log('Business registration payload:', JSON.stringify(businessPayload, null, 2));
        console.log('Location object type:', typeof businessPayload.location);
        console.log('Location object:', businessPayload.location);

        const response = await authApi.registerBusiness(businessPayload);
        console.log('Business registration response:', response);
        
        // Set success state
        setSuccess(true);
        
        // Store email in localStorage as backup
        localStorage.setItem('pendingVerificationEmail', formData.email);
        
        // Wait for 2 seconds to show success message before navigating
        setTimeout(() => {
          // Navigate to verify-email page
          navigate('/verify-email', { 
            state: { email: formData.email },
            replace: true // Use replace to prevent back button from returning to registration
          });
        }, 2000);
      } else {
        // Customer registration
        const customerPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        };
        const response = await authApi.registerCustomer(customerPayload);
        console.log('Customer registration successful:', response);
        
        // Set success state
        setSuccess(true);
        
        // Store email in localStorage as backup
        localStorage.setItem('pendingVerificationEmail', formData.email);
        
        // Wait for 2 seconds to show success message before navigating
        setTimeout(() => {
          // Navigate to verify-email page
          navigate('/verify-email', { 
            state: { email: formData.email },
            replace: true // Use replace to prevent back button from returning to registration
          });
        }, 2000);
      }
    } catch (err: any) {
      console.error('Full error object:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to register. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box 
            sx={{ 
              mb: 4,
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
            onClick={() => navigate('/')}
          >
            <Logo />
          </Box>

          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              width: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              bgcolor: 'background.paper',
            }}
          >
            <Typography 
              component="h1" 
              variant="h4" 
              align="center" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                mb: 3
              }}
            >
              Create Your Account
            </Typography>

            <Typography 
              variant="body1" 
              align="center" 
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Join Refrr and start growing your business through referrals
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                centered
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minWidth: 120,
                    py: 2,
                  },
                  '& .Mui-selected': {
                    color: 'primary.main',
                  },
                }}
              >
                <Tab label="Business" />
                <Tab label="Customer" />
              </Tabs>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                Registration successful! Redirecting to email verification...
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TabPanel value={tabValue} index={0}>
                <Stack spacing={3}>
                  <TextField
                    required
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Business Name"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Business Type</InputLabel>
                    <Select
                      value={formData.businessType}
                      label="Business Type"
                      onChange={handleBusinessTypeChange}
                      sx={{ 
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: 2,
                        }
                      }}
                    >
                      {BUSINESS_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {formData.businessType === 'Other' && (
                    <TextField
                      required
                      fullWidth
                      label="Specify Business Type"
                      name="customBusinessType"
                      value={formData.customBusinessType}
                      onChange={handleChange}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  )}
                  <TextField
                    required
                    fullWidth
                    label="Address"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="City"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Postcode"
                    name="location.postcode"
                    value={formData.location.postcode}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Stack>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Stack spacing={3}>
                  <TextField
                    required
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Stack>
              </TabPanel>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  mt: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Already have an account?
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ 
                  mt: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          </Paper>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ mt: 4 }}
          >
            © {new Date().getFullYear()} Refrr. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </PublicLayout>
  );
};

export default Register;