import toastError from "./toastError";

const ensureEthereumMainnet = (userAccount, ethereum, WalletConnectConnector) => {
    if (userAccount.wallet == "metamask") {
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        if (chainId !== "0x1") {
            try {
                const response = await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] });
            } catch (error) {
                toastError("Please change to Ethereum Mainnet before proceeding")
                return
            }

        }
    }

    if (userAccount.wallet == "walletconnect") {
        if (WalletConnectConnector.chainId != 1) {
            toastError("Please change to Ethereum Mainnet before proceeding")
            return
        }
    }

}

export default ensureEthereumMainnet