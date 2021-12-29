import { useState, useEffect } from "react";
import { ethers } from "ethers";
import * as web3 from '@solana/web3.js';


import TOKEN_ABI from "../lib/TOKEN_ABI";
import generateQR from "../lib/generateQR";
import getSolanaProvider from "../lib/getSolanaProvider";

const TOKEN_ADDRESS = "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa"




async function transferSOL(solAmount, toAddr) {
    // Detecing and storing the phantom wallet of the user (creator in this case)
    var provider = await getSolanaProvider();
    console.log("Public key of the emitter: ", provider.publicKey.toString());

    // Establishing connection
    var connection = new web3.Connection(
        web3.clusterApiUrl('devnet'), // change to mainnet-beta when deploying
    );

    // I have hardcoded my secondary wallet address here. You can take this address either from user input or your DB or wherever
    var recieverWallet = new web3.PublicKey(toAddr);

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
    console.log(transaction)
    // Request creator to sign the transaction (allow the transaction)
    let signed = await provider.signTransaction(transaction);
    // The signature is generated
    let signature = await connection.sendRawTransaction(signed.serialize());
    // Confirm whether the transaction went through or not
    await connection.confirmTransaction(signature);
    console.log(signature)

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
        console.log(tx)
    } catch (err) {
        console.error(err)
    }
};


export default function App() {
    const [qrCode, setQrCode] = useState("")
    const [ETHpayValue, setETHPayValue] = useState(0);
    const [SOLpayValue, setSOLPayValue] = useState(0);
    const [ERC20payValue, setERC20PayValue] = useState(0);

    useEffect(() => {
        (async () => {
            const qrCode = await generateQR("bitcoin:3DBGwFbBoj7FjBFcbVi8hFcpmCjPhCY62X")
            setQrCode(qrCode)
        })()
    }, [])

    const handleSubmitEth = async (e) => {
        e.preventDefault();
        await startPayment({
            ether: ETHpayValue,
            addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
        });
    };

    const handleSubmitSol = async (e) => {
        e.preventDefault();
        await transferSOL(SOLpayValue, "AA6bqLgTzYPpFFH2R9XLdudibWcemLkKDRtZmPQEsEiS");
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
                <img src={qrCode}></img>
                <a href="bitcoin:3DBGwFbBoj7FjBFcbVi8hFcpmCjPhCY62X">Send</a>
            </div>


        </div>

    );
}
