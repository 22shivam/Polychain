import toastError from "./toastError";

const ensureMaticMainnet = async (userAccount, ethereum, WalletConnectConnector) => {
    if (userAccount.wallet == "metamask") {
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        if (chainId !== "0x137") {
            try {
                // const response = await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: 137 }] });
                await ethereum.request({
                    id: 1,
                    jsonrpc: "2.0",
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: "0x89",
                            rpcUrls: ["https://polygon-rpc.com/"],

                            chainName: "Polygon Mainnet",
                            nativeCurrency: {
                                name: "MATIC",
                                symbol: "MATIC", // 2-6 characters long
                                decimals: 18,
                            },
                            blockExplorerUrls: ["https://polygonscan.com/"],
                        },
                    ],
                });
            } catch (error) {
                console.log(error)
                toastError("Please change to Polygon Network before proceeding")
                return
            }

        }
    }

    if (userAccount.wallet == "walletconnect") {
        if (WalletConnectConnector.chainId != 137) {
            toastError("Please change to Polygon Network before proceeding")
            return
        }
    }
}

export default ensureMaticMainnet;