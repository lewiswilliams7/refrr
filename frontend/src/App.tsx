import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';
import ErrorBoundary from './components/common/ErrorBoundary';
import Home from './pages/Home';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CampaignPage from './pages/CampaignPage';
import ReferralPage from './pages/ReferralPage';
import ReferralLanding from './pages/ReferralLanding';
import ReferralDetails from './pages/ReferralDetails';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import WhyRefrr from './pages/WhyRefrr';
import RegisterCustomer from './pages/RegisterCustomer';
import CustomerCampaigns from './pages/CustomerCampaigns';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';

// Basic route component without any extra logic
const BasicRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  return <>{element}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<BasicRoute element={<Home />} />} />
              <Route path="/features" element={<BasicRoute element={<Features />} />} />
              <Route path="/pricing" element={<BasicRoute element={<Pricing />} />} />
              <Route path="/why-refrr" element={<BasicRoute element={<WhyRefrr />} />} />
              <Route path="/login" element={<BasicRoute element={<Login />} />} />
              <Route path="/register" element={<BasicRoute element={<Register />} />} />
              <Route path="/register/customer" element={<BasicRoute element={<RegisterCustomer />} />} />
              <Route path="/forgot-password" element={<BasicRoute element={<ForgotPassword />} />} />
              <Route path="/reset-password/:token" element={<BasicRoute element={<ResetPassword />} />} />
              <Route path="/verify-email" element={<BasicRoute element={<VerifyEmail />} />} />
              <Route path="/dashboard" element={<BasicRoute element={<Dashboard />} />} />
              <Route path="/campaigns" element={<BasicRoute element={<CampaignPage />} />} />
              <Route path="/referrals" element={<BasicRoute element={<ReferralPage />} />} />
              <Route path="/admin" element={<BasicRoute element={<AdminDashboard />} />} />
              <Route path="/refer/:code" element={<BasicRoute element={<ReferralLanding />} />} />
              <Route path="/campaign/:campaignId" element={<BasicRoute element={<ReferralDetails />} />} />
              <Route path="/customer/campaigns" element={<BasicRoute element={<CustomerCampaigns />} />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;