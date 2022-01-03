import { ethers } from 'ethers'
import { toBn } from 'evm-bn';
import toastError from './toastError';

const transferEth = async ({ ether, addr }, setUserAccount) => {
    try {
        if (!window.ethereum)
            throw new Error("No crypto wallet found. Please install it.");

        const accounts = await ethereum.request({ method: "eth_requestAccounts" })
        // await window.ethereum.request({ method: 'eth_accounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tx = await signer.sendTransaction({
            to: addr,
            value: toBn(ether)
        });
        if (setUserAccount) {
            setUserAccount({ address: accounts[0], blockchain: "eth" })
        }
        return tx
    } catch (err) {
        console.log("err", err.message)
        toastError(err.message)
    }
};

export default transferEth