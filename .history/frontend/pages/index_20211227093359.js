import { useState } from "react";
import { ethers } from "ethers";

const startPayment = async ({ ether, addr }) => {
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
        console.error(err)
    }
};

export default function App() {

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        await startPayment({
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
                    <span className="">Send Shivam</span>
                    <input
                        name="ether"
                        type="text"
                        placeholder="Amount in ETH"
                    />
                </main>
                <footer className="p-4">
                    <button
                        type="submit"

                    >
                        Pay now
                    </button>
                </footer>
            </div>
        </form>
    );
}
