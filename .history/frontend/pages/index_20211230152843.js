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
        const response = await fetch("http://localhost:3001/logout", {
            credentials: 'include'
        })

        const processedResponse = await response.json()
        console.log(processedResponse)
        setUserAccount({})
    }

    useEffect(() => {
        if (!userAccount.address) {
            // ask them to login either through solana or eth
            (async () => {
                const response = await fetch("http://localhost:3001/isLoggedIn", {
                    credentials: 'include'
                })
                const processedResponse = await response.json()
                if (!processedResponse.isLoggedIn) {
                    return console.log("please login first")
                } else {
                    setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                }
            })()
        }
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
            const provider = await getSolanaProvider() // need this for login
            const message = `Logging in.... \n \n Random ID: ${Math.random().toString(36).slice(2)}`
            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await window.solana.signMessage(encodedMessage, "utf8")
            console.log(JSON.parse(JSON.stringify(signedMessage.publicKey)).toString())
            console.log(JSON.stringify(signedMessage.publicKey._bn, null))
            console.log(Object.getPrototypeOf(signedMessage.publicKey))
            console.log(signedMessage.publicKey)
            console.log(signedMessage.publicKey)
            console.log(signedMessage.publicKey._bn)



            // const requestObject = {
            //     signature: signedMessage.signature,
            //     message,
            //     address: signedMessage.publicKey.toBytes(),

            // }
            // // const requestObject = {
            // //     signature: signedMessage,
            // //     message
            // // }
            // const loginResponse = await createPostRequest("http://localhost:3001/login/sol", requestObject)

            // if (loginResponse.success) {
            //     setUserAccount({ address: signedMessage.publicKey.toString(), blockchain: "sol" })
            // }

            // console.log(loginResponse)
        } catch (err) { console.log(err) }
    }


    return (
        <div>
            {userAccount.address ? <div><h1>Go to your <Link href="/dashboard">Dashboard</Link></h1><button onClick={handleLogout}>Logout</button></div> : (
                <div>
                    <button onClick={ethLogin}>Login with Ethereum</button>
                    <button onClick={solLogin}>Login with Solana</button>

                </div>
            )}

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
