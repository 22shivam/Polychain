import { useState, useEffect } from "react";
import generateQR from "../../lib/generateQR";
import transferSOL from "../../lib/transferSol";
import transferEth from "../../lib/transferEth";
import { useRouter } from 'next/router'
import CustomLabel from "../components/customLabel";
import CustomInput from "../components/customInput";
import CurrencySelector from "../components/currencySelector";
import CustomBrandedButton from "../components/customBrandedButton";
import Image from "next/image";
import Loading from "../components/Loading";
import Identicon from 'react-identicons';

const COINBASE_URL_ETH = "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
const COINBASE_URL_SOL = "https://api.coinbase.com/v2/exchange-rates?currency=SOL"
const COINBASE_URL_BTC = "https://api.coinbase.com/v2/exchange-rates?currency=BTC"
const COINBASE_URL_DESO = "https://api.coinbase.com/v2/exchange-rates?currency=DESO"



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

    }
}

export default function Gateway({ username }) {

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



    useEffect(() => {
        (async () => {
            try {
                const qrCode = await generateQR(`bitcoin:${BTCAddress}`)
                setQrCode(qrCode)
            } catch (e) {
                // toastError("Something went wrong. Please try again")
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
                // toastInfo("Something went wrong fetching price information. However, you can still make transactions!")
            }
        })();

    }, [selectedCurrency])

    // ensures only available options are shown
    useEffect(() => {
        (async () => {
            try {
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
                // toastError("Something went wrong. Please try again")
            }
        })()
    }, [username])

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
                // toastInfo("You need to have a bitcoin wallet installed in order to transfer bitcoin. Alternatively, you can scan the QR code to send BTC")
            }
        } catch (e) {
            // toastError("Something went wrong. Please try again")
        }
    }


    return (

        <div className="flex flex-col items-center justify-center mx-4">
            {loading ? <Loading /> : <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm p-3 pt-6 sm:p-6 bg-white">
                <div id="profile_header mt-6" className="flex flex-row items-start">
                    {profilePic ?
                        <Image width="60" className="rounded-full object-cover" height="60" src={profilePic}></Image> : <Identicon className="rounded-full object-cover mr-1" string={ETHAddress ? ETHAddress : SOLAddress} size={50} />}
                    <div className="flex flex-col ml-2">
                        {fullName ? <CustomLabel className="px-0">{fullName}</CustomLabel> : <CustomLabel className="px-0">{username}</CustomLabel>}
                        <CustomLabel style={{ fontWeight: "500", maxWidth: "300px" }} className="px-0">{bio ? bio : "Welcome to my Polychain Page!"}</CustomLabel>
                    </div>
                </div>


                <div onClick={() => { navigator.clipboard.writeText(displayedAddress) }} className=" flex flex-row justify-between mt-6 mb-1 items-center">
                    <CustomLabel style={{ fontSize: "0.875rem" }} className="address-overflow p-0 font-semibold cursor-pointer text-sm text-gray-400">{displayedAddress}</CustomLabel>
                    <img style={{ height: "16px", width: "16px", cursor: "pointer" }} className="mr-2 sm:mr-4" src="/images/clipboard.png"></img>
                </div>
                <div className="flex flex-row justify-center mb-6">
                    {/* <span className="border border-gray-300 shadow-sm border-r-0 rounded-l-md px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-semibold">localhost:3000/</span> */}
                    <div className="flex flex-col">
                        <CustomInput inputMode="decimal" placeholder="Amount" value={payValue} onChange={(e) => { setPayValue(e.target.value) }} name="field_name" className="px-1 sm:px-2 ml-0 mr-1.5 sm:mr-4 input-placeholder py-3" type="text" />
                        <CustomLabel className="text-gray-500 sm:text-normal mx-0 px-0">USD {parseFloat((USDPerCurrency * payValue)).toFixed(3)}</CustomLabel>
                    </div>

                    <div className="flex flex-col">
                        <CurrencySelector currencies={currencies.length == 0 ? defaultCurrencies : currencies} selected={selectedCurrency} setSelected={setSelectedCurrency}></CurrencySelector>
                        <CustomLabel className="text-gray-500 text-normal px-0"> 1 {selectedCurrency.name} = USD {parseFloat(USDPerCurrency).toFixed(3)}</CustomLabel>
                    </div>

                </div>

                {selectedCurrency.name == "BTC" ? <img className="-mt-6" src={qrCode}></img> : ""}
                <CustomBrandedButton onClick={transferAmount} className="mb-6 ">Pay</CustomBrandedButton>

            </div>}
        </div>

    )
}