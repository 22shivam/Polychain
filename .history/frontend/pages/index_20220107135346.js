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
import CustomLabel from "./components/customLabel";
import Typewriter from 'typewriter-effect';



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
        <div className="flex flex-col w-screen h-screen">
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
            <div className="flex flex-row shadow-md py-1 px-2 w-screen items-center" id="nav_bar">
                <div onClick={() => { router.push("http://localhost:3000/") }} className="grow-0 flex items-center justify-center cursor-pointer" id="left_nav_bar">
                    <img className="" src="/croppedPolychainLogo.png" alt="Polychain Logo" width="150" />
                </div>
                <div className="grow" id="spacer">  </div>
                <div id="middle_nav_bar" clas>
                    <a href="#home" className="hover:no-underline no-underline hover:text-black cursor-pointer"><CustomLabel className="cursor-pointer">Home</CustomLabel></a>
                    <a href="#faq" className="hover:no-underline no-underline hover:text-black cursor-pointer"><CustomLabel className="cursor-pointer">FAQs</CustomLabel></a>

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
            <div id="home" className="flex flex-col justify-center items-center">
                <div id="main_content" className="my-8">
                    <h1 style={{ maxWidth: "650px", lineHeight: "4rem" }} class="text-5xl font-extrabold leading-10 tracking-tight text-gray-900 md:text-center sm:leading-none md:text-6xl lg:text-7xl text-center"><span class="inline md:block"><span class="relative mt-2 text-transparent bg-clip-text bg-gradient-to-br from-brand-primary-dark to-brand-primary-light md:inline-block block">receive <Typewriter
                        options={{
                            strings: ['bitcoin', 'ethereum', 'solana', 'deso'],
                            autoStart: true,
                            loop: true,
                            wrapperClassName: "relative mt-2 text-transparent bg-clip-text bg-gradient-to-br from-brand-primary-dark to-brand-primary-light md:inline-block",
                            // tailwind classes to make it look like a typewriter
                            cursorClassName: "typewrite",
                            cursor: ""
                        }}
                    /> </span> with a simple,</span> shareable link</h1>
                    <div style={{ maxWidth: "500px" }} class="text-center mx-auto mt-7 md:mt-12 md:max-w-lg md:text-center lg:text-lg font-medium">Replace all your wallet addresses (bitcoin, ethereum, solana, deso) with a simple link! <span className=" text-transparent font-bold bg-clip-text bg-gradient-to-br from-brand-primary-dark to-brand-primary-light md:inline-block">Get one for free</span> by <a href="https://twitter.com/intent/tweet?original_referer=https://polychain.tech/&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Eshare%7Ctwgr%5E&related=polychainhq&text=claiming%20my%20%40polychainhq%20link!&url=https%3A%2F%2Fpolychain.tech%2F" target="_blank">tweeting</a> @polychainhq or buy for $5/yr</div>
                </div>
                <div id="username" className="flex flex-col justify-center items-center">
                    <div className="flex justify-center my-2">
                        <span className="border border-gray-300 shadow-sm border-r-0 rounded-l-md px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-semibold">polychian.tech/</span>
                        <CustomInput value={username} onChange={(e) => { setUsername((e.target.value).replace(/[^a-zA-Z0-9]/g, "")) }} name="field_name" className="rounded-l-none ml-0 input-placeholder" type="text" placeholder="Enter Username" />
                        <DropDownComponent primaryLabel="Buy" label1="Ethereum" label2="Solana" label1onClick={registerUsingEthereum} label2onClick={registerUsingSolana} />
                    </div>
                    <div id="promo_code" className="flex flex-row justify-center my-2">
                        <CustomInput className="text-sm" value={promoCode} onChange={(e) => { setPromoCode((e.target.value).replace(/[^a-zA-Z0-9]/g, "")) }} type="text" placeholder="Enter Promo Code" />
                        <CustomButton className="text-sm py-1" onClick={registerUsingPromoCode}>Use Promo Code</CustomButton>
                    </div>

                </div>
            </div>
            <div className="grow"></div>
            <footer className="flex flex-row shadow-md py-1 px-2 w-screen items-center">
                <section class="text-gray-700 bg-white body-font">
                    <div class="container flex flex-col items-center px-8 py-8 mx-auto max-w-7xl sm:flex-row">
                        <a href="#_" class="text-xl font-black leading-none text-gray-900 select-none logo">tails<span class="text-indigo-600">.</span></a>
                        <p class="mt-4 text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l sm:border-gray-200 sm:mt-0">© 2021 Tails - Tailwindcss Page Builder
                        </p>
                        <span class="inline-flex justify-center mt-4 space-x-5 sm:ml-auto sm:mt-0 sm:justify-start">
                            <a href="#" class="text-gray-400 hover:text-gray-500">
                                <span class="sr-only">Facebook</span>
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd"></path>
                                </svg>
                            </a>

                            <a href="#" class="text-gray-400 hover:text-gray-500">
                                <span class="sr-only">Instagram</span>
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd"></path>
                                </svg>
                            </a>

                            <a href="#" class="text-gray-400 hover:text-gray-500">
                                <span class="sr-only">Twitter</span>
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                                </svg>
                            </a>

                            <a href="#" class="text-gray-400 hover:text-gray-500">
                                <span class="sr-only">GitHub</span>
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
                                </svg>
                            </a>

                            <a href="#" class="text-gray-400 hover:text-gray-500">
                                <span class="sr-only">Dribbble</span>
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clip-rule="evenodd"></path>
                                </svg>
                            </a>
                        </span>
                    </div>
                </section>
            </footer>

        </div >

    );
}
