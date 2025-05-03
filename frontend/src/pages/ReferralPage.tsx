import React from 'react';
import { Container } from '@mui/material';
import ReferralList from '../components/Referral/ReferralList';

export default function ReferralPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ReferralList />
    </Container>
  );
}
