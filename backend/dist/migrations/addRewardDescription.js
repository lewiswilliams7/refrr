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
const mongoose_1 = __importDefault(require("mongoose"));
const campaign_1 = require("../models/campaign");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://lewiswilliams077:YS9XaEpwNtaGJ5rl@cluster0.pxooejq.mongodb.net/refrr?retryWrites=true&w=majority';
function migrate() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(MONGODB_URI);
            console.log('Connected to MongoDB');
            // First, update the schema to include the new field
            yield campaign_1.Campaign.updateMany({ rewardDescription: { $exists: false } }, [{
                    $set: {
                        rewardDescription: {
                            $concat: [
                                { $toString: "$rewardValue" },
                                {
                                    $cond: {
                                        if: { $eq: ["$rewardType", "percentage"] },
                                        then: "% discount",
                                        else: " points reward"
                                    }
                                }
                            ]
                        }
                    }
                }]);
            console.log('Migration completed successfully');
            process.exit(0);
        }
        catch (error) {
            console.error('Migration failed:', error);
            process.exit(1);
        }
    });
}
migrate();
