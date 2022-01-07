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
import Link from "next/link";



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
            <div className="flex flex-row shadow-md py-1 px-2 w-screen items-center fixed bg-white z-20" id="nav_bar">
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
            <div id="home" className="mt-20 flex flex-col justify-center items-center mb-40 md:44 lg:mb-52">
                <div id="main_content" className="my-7">
                    <h1 style={{ maxWidth: "650px", lineHeight: "4rem" }} class="text-3xl font-extrabold tracking-tight text-gray-900 md:text-center md:text-4xl lg:text-5xl text-center"><span class="inline md:block"><span class="relative mt-2 text-transparent bg-clip-text bg-gradient-to-br from-brand-primary-dark to-brand-primary-light block">receive <Typewriter
                        options={{
                            strings: ['bitcoin', 'ethereum', 'solana', 'deso'],
                            autoStart: true,
                            loop: true,
                            wrapperClassName: "relative mt-2 text-transparent bg-clip-text bg-gradient-to-br from-brand-primary-dark to-brand-primary-light",
                            // tailwind classes to make it look like a typewriter
                            cursorClassName: "typewrite",
                            cursor: ""
                        }}
                    /> </span> with a simple,</span> shareable link</h1>
                    <div style={{ maxWidth: "500px" }} class="text-center mx-auto mt-7 md:mt-8 md:max-w-lg md:text-center lg:text-lg font-medium">Replace all your wallet addresses with a simple link! <span className=" text-transparent font-bold bg-clip-text bg-gradient-to-br from-brand-primary-dark to-brand-primary-light md:inline-block">Get one for free</span> by <a href="https://twitter.com/intent/tweet?original_referer=https://polychain.tech/&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Eshare%7Ctwgr%5E&related=polychainhq&text=claiming%20my%20%40polychainhq%20link!&url=https%3A%2F%2Fpolychain.tech%2F" target="_blank">tweeting</a> @polychainhq or buy for $5/yr</div>
                </div>
                <div id="username" className="flex flex-col justify-center items-center">
                    <div className="flex justify-center my-3">
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

            <div class="px-8 mx-auto max-w-7xl lg:px-16 mb-40">
                <h2 class="pt-4 text-xl font-bold md:text-3xl" id="faq" >Frequently Asked Questions</h2>
                <div class="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-16 font-medium">
                    <div>
                        <h5 class="mt-10 mb-3 font-semibold text-gray-900">What is Polychain?</h5>
                        <p>Polychain replaces your wallet addresses with a shareable link which you can use to receive payments, tips, etc. in several popular cryptocurrencies. Check <Link href="/shivam">polchain.tech/shivam</Link> for example!</p>
                        <h5 class="mt-10 mb-3 font-semibold text-gray-900">How can I access to it for free?</h5>
                        <p>Just tweet anything @polychainhq to receive a promocode which can be redeemed for 1 year access to your own polychain link!</p>

                        <h5 class="mt-10 mb-3 font-semibold text-gray-900">What is the pricing?</h5>
                        <p>
                            It costs $5/yr. For a limited time, you can get it for free by tweeting anything @polychainhq.
                        </p>
                    </div>
                    <div>
                        <h5 class="mt-10 mb-3 font-semibold text-gray-900">What does the future of Polychain look like?</h5>
                        <p>Apart from adding support for more cryptocurrencies, we hope to make personal token creation and airdrops easier. </p>
                        <h5 class="mt-10 mb-3 font-semibold text-gray-900">What cryptocurrencies are currently supported?</h5>
                        <p>
                            Bitcoin, Ethereum, Solana, and DeSo are currently supported. ERC20 tokens and other popular cryptocurrencies will also be added to the platform in the near future. If you have any recommendations, then drop us a message <a href="https://twitter.com/polychainhq" target="_blank">@polychainhq</a> on twitter.
                        </p>
                        <h5 class="mt-10 mb-3 font-semibold text-gray-900">Have any other questions or suggestions?</h5>
                        <p>Feel free to drop us a message @polychainhq on twitter</p>

                    </div>
                </div>
            </div>

            <div className="grow"></div>
            <footer className="flex flex-row shadow-md py-1 px-2 w-screen items-center">
                <div id="left"></div>
                <div id="middle" className="grow"></div>
                <div id="right"></div>
            </footer>
            <section class="text-gray-700 bg-white body-font">
                <div class="container flex flex-col items-center px-8 py-8 mx-auto max-w-7xl sm:flex-row">
                    {/* <a href="#_" class="text-xl font-black leading-none text-gray-900 select-none logo">tails<span class="text-indigo-600">.</span></a> */}
                    <p class="mt-4 text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l sm:border-gray-200 sm:mt-0">© 2021 Polychain
                    </p>
                    <span class="inline-flex justify-center mt-4 space-x-5 sm:ml-auto sm:mt-0 sm:justify-start font-medium">

                        <a href="https://twitter.com/polychainhq" target="_blank" class="text-gray-400 hover:text-gray-500">
                            <span class="sr-only">Twitter</span>
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                            </svg>
                        </a>

                        &nbsp; made with&nbsp;<span style={{ margin: "0px" }} className="text-red-600 text-lg">&hearts;</span> &nbsp;in india
                    </span>
                </div>
            </section>

        </div >

    );
}
