import { useState } from "react";
import { ethers } from "ethers";
import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';

const TOKEN_ADDRESS = "0xFab46E002BbF0b4509813474841E0716E6730136"
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

const startPayment = async ({ ether, addr }) => {
    try {
        if (!window.ethereum)
            throw new Error("No crypto wallet found. Please install it.");

        await window.ethereum.send("eth_requestAccounts");
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
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
            await contract.transfer("0x76aEB5092D8eabCec324Be739b8BA5dF473F0055", ethers.utils.parseUnits(ERC20payValue, contract.decimals()));
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
        </div>

    );
}
