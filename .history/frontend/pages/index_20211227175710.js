import { useState, useRef } from "react";
import { ethers } from "ethers";
import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
var QRCode = require('qrcode')

const TOKEN_ADDRESS = "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa"
const TOKEN_ABI = [
    {
        "name": "transfer",
        "type": "function",
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "type": "uint256",
                "name": "_tokens"
            }
        ],
        "constant": false,
        "outputs": [],
        "payable": false
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "type": "function"
    }
];

const getProvider = async () => {
    if ("solana" in window) {
        await window.solana.connect();
        const provider = window.solana;
        if (provider.isPhantom) {
            console.log("Is Phantom installed?  ", provider.isPhantom);
            return provider;
        }
    } else {
        window.open("https://www.phantom.app/", "_blank");
    }
};

async function transferSOL(solAmount) {
    // Detecing and storing the phantom wallet of the user (creator in this case)
    var provider = await getProvider();
    console.log("Public key of the emitter: ", provider.publicKey.toString());

    // Establishing connection
    var connection = new web3.Connection(
        web3.clusterApiUrl('devnet'), // change to mainnet-beta when deploying
    );

    // I have hardcoded my secondary wallet address here. You can take this address either from user input or your DB or wherever
    var recieverWallet = new web3.PublicKey("AA6bqLgTzYPpFFH2R9XLdudibWcemLkKDRtZmPQEsEiS");

    var transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: recieverWallet,
            lamports: solAmount * web3.LAMPORTS_PER_SOL //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
        }),
    );

    // Setting the variables for the transaction
    transaction.feePayer = await provider.publicKey;
    let blockhashObj = await connection.getRecentBlockhash();
    transaction.recentBlockhash = await blockhashObj.blockhash;

    // Request creator to sign the transaction (allow the transaction)
    let signed = await provider.signTransaction(transaction);
    // The signature is generated
    let signature = await connection.sendRawTransaction(signed.serialize());
    // Confirm whether the transaction went through or not
    await connection.confirmTransaction(signature);
    console.log("transaction complete")
}

const handleSubmitDESO = async (e) => {
    window.open("https://diamondapp.com/send-deso?public_key=BC1YLj4aFMVM1g44wBgibYq8dFQ1NxTCpQFyJnNMqGqmyUt9zDVjZ5L", "_blank");
}

const startPayment = async ({ ether, addr }) => {
    try {
        if (!window.ethereum)
            throw new Error("No crypto wallet found. Please install it.");

        const accounts = await ethereum.request({ method: "eth_requestAccounts" })
        // await window.ethereum.request({ method: 'eth_accounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tx = await signer.sendTransaction({
            to: addr,
            value: ethers.utils.parseEther(ether)
        });
    } catch (err) {
        console.error(err)
    }
};

const generateQR = async text => {
    try {
        const qrCode = await QRCode.toDataURL(text, { errorCorrectionLevel: 'M', version: 8 })
        console.log(qrCode)
        return qrCode
    } catch (err) {
        console.error(err)
    }
}

export default function App() {
    const [ETHpayValue, setETHPayValue] = useState(0);
    const [SOLpayValue, setSOLPayValue] = useState(0);
    const [ERC20payValue, setERC20PayValue] = useState(0);

    const handleSubmitEth = async (e) => {
        e.preventDefault();
        await startPayment({
            ether: ETHpayValue,
            addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
        });
    };

    const handleSubmitSol = async (e) => {
        e.preventDefault();
        await transferSOL(SOLpayValue);
    };

    const handleSubmitERC20 = async (e) => {
        e.preventDefault();
        try {
            if (!window.ethereum)
                throw new Error("No crypto wallet found. Please install it.");
            // await window.ethereum.send("eth_requestAccounts");
            // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
            const decimals = await contract.decimals()
            await contract.transfer("0x76aEB5092D8eabCec324Be739b8BA5dF473F0055", ethers.utils.parseUnits(ERC20payValue.toString(), decimals));
        } catch (err) {
            console.log(err)
        }
    }



    return (
        <div>
            <form onSubmit={handleSubmitEth}>
                <h1> Send ETH payment </h1>
                <span>Send Shivam</span>
                <input value={ETHpayValue} onChange={(e) => { setETHPayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ETH" />
                <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>
            </form>
            <form onSubmit={handleSubmitSol}>
                <h1> Send Sol payment </h1>
                <span>Send Shivam</span>
                <input value={SOLpayValue} onChange={(e) => { setSOLPayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in SOL" />
                <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>
            </form>
            <form onSubmit={handleSubmitERC20}>
                <h1> Send ERC20 payment </h1>
                <span>Send Shivam</span>
                <input value={ERC20payValue} onChange={(e) => { setERC20PayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ERC20" />
                <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>
            </form>
            <form onSubmit={handleSubmitDESO}>
                <span>Send Shivam</span>
                <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Send Deso </button>
            </form>
            <div>
                <span>Pay Using Bitcoin</span>
                <img src="index.js?bee7:114 data:image/png;base64,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"></img>
            </div>


        </div>

    );
}
