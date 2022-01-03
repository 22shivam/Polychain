import { ethers } from 'ethers'
import toastError from './toastError';

const getEthSigner = async () => {
    try {
        if (!window.ethereum) {
            toastError("No Ethereum Crypto wallet found. Please install one like MetaMask.")
            return
        }
        // await window.ethereum.send("eth_requestAccounts");
        // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const accounts = await ethereum.request({ method: "eth_requestAccounts" })
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        return signer
    } catch (err) {
        toastError(err.message)
    }
}

export default getEthSigner