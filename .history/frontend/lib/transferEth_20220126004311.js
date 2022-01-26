import { ethers } from 'ethers'
import { toBn } from 'evm-bn';
import { toast } from 'react-toastify';
import toastError from './toastError';
const { utils } = require('ethers');
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { ethers } from 'ethers'

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

const transferEth = async ({ ether, addr }, setUserAccount, boolCheckIfEthAddressAvailable = false) => {
    try {

        const connector = new WalletConnect({
            bridge: "https://bridge.walletconnect.org", // Required
            qrcodeModal: QRCodeModal,
        });

        if (connector._accounts[0]) {
            // Draft transaction
            console.log(ether)
            const tx = {
                from: connector._accounts[0], // Required
                to: addr, // Required (for non contract deployments)
                data: "0x", // Required
                value: ethers.utils.parseEther(ether), // Optional
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
            return

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