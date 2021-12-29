import { useState, useEffect } from "react";
import { ethers } from "ethers";
import TOKEN_ABI from "../lib/TOKEN_ABI";
import generateQR from "../lib/generateQR";
import transferSOL from "../lib/transferSol";
import { toBn } from "evm-bn";

const TOKEN_ADDRESS = "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa"
const STANDARD_MESSAGE = "Logging in...";

const handleSubmitDESO = async (e) => {
    window.open("https://diamondapp.com/send-deso?public_key=BC1YLj4aFMVM1g44wBgibYq8dFQ1NxTCpQFyJnNMqGqmyUt9zDVjZ5L", "_blank");
}

const startPayment = async ({ ether, addr }) => {
    try {
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
        return tx
    } catch (err) {
        console.log(err)
    }
};



export default function App() {
    console.log("rerendering")
    const [qrCode, setQrCode] = useState("")
    const [ETHpayValue, setETHPayValue] = useState(0);
    const [SOLpayValue, setSOLPayValue] = useState(0);
    const [ERC20payValue, setERC20PayValue] = useState(0);
    const [username, setUsername] = useState("")
    const [promoCode, setPromoCode] = useState("");

    useEffect(() => {
        (async () => {
            const qrCode = await generateQR("bitcoin:3DBGwFbBoj7FjBFcbVi8hFcpmCjPhCY62X")
            setQrCode(qrCode)
        })()
    }, [])

    const handleSubmitEth = async (e) => {
        e.preventDefault();
        await startPayment({
            ether: ETHpayValue,
            addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
        });
    };

    const handleSubmitSol = async (e) => {
        e.preventDefault();
        await transferSOL(SOLpayValue, "AA6bqLgTzYPpFFH2R9XLdudibWcemLkKDRtZmPQEsEiS");
    };

    const handleSubmitERC20 = async (e) => {
        e.preventDefault();
        try {
            if (!window.ethereum)
                throw new Error("No crypto wallet found. Please install it.");
            // await window.ethereum.send("eth_requestAccounts");
            // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
            const decimals = await contract.decimals()
            await contract.transfer("0x76aEB5092D8eabCec324Be739b8BA5dF473F0055", ethers.utils.parseUnits(ERC20payValue.toString(), decimals));
        } catch (err) {
            console.log(err)
        }
    }

    const registerUsingPromoCode = async (e) => {

        const requestObject = {
            username,
            promoCode
        }

        try {
            const response = await fetch("http://localhost:3001/register/promo", {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(requestObject) // body data type must match "Content-Type" header
            });

            const registrationResponse = await response.json()
            console.log(registrationResponse)
        } catch (err) {
            console.log("registration failed:", err)
        }

    }

    const registerUsingSolana = async (e) => {
        const coinbaseResponse = await fetch("https://api.coinbase.com/v2/exchange-rates")
        const data = await coinbaseResponse.json()

        const solPerUSD = data.data.rates.SOL
        const SOLpayValue = solPerUSD * 5

        const hash = await transferSOL(SOLpayValue, "AA6bqLgTzYPpFFH2R9XLdudibWcemLkKDRtZmPQEsEiS");
        console.log(hash)
        if (!hash) {
            console.log("returning")
            return
        }

        const requestObject = {
            hash,
            username
        }

        try {
            const response = await fetch("http://localhost:3001/register/sol", {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(requestObject) // body data type must match "Content-Type" header
            });

            const registrationResponse = await response.json()
            console.log(registrationResponse)
        } catch (err) {
            console.log("registration failed:", err)
        }


    }

    const registerUsingEthereum = async (e) => {
        // make get request to https://api.coinbase.com/v2/exchange-rates
        // get the USD value of ETH
        const coinbaseResponse = await fetch("https://api.coinbase.com/v2/exchange-rates")
        const data = await coinbaseResponse.json()

        const ethPerUSD = data.data.rates.ETH
        const ETHpayValue = ethPerUSD * 5

        const tx = await startPayment({
            ether: ETHpayValue.toString(),
            addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
        })

        if (!tx) {
            return
        }

        const requestObject = {
            tx,
            username
        }
        try {
            const response = await fetch("http://localhost:3001/register/eth", {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(requestObject) // body data type must match "Content-Type" header
            });

            const registrationResponse = await response.json()
            console.log(registrationResponse)
        } catch (err) {
            console.log("registration failed:", err)
        }


    }

    const ethLogin = async (e) => {
        try {
            if (!window.ethereum)
                throw new Error("No crypto wallet found. Please install it.");

            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            console.log(accounts)
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const message = `Logging in.... \n \n Random ID: ${Math.random().toString(36).slice(2)}`
            const signature = await signer.signMessage(message)

            const requestObject = {
                signature,
                message,
                address: accounts[0]
            }
            console.log(requestObject)
            const response = await fetch("http://localhost:3001/login/eth", {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(requestObject) // body data type must match "Content-Type" header
            });

            const loginResponse = await response.json()
            console.log(loginResponse)

        } catch (err) {
            console.log(err)
        }


    }

    return (
        <div>
            <div>
                <button onClick={ethLogin}>Login with Ethereum</button>
                <br></br>
            </div>

            <div>
                <h1> Enter Username </h1>
                <input value={username} onChange={(e) => { setUsername(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Enter Username" />
                <input value={promoCode} onChange={(e) => { setPromoCode(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Enter Promo Code" />
                {/* <button onClick={registerUsingSolana}>Pay using Solana</button> */}
                <br />
                <button onClick={registerUsingEthereum}>Pay using Ethereum</button>
                <br />
                <button onClick={registerUsingSolana}>Pay using Solana</button>
                <br />
                <button onClick={registerUsingPromoCode}>Use Promo Code</button>
            </div>

            <div>
                <form onSubmit={handleSubmitEth}>
                    <h1> Send ETH payment </h1>
                    <span>Send Shivam</span>
                    <input value={ETHpayValue} onChange={(e) => { setETHPayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ETH" />
                    <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>
                </form>
                <form onSubmit={handleSubmitSol}>
                    <h1> Send Sol payment </h1>
                    <span>Send Shivam</span>
                    <input value={SOLpayValue} onChange={(e) => { setSOLPayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in SOL" />
                    <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>
                </form>
                <form onSubmit={handleSubmitERC20}>
                    <h1> Send ERC20 payment </h1>
                    <span>Send Shivam</span>
                    <input value={ERC20payValue} onChange={(e) => { setERC20PayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ERC20" />
                    <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>
                </form>
                <form onSubmit={handleSubmitDESO}>
                    <span>Send Shivam</span>
                    <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Send Deso </button>
                </form>
                <div>
                    <span>Pay Using Bitcoin</span>
                    <img src={qrCode}></img>
                    <a href="bitcoin:3DBGwFbBoj7FjBFcbVi8hFcpmCjPhCY62X">Send</a>
                </div></div>
        </div>

    );
}
