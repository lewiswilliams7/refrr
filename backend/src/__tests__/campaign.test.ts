import request from 'supertest';
import app from '../server';
import Campaign, { ICampaign, CampaignDocument } from '../models/campaign.model';
import { User, UserDocument } from '../models/user.model';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import './jest.setup';

describe('Campaign Endpoints', () => {
  let userId: string;
  let token: string;

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
    } catch (error) {
      console.error('Setup error:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await Campaign.deleteMany({});
      await User.deleteMany({});
    } catch (error) {
      console.error('Test cleanup error:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    await Campaign.deleteMany({});
  });

  describe('POST /api/campaigns', () => {
    it('should create a new campaign', async () => {
      const res = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Campaign',
          description: 'Test Description',
          rewardType: 'percentage',
          rewardValue: 10
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('title', 'Test Campaign');
      expect(res.body.businessId).toBe(userId);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Test Description'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Required fields missing');
    });

    it('should validate reward type', async () => {
      const res = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Campaign',
          description: 'Test Description',
          rewardType: 'invalid',
          rewardValue: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid reward type');
    });
  });

  describe('GET /api/campaigns', () => {
    it('should get all campaigns for a business', async () => {
      // Create test campaigns
      await Campaign.create([
        {
          businessId: userId,
          title: 'Campaign 1',
          description: 'Description 1',
          rewardType: 'percentage',
          rewardValue: 10
        },
        {
          businessId: userId,
          title: 'Campaign 2',
          description: 'Description 2',
          rewardType: 'fixed',
          rewardValue: 20
        }
      ]);

      const res = await request(app)
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body).toHaveLength(2);
    });
  });

  describe('PUT /api/campaigns/:id', () => {
    it('should update a campaign', async () => {
      const campaign = await Campaign.create({
        businessId: userId,
        title: 'Original Title',
        description: 'Original Description',
        rewardType: 'percentage',
        rewardValue: 10
      });

      const res = await request(app)
        .put(`/api/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          rewardValue: 20
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.rewardValue).toBe(20);
    });
  });

  describe('DELETE /api/campaigns/:id', () => {
    it('should delete a campaign', async () => {
      const campaign = await Campaign.create({
        businessId: userId,
        title: 'To Be Deleted',
        description: 'Test Description',
        rewardType: 'percentage',
        rewardValue: 10
      });

      const res = await request(app)
        .delete(`/api/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Campaign deleted successfully');

      const deletedCampaign = await Campaign.findById(campaign._id);
      expect(deletedCampaign).toBeNull();
    });
  });
});
