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
    try {
        window.open(`https://diamondapp.com/send-deso?public_key=${addr}`, "_blank");
    } catch (error) {
        toastError("Something went wrong. Please try again")
    }
}

export default function UserPayment() {

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
    const [displayedAddress, setDisplayedAddress] = useState("")
    const [twitterUrl, setTwitterUrl] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [facebookUrl, setFacebookUrl] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [tiktokUrl, setTiktokUrl] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [pinterestUrl, setPinterestUrl] = useState("");
    const [redditUrl, setRedditUrl] = useState("");
    const [snapchatUrl, setSnapchatUrl] = useState("");
    const [fullName, setFullName] = useState("");
    const [anySocialUrl, setAnySocialUrl] = useState(false);


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
                    if (response.user.twitterUsername && response.user.twitterUsername != "") {
                        setTwitterUrl("https://twitter.com/" + response.user.twitterUsername)
                        setAnySocialUrl(true)
                    }
                    if (response.user.instagramUsername && response.user.instagramUsername != "") {
                        setInstagramUrl("https://instagram.com/" + response.user.instagramUsername)
                        setAnySocialUrl(true)
                    }
                    if (response.user.githubUsername && response.user.githubUsername != "") {
                        setGithubUrl("https://github.com/" + response.user.githubUsername)
                        setAnySocialUrl(true)
                    }
                    if (response.user.facebookUsername && response.user.facebookUsername != "") {
                        setFacebookUrl("https://facebook.com/" + response.user.facebookUsername)
                        setAnySocialUrl(true)
                    }
                    if (response.user.youtubeUsername && response.user.youtubeUsername != "") {
                        setYoutubeUrl("https://youtube.com/" + response.user.youtubeUsername)
                        setAnySocialUrl(true)
                    }
                    if (response.user.linkedinUsername && response.user.linkedinUsername != "") {
                        setLinkedinUrl("https://linkedin.com/in/" + response.user.linkedinUsername)
                        setAnySocialUrl(true)
                    }
                    if (response.user.pinterestUsername && response.user.pinterestUsername != "") {
                        setPinterestUrl("https://pinterest.com/" + response.user.pinterestUsername)
                        setAnySocialUrl(true)
                    }
                    if (response.user.redditUsername && response.user.redditUsername != "") {
                        setRedditUrl("https://reddit.com/u/" + response.user.redditUsername)
                        setAnySocialUrl(true)
                    }
                    if (response.user.snapchatUsername && response.user.snapchatUsername != "") {
                        setSnapchatUrl("https://snapchat.com/add/" + response.user.snapchatUsername)
                        setAnySocialUrl(true)
                    }
                    if (response.user.tiktokUsername && response.user.tiktokUsername != "") {
                        setTiktokUrl("https://tiktok.com/@" + response.user.tiktokUsername)
                        setAnySocialUrl(true)
                    }

                    setSelectedCurrency(currencyArray[0])
                    setCurrencies(currencyArray)
                    setBio(response.user.bio)
                    setProfilePic(response.user.profilePic)
                    setAccountExists(true)
                }
                setLoading(false)
            } catch (e) {
                setLoading(false)
                toastError("Something went wrong. Please try again")
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
                toastInfo("You need to have a bitcoin wallet installed in order to transfer bitcoin. Alternatively, you can scan the QR code to send BTC")
            }
        } catch (e) {
            toastError("Something went wrong. Please try again")
        }
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
            <div onClick={() => { router.push("/", "_self") }} className="my-10 cursor-pointer">
                <img src="croppedPolychainLogo.png" width="200"></img>
            </div>
            {loading ? <div type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-lg transition ease-in-out duration-150 cursor-not-allowed" disabled="">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
            </div> : accountExists ? <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm p-3 pt-6 sm:p-6 bg-white">
                <div id="profile_header mt-6" className="flex flex-row items-start">
                    {profilePic ?
                        <Image width="60" className="rounded-full object-cover" height="60" src={profilePic}></Image> : ""}
                    <div className="flex flex-col ml-2">
                        {fullName ? <CustomLabel className="px-0">{fullName}</CustomLabel> : <CustomLabel className="px-0">{username}</CustomLabel>}
                        <CustomLabel style={{ fontWeight: "500", maxWidth: "300px" }} className="px-0">{bio}</CustomLabel>
                    </div>
                </div>

                {anySocialUrl ? <div className="flex flex-row justify-center mt-4 items-center">
                    {facebookUrl ? <a href={facebookUrl} target="_blank" rel="noopener noreferrer"><Image src="/facebook.png" width="30" height="30"></Image></a> : ""}
                    {instagramUrl ? <a href={instagramUrl} target="_blank" rel="noopener noreferrer"><Image src="/instagram.png" width="30" height="30"></Image></a> : ""}
                    {githubUrl ? <a href={githubUrl} target="_blank" rel="noopener noreferrer"><Image src="/github.png" width="30" height="30"></Image></a> : ""}
                    {linkedinUrl ? <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"><Image src="/linkedin.png" width="30" height="30"></Image></a> : ""}
                    {redditUrl ? <a href={redditUrl} target="_blank" rel="noopener noreferrer"><Image src="/reddit.png" width="30" height="30"></Image></a> : ""}
                    {snapchatUrl ? <a href={snapchatUrl} target="_blank" rel="noopener noreferrer"><Image src="/snapchat.png" width="30" height="30"></Image></a> : ""}
                    {tiktokUrl ? <a href={tiktokUrl} target="_blank" rel="noopener noreferrer"><Image src="/tiktok.png" width="30" height="30"></Image></a> : ""}
                    {pinterestUrl ? <a href={pinterestUrl} target="_blank" rel="noopener noreferrer"><Image src="/pinterest.png" width="30" height="30"></Image></a> : ""}
                    {twitterUrl ? <a href={twitterUrl} target="_blank" rel="noopener noreferrer"><Image src="/twitter.png" width="30" height="30"></Image></a> : ""}
                    {youtubeUrl ? <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"><Image src="/youtube.png" width="30" height="30"></Image></a> : ""}
                </div> : ""}

                <div className="flex flex-row justify-between mt-6 mb-1 items-center">
                    <CustomLabel style={{ fontSize: "0.875rem" }} className="address-overflow p-0 font-semibold text-sm text-gray-400">{displayedAddress}</CustomLabel>
                    <img onClick={() => { toastSuccess("Address copied!"); navigator.clipboard.writeText(displayedAddress) }} style={{ height: "16px", width: "16px", cursor: "pointer" }} className="mr-2 sm:mr-4" src="/images/clipboard.png"></img>
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

            </div> : <CustomLabel className="text-lg">No account with this username exists. <Link className="" href="/">Buy</Link> this username</CustomLabel>}
            <CustomBrandedButton onClick={() => { router.push("/") }} className="my-10 opacity-60 rounded-2xl">Get your own!</CustomBrandedButton>
            <div id="spacer" className="grow"></div>
        </div>

    )
}