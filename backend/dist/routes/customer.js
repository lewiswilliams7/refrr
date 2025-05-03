"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_controller_1 = require("../controllers/customer.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Protected routes
router.get('/analytics', auth_1.authenticateToken, customer_controller_1.customerController.getAnalytics);
exports.default = router;
