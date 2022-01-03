import { useState, useEffect, useContext } from "react";
import transferSOL from "../lib/transferSol";
import transferEth from "../lib/transferEth";
import createPostRequest from "../lib/createPostRequest";
import { ethers } from "ethers";
import Link from 'next/link'
import getSolanaProvider from "../lib/getSolanaProvider";
import { UserContext } from "./_app";
import * as web3 from "@solana/web3.js";

export default function App() {
    console.log("rerendering")
    const [username, setUsername] = useState("")
    const [promoCode, setPromoCode] = useState("");
    const { userAccount, setUserAccount } = useContext(UserContext);

    const handleLogout = async () => {
        console.log(userAccount.blockchain)
        if (userAccount.blockchain == "sol") {
            window.solana.disconnect()
        }
        const response = await fetch("http://localhost:3001/logout", {
            credentials: 'include'
        })

        const processedResponse = await response.json()
        console.log(processedResponse)
        setUserAccount({})
    }

    useEffect(() => {
        // ask them to login either through solana or eth
        (async () => {
            console.log("fetching username details")
            const response = await fetch("http://localhost:3001/isLoggedIn", {
                credentials: 'include'
            })
            const processedResponse = await response.json()
            console.log("processedResponse", processedResponse)
            if (!processedResponse.isLoggedIn) {
                return console.log("please login first")
            } else {
                setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
            }
        })()
    }, [])

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleLogout);
        }
        if (window.solana) {
            window.solana.on("disconnect", handleLogout)
        }
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleLogout);
            }
            if (window.solana) {
                window.solana.removeListener("disconnect", handleLogout);
            }
        }
    }, [])

    const registerUsingPromoCode = async (e) => {

        if (!window.ethereum)
            throw new Error("No Ethereum Crypto wallet found. Please install it.");
        // await window.ethereum.send("eth_requestAccounts");
        // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (!userAccount.address) {
            // ask them to login either through solana or eth
            return console.log("please login first")
        }

        const requestObject = {
            username,
            promoCode,
            address: userAccount.address,
            blockchain: userAccount.blockchain
        }

        try {
            const registrationResponse = await createPostRequest("http://localhost:3001/register/promo", requestObject)
            console.log(registrationResponse)
        } catch (err) { console.log("registration failed:", err) }

    }

    const registerUsingSolana = async (e) => {
        const coinbaseResponse = await fetch("https://api.coinbase.com/v2/exchange-rates")
        const data = await coinbaseResponse.json()
        const solPerUSD = data.data.rates.SOL
        const SOLpayValue = solPerUSD * 5
        const hash = await transferSOL(SOLpayValue, "AA6bqLgTzYPpFFH2R9XLdudibWcemLkKDRtZmPQEsEiS", setUserAccount);
        if (!hash) { return }

        const requestObject = {
            hash,
            username
        }

        try {
            const registrationResponse = await createPostRequest("http://localhost:3001/register/sol", requestObject)
            console.log(registrationResponse)
        } catch (err) { console.log("registration failed:", err) }


    }

    const registerUsingEthereum = async (e) => {
        // make get request to https://api.coinbase.com/v2/exchange-rates
        // get the USD value of ETH
        const coinbaseResponse = await fetch("https://api.coinbase.com/v2/exchange-rates")
        const data = await coinbaseResponse.json()
        const ethPerUSD = data.data.rates.ETH
        const ETHpayValue = ethPerUSD * 5

        const tx = await transferEth({
            ether: ETHpayValue.toString(),
            addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
        }, setUserAccount)
        if (!tx) { return }

        const requestObject = {
            tx,
            username
        }
        try {
            const registrationResponse = await createPostRequest("http://localhost:3001/register/eth", requestObject)
            console.log(registrationResponse)
        } catch (err) { console.log("registration failed:", err) }
    }

    const ethLogin = async (e) => {
        try {
            if (!window.ethereum)
                throw new Error("No Ethereum Crypto wallet found. Please install it.");
            // await window.ethereum.send("eth_requestAccounts");
            // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const accounts = await window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{
                    eth_accounts: {}
                }]
            }).then(() => ethereum.request({
                method: 'eth_requestAccounts'
            }))
            // const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const message = `Logging in.... \n \n Random ID: ${Math.random().toString(36).slice(2)}`
            const signature = await signer.signMessage(message)
            const requestObject = {
                signature,
                message,
                address: accounts[0]
            }
            const loginResponse = await createPostRequest("http://localhost:3001/login/eth", requestObject)

            if (loginResponse.success) {
                setUserAccount({ address: accounts[0], blockchain: "eth" })
            }

            console.log(loginResponse)
        } catch (err) { console.log(err) }

    }

    const solLogin = async (e) => {
        try {
            const provider = await (async () => {
                if ("solana" in window) {
                    // await window.solana.request({ method: "disconnect" });
                    await window.solana.connect();
                    const provider = window.solana;
                    console.log("Is Phantom installed?  ", provider.isPhantom);
                    return provider
                } else {
                    window.open("https://www.phantom.app/", "_blank");
                }
            })()
            const message = `Logging in.... \n \n Random ID: ${Math.random().toString(36).slice(2)}`
            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await window.solana.signMessage(encodedMessage, "utf8")
            console.log(JSON.parse(JSON.stringify(signedMessage.publicKey)).toString())
            console.log(signedMessage.publicKey.toBase58()) // returns publickey in base58. 
            console.log(new web3.PublicKey(signedMessage.publicKey.toBase58()))
            console.log(Object.getPrototypeOf(signedMessage.publicKey))
            console.log(signedMessage.publicKey)
            console.log(signedMessage.publicKey)
            console.log(signedMessage.publicKey._bn)
            console.log(signedMessage)
            console.log(JSON.stringify(signedMessage))


            const requestObject = {
                signedMessage: signedMessage,
                message,
                address: signedMessage.publicKey.toBytes(),
                publicKey: signedMessage.publicKey.toBase58()

            }
            const loginResponse = await createPostRequest("http://localhost:3001/login/sol", requestObject)

            if (loginResponse.success) {
                setUserAccount({ address: signedMessage.publicKey.toString(), blockchain: "sol" })
            }

            console.log(loginResponse)
        } catch (err) { console.log(err) }
    }


    return (
        <div className="flex flex-col">
            <div className="flex flex-row shadow-md" id="nav_bar">
                <div className="grow-0" id="left_nav_bar"> </div>
                <div className="grow" id="spacer">  </div>
                <div className="grow-0 my-2" id="right_nav_bar">
                    {userAccount.address ?
                        <div>
                            <h1><Link href="/dashboard">Dashboard</Link></h1>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                        : (
                            <div>
                                <div class="relative inline-block text-left">
                                    <div>
                                        <button type="button" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500" id="menu-button" aria-expanded="true" aria-haspopup="true">
                                            Login
                                            <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                                        <div class="py-1" role="none">
                                            <button class="text-gray-700 block px-4 py-2 text-sm" onClick={ethLogin} role="menuitem" tabindex="-1" id="menu-item-0">Solana</button>
                                            <button class="text-gray-700 block px-4 py-2 text-sm" onClick={solLogin} role="menuitem" tabindex="-1" id="menu-item-1">Ethereum</button>
                                        </div>
                                    </div>
                                </div>
                                {/* <button className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center" onClick={ethLogin}>Login with Ethereum</button>
                                <button onClick={solLogin}>Login with Solana</button> */}
                            </div>
                        )}


                </div>
            </div>

            <br />
            <h1> Enter Username </h1>
            <input value={username} onChange={(e) => { setUsername(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Enter Username" />
            <input value={promoCode} onChange={(e) => { setPromoCode(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Enter Promo Code" />
            <br />
            <button onClick={registerUsingEthereum}>Pay using Ethereum</button>
            <br />
            <button onClick={registerUsingSolana}>Pay using Solana</button>
            <br />
            <button onClick={registerUsingPromoCode}>Use Promo Code</button>
        </div>

    );
}
