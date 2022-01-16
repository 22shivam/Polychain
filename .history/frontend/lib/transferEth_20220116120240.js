import { ethers } from 'ethers'
import { toBn } from 'evm-bn';
import { toast } from 'react-toastify';
import toastError from './toastError';
const { utils } = require('ethers');

let checkIfETHAddressAvailable = async (address) => {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/eth/${address}`)
        response = await response.json()
        console.log(response)
        if (response.success) {
            toastError("The address with which you are trying to buy the username is already linked with another account. Try again with another wallet.")
            return false
        }
        return true
    } catch (err) {
        toastError(err.message)
    }
}

const transferEth = async ({ ether, addr }, setUserAccount, boolCheckIfEthAddressAvailable = false) => {
    try {
        if (!window.ethereum)
            throw new Error("No crypto wallet found. Please install it.");

        const accounts = await ethereum.request({ method: "eth_requestAccounts" })

        console.log("boolCheckIfEthAddressAvailable", boolCheckIfEthAddressAvailable)
        console.log(utils.getAddress(accounts[0]))
        if (boolCheckIfEthAddressAvailable) {
            let bool = await checkIfETHAddressAvailable(utils.getAddress(accounts[0]))
            console.log("ethaddressavailable", bool)
            if (!bool) {
                return
            }
        }
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
        } else {
            toastError(err.message)
        }
    }
};

export default transferEth