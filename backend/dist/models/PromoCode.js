"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PromoCodeSchema = new mongoose_1.default.Schema({
    promoCode: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: false,
        default: ""
    },
    blockchain: {
        type: String,
        enum: ["eth", "sol"],
        required: false
    }
});
PromoCodeSchema.statics.build = (attr) => {
    return new PromoCode(attr);
};
const PromoCode = mongoose_1.default.model('PromoCode', PromoCodeSchema);
exports.default = PromoCode;
