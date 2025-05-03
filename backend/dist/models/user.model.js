"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUSINESS_TYPES = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const BUSINESS_TYPES = [
    'Barber',
    'Hair Salon',
    'Beauty Salon',
    'Nail Salon',
    'Spa',
    'Tanning Salon',
    'Gym',
    'Personal Trainer',
    'Restaurant',
    'Cafe',
    'Bar',
    'Retail Store',
    'Other'
];
exports.BUSINESS_TYPES = BUSINESS_TYPES;
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    businessName: {
        type: String,
        required: function () { return this.role === 'business'; },
        trim: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    businessType: {
        type: String,
        enum: BUSINESS_TYPES,
        required: function () { return this.role === 'business'; },
    },
    location: {
        address: { type: String, required: function () { return this.role === 'business'; } },
        city: { type: String, required: function () { return this.role === 'business'; } },
        postcode: { type: String, required: function () { return this.role === 'business'; } },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    businessDescription: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ['admin', 'business', 'customer'],
        default: 'business',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
// Hash password before saving
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return next();
        try {
            const salt = yield bcryptjs_1.default.genSalt(10);
            this.password = yield bcryptjs_1.default.hash(this.password, salt);
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// Method to compare password for login
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield bcryptjs_1.default.compare(candidatePassword, this.password);
        }
        catch (error) {
            return false;
        }
    });
};
exports.User = mongoose_1.default.model('User', userSchema);
