import { useState, useEffect, Fragment } from "react";
import generateQR from "../../lib/generateQR";
import transferSOL from "../../lib/transferSol";
import transferEth from "../../lib/transferEth";
import { useRouter } from 'next/router'
import CustomLabel from "../components/customLabel";
import CustomInput from "../components/customInput";
import CurrencySelector from "../components/currencySelector";
import CustomBrandedButton from "../components/customBrandedButton";
import CustomButton from '../components/customButton';
import Image from "next/image";
import Loading from "../components/Loading";
import Identicon from 'react-identicons';
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/outline'
import toastError from "../../lib/toastError";
import toastInfo from "../../lib/toastInfo";
import Page from "./Page";
import { ethers } from "ethers";
import * as web3 from '@solana/web3.js'

const COINBASE_URL_ETH = "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
const COINBASE_URL_SOL = "https://api.coinbase.com/v2/exchange-rates?currency=SOL"
const COINBASE_URL_BTC = "https://api.coinbase.com/v2/exchange-rates?currency=BTC"
const COINBASE_URL_DESO = "https://api.coinbase.com/v2/exchange-rates?currency=DESO"

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

const handleSubmitDESO = async (addr) => {
    try {
        window.open(`https://diamondapp.com/send-deso?public_key=${addr}`, "_blank");
    } catch (error) {
        toastError(error.message)
    }
}

export default function Gateway({ propUsername, address, blockchain, advertisement }) {

    const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrencies[0]);
    const [qrCode, setQrCode] = useState("")
    const [payValue, setPayValue] = useState("")
    const [USDPerCurrency, setUSDPerCurrency] = useState(0)
    const [ETHAddress, setETHAddress] = useState("");
    const [SOLAddress, setSOLAddress] = useState("");
    const [DESOAddress, setDESOAddress] = useState("");
    const [BTCAddress, setBTCAddress] = useState("");
    const [bio, setBio] = useState("")
    const [profilePic, setProfilePic] = useState("")
    const [currencies, setCurrencies] = useState([])
    const [loading, setLoading] = useState(true)
    const [displayedAddress, setDisplayedAddress] = useState("")
    const [fullName, setFullName] = useState("");
    const [qrVisible, setQrVisible] = useState(false);
    const [reload, setReload] = useState(false);
    const [username, setUsername] = useState(propUsername)

    if (blockchain == "SOL") {
        if (!validSolAddress(address)) {
            // TODO: create base page
            return (
                <Page>
                    <CustomLabel className="mt-4 self-center">Invalid Address</CustomLabel>
                </Page>)
        }
    }

    if (blockchain == "ETH") {
        if (!ethers.utils.isAddress(address)) {
            return (
                <Page>
                    <CustomLabel className="mt-4 self-center">Invalid Address</CustomLabel>
                </Page>
            )
        }
    }

    useEffect(() => {
        (async () => {
            try {
                const qrCode = await generateQR(`bitcoin:${BTCAddress}`)
                setQrCode(qrCode)
            } catch (e) {
                toastError("Something went wrong. Please try again")
            }
        })()
    }, [BTCAddress])

    useEffect(() => {
        // get currency deets from coinbase

        (async () => {
            try {
                if (selectedCurrency.name === "ETH") {
                    let coinbaseResponse = await fetch(COINBASE_URL_ETH)
                    coinbaseResponse = await coinbaseResponse.json()
                    const USDPerETH = coinbaseResponse.data.rates.USD
                    setUSDPerCurrency(USDPerETH)
                    setDisplayedAddress(ETHAddress)
                } else if (selectedCurrency.name === "SOL") {
                    let coinbaseResponse = await fetch(COINBASE_URL_SOL)
                    coinbaseResponse = await coinbaseResponse.json()
                    const USDPerETH = coinbaseResponse.data.rates.USD
                    setUSDPerCurrency(USDPerETH)
                    setDisplayedAddress(SOLAddress)
                } else if (selectedCurrency.name === "BTC") {
                    let coinbaseResponse = await fetch(COINBASE_URL_BTC)
                    coinbaseResponse = await coinbaseResponse.json()
                    const USDPerETH = coinbaseResponse.data.rates.USD
                    setUSDPerCurrency(USDPerETH)
                    setDisplayedAddress(BTCAddress)
                } else if (selectedCurrency.name === "DESO") {
                    let coinbaseResponse = await fetch(COINBASE_URL_DESO)
                    coinbaseResponse = await coinbaseResponse.json()
                    const USDPerETH = coinbaseResponse.data.rates.USD
                    setUSDPerCurrency(USDPerETH)
                    setDisplayedAddress(DESOAddress)
                }
            } catch (e) {
                toastInfo("Something went wrong fetching price information. However, you can still make transactions!")
            }
        })();

    }, [selectedCurrency])

    // ensures only available options are shown
    useEffect(() => {
        (async () => {
            try {
                if (address && !reload) {

                    if (blockchain == "ETH") {

                        (async () => {
                            let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/eth/${address}`);
                            response = await response.json();
                            if (response.user) {

                                setUsername(response.user.username)
                                let currencyArray = []

                                if (response.user.ETHAddress && response.user.ETHAddress != "") {
                                    setETHAddress(response.user.ETHAddress)
                                    currencyArray.push({
                                        id: 2,
                                        name: 'ETH',
                                        avatar: '/ethereumLogo.png',
                                    })

                                }
                                if (response.user.SOLAddress && response.user.SOLAddress != "") {
                                    setSOLAddress(response.user.SOLAddress)
                                    currencyArray.push(
                                        {
                                            id: 3,
                                            name: 'SOL',
                                            avatar: '/solanaLogo.png',
                                        })
                                }

                                if (response.user.DESOAddress && response.user.DESOAddress != "") {
                                    setDESOAddress(response.user.DESOAddress)
                                    currencyArray.push(
                                        {
                                            id: 4,
                                            name: 'DESO',
                                            avatar: '/DeSoLogo.png',
                                        })
                                }
                                if (response.user.BTCAddress && response.user.BTCAddress != "") {
                                    setBTCAddress(response.user.BTCAddress)
                                    currencyArray.push(
                                        {
                                            id: 1,
                                            name: 'BTC',
                                            avatar: '/bitcoinLogo.png',
                                        })
                                }
                                if (response.user.fullName && response.user.fullName != "") {
                                    setFullName(response.user.fullName)
                                }


                                setSelectedCurrency(currencyArray[0])
                                setCurrencies(currencyArray)
                                setBio(response.user.bio)
                                setProfilePic(response.user.profilePic)
                                setLoading(false)
                                return
                            }
                        })();


                        setCurrencies([{
                            id: 2,
                            name: 'ETH',
                            avatar: '/ethereumLogo.png',
                        }])
                        setSelectedCurrency({
                            id: 2,
                            name: 'ETH',
                            avatar: '/ethereumLogo.png',
                        })
                    } else if (blockchain == "SOL") {

                        (async () => {
                            let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/sol/${address}`);
                            response = await response.json();
                            if (response.user) {

                                setUsername(response.user.username)
                                let currencyArray = []

                                if (response.user.ETHAddress && response.user.ETHAddress != "") {
                                    setETHAddress(response.user.ETHAddress)
                                    currencyArray.push({
                                        id: 2,
                                        name: 'ETH',
                                        avatar: '/ethereumLogo.png',
                                    })

                                }
                                if (response.user.SOLAddress && response.user.SOLAddress != "") {
                                    setSOLAddress(response.user.SOLAddress)
                                    currencyArray.push(
                                        {
                                            id: 3,
                                            name: 'SOL',
                                            avatar: '/solanaLogo.png',
                                        })
                                }

                                if (response.user.DESOAddress && response.user.DESOAddress != "") {
                                    setDESOAddress(response.user.DESOAddress)
                                    currencyArray.push(
                                        {
                                            id: 4,
                                            name: 'DESO',
                                            avatar: '/DeSoLogo.png',
                                        })
                                }
                                if (response.user.BTCAddress && response.user.BTCAddress != "") {
                                    setBTCAddress(response.user.BTCAddress)
                                    currencyArray.push(
                                        {
                                            id: 1,
                                            name: 'BTC',
                                            avatar: '/bitcoinLogo.png',
                                        })
                                }
                                if (response.user.fullName && response.user.fullName != "") {
                                    setFullName(response.user.fullName)
                                }


                                setSelectedCurrency(currencyArray[0])
                                setCurrencies(currencyArray)
                                setBio(response.user.bio)
                                setProfilePic(response.user.profilePic)
                                setLoading(false)
                                return
                            }
                        })();

                        setCurrencies([{
                            id: 3,
                            name: 'SOL',
                            avatar: '/solanaLogo.png',
                        }])
                        setSelectedCurrency({
                            id: 3,
                            name: 'SOL',
                            avatar: '/solanaLogo.png',
                        })
                    }
                    setLoading(false)
                    return
                }
                setLoading(true)
                let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${username}`)
                response = await response.json()
                if (response.success) {
                    let currencyArray = []

                    if (response.user.ETHAddress && response.user.ETHAddress != "") {
                        setETHAddress(response.user.ETHAddress)
                        currencyArray.push({
                            id: 2,
                            name: 'ETH',
                            avatar: '/ethereumLogo.png',
                        })

                    }
                    if (response.user.SOLAddress && response.user.SOLAddress != "") {
                        setSOLAddress(response.user.SOLAddress)
                        currencyArray.push(
                            {
                                id: 3,
                                name: 'SOL',
                                avatar: '/solanaLogo.png',
                            })
                    }

                    if (response.user.DESOAddress && response.user.DESOAddress != "") {
                        setDESOAddress(response.user.DESOAddress)
                        currencyArray.push(
                            {
                                id: 4,
                                name: 'DESO',
                                avatar: '/DeSoLogo.png',
                            })
                    }
                    if (response.user.BTCAddress && response.user.BTCAddress != "") {
                        setBTCAddress(response.user.BTCAddress)
                        currencyArray.push(
                            {
                                id: 1,
                                name: 'BTC',
                                avatar: '/bitcoinLogo.png',
                            })
                    }
                    if (response.user.fullName && response.user.fullName != "") {
                        setFullName(response.user.fullName)
                    }


                    setSelectedCurrency(currencyArray[0])
                    setCurrencies(currencyArray)
                    setBio(response.user.bio)
                    setProfilePic(response.user.profilePic)
                }
                setLoading(false)
            } catch (e) {
                setLoading(false)
                toastError("Something went wrong. Please try again")
            }
        })()
    }, [])

    const transferAmount = async () => {
        try {
            if (selectedCurrency.name == "ETH") {
                await transferEth({ ether: payValue, addr: ETHAddress })
            } else if (selectedCurrency.name == "SOL") {
                await transferSOL(payValue, SOLAddress)
            } else if (selectedCurrency.name == "DESO") {
                await handleSubmitDESO(DESOAddress)
            } else if (selectedCurrency.name == "BTC") {
                // nothing
                window.open(`bitcoin:${BTCAddress}?amount=${payValue}`, "_blank");
                toastInfo("You need to have a bitcoin wallet installed in order to transfer bitcoin. Alternatively, you can scan the QR code to send BTC")
            }
        } catch (e) {
            toastError("Something went wrong. Please try again")
        }
    }

    const showQR = () => {
        setQrVisible(true);
    }

    const hideQR = () => {
        setQrVisible(false);
    }

    function redirectToProfile() {
        if (username) {
            return window.open(`https://polychain.tech/${username}`, "_blank");
        } else {
            if (blockchain == "ETH") {
                return window.open(`https://polychain.tech/eth/${address}`, "_blank")
            } else if (blockchain == "SOL") {
                return window.open(`https://polychain.tech/sol/${address}`, "_blank")
            }
        }
    }


    return (
        <>
            {loading ? <Loading /> : <div id="card" className="w-screen flex flex-col  rounded-xl border border-gray-300 shadow-sm p-6 pt-6 sm:p-6 bg-white">
                {/* {advertisement ? <img className="self-center mb-8" src="/croppedPolychainLogo.png" width="150"></img> : ""} */}
                <div id="profile_header mt-6" className="flex flex-row items-start">
                    {profilePic ?
                        <Image width="60" className="rounded-full object-cover" height="60" src={profilePic}></Image> : <Identicon className="rounded-full object-cover mr-1" string={ETHAddress ? ETHAddress : SOLAddress ? SOLAddress : address} size={50} />}
                    <div className="flex flex-col ml-2">
                        {fullName ? <CustomLabel className="px-0">{fullName}</CustomLabel> : username ? <CustomLabel className="px-0">{username}</CustomLabel> : <CustomLabel className="px-0 sm-address-overflow">{address}</CustomLabel>}
                        <CustomLabel style={{ fontWeight: "500", maxWidth: "300px" }} className="px-0">{bio ? bio : "Welcome to my Polychain Page!"}</CustomLabel>
                    </div>
                    <div className="flex-1" id="spacer"></div>
                    <div className="cursor-pointer" onClick={redirectToProfile}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg></div>
                </div>


                <div onClick={() => { toastInfo("Address Copied!"); displayedAddress ? navigator.clipboard.writeText(displayedAddress) : navigator.clipboard.writeText(address) }} className=" flex flex-row justify-between mt-6 mb-1 items-center">
                    <CustomLabel style={{ fontSize: "0.875rem" }} className="address-overflow p-0 font-semibold cursor-pointer text-sm text-gray-400">{displayedAddress ? displayedAddress : address}</CustomLabel>
                    <img style={{ height: "16px", width: "16px", cursor: "pointer" }} className="mr-2 sm:mr-4" src="/images/clipboard.png"></img>
                </div>
                <div className="flex flex-row justify-center mb-6">
                    {/* <span className="border border-gray-300 shadow-sm border-r-0 rounded-l-md px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-semibold">localhost:3000/</span> */}
                    <div className="flex flex-col">
                        <CustomInput inputMode="decimal" placeholder="Amount" value={payValue} onChange={(e) => { setPayValue(e.target.value) }} name="field_name" className="px-1 sm:px-2 ml-0 mr-1.5 sm:mr-4 input-placeholder py-3" type="text" />
                        <CustomLabel className="text-gray-500 sm:text-normal mx-0 px-0 mt-1">USD {parseFloat((USDPerCurrency * payValue)).toFixed(3)}</CustomLabel>
                    </div>

                    <div className="flex flex-col">
                        <CurrencySelector currencies={currencies.length == 0 ? defaultCurrencies : currencies} selected={selectedCurrency} setSelected={setSelectedCurrency}></CurrencySelector>
                        <CustomLabel className="text-gray-500 text-normal px-0 mt-1"> 1 {selectedCurrency.name} = USD {parseFloat(USDPerCurrency).toFixed(3)}</CustomLabel>
                    </div>

                </div>

                <Transition.Root show={qrVisible} as={Fragment}>
                    <Dialog as="div" static className="fixed z-10 inset-0 overflow-y-auto" open={qrVisible} onClose={hideQR}>
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                            </Transition.Child>

                            {/* This element is to trick the browser into centering the modal contents. */}
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                                &#8203;
                            </span>
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <div className="inline-block align-bottom transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                                    {selectedCurrency.name == "BTC" ? <img className="mx-0" src={qrCode}></img> : ""}
                                </div>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition.Root>
                {selectedCurrency.name == "BTC" ? <div className="flex justify-items-between">
                    <CustomBrandedButton onClick={transferAmount} className="mb-6 flex-1">Pay</CustomBrandedButton>
                    <CustomButton onClick={showQR} className="mb-6 flex-1">Show QR</CustomButton>

                </div> : <CustomBrandedButton onClick={transferAmount} className="mb-6 ">Pay</CustomBrandedButton>}

                {/* <CustomBrandedButton onClick={() => { router.push("/") }} className="opacity-60 px-4 rounded-2xl self-center">Get your own Polychain Page!</CustomBrandedButton> */}
            </div>}
        </>
    )
}