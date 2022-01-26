import getSolanaProvider from "./getSolanaProvider";
import * as web3 from '@solana/web3.js';
import { toast } from "react-toastify";
import toastError from "./toastError";
import toastSuccess from "./toastSuccess";
import toastInfo from "./toastInfo";

let checkIfSOLAddressAvailable = async (address) => {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/sol/${address}`)
        response = await response.json()
        if (response.success) {
            toastError("The address with which you are trying to buy the username is already linked with another account. Try again with another wallet.")
            return false
        }
        return true
    } catch (e) {
        toastError(e.message)
        return false
    }
}


export default async function transferSOL(solAmount, toAddr, setUserAccount, checkSolAddressAvailability = false, userAccount) {
    // Detecing and storing the phantom wallet of the user (creator in this case)
    try {

        if (userAccount && !userAccount.blockchain == "sol") {
            toastError("Please login with a Solana Wallet to send SOL")
            return
        }


        var provider = await getSolanaProvider();

        // Establishing connection
        var connection = new web3.Connection(
            web3.clusterApiUrl('mainnet-beta'), // change to mainnet-beta when deploying
        );
        var recieverWallet = new web3.PublicKey(toAddr);
        if (checkSolAddressAvailability) {
            if (!(await checkIfSOLAddressAvailable(provider.publicKey.toString()))) {
                return
            }
        }

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
        toastInfo("Please wait while we confirm your transaction. This may take a minute.")
        // Confirm whether the transaction went through or not
        if (setUserAccount) {
            setUserAccount({ address: provider.publicKey.toString(), blockchain: "sol" })
        }
        await connection.confirmTransaction(hash);
        toastSuccess("Congrats! Amount transferred successfully.")
        return hash
    } catch (error) {
        toastError(error.message)

    }
}
