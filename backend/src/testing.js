import * as web3 from "@solana/web3.js"
const pubKeyFrontEnd = {
    type: 'Buffer',
    data: [
        213, 188, 73, 227, 134, 38, 180,
        119, 238, 28, 118, 3, 123, 247,
        1, 121, 205, 142, 182, 118, 140,
        54, 49, 91, 206, 232, 137, 199,
        222, 165, 161, 232
    ]
}

try {
    new web3.PublicKey(pubKeyFrontEnd)
}

