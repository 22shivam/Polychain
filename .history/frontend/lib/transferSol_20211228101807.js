import getSolanaProvider from "./getSolanaProvider";
import * as web3 from '@solana/web3.js';

export default async function transferSOL(solAmount, toAddr) {
    // Detecing and storing the phantom wallet of the user (creator in this case)
    var provider = await getSolanaProvider();

    // Establishing connection
    var connection = new web3.Connection(
        web3.clusterApiUrl('devnet'), // change to mainnet-beta when deploying
    );
    var recieverWallet = new web3.PublicKey(toAddr);

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
    let signature = await connection.sendRawTransaction(signed.serialize());
    // Confirm whether the transaction went through or not
    await connection.confirmTransaction(signature);
}
