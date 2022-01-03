import { ethers } from 'ethers'
import { toBn } from 'evm-bn';
import { toast } from 'react-toastify';
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
        toast.success("Congrats! Amount transferred successfully.")
        return tx
    } catch (err) {
        console.log(err.code)
        if (err.code == "INSUFFICIENT_FUNDS") {
            return toastError("Insufficient funds")
        }
        toastError(err.message)
    }
};

export default transferEth