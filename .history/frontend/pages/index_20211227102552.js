import { useState } from "react";
import { ethers } from "ethers";
import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';

const getProvider = async () => {
    if ("solana" in window) {
        const provider = window.solana;
        if (provider.isPhantom) {
            console.log("Is Phantom installed?  ", provider.isPhantom);
            return provider;
        }
    } else {
        window.open("https://www.phantom.app/", "_blank");
    }
};

async function transferSOL() {
    // Detecing and storing the phantom wallet of the user (creator in this case)
    var provider = await getProvider();
    console.log("Public key of the emitter: ", provider.publicKey.toString());

    // Establishing connection
    var connection = new web3.Connection(
        web3.clusterApiUrl('devnet'),
    );

    // I have hardcoded my secondary wallet address here. You can take this address either from user input or your DB or wherever
    var recieverWallet = new web3.PublicKey("AA6bqLgTzYPpFFH2R9XLdudibWcemLkKDRtZmPQEsEiS");

    var transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: recieverWallet,
            lamports: web3.LAMPORTS_PER_SOL //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
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
    const [payValue, setPayValue] = useState(0);

    const handleSubmitEth = async (e) => {
        e.preventDefault();
        await startPayment({
            ether: payValue,
            addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
        });
    };

    return (
        <form onSubmit={handleSubmitEth}>
            <h1> Send ETH payment </h1>
            <span>Send Shivam</span>
            <input value={payValue} onChange={(e) => { setPayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ETH" />
            <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>
        </form>
    );
}
