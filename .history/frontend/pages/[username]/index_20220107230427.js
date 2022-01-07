import { useState, useEffect, useContext } from "react";
import TOKEN_ABI from "../../lib/TOKEN_ABI";
import generateQR from "../../lib/generateQR";
import transferERC20 from "../../lib/transferERC20";
import transferSOL from "../../lib/transferSol";
import transferEth from "../../lib/transferEth";
import { useRouter } from 'next/router'
import CustomLabel from "../components/customLabel";
import CustomInput from "../components/customInput";
import CurrencySelector from "../components/currencySelector";
import CustomButton from "../components/customButton";
import toastError from "../../lib/toastError";
import toastInfo from "../../lib/toastInfo";
import toastSuccess from "../../lib/toastSuccess";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import CustomBrandedButton from "../components/customBrandedButton";
import Image from "next/image";

const COINBASE_URL_ETH = "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
const COINBASE_URL_SOL = "https://api.coinbase.com/v2/exchange-rates?currency=SOL"
const COINBASE_URL_BTC = "https://api.coinbase.com/v2/exchange-rates?currency=BTC"
const COINBASE_URL_DESO = "https://api.coinbase.com/v2/exchange-rates?currency=DESO"


const TOKEN_ADDRESS = "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa";

let defaultCurrencies = [
    {
        id: 0,
        name: 'Loading',
        avatar: '/bitcoinLogo.png',
    }
]

const handleSubmitDESO = async (addr) => {
    window.open(`https://diamondapp.com/send-deso?public_key=${addr}`, "_blank");
}

export default function UserPayment() {

    console.log("rerendering")
    const router = useRouter()
    const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrencies[0]);
    const { username } = router.query
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
    const [accountExists, setAccountExists] = useState(false)

    useEffect(() => {
        (async () => {
            const qrCode = await generateQR(`bitcoin:${BTCAddress}`)
            setQrCode(qrCode)
        })()
    }, [BTCAddress])

    useEffect(() => {
        // get currency deets from coinbase

        (async () => {
            if (selectedCurrency.name === "ETH") {
                let coinbaseResponse = await fetch(COINBASE_URL_ETH)
                coinbaseResponse = await coinbaseResponse.json()
                console.log(coinbaseResponse)
                const USDPerETH = coinbaseResponse.data.rates.USD
                console.log(USDPerETH)
                setUSDPerCurrency(USDPerETH)
            } else if (selectedCurrency.name === "SOL") {
                let coinbaseResponse = await fetch(COINBASE_URL_SOL)
                coinbaseResponse = await coinbaseResponse.json()
                const USDPerETH = coinbaseResponse.data.rates.USD
                console.log(USDPerETH)
                setUSDPerCurrency(USDPerETH)
            } else if (selectedCurrency.name === "BTC") {
                let coinbaseResponse = await fetch(COINBASE_URL_BTC)
                coinbaseResponse = await coinbaseResponse.json()
                const USDPerETH = coinbaseResponse.data.rates.USD
                console.log(USDPerETH)
                setUSDPerCurrency(USDPerETH)
            } else if (selectedCurrency.name === "DESO") {
                let coinbaseResponse = await fetch(COINBASE_URL_DESO)
                coinbaseResponse = await coinbaseResponse.json()
                const USDPerETH = coinbaseResponse.data.rates.USD
                console.log(USDPerETH)
                setUSDPerCurrency(USDPerETH)
            }
        })();

    }, [selectedCurrency])

    // ensures only available options are shown
    useEffect(() => {
        // console.log("fetching username details")
        (async () => {
            setLoading(true)
            let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${username}`)
            response = await response.json()
            if (response.success) {
                let currencyArray = []

                if (response.user.ETHAddress && response.user.ETHAddress != "") {
                    console.log("user:", response.user.ETHAddress)
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
                setSelectedCurrency(currencyArray[0])
                setCurrencies(currencyArray)
                setBio(response.user.bio)
                setProfilePic(response.user.profilePic)
                setAccountExists(true)
            }
            setLoading(false)
        })()
    }, [username])

    const transferAmount = async () => {
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

    }


    return (

        <div className="flex flex-col items-center justify-center">
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
            <div onClick={() => { router.push("http://localhost:3000/", "_self") }} className="my-10 cursor-pointer">
                <img src="croppedPolychainLogo.png" width="200"></img>
            </div>
            {loading ? <div type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-lg transition ease-in-out duration-150 cursor-not-allowed" disabled="">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
            </div> : accountExists ? <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm p-6 bg-white">
                <div id="profile_header mt-6" className="flex flex-row">
                    {profilePic ?
                        <Image width="60" className="rounded-full object-cover" height="60" src={profilePic}></Image> : ""}
                    <div className="flex flex-col">
                        <CustomLabel className="px-0">{username}</CustomLabel>
                        <CustomLabel style={{ fontWeight: "500", maxWidth: "300px" }} className="px-0">{bio}</CustomLabel>
                    </div>
                </div>
                <div className="flex justify-center my-6">
                    {/* <span className="border border-gray-300 shadow-sm border-r-0 rounded-l-md px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-semibold">localhost:3000/</span> */}
                    <div className="flex flex-col">
                        <CustomInput inputMode="decimal" placeholder="Amount" value={payValue} onChange={(e) => { setPayValue(e.target.value) }} name="field_name" className="ml-0 input-placeholder py-3" type="text" />
                        <CustomLabel className="text-gray-500 text-normal mx-0 px-0">USD {parseFloat((USDPerCurrency * payValue)).toFixed(3)}</CustomLabel>
                    </div>

                    <div className="flex flex-col">
                        <CurrencySelector currencies={currencies.length == 0 ? defaultCurrencies : currencies} selected={selectedCurrency} setSelected={setSelectedCurrency}></CurrencySelector>
                        <CustomLabel className="text-gray-500 text-normal px-0"> 1 {selectedCurrency.name} = USD {parseFloat(USDPerCurrency).toFixed(3)}</CustomLabel>
                    </div>

                </div>
                {selectedCurrency.name == "BTC" ? <img className="-mt-6" src={qrCode}></img> : ""}
                <CustomBrandedButton onClick={transferAmount} className="mb-6 ">Pay</CustomBrandedButton>

            </div> : <CustomLabel className="text-lg">No account with this username exists. <Link className="" href="http://localhost:3000/">Buy</Link> this username</CustomLabel>}
            <CustomBrandedButton onClick={() => { router.push("http://localhost:3000/") }} className="my-10 opacity-60 rounded-2xl">Get your own!</CustomBrandedButton>
            <div id="spacer" className="grow"></div>
        </div>

    )
}