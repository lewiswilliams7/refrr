import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';
import PublicLayout from '../components/Layout/PublicLayout';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    // Debug logging
    console.log('VerifyEmail mounted');
    console.log('Location state:', location.state);
    console.log('Location search:', location.search);
    
    // Get token from query parameters
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    console.log('Token from query:', token);
    
    // Try to get email from location state or localStorage
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem('pendingVerificationEmail');
    const finalEmail = emailFromState || emailFromStorage;
    
    console.log('Email from state:', emailFromState);
    console.log('Email from storage:', emailFromStorage);
    console.log('Final email:', finalEmail);

    if (finalEmail) {
      setEmail(finalEmail);
      // Clear the stored email once we've used it
      localStorage.removeItem('pendingVerificationEmail');
    } else if (!token) {
      console.log('No email found and no token, redirecting to register');
      navigate('/register');
    }

    // If we have a token and haven't already verified, verify the email
    if (token && !verificationSuccess && !loading && !error) {
      verifyEmail(token);
    }
  }, [location.state, location.search, navigate, verificationSuccess, loading, error]);

  const verifyEmail = async (token: string) => {
    try {
      setLoading(true);
      setError('');
      console.log('Verifying email with token:', token);
      
      const response = await authApi.verifyEmail(token);
      console.log('Verification response:', response);
      
      // If we don't have an email locally but the response includes one, use it
      if (!email && response.email) {
        setEmail(response.email);
      }
      
      setVerificationSuccess(true);
      // Wait for 3 seconds before redirecting
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Email verified successfully. Please log in.' 
          }
        });
      }, 3000);
    } catch (error: any) {
      console.error('Verification error:', error);
      // If the error is about an invalid/expired token, show a more specific message
      if (error.response?.status === 400) {
        setError('This verification link has already been used or has expired. Please try logging in.');
        // Redirect to login after showing the error
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Please log in with your verified account.' 
            }
          });
        }, 3000);
      } else {
        setError(error.response?.data?.message || 'Failed to verify email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('No email address available');
      return;
    }

    setError('');
    setLoading(true);
    setResendSuccess(false);

    try {
      console.log('Resending verification email to:', email);
      await authApi.resendVerification(email);
      setResendSuccess(true);
      console.log('Verification email resent successfully');
    } catch (err: any) {
      console.error('Error resending verification email:', err);
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Verify Your Email
          </Typography>

          {verificationSuccess ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                Email verified successfully! Redirecting to login...
              </Alert>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            </>
          ) : (
            <>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                {email ? (
                  <>We've sent a verification email to {email}. Please check your inbox and click the verification link.</>
                ) : (
                  <>Please check your email for the verification link.</>
                )}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {resendSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Verification email resent successfully!
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleResendVerification}
                  disabled={loading || !email}
                >
                  {loading ? <CircularProgress size={24} /> : 'Resend Verification Email'}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </PublicLayout>
  );
} 