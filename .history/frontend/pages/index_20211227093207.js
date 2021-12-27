import { useState } from "react";
import { ethers } from "ethers";
import ErrorMessage from "./components/error-message";

const startPayment = async ({ setError, ether, addr }) => {
    try {
        if (!window.ethereum)
            throw new Error("No crypto wallet found. Please install it.");

        await window.ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        ethers.utils.getAddress(addr);
        const tx = await signer.sendTransaction({
            to: addr,
            value: ethers.utils.parseEther(ether)
        });
        console.log({ ether, addr });
        console.log("tx", tx);
    } catch (err) {
        setError(err.message);
    }
};

export default function App() {
    const [error, setError] = useState();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        setError();
        await startPayment({
            setError,
            ether: data.get("ether"),
            addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
        });
    };

    return (
        <form className="m-4" onSubmit={handleSubmit}>
            <div className="">
                <main className="">
                    <h1 className="">
                        Send ETH payment
                    </h1>
                    <div className="">
                        <div className="my-3">
                            <span className="input input-bordered block w-full focus:ring focus:outline-none">Send Shivam</span>
                        </div>
                        <div className="my-3">
                            <input
                                name="ether"
                                type="text"
                                className="input input-bordered block w-full focus:ring focus:outline-none"
                                placeholder="Amount in ETH"
                            />
                        </div>
                    </div>
                </main>
                <footer className="p-4">
                    <button
                        type="submit"
                        className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                    >
                        Pay now
                    </button>
                    <ErrorMessage message={error} />
                </footer>
            </div>
        </form>
    );
}
