import getSolanaProvider from "./getSolanaProvider";
import * as web3 from '@solana/web3.js';
import { toast } from "react-toastify";
import toastError from "./toastError";

export default async function transferSOL(solAmount, toAddr, setUserAccount) {
    // Detecing and storing the phantom wallet of the user (creator in this case)
    try {
        var provider = await getSolanaProvider();

        // Establishing connection
        var connection = new web3.Connection(
            web3.clusterApiUrl('devnet'), // change to mainnet-beta when deploying
        );
        var recieverWallet = new web3.PublicKey(toAddr);
        console.log("pblickey of sender", provider.publicKey)
        var transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey: provider.publicKey,
                toPubkey: recieverWallet,
                lamports: solAmount * web3.LAMPORTS_PER_SOL
            }),
        );

        // Setting the variables for the transaction
        transaction.feePayer = await provider.publicKey;
        let blockhashObj = await connection.getRecentBlockhash();
        transaction.recentBlockhash = await blockhashObj.blockhash;
        // Request creator to sign the transaction (allow the transaction)
        let signed = await provider.signTransaction(transaction);
        // The signature is generated
        let hash = await connection.sendRawTransaction(signed.serialize());
        console.log(hash)
        // Confirm whether the transaction went through or not
        if (setUserAccount) {
            setUserAccount({ address: provider.publicKey, blockchain: "sol" })
        }
        await connection.confirmTransaction(hash);
        return hash
    } catch (error) {
        console.log(error)
        toastError(error.message)

    }
}
