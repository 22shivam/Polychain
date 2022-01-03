import toastError from "./toastError";

const getSolanaProvider = async () => {
    try {
        if ("solana" in window) {
            await window.solana.connect();
            const provider = window.solana;
            if (provider.isPhantom) {
                console.log("Is Phantom installed?  ", provider.isPhantom);
                return provider;
            }
        } else {
            window.open("https://www.phantom.app/", "_blank");
        }
    } catch (err) {
        toastError(err.message)
    }
};

export default getSolanaProvider;