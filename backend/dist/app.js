"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const business_1 = __importDefault(require("./routes/business"));
const customer_1 = __importDefault(require("./routes/customer"));
const campaign_1 = __importDefault(require("./routes/campaign"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const referral_1 = __importDefault(require("./routes/referral"));
const health_1 = __importDefault(require("./routes/health"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/refrr')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/business', business_1.default);
app.use('/api/customer', customer_1.default);
app.use('/api/campaigns', campaign_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/referrals', referral_1.default);
app.use('/api/health', health_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
