import React from "react";
import { useRouter } from "next/router";
import * as web3 from '@solana/web3.js'
import CustomLabel from "../components/customLabel";
import CustomInput from "../components/customInput";
import CustomBrandedButton from "../components/customBrandedButton";
import CurrencySelector from "../components/currencySelector";
import { ToastContainer } from "react-toastify";
import toastSuccess from "../../lib/toastSuccess";
import toastError from "../../lib/toastError";
import { useState, useEffect } from "react";
import transferSOL from "../../lib/transferSol";
import Loading from "../components/Loading";

const COINBASE_URL_SOL = "https://api.coinbase.com/v2/exchange-rates?currency=SOL"

function validSolAddress(s) {
    try {
        return new web3.PublicKey(s);
    } catch (e) {
        return null;
    }
}

let defaultCurrencies = [
    {
        id: 0,
        name: 'Loading',
        avatar: '/bitcoinLogo.png',
    }
]


let currencies = [
    {
        id: 1,
        name: 'SOL',
        avatar: '/solanaLogo.png',
    }
]

export default function SOLGateway() {
    const router = useRouter()
    const { address } = router.query
    const [payValue, setPayValue] = useState("")
    const [USDPerCurrency, setUSDPerCurrency] = useState()
    const [loading, setLoading] = useState(true)
    console.log("rerendering")

    useEffect(() => {
        try {
            (async () => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/sol/${address}`);
                let data = await response.json();
                if (data.user) {
                    router.push(`/${data.user.username}`)
                }
            })();

            (async () => {
                try {
                    let coinbaseResponse = await fetch(COINBASE_URL_SOL)
                    coinbaseResponse = await coinbaseResponse.json()
                    const USDPerSOL = coinbaseResponse.data.rates.USD
                    setUSDPerCurrency(USDPerSOL)
                    setLoading(false)
                } catch (e) {
                    toastInfo("Something went wrong fetching price information. However, you can still make transactions!")
                }
            })();
        } catch (e) {
            toastError(e.message);
        }
    }, [address])

    if (!ethers.utils.isAddress(address)) {
        // TODO: create base page
        return <div>Invalid address</div>
    }

    const transferAmount = async () => {
        try {
            await transferSOL(payValue, address)
        } catch (e) {
            toastError("Something went wrong. Please try again")
        }
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className="flex flex-col items-center justify-center mx-4">
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                style={{ maxWidth: "70%", left: "50%", transform: "translate(-50%, 0%)" }}
            />
            <div onClick={() => { router.push("/") }} className="my-10 cursor-pointer">
                <img src="/croppedPolychainLogo.png" width="200"></img>
            </div>
            <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm p-3 pt-6 sm:p-6 bg-white">
                <div id="profile_header mt-6" className="flex flex-row items-start">

                    {/* <Image width="60" className="rounded-full object-cover" height="60" src={profilePic}></Image> */}
                    <div className="flex flex-row items-center justify-center mb-5 ml-2 cursor-pointer" onClick={() => { toastSuccess("Address copied!"); navigator.clipboard.writeText(address) }}>
                        <CustomLabel className="px-0">{address}</CustomLabel>
                        <img style={{ height: "16px", width: "16px", cursor: "pointer" }} className="mr-2 sm:mr-4" src="/images/clipboard.png"></img>
                        {/* <CustomLabel style={{ fontWeight: "500", maxWidth: "300px" }} className="px-0"></CustomLabel> */}
                    </div>
                </div>

                {/* <div onClick={() => { toastSuccess("Address copied!"); navigator.clipboard.writeText(address) }} className=" flex flex-row justify-between mt-6 mb-1 items-center">
                    <CustomLabel style={{ fontSize: "0.875rem" }} className="address-overflow p-0 font-semibold cursor-pointer text-sm text-gray-400">{address}</CustomLabel>
                    <img style={{ height: "16px", width: "16px", cursor: "pointer" }} className="mr-2 sm:mr-4" src="/images/clipboard.png"></img>
                </div> */}
                <div className="flex flex-row justify-center mb-6">
                    {/* <span className="border border-gray-300 shadow-sm border-r-0 rounded-l-md px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-semibold">localhost:3000/</span> */}
                    <div className="flex flex-col">
                        <CustomInput inputMode="decimal" placeholder="Amount" value={payValue} onChange={(e) => { setPayValue(e.target.value) }} name="field_name" className="px-1 sm:px-2 ml-0 mr-1.5 sm:mr-4 input-placeholder py-3" type="text" />
                        <CustomLabel className="text-gray-500 sm:text-normal mx-0 px-0 mt-1">USD {parseFloat((USDPerCurrency * payValue)).toFixed(3)}</CustomLabel>
                    </div>

                    <div className="flex flex-col">
                        <CurrencySelector currencies={currencies.length == 0 ? defaultCurrencies : currencies} selected={currencies[0]}></CurrencySelector>
                        <CustomLabel className="text-gray-500 text-normal px-0 mt-1"> 1 {currencies[0].name} = USD {parseFloat(USDPerCurrency).toFixed(3)}</CustomLabel>
                    </div>

                </div>
                <CustomBrandedButton onClick={transferAmount} className="mb-6 ">Pay</CustomBrandedButton>

            </div>
            <CustomBrandedButton onClick={() => { router.push("/") }} className="my-10 text-xl p-4 opacity-80 rounded-2xl">Get your own!</CustomBrandedButton>
        </div>
    )
}