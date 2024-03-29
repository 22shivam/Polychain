import { ethers } from 'ethers'
import { toBn } from 'evm-bn';
import { toast } from 'react-toastify';
import toastError from './toastError';
const { utils } = require('ethers');

let checkIfETHAddressAvailable = async (address) => {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/eth/${address}`)
        response = await response.json()
        if (response.success) {
            toastError("The address with which you are trying to buy the username is already linked with another account. Try again with another wallet.")
            return false
        }
        return true
    } catch (err) {
        toastError(err.message)
        return false
    }
}

const transferEth = async ({ ether, addr }, setUserAccount, boolCheckIfEthAddressAvailable = false, WalletConnectConnector, userAccount) => {
    try {
        console.log(userAccount)
        console.log(WalletConnectConnector)

        if (!userAccount || !userAccount.address || userAccount.blockchain !== "eth") {
            toastError("Please login with an Ethereum Wallet")
            return
        }

        if (boolCheckIfEthAddressAvailable) {
            let bool = await checkIfETHAddressAvailable(utils.getAddress(userAccount.address))
            if (!bool) {
                return
            }
        }

        if (userAccount.wallet == "walletconnect") {
            if (!WalletConnectConnector || !WalletConnectConnector._accounts || !WalletConnectConnector._accounts[0]) {
                console.log("here")
                toastError("Please login to send Ethereum")
                return
            }

            console.log(ethers.utils.parseEther(ether))
            const tx = {
                from: WalletConnectConnector._accounts[0], // Required
                to: addr, // Required (for non contract deployments)
                data: "0x", // Required
                value: ethers.utils.parseEther(ether)._hex, // Optional
            };

            console.log(tx)

            // Send transaction
            return WalletConnectConnector
                .sendTransaction(tx)
                .then((result) => {
                    // Returns transaction id (hash)
                    console.log(result);
                    toast.success("Congrats! Amount transferred successfully.")
                    const tx = {
                        hash: result,
                    };
                    return tx
                })
                .catch((error) => {
                    // Error returned when rejected
                    console.log(error)
                    toastError("Transaction Failed. Please try again.")
                });

        } else {

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
            // if (setUserAccount) {
            //     setUserAccount({ address: accounts[0], blockchain: "eth" })
            // }
            toast.success("Congrats! Amount transferred successfully.")
            return tx

        }


    } catch (err) {
        if (err.code == "INSUFFICIENT_FUNDS") {
            toastError("Insufficient funds")
            return
        } else {
            console.log(err)
            toastError("Transfer failed. Please try again.")
        }
    }
};

export default transferEth