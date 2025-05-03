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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { BUSINESS_TYPES, BusinessType } from '../types/business';
import PublicLayout from '../components/Layout/PublicLayout';
import { RegisterData } from '../types/auth';

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (tabValue === 0 && !formData.businessType) {
      setError('Please select a business type');
      setLoading(false);
      return;
    }

    if (tabValue === 0 && formData.businessType === 'Other' && !formData.customBusinessType) {
      setError('Please specify your business type');
      setLoading(false);
      return;
    }

    try {
      if (tabValue === 0) {
        // Business registration
        const businessPayload: RegisterData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          businessType: formData.businessType === 'Other' ? formData.customBusinessType : formData.businessType,
          location: formData.location,
        };
        const response = await authApi.register(businessPayload);
        console.log('Registration successful:', response);
        if (response && response.token && response.user) {
          // Show verification message instead of logging in
          navigate('/verify-email', { state: { email: formData.email } });
        }
      } else {
        // Customer registration
        const customerPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        };
        const response = await authApi.registerCustomer(customerPayload);
        console.log('Registration successful:', response);
        if (response && response.token && response.user) {
          // Show verification message instead of logging in
          navigate('/verify-email', { state: { email: formData.email } });
        }
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
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Business" />
              <Tab label="Customer" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom align="center">
                Business Registration
              </Typography>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom align="center">
                Customer Registration
              </Typography>
            </TabPanel>

            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              value={formData.firstName}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              label="Last Name"
              name="lastName"
              fullWidth
              value={formData.lastName}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />

            {tabValue === 0 && (
              <>
                <TextField
                  label="Business Name"
                  name="businessName"
                  fullWidth
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                />
                <FormControl fullWidth required sx={{ mb: 3 }}>
                  <InputLabel>Business Type</InputLabel>
                  <Select
                    value={formData.businessType}
                    onChange={handleBusinessTypeChange}
                    label="Business Type"
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    {BUSINESS_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formData.businessType === 'Other' && (
                  <TextField
                    label="Specify Business Type"
                    name="customBusinessType"
                    fullWidth
                    value={formData.customBusinessType}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                  />
                )}
                <TextField
                  label="Address"
                  name="location.address"
                  fullWidth
                  value={formData.location.address}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                />
                <TextField
                  label="City"
                  name="location.city"
                  fullWidth
                  value={formData.location.city}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                />
                <TextField
                  label="Postcode"
                  name="location.postcode"
                  fullWidth
                  value={formData.location.postcode}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                />
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => navigate(tabValue === 0 ? '/login' : '/login')}
            >
              Already have an account? Login as {tabValue === 0 ? 'Business' : 'Customer'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </PublicLayout>
  );
};

export default Register;