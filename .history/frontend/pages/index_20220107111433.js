import { useState, useEffect, useContext } from "react";
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
import { ToastContainer, toast } from 'react-toastify';
import toastError from '../lib/toastError'
import toastSuccess from '../lib/toastSuccess'
import toastInfo from "../lib/toastInfo";
import CustomBrandedButton from "./components/customBrandedButton";

let checkifUsernameAvailable = async (username) => {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/${username}`)
        response = await response.json()
        if (response.success) { // user with username found
            toastError("Username unavailable")
            return false
        }
        return true
    } catch (error) {
        toastError("Invalid Username")
        return false
    }
}



export default function App() {
    console.log("rerendering")
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [promoCode, setPromoCode] = useState("");
    const { userAccount, setUserAccount } = useContext(UserContext);

    const handleLogout = async () => {
        console.log(userAccount.blockchain)
        if (userAccount.blockchain == "sol") {
            window.solana.disconnect()
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`, {
            credentials: 'include'
        })

        const processedResponse = await response.json()
        console.log(processedResponse)
        toastInfo("Logged out")
        setUserAccount({})
    }

    // useEffect(() => {
    //     // ask them to login either through solana or eth
    //     (async () => {
    //         setLoading(true)
    //         console.log("fetching username details")
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/isLoggedIn", {
    //             credentials: 'include'
    //         })
    //         const processedResponse = await response.json()
    //         console.log("processedResponse", processedResponse)
    //         if (!processedResponse.isLoggedIn) {
    //             // return console.log("please login first")
    //             setLoading(false)
    //         } else {
    //             setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
    //             setLoading(false)
    //         }
    //     })()
    // }, [])

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

        if (!(await checkifUsernameAvailable(username))) {
            return
        }

        if (!userAccount.address) {
            // ask them to login either through solana or eth
            return toastError("Please login before registering using a promocode")
        }

        // if (userAccount.blockchain == "eth") {
        //     let bool = await checkIfETHAddressAvailable(userAccount.address)
        //     if (!bool) {
        //         return
        //     }
        // } else if (userAccount.blockchain == "sol") {
        //     let bool = await checkIfSOLAddressAvailable(userAccount.address)
        //     if (!bool) {
        //         return
        //     }
        // }

        const requestObject = {
            username,
            promoCode,
            address: userAccount.address,
            blockchain: userAccount.blockchain
        }

        try {
            const registrationResponse = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/register/promo`, requestObject)

            if (!registrationResponse.success) {
                if (registrationResponse.isNotLoggedIn) {
                    setUserAccount({})
                    return toastError("Session Expired. You will need to login again before registering this username")
                }
                toastError(registrationResponse.message)
            } else {
                toastSuccess(registrationResponse.message)
                setUserAccount({ address: registrationResponse.address, blockchain: registrationResponse.blockchain })
            }

        } catch (err) {
            toastError(err.message)
        }

    }

    const registerUsingSolana = async (e) => {

        if (!(await checkifUsernameAvailable(username))) {
            return
        }

        console.log("trying to reg")

        const coinbaseResponse = await fetch("https://api.coinbase.com/v2/exchange-rates")
        const data = await coinbaseResponse.json()
        const solPerUSD = data.data.rates.SOL
        const SOLpayValue = solPerUSD * 5
        const hash = await transferSOL(SOLpayValue, "AA6bqLgTzYPpFFH2R9XLdudibWcemLkKDRtZmPQEsEiS", setUserAccount, true);
        if (!hash) { return }

        const requestObject = {
            hash,
            username
        }

        try {
            const registrationResponse = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/register/sol`, requestObject)
            if (!registrationResponse.success) {
                toastError(registrationResponse.message)
            } else {
                toastSuccess(registrationResponse.message)
                setUserAccount({ address: registrationResponse.address, blockchain: "sol" })
            }

        } catch (err) {
            toastError(err.message)
        }


    }

    const registerUsingEthereum = async (e) => {
        // make get request to https://api.coinbase.com/v2/exchange-rates
        // get the USD value of ETH

        // check if username available
        if (!(await checkifUsernameAvailable(username))) {
            console.log("checking")
            return
        }

        const coinbaseResponse = await fetch("https://api.coinbase.com/v2/exchange-rates")
        const data = await coinbaseResponse.json()
        const ethPerUSD = data.data.rates.ETH
        const ETHpayValue = ethPerUSD * 5

        const tx = await transferEth({
            ether: ETHpayValue.toString(),
            addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
        }, setUserAccount, true)
        if (!tx) { return }

        const requestObject = {
            tx,
            username
        }
        try {
            const registrationResponse = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/register/eth`, requestObject)
            if (!registrationResponse.success) {
                toastError(registrationResponse.message)
            } else {
                toastSuccess(registrationResponse.message)
                setUserAccount({ address: registrationResponse.address, blockchain: "eth" })
            }

        } catch (err) {
            toastError(err.message)
        }
    }

    const ethLogin = async (e) => {
        try {
            if (!window.ethereum) {
                window.open(`https://metamask.io/`, "_blank");
                return toastError('No Ethereum Crypto wallet found. Please install one like Metamask.')
            }
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
            const loginResponse = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login/eth`, requestObject)

            if (!loginResponse.success) {
                toastError('Login Failed')
            }

            if (loginResponse.success) {
                toastSuccess('Login Successful')
                setUserAccount({ address: accounts[0], blockchain: "eth" })
            }

            console.log(loginResponse)
        } catch (err) {
            if (err.code == -32002) {
                return toastInfo('Login request already sent to your ethereum wallet. Kindly connect using your wallet.')
            }
            console.log(err), toastError(err.message)
        }

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

            const requestObject = {
                signedMessage: signedMessage,
                message,
                address: signedMessage.publicKey.toBytes(),
                publicKey: signedMessage.publicKey.toBase58()

            }
            const loginResponse = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login/sol`, requestObject)

            if (!loginResponse.success) {
                toastError('Login Failed')
            }

            if (loginResponse.success) {
                toastSuccess('Login Successful')
                setUserAccount({ address: signedMessage.publicKey.toString(), blockchain: "sol" })
            }

            console.log(loginResponse)
        } catch (err) { toastError(err.message) }
    }

    const goToDashboard = () => {
        router.push("/dashboard")
    }


    return (
        <div className="flex flex-col w-screen">
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
            />
            <div className="flex flex-row shadow-md py-1 px-2 w-screen" id="nav_bar">
                <div onClick={() => { router.push("http://localhost:3000/") }} className="grow-0 flex items-center justify-center cursor-pointer" id="left_nav_bar">
                    <img className="" src="/croppedPolychainLogo.png" alt="Polychain Logo" width="150" />
                </div>
                <div className="grow" id="spacer">  </div>
                <div className="grow-0 my-2 mr-4 flex" id="right_nav_bar">
                    {userAccount.address ?
                        <div className="flex flex-row">
                            <CustomBrandedButton className="" onClick={goToDashboard}>Dashboard</CustomBrandedButton>
                            {/* <h1><Link href="/dashboard">Dashboard</Link></h1> */}
                            <CustomButton onClick={handleLogout}>Logout</CustomButton>
                        </div>
                        : (
                            <div>
                                <DropDownComponent primaryLabel="Login" label1="Ethereum" label2="Solana" label1onClick={ethLogin} label2onClick={solLogin} />
                            </div>
                        )}


                </div>
            </div >

            <br />
            <div id="main_body" className="flex flex-col justify-center align-middle">
                <div id="username" className="flex flex-col justify-center align-middle">
                    <div className="flex justify-center my-2">
                        <span className="border border-gray-300 shadow-sm border-r-0 rounded-l-md px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-semibold">localhost:3000/</span>
                        <CustomInput value={username} onChange={(e) => { setUsername((e.target.value).replace(/[^a-zA-Z0-9]/g, "")) }} name="field_name" className="rounded-l-none ml-0 input-placeholder" type="text" placeholder="Enter Username" />
                        <DropDownComponent primaryLabel="Buy" label1="Ethereum" label2="Solana" label1onClick={registerUsingEthereum} label2onClick={registerUsingSolana} />
                    </div>
                    <div id="promo_code" className="flex flex-row justify-center my-2">
                        <CustomInput value={promoCode} onChange={(e) => { setPromoCode((e.target.value).replace(/[^a-zA-Z0-9]/g, "")) }} type="text" placeholder="Enter Promo Code" />
                        <CustomButton onClick={registerUsingPromoCode}>Use Promo Code</CustomButton>
                    </div>

                </div>
            </div>
            <section class="w-full px-6 pb-12 antialiased bg-white">
                <div class="mx-auto max-w-7xl">

                    <nav class="relative z-50 h-24 select-none" x-data="{ showMenu: false }">
                        <div class="container relative flex flex-wrap items-center justify-between h-24 mx-auto overflow-hidden font-medium border-b border-gray-200 md:overflow-visible lg:justify-center sm:px-4 md:px-2">
                            <div class="flex items-center justify-start w-1/4 h-full pr-4">
                                <a href="#_" class="inline-block py-4 md:py-0">
                                    <span class="p-1 text-xl font-black leading-none text-gray-900"><span>tails</span><span class="text-indigo-600">.</span></span>
                                </a>
                            </div>
                            <div class="top-0 left-0 items-start hidden w-full h-full p-4 text-sm bg-gray-900 bg-opacity-50 md:items-center md:w-3/4 md:absolute lg:text-base md:bg-transparent md:p-0 md:relative md:flex" :class="{'flex fixed': showMenu, 'hidden': !showMenu }">
                            <div class="flex-col w-full h-auto overflow-hidden bg-white rounded-lg md:bg-transparent md:overflow-visible md:rounded-none md:relative md:flex md:flex-row">
                                <a href="#_" class="inline-flex items-center block w-auto h-16 px-6 text-xl font-black leading-none text-gray-900 md:hidden">tails<span class="text-indigo-600">.</span></a>
                                <div class="flex flex-col items-start justify-center w-full space-x-6 text-center lg:space-x-8 md:w-2/3 md:mt-0 md:flex-row md:items-center">
                                    <a href="#_" class="inline-block w-full py-2 mx-0 ml-6 font-medium text-left text-indigo-600 md:ml-0 md:w-auto md:px-0 md:mx-2 lg:mx-3 md:text-center">Home</a>
                                    <a href="#_" class="inline-block w-full py-2 mx-0 font-medium text-left text-gray-700 md:w-auto md:px-0 md:mx-2 hover:text-indigo-600 lg:mx-3 md:text-center">Features</a>
                                    <a href="#_" class="inline-block w-full py-2 mx-0 font-medium text-left text-gray-700 md:w-auto md:px-0 md:mx-2 hover:text-indigo-600 lg:mx-3 md:text-center">Blog</a>
                                    <a href="#_" class="inline-block w-full py-2 mx-0 font-medium text-left text-gray-700 md:w-auto md:px-0 md:mx-2 hover:text-indigo-600 lg:mx-3 md:text-center">Contact</a>
                                    <a href="#_" class="absolute top-0 left-0 hidden py-2 mt-6 ml-10 mr-2 text-gray-600 lg:inline-block md:mt-0 md:ml-2 lg:mx-3 md:relative">
                                        <svg class="inline w-5 h-5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </a>
                                </div>
                                <div class="flex flex-col items-start justify-end w-full pt-4 md:items-center md:w-1/3 md:flex-row md:py-0">
                                    <a href="#" class="w-full px-6 py-2 mr-0 text-gray-700 md:px-0 lg:pl-2 md:mr-4 lg:mr-5 md:w-auto">Sign In</a>
                                    <a href="#_" class="inline-flex items-center w-full px-6 py-3 text-sm font-medium leading-4 text-white bg-indigo-600 md:px-3 md:w-auto md:rounded-full lg:px-5 hover:bg-indigo-500 focus:outline-none md:focus:ring-2 focus:ring-0 focus:ring-offset-2 focus:ring-indigo-600">Sign Up</a>
                                </div>
                            </div>
                        </div>
                        <div @click="showMenu = !showMenu" class="absolute right-0 flex flex-col items-center items-end justify-center w-10 h-10 bg-white rounded-full cursor-pointer md:hidden hover:bg-gray-100">
                        <svg class="w-6 h-6 text-gray-700" x-show="!showMenu" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" x-cloak="">
                            <path d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                        <svg class="w-6 h-6 text-gray-700" x-show="showMenu" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" x-cloak="">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                </div>
        </div>
        </nav >

        < !--Main Hero Content-- >
        <div class="container max-w-lg px-4 py-32 mx-auto text-left md:max-w-none md:text-center">
            <h1 class="text-5xl font-extrabold leading-10 tracking-tight text-left text-gray-900 md:text-center sm:leading-none md:text-6xl lg:text-7xl"><span class="inline md:block">Start Crafting Your</span> <span class="relative mt-2 text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-indigo-500 md:inline-block">Next Great Idea</span></h1>
            <div class="mx-auto mt-5 text-gray-500 md:mt-12 md:max-w-lg md:text-center lg:text-lg">Simplifying the creation of landing pages, blog pages, application pages and so much more!</div>
            <div class="flex flex-col items-center mt-12 text-center">
                <span class="relative inline-flex w-full md:w-auto">
                    <a href="#_" type="button" class="inline-flex items-center justify-center w-full px-8 py-4 text-base font-bold leading-6 text-white bg-indigo-600 border border-transparent rounded-full md:w-auto hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
                        Purchase Now
                    </a>
                    <span class="absolute top-0 right-0 px-2 py-1 -mt-3 -mr-6 text-xs font-medium leading-tight text-white bg-green-400 rounded-full">only $15/mo</span>
                </span>
                <a href="#" class="mt-3 text-sm text-indigo-500">Learn More</a>
            </div>
        </div>
        <!--End Main Hero Content-- >

    </div >
</section >
        </div >

    );
}
