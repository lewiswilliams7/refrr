import request from 'supertest';
import app from '../server';
import Campaign, { CampaignDocument } from '../models/campaign.model';
import { User, UserDocument } from '../models/user.model';
import Referral from '../models/referrals';
import jwt from 'jsonwebtoken';
import './jest.setup';

describe('Referral Endpoints', () => {
  let userId: string;
  let token: string;
  let campaignId: string;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    businessName: 'Test Business',
    firstName: 'John',
    lastName: 'Doe',
    businessType: 'Other',
    location: {
      address: '123 Test St',
      city: 'Test City',
      postcode: '12345'
    }
  };

  beforeAll(async () => {
    try {
      const userDoc = await User.create(testUser);
      const user = userDoc as UserDocument;
      userId = user._id.toString();
      token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'test-secret'
      );

      const campaign = await Campaign.create({
        businessId: user._id,
        title: 'Test Campaign',
        description: 'Test Description',
        rewardType: 'percentage',
        rewardValue: 10,
        rewardDescription: 'Test Reward'
      });
      campaignId = campaign._id.toString();
    } catch (error) {
      console.error('Setup error:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await Referral.deleteMany({});
    await Campaign.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    await Referral.deleteMany({});
  });

  describe('POST /api/referrals', () => {
    it('should create a new referral', async () => {
      const res = await request(app)
        .post('/api/referrals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaignId,
          referrerEmail: 'referrer@test.com',
          referredEmail: 'friend@test.com'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('code');
      expect(res.body.status).toBe('pending');
      expect(res.body.businessId).toBe(userId);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/referrals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaignId
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Required fields missing');
    });

    it('should validate email formats', async () => {
      const res = await request(app)
        .post('/api/referrals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaignId,
          referrerEmail: 'invalid-email',
          referredEmail: 'also-invalid'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid email format');
    });
  });

  describe('GET /api/referrals', () => {
    it('should get all referrals for a business', async () => {
      // Create test referrals
      await Referral.create([
        {
          campaignId,
          businessId: userId,
          referrerEmail: 'referrer1@test.com',
          referredEmail: 'friend1@test.com',
          code: 'TEST1'
        },
        {
          campaignId,
          businessId: userId,
          referrerEmail: 'referrer2@test.com',
          referredEmail: 'friend2@test.com',
          code: 'TEST2'
        }
      ]);

      const res = await request(app)
        .get('/api/referrals')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body).toHaveLength(2);
    });
  });

  describe('PATCH /api/referrals/:id/status', () => {
    it('should update referral status', async () => {
      const referral = await Referral.create({
        campaignId,
        businessId: userId,
        referrerEmail: 'referrer@test.com',
        referredEmail: 'friend@test.com',
        code: 'TEST123'
      });

      const res = await request(app)
        .patch(`/api/referrals/${referral._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('approved');
    });

    it('should validate status value', async () => {
      const referral = await Referral.create({
        campaignId,
        businessId: userId,
        referrerEmail: 'referrer@test.com',
        referredEmail: 'friend@test.com',
        code: 'TEST124'
      });

      const res = await request(app)
        .patch(`/api/referrals/${referral._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid-status' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid status');
    });
  });
});
