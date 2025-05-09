import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Error info:', errorInfo);
    }

    // Log error to state for display
    this.setState({ errorInfo });

    // You could also log to an error reporting service here
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ 
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}> = ({ error, errorInfo }) => {
  const navigate = useNavigate();
  const isDev = process.env.NODE_ENV === 'development';

  const handleRetry = () => {
    window.location.reload();
  };

  const handleHome = () => {
    navigate('/');
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" gutterBottom align="center">
            Oops! Something went wrong
          </Typography>

          <Alert severity="error" sx={{ mb: 2 }}>
            {error?.message || 'An unexpected error occurred'}
          </Alert>

          {isDev && errorInfo && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.100', 
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Error Stack:
              </Typography>
              <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                {errorInfo.componentStack}
              </pre>
            </Box>
          )}

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleRetry}
            >
              Retry
            </Button>
            <Button
              variant="outlined"
              onClick={handleHome}
            >
              Return to Home
            </Button>
            {isAuthenticated() && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ErrorBoundary; 