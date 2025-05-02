import express from 'express';
import { businessController } from '../controllers/business.controller';

const router = express.Router();

router.get('/public', businessController.getPublicBusinesses);

export default router;
