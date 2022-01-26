import WalletConnect from "@walletconnect/client";
export default WalletConnectConnector = new WalletConnect({
    bridge: "https://bridge.walletconnect.org", // Required
    qrcodeModal: QRCodeModal,
});