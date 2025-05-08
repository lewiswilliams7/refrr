// backend/src/__tests__/auth.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import { User } from '../models/user.model';
import dotenv from 'dotenv';
import './jest.setup';

dotenv.config();

jest.setTimeout(60000);

describe('Auth Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    businessName: 'Test Business',
    businessType: 'Other',
    location: {
      address: '123 Test St',
      city: 'Test City',
      postcode: '12345'
    }
  };

  beforeEach(async () => {
    try {
      await User.deleteMany({});
    } catch (error) {
      console.error('Error cleaning up users:', error);
    }
  });

  describe('POST /api/auth/register', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          businessName: 'Test Business',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not create a user with existing email', async () => {
      // First create a user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          businessName: 'Test Business',
          firstName: 'John',
          lastName: 'Doe'
        });

      // Try to create another user with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password456',
          businessName: 'Another Business',
          firstName: 'Jane',
          lastName: 'Doe'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'User already exists');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // Missing other required fields
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('required');
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          businessName: 'Test Business',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid email format');
    });

    it('should validate password length', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '12345', // Too short
          businessName: 'Test Business',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Password must be at least 6 characters long');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      // First register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          businessName: 'Test Business',
          firstName: 'John',
          lastName: 'Doe'
        });

      // Then try to login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile', async () => {
      // First register and login
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          businessName: 'Test Business',
          firstName: 'John',
          lastName: 'Doe'
        });

      const token = registerRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should not allow access without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should not allow access with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(403);
    });
  });
});