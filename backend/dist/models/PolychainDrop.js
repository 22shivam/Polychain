"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PolychainDropSchema = new mongoose_1.default.Schema({
    address: {
        type: String,
        required: false,
        default: ""
    },
    promo: {
        type: String,
        required: false,
    }
});
PolychainDropSchema.statics.build = (attr) => {
    return new PolychainDrop(attr);
};
const PolychainDrop = mongoose_1.default.model('PolychainDrop', PolychainDropSchema);
exports.default = PolychainDrop;
