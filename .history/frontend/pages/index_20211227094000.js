import { useState } from "react";
import { ethers } from "ethers";

const startPayment = async ({ ether, addr }) => {
    try {
        if (!window.ethereum)
            throw new Error("No crypto wallet found. Please install it.");

        await window.ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        // ethers.utils.getAddress(addr);
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
    const [payValue, setPayValue] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await startPayment({
            ether: payValue,
            addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1> Send ETH payment </h1>
            <span>Send Shivam</span>
            <input value={payValue} onChange={() => { setPayValue(e.target.value) }} className="shadow-sm mr-4 border-4" name="ether" type="text" placeholder="Amount in ETH" />
            <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>
        </form>
    );
}
