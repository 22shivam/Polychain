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

const transferEth = async ({ ether, addr }, setUserAccount, boolCheckIfEthAddressAvailable = false, connector, walletConnect) => {
    try {

        if (walletConnect) {
            // Draft transaction
            const tx = {
                from: "0xbc28Ea04101F03aA7a94C1379bc3AB32E65e62d3", // Required
                to: "0x89D24A7b4cCB1b6fAA2625Fe562bDd9A23260359", // Required (for non contract deployments)
                data: "0x", // Required
                gasPrice: "0x02540be400", // Optional
                gas: "0x9c40", // Optional
                value: "0x00", // Optional
                nonce: "0x0114", // Optional
            };

            // Sign transaction
            connector
                .signTransaction(tx)
                .then((result) => {
                    // Returns signed transaction
                    console.log(result);
                })
                .catch((error) => {
                    // Error returned when rejected
                    console.error(error);
                });

        }

        if (!window.ethereum)
            throw new Error("No crypto wallet found. Please install it.");

        const accounts = await ethereum.request({ method: "eth_requestAccounts" })

        if (boolCheckIfEthAddressAvailable) {
            let bool = await checkIfETHAddressAvailable(utils.getAddress(accounts[0]))
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
        if (err.code == "INSUFFICIENT_FUNDS") {
            return toastError("Insufficient funds")
        } else {
            toastError(err.message)
        }
    }
};

export default transferEth