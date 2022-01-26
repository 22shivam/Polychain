import { useState, useEffect, useContext } from "react";
import transferSOL from "../lib/transferSol";
import transferEth from "../lib/transferEth";
import createPostRequest from "../lib/createPostRequest";
import { UserContext } from "./_app";
import DropDownComponent from './components/DropDown'
import { useRouter } from "next/dist/client/router";
import CustomButton from "./components/customButton";
import CustomInput from "./components/customInput";
import toastError from '../lib/toastError'
import toastSuccess from '../lib/toastSuccess'
import Typewriter from 'typewriter-effect';
import Link from "next/link";
import Page from "./components/page";
import WalletConnectorContext from "./_app";



let checkifUsernameAvailable = async (username) => {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${username}`)
        response = await response.json()
        if (response.success) { // user with username found
            toastError("Username unavailable")
            return false
        }
        return true
    } catch (error) {
        console.log(error)
        toastError("Invalid Username")
        return false
    }
}



export default function App() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [promoCode, setPromoCode] = useState("");
    const { userAccount, setUserAccount } = useContext(UserContext);
    const { WalletConnectConnector } = useContext(WalletConnectorContext);

    const registerUsingPromoCode = async (e) => {
        try {

            if (!(await checkifUsernameAvailable(username))) {
                return
            }

            if (!userAccount.address) {
                // ask them to login either through solana or eth
                return toastError("Please login before registering using a promocode")
            }

            const requestObject = {
                username,
                promoCode,
                address: userAccount.address,
                blockchain: userAccount.blockchain
            }
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
            toastError("Something went wrong while registering. Please try again.", err.message)
        }

    }

    const registerUsingSolana = async (e) => {

        try {

            if (!(await checkifUsernameAvailable(username))) {
                return
            }


            const coinbaseResponse = await fetch("https://api.coinbase.com/v2/exchange-rates")
            const data = await coinbaseResponse.json()
            const solPerUSD = data.data.rates.SOL
            const SOLpayValue = solPerUSD * 5
            const hash = await transferSOL(SOLpayValue, "wFQcfUuXkyb7puHS7mSbrjETEhnBDCfdbnLLDftKNLg", setUserAccount, true);
            if (!hash) { return }

            const requestObject = {
                hash,
                username
            }
            const registrationResponse = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/register/sol`, requestObject)
            if (!registrationResponse.success) {
                toastError(registrationResponse.message)
            } else {
                toastSuccess(registrationResponse.message)
                setUserAccount({ address: registrationResponse.address, blockchain: "sol" })
            }

        } catch (err) {
            toastError("Something went wrong while registering. Please try again.", err.message)
        }


    }

    const registerUsingEthereum = async (e) => {
        try {
            // make get request to https://api.coinbase.com/v2/exchange-rates
            // get the USD value of ETH

            // check if username available
            if (!(await checkifUsernameAvailable(username))) {
                return
            }

            const coinbaseResponse = await fetch("https://api.coinbase.com/v2/exchange-rates")
            const data = await coinbaseResponse.json()
            const ethPerUSD = data.data.rates.ETH
            const ETHpayValue = ethPerUSD * 5

            const tx = await transferEth({
                ether: ETHpayValue.toString(),
                addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
            }, setUserAccount, true, WalletConnectConnector, userAccount)
            if (!tx) { return }

            const requestObject = {
                tx,
                username
            }
            const registrationResponse = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/register/eth`, requestObject)
            if (!registrationResponse.success) {
                toastError(registrationResponse.message)
            } else {
                toastSuccess(registrationResponse.message)
                setUserAccount({ address: registrationResponse.address, blockchain: "eth" })
            }

        } catch (err) {
            toastError("Something went wrong while registering. Please try again.", err.message)
        }
    }

    return (


        <Page>
            <div id="home" className="pt-20 flex flex-col justify-center items-center mb-40 sm:mb-48 md:mb-52">
                <div id="main_content" className="my-7">
                    <h1 style={{ maxWidth: "650px" }} className="font-extrabold tracking-tight text-gray-900 sm:text-center text-5xl text-center mx-4 leading-10 sm:leading-4rem"><span className="block"><span className="relative mt-2 text-transparent bg-clip-text bg-gradient-to-br from-brand-primary-dark to-brand-primary-light block">receive <Typewriter
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
                    <div style={{ maxWidth: "500px" }} className="text-center mx-16 mt-7 sm:mt-8 md:max-w-lg md:text-center sm:text-lg font-medium">Replace all your wallet addresses with a simple link! <span className=" text-transparent font-bold bg-clip-text bg-gradient-to-br from-brand-primary-dark to-brand-primary-light sm:inline-block">Get one for free</span> by <a href="https://twitter.com/intent/tweet?original_referer=https://polychain.tech/&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Eshare%7Ctwgr%5E&related=polychainhq&text=claiming%20my%20%40polychainhq%20link!&url=https%3A%2F%2Fpolychain.tech%2F" target="_blank" rel="noreferrer">tweeting</a> @polychainhq or buy for $5/yr</div>
                </div>
                <div id="username" className="flex flex-col justify-center items-center">
                    <div className="flex justify-center my-3">
                        <span className="border text-sm sm:text-base border-gray-300 shadow-sm border-r-0 rounded-l-md px-2 sm:px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-medium sm:font-semibold ">polychain.tech/</span>
                        <CustomInput value={username} onChange={(e) => { setUsername((e.target.value).replace(/[^a-zA-Z0-9]/g, "")) }} name="field_name" className="homepageInput rounded-l-none ml-0 mr-2 sm:mr-4 input-placeholder" type="text" placeholder="Enter Username" />
                        <div className="buyHomePage"><DropDownComponent primaryLabel="Buy" label1="Ethereum" label2="Solana" label1onClick={registerUsingEthereum} label2onClick={registerUsingSolana} /></div>
                    </div>
                    <div id="promo_code" className="flex flex-row justify-center my-2">
                        <CustomInput className="text-sm mx-0" value={promoCode} onChange={(e) => { setPromoCode((e.target.value).replace(/[^a-zA-Z0-9]/g, "")) }} type="text" placeholder="Enter Promo Code" />
                        <CustomButton className="text-xs sm:text-base py-1" onClick={registerUsingPromoCode}>Use Promo Code</CustomButton>
                    </div>

                </div>
            </div>

            <div className="px-8 mx-auto max-w-7xl lg:px-16 mb-40">
                <h2 className="text-center sm:text-left pt-4 text-xl font-bold sm:text-3xl" id="faq" >Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-16 font-medium">
                    <div>
                        <h5 className="mt-10 mb-3 font-semibold text-gray-900">What is Polychain?</h5>
                        <p>Polychain replaces your wallet addresses with a shareable link which you can use to receive payments, tips, etc. in several popular cryptocurrencies. Check <Link href="/shivam">polchain.tech/shivam</Link> for example!</p>
                        <h5 className="mt-10 mb-3 font-semibold text-gray-900">How can I access to it for free?</h5>
                        <p>Just tweet anything @polychainhq to receive a promocode which can be redeemed for 1 year access to your own polychain link!</p>

                        <h5 className="mt-10 mb-3 font-semibold text-gray-900">What is the pricing?</h5>
                        <p>
                            It costs $5/yr. For a limited time, you can get it for free by tweeting anything @polychainhq.
                        </p>
                    </div>
                    <div>
                        <h5 className="mt-10 mb-3 font-semibold text-gray-900">What does the future of Polychain look like?</h5>
                        <p>Apart from adding support for more cryptocurrencies, we hope to make personal token creation and airdrops easier. </p>
                        <h5 className="mt-10 mb-3 font-semibold text-gray-900">What cryptocurrencies are currently supported?</h5>
                        <p>
                            Bitcoin, Ethereum, Solana, and DeSo are currently supported. ERC20 tokens and other popular cryptocurrencies will also be added to the platform in the near future. If you have any recommendations, then drop us a message <a href="https://twitter.com/polychainhq" target="_blank" rel="noreferrer">@polychainhq</a> on twitter.
                        </p>
                        <h5 className="mt-10 mb-3 font-semibold text-gray-900">Have any other questions or suggestions?</h5>
                        <p>Feel free to drop us a message @polychainhq on twitter</p>

                    </div>
                </div>
            </div>

            <div className="grow"></div>



        </Page>

    );
}
