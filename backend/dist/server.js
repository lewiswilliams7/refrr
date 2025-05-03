"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const campaign_1 = __importDefault(require("./routes/campaign"));
const referral_1 = __importDefault(require("./routes/referral"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const business_1 = __importDefault(require("./routes/business"));
const customer_1 = __importDefault(require("./routes/customer"));
const admin_1 = __importDefault(require("./routes/admin"));
const health_1 = __importDefault(require("./routes/health"));
const security_1 = require("./config/security");
// Load environment variables
dotenv_1.default.config();
// Check if we have a MongoDB URI
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}
exports.app = (0, express_1.default)();
// Middleware
exports.app.use(security_1.helmetConfig);
exports.app.use((0, cors_1.default)(security_1.corsOptions));
exports.app.use(express_1.default.json());
exports.app.use(security_1.limiter);
// Routes
exports.app.use('/api/auth', auth_1.default);
exports.app.use('/api/campaigns', campaign_1.default);
exports.app.use('/api/referrals', referral_1.default);
exports.app.use('/api/dashboard', dashboard_1.default);
exports.app.use('/api/businesses', business_1.default);
exports.app.use('/api/customer', customer_1.default);
exports.app.use('/api/admin', admin_1.default);
exports.app.use('/api', health_1.default);
// MongoDB connection
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB Atlas');
})
    .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
const PORT = process.env.PORT || 5000;
exports.app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = exports.app;
