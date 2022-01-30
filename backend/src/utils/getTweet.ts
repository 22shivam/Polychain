import { ethers } from 'ethers';
import { TwitterApi } from 'twitter-api-v2';

require('dotenv').config();
const app = new TwitterApi(process.env.TWITTER_ACCESS_TOKEN!);

function getEth(str: string) {
    return str.match(/0x[0-9A-Za-z]{40}/g);
}

function getEns(str: string) {
    return str.match(/[0-9A-Za-z]+.eth/g);
}

async function fetchTweet(url: string) {
    const match = url.match(/\/[0-9]+/g)![0].substring(1);
    if (match.length < 1) {
        return;
    }
    const root = await app.v2.singleTweet(match, {
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

    const tweets = await app.v2.search(`conversation_id:${root.data.conversation_id}`, {
        "tweet.fields": [
            "in_reply_to_user_id",
            "conversation_id"
        ]
    });

    var addrs: string[] = [];
    var enss: string[] = [];

    for await (const tweet of tweets) {
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

    addrs = addrs.filter(addr => ethers.utils.isAddress(addr));


    return {
        ens: enss,
        address: addrs
    }
}

export default fetchTweet;