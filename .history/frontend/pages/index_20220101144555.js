import { useState, useEffect, useContext, useReducer } from "react";
import transferSOL from "../lib/transferSol";
import transferEth from "../lib/transferEth";
import createPostRequest from "../lib/createPostRequest";
import { ethers } from "ethers";
import { UserContext } from "./_app";
import * as web3 from "@solana/web3.js";
import DropDownComponent from './components/DropDown'
import { useRouter } from "next/dist/client/router";
import CustomButton from "./components/customButton";
import CustomInput from "./components/customInput";
import Alert from "./components/Alert";

function alertReducer(state, action) {
    switch (action.type) {
        case 'login':
            return { show: true, success: true, message: "Login Successful" };
        case 'logout':
            return { show: true, success: true, message: "Logout Successful" };
        case 'error':
            return { show: true, success: false, message: action.message };
        case 'hide':
            return { show: false, success: "", message: "" };
        default:
            throw new Error();
    }
}

const initialAlertState = {
    show: false,
    message: "",
    success: ""
}

export default function App() {
    const [alertState, alertDispatch] = useReducer(alertReducer, initialAlertState);
    console.log("rerendering")
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [promoCode, setPromoCode] = useState("");
    const { userAccount, setUserAccount } = useContext(UserContext);
    const [showWalletConnect, setShowWalletConnect] = useState(false);

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

            if (!loginResponse.success) {
                setTimeout(() => {
                    alertDispatch({ type: "hide" })
                }, 5000)
                alertDispatch({ type: "error", message: "Login Failed" })
            }

            if (loginResponse.success) {
                setTimeout(() => {
                    alertDispatch({ type: "hide" })
                }, 5000)
                alertDispatch({ type: "login" })
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

            if (!loginResponse.success) {
                setTimeout(() => {
                    alertDispatch({ type: "hide" })
                }, 5000)
                alertDispatch({ type: "error", message: "Login Failed" })
            }

            if (loginResponse.success) {
                setTimeout(() => {
                    alertDispatch({ type: "hide" })
                }, 5000)
                alertDispatch({ type: "login" })
                setUserAccount({ address: signedMessage.publicKey.toString(), blockchain: "sol" })
            }

            console.log(loginResponse)
        } catch (err) { console.log(err) }
    }

    const goToDashboard = () => {
        router.push("/dashboard")
    }


    return (
        <div className="flex flex-col">
            {!showWalletConnect ? <span /> : showWalletConnect === "successful" ? <Alert success message="Login Successful" /> : <Alert {...alertState} />}
            <div className="flex flex-row shadow-md py-1 px-2" id="nav_bar">
                <div className="grow-0" id="left_nav_bar"> </div>
                <div className="grow" id="spacer">  </div>
                <div className="grow-0 my-2 mr-4 flex" id="right_nav_bar">
                    {userAccount.address ?
                        <div className="flex flex-row">
                            <CustomButton onClick={goToDashboard}>Dashboard</CustomButton>
                            {/* <h1><Link href="/dashboard">Dashboard</Link></h1> */}
                            <CustomButton onClick={handleLogout}>Logout</CustomButton>
                        </div>
                        : (
                            <div>
                                <DropDownComponent primaryLabel="Login" label1="Ethereum" label2="Solana" label1onClick={ethLogin} label2onClick={solLogin} />
                            </div>
                        )}


                </div>
            </div>

            <br />
            <div id="main_body" class="flex flex-col justify-center align-middle">
                <div id="username" className="flex flex-col justify-center align-middle">
                    <div class="flex justify-center my-2">
                        <span class="border border-gray-300 shadow-sm border-r-0 rounded-l-md px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-semibold">localhost:3000/</span>
                        <CustomInput value={username} onChange={(e) => { setUsername(e.target.value) }} name="field_name" className="rounded-l-none ml-0 input-placeholder" type="text" placeholder="Enter Username" />
                        <DropDownComponent primaryLabel="Buy" label1="Ethereum" label2="Solana" label1onClick={registerUsingEthereum} label2onClick={registerUsingSolana} />
                    </div>
                    <div id="promo_code" className="flex flex-row justify-center my-2">
                        <CustomInput value={promoCode} onChange={(e) => { setPromoCode(e.target.value) }} type="text" placeholder="Enter Promo Code" />
                        <CustomButton onClick={registerUsingPromoCode}>Use Promo Code</CustomButton>
                    </div>

                </div>
            </div>
        </div>

    );
}
