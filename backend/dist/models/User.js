"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    ETHAddress: {
        type: String,
        required: false,
        default: ""
    },
    SOLAddress: {
        type: String,
        required: false,
        default: ""
    },
    DESOAddress: {
        type: String,
        required: false,
        default: ""
    },
    BTCAddress: {
        type: String,
        required: false,
        default: ""
    },
    bio: {
        type: String,
        required: false,
        default: ""
    },
    profilePic: {
        type: String,
        required: false,
        default: ""
    }
    // twitterLink: {
    //     type: String,
    //     required: false,
    // }
});
UserSchema.statics.build = (attr) => {
    return new User(attr);
};
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;
