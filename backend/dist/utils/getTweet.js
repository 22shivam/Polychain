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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const twitter_api_v2_1 = require("twitter-api-v2");
require('dotenv').config();
const app = new twitter_api_v2_1.TwitterApi(process.env.TWITTER_ACCESS_TOKEN);
function getEth(str) {
    return str.match(/0x[0-9A-Za-z]{40}/g);
}
function getEns(str) {
    return str.match(/[0-9A-Za-z]+.eth/g);
}
function fetchTweet(url) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const match = url.match(/\/[0-9]+/g)[0].substring(1);
        if (match.length < 1) {
            return;
        }
        const root = yield app.v2.singleTweet(match, {
            expansions: [
                'author_id',
                'referenced_tweets.id',
                'referenced_tweets.id.author_id'
            ],
            "tweet.fields": [
                'conversation_id',
                'created_at'
            ]
        });
        const tweets = yield app.v2.search(`conversation_id:${root.data.conversation_id}`, {
            "tweet.fields": [
                "in_reply_to_user_id",
                "conversation_id"
            ]
        });
        var addrs = [];
        var enss = [];
        try {
            for (var tweets_1 = __asyncValues(tweets), tweets_1_1; tweets_1_1 = yield tweets_1.next(), !tweets_1_1.done;) {
                const tweet = tweets_1_1.value;
                if (tweet.conversation_id == root.data.conversation_id && root.data.author_id == tweet.in_reply_to_user_id) {
                    const eth = getEth(tweet.text);
                    if (eth) {
                        // for (let i = 0; i < eth.length; i++) {
                        //     if (ethers.utils.isAddress(eth[i])) {
                        //         addrs.push(eth[i]);
                        //     }
                        // }
                        addrs = addrs.concat(eth);
                    }
                    const ens = getEns(tweet.text);
                    if (ens) {
                        enss = enss.concat(ens);
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (tweets_1_1 && !tweets_1_1.done && (_a = tweets_1.return)) yield _a.call(tweets_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        addrs = addrs.filter(addr => ethers_1.ethers.utils.isAddress(addr));
        return {
            ens: enss,
            address: addrs
        };
    });
}
exports.default = fetchTweet;
