import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import RoleBasedRoute from './components/RoleBasedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterCustomer from './pages/RegisterCustomer';
import Dashboard from './pages/Dashboard';
import ReferralLanding from './pages/ReferralLanding';
import CampaignPage from './pages/CampaignPage';
import Referrals from './pages/Referrals';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import CustomerCampaigns from './pages/CustomerCampaigns';
import Home from './pages/Home';
import CampaignDetails from './pages/CampaignDetails';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import WhyRefrr from './pages/WhyRefrr';
import VerifyEmail from './pages/VerifyEmail';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/customer" element={<RegisterCustomer />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/referral/:code" element={<ReferralLanding />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/why-refrr" element={<WhyRefrr />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<RoleBasedRoute><Dashboard /></RoleBasedRoute>} />
            <Route path="/campaigns" element={<RoleBasedRoute><CampaignPage /></RoleBasedRoute>} />
            <Route path="/referrals" element={<RoleBasedRoute><Referrals /></RoleBasedRoute>} />
            <Route path="/analytics" element={<RoleBasedRoute><Analytics /></RoleBasedRoute>} />
            <Route path="/settings" element={<RoleBasedRoute><Settings /></RoleBasedRoute>} />
            <Route path="/customer/campaigns" element={
              <RoleBasedRoute allowedRoles={['customer']}>
                <CustomerCampaigns />
              </RoleBasedRoute>
            } />
            <Route path="/customer/campaign/:id" element={
              <RoleBasedRoute allowedRoles={['customer']}>
                <CampaignDetails />
              </RoleBasedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;