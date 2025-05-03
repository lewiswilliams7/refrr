import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.message || 'An unexpected error occurred'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => {
            navigate('/');
            window.location.reload();
          }}
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
};

export default ErrorBoundary; 