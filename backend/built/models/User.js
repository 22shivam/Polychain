"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// write a user model 
const UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    ETHaddress: {
        type: String,
        required: false,
    },
    SOLaddress: {
        type: String,
        required: false,
    },
    DESOaddress: {
        type: String,
        required: false,
    },
    BITCOINaddress: {
        type: String,
        required: false,
    },
    bio: {
        type: String,
        required: false,
    },
    // twitterLink: {
    //     type: String,
    //     required: false,
    // }
});
const UserModel = mongoose_1.default.model('User', UserSchema);
exports.default = UserModel;
