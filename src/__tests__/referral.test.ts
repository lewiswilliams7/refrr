import request from 'supertest';
import { app } from '../server';
import mongoose, { HydratedDocument } from 'mongoose';
import { User, IUser } from '../models/user.model';
import { Campaign } from '../models/campaign';
import Referral from '../models/referrals';
import jwt from 'jsonwebtoken';

const MONGODB_URI = 'mongodb+srv://lewiswilliams077:YS9XaEpwNtaGJ5rl@cluster0.pxooejq.mongodb.net/refrr_test?retryWrites=true&w=majority';

describe('Referral Endpoints', () => {
  let token: string;
  let userId: string;
  let campaignId: string;

  beforeAll(async () => {
    try {
      await mongoose.connect(MONGODB_URI);
      
      // Create test user
      const userDoc: HydratedDocument<IUser> = await User.create({
        email: 'business@test.com',
        password: 'password123',
        businessName: 'Test Business',
        firstName: 'John',
        lastName: 'Doe'
      });

      userId = userDoc._id.toString();
      token = jwt.sign(
        { userId: userDoc._id, email: userDoc.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Create test campaign
      const campaign = await Campaign.create({
        businessId: userId,
        title: 'Test Campaign',
        description: 'Test Description',
        rewardType: 'percentage',
        rewardValue: 10
      });

      campaignId = campaign._id.toString();
    } catch (error) {
      console.error('Test setup error:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await Referral.deleteMany({});
    await Campaign.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
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
