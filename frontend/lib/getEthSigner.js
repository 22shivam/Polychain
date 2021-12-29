import { ethers } from 'ethers'

const getEthSigner = async () => {
    if (!window.ethereum)
        throw new Error("No Ethereum Crypto wallet found. Please install it.");
    // await window.ethereum.send("eth_requestAccounts");
    // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const accounts = await ethereum.request({ method: "eth_requestAccounts" })
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return signer
}

export default getEthSigner