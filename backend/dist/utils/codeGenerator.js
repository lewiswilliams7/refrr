"use strict";
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
exports.generateReferralCode = void 0;
const referrals_1 = __importDefault(require("../models/referrals"));
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 8;
const generateReferralCode = () => __awaiter(void 0, void 0, void 0, function* () {
    let code;
    let isUnique = false;
    while (!isUnique) {
        code = Array.from({ length: CODE_LENGTH }, () => CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length))).join('');
        // Check if code already exists
        const existingReferral = yield referrals_1.default.findOne({ code });
        if (!existingReferral) {
            isUnique = true;
        }
    }
    return code;
});
exports.generateReferralCode = generateReferralCode;
