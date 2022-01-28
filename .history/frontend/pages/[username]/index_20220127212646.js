import { useState, useEffect, useContext } from "react";
import generateQR from "../../lib/generateQR";
import transferSOL from "../../lib/transferSol";
import transferEth from "../../lib/transferEth";
import { useRouter } from 'next/router'
import CustomLabel from "../components/customLabel";
import CustomInput from "../components/customInput";
import CurrencySelector from "../components/currencySelector";
import toastError from "../../lib/toastError";
import toastInfo from "../../lib/toastInfo";
import toastSuccess from "../../lib/toastSuccess";
import Link from "next/link";
import CustomBrandedButton from "../components/customBrandedButton";
import Image from "next/image";
import Head from "next/head";
import Loading from "../components/Loading";
import Identicon from 'react-identicons';
import { WalletConnectorContext } from "../_app";
import { UserContext } from "../_app";
import Page from "./../components/Page";
import ensureEthereumMainnet from "../../lib/ensureEthereumMainnet";
import ensureMaticMainnet from "../../lib/ensureMaticMainnet";
import CustomButton from "../components/customButton";
import Moralis from 'react-moralis'
import { useMoralisWeb3Api } from 'react-moralis'

function fixUrl(url) {
    try {
        if (url.startsWith("ipfs")) {
            return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://")[1]
        } else {
            return url + "?format=JSON"
        }
    }
    catch (error) {
        return ""
    }
}

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

const MORALIS_ETH_NFT_URL = "https://deep-index.moralis.io/api/v2"

export default function UserPayment() {
    const { Web3API } = useMoralisWeb3Api()
    const { WalletConnectConnector, setWalletConnectConnector } = useContext(WalletConnectorContext);
    const { userAccount, setUserAccount } = useContext(UserContext);
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
    const [links, setLinks] = useState([]);
    const [active, setActive] = useState(1);
    const [ethNFTs, setEthNFTs] = useState([]);
    // const [polygonNFTs, setPolygonNFTs] = useState([]);

    useEffect(() => {
        // if (!ETHAddress) {
        //     return
        // }
        // console.log("hello")
        // try {

        //     const fetchEthNFTs = async () => {
        //         const options = { chain: 'eth', address: ETHAddress };
        //         const ethNFTs = await Web3API.account.getNFTs(options);
        //         console.log(ethNFTs)
        //         let ethNFTArray = []

        //         // const data = await response.json()
        //         for (let i = 0; i < ethNFTs.result.length; i++) {
        //             try {
        //                 const url = fixUrl(ethNFTs.result[i].token_uri)
        //                 if (url == "") {
        //                     continue
        //                 }
        //                 let response = await fetch(url)
        //                 let data = await response.json()

        //                 if (data.image) {
        //                     ethNFTArray.push(data.image)
        //                 } else if (data.image_url) {
        //                     ethNFTArray.push(data.image_url)
        //                 }

        //             } catch (e) {
        //                 console.log(e)
        //             }

        //         }

        //         setEthNFTs(ethNFTArray)
        //     }



        //     fetchEthNFTs()

        // } catch (error) {
        //     console.log(error)
        // }

        if (!ETHAddress) {
            return
        }
        async function fetchEthNFTs() {
            try {
                let response = await fetch(`https://api.nftport.xyz/v0/accounts/${ETHAddress}?chain=ethereum`, {
                    headers: {
                        "Authorization": "c4688209-7089-4421-add7-e2904a27de41",
                        "Content-Type": "application/json"
                    }
                })
                let data = await response.json()
                console.log(data)
                let ethNFTArray = []
                for (let i = 0; i < data.nfts.length; i++) {
                    ethNFTArray.push({ url: data.nfts[i].file_url, name: data.nfts[i].name, contractAddress: data.nfts[i].contract_address, tokenId: data.nfts[i].token_id })
                }
                ethNFTArray = ethNFTArray.filter((c, index) => {
                    return ethNFTArray.indexOf(c) === index && c.url !== "";
                });
                setEthNFTs(ethNFTArray)
            } catch (e) {
                console.log(e)

            }
        }

        // async function fetchPolygonNFTs() {
        //     try {
        //         let response = await fetch(`https://api.nftport.xyz/v0/accounts/${ETHAddress}?chain=polygon`, {
        //             headers: {
        //                 "Authorization": "c4688209-7089-4421-add7-e2904a27de41",
        //                 "Content-Type": "application/json"
        //             }
        //         })
        //         let data = await response.json()
        //         console.log(data)
        //         let polygonNFTArray = []
        //         for (let i = 0; i < data.nfts.length; i++) {
        //             polygonNFTArray.push(data.nfts[i].file_url)
        //         }
        //         setPolygonNFTs(polygonNFTArray)
        //     } catch (e) {
        //         console.log(e)

        //     }
        // }

        fetchEthNFTs()
        // fetchPolygonNFTs()

    }, [ETHAddress])

    console.log(ethNFTs)


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
                        currencyArray.push({
                            id: 5,
                            name: 'MATIC',
                            avatar: '/maticLogo.png',
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

                    if (response.user.links && response.user.links.length > 0) {
                        setLinks(response.user.links)
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
                if (!await ensureEthereumMainnet(userAccount, ethereum, WalletConnectConnector)) {
                    return
                }
                await transferEth({ ether: payValue, addr: ETHAddress }, setUserAccount, false, WalletConnectConnector, userAccount)
            } else if (selectedCurrency.name == "SOL") {
                await transferSOL(payValue, SOLAddress, setUserAccount, false, userAccount)
            } else if (selectedCurrency.name == "DESO") {
                await handleSubmitDESO(DESOAddress)
            } else if (selectedCurrency.name == "BTC") {
                // nothing
                window.open(`bitcoin:${BTCAddress}?amount=${payValue}`, "_blank");
                toastInfo("You need to have a bitcoin wallet installed in order to transfer bitcoin. Alternatively, you can scan the QR code to send BTC")
            } else if (selectedCurrency.name = "MATIC") {
                if (!await ensureMaticMainnet(userAccount, ethereum, WalletConnectConnector)) {
                    return
                }
                await transferEth({ ether: payValue, addr: ETHAddress }, setUserAccount, false, WalletConnectConnector, userAccount)
            }
        } catch (e) {
            toastError("Something went wrong. Please try again")
        }
    }



    return (

        <Page>
            <div className="flex flex-col align-items-center items-center mt-16 transition duration-300">
                <Head>
                    <title>{username}</title>
                    <meta name="twitter:title" content={`${fullName}'s Polychain Page`} />
                    <meta name="twitter:description" content="Polychain - Send and recieve bitcoin, ethereum, solana, etc. with a simple, shareable link!" />
                    <meta name="description" property="og:description" content="Polychain - Send and recieve bitcoin, ethereum, solana, etc. with a simple, shareable link!" />
                    <meta name="title" property="og:title" content={`${fullName}'s Polychain Page`} />
                </Head>
                {loading ? <Loading /> : accountExists ?
                    <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm p-3 pt-6 sm:p-6 bg-white mx-64">
                        <nav className="flex flex-row justify-evenly">

                            {links.length <= 0 && ethNFTs.length > 0 ? <>
                                <CustomLabel style={{ fontSize: "1.2rem" }} onClick={() => { setActive(1) }} className={active == 1 ? "text-brand-primary-medium" : "text-gray-500"}>Payment</CustomLabel>
                                <div className="border border-gray-300"></div>
                                <CustomLabel style={{ fontSize: "1.2rem" }} onClick={() => { setActive(3) }} className={active == 3 ? "text-brand-primary-medium" : "text-gray-500"}>NFTs</CustomLabel>

                            </> : ""}

                            {links.length > 0 && (ethNFTs.length <= 0) ?
                                <>
                                    <CustomLabel style={{ fontSize: "1.2rem" }} onClick={() => { setActive(1) }} className={active == 1 ? "text-brand-primary-medium" : "text-gray-500"}>Payment</CustomLabel>
                                    <div className="border border-gray-300"></div>
                                    <CustomLabel style={{ fontSize: "1.2rem" }} onClick={() => { setActive(2) }} className={active == 2 ? "text-brand-primary-medium" : "text-gray-500"}>Links</CustomLabel>

                                </> : ""}
                            {links.length > 0 && ethNFTs.length > 0 ?
                                <>
                                    <CustomLabel style={{ fontSize: "1.2rem" }} onClick={() => { setActive(1) }} className={active == 1 ? "text-brand-primary-medium" : "text-gray-500"}>Payment</CustomLabel>
                                    <div className="border border-gray-300"></div>
                                    <CustomLabel style={{ fontSize: "1.2rem" }} onClick={() => { setActive(2) }} className={active == 2 ? "text-brand-primary-medium" : "text-gray-500"}>Links</CustomLabel>
                                    <CustomLabel style={{ fontSize: "1.2rem" }} onClick={() => { setActive(3) }} className={active == 3 ? "text-brand-primary-medium" : "text-gray-500"}>NFTs</CustomLabel>
                                </> : ""}
                        </nav>
                        {active == 1 ? <div className="flex flex-col">
                            <div id="profile_header" className={(links.length > 0 || ethNFTs.length > 0 ? "flex flex-row items-start mt-8" : "flex flex-row items-start")}>
                                {profilePic ?
                                    <Image width="60" className="rounded-full object-cover" height="60" src={profilePic}></Image> : <Identicon className="rounded-full object-cover mr-1" string={ETHAddress ? ETHAddress : SOLAddress} size={50} />}
                                <div className="flex flex-col ml-2">
                                    {fullName ? <CustomLabel className="px-0">{fullName}</CustomLabel> : <CustomLabel className="px-0">{username}</CustomLabel>}
                                    <CustomLabel style={{ fontWeight: "500", maxWidth: "300px" }} className="px-0">{bio ? bio : "Welcome to my Polychain Page!"}</CustomLabel>
                                </div>
                            </div>

                            {anySocialUrl ?
                                <div className="flex flex-row justify-center items-center">
                                    {facebookUrl ? <a href={facebookUrl} target="_blank" rel="noopener noreferrer"><img src="images/Facebook.svg" width="30"></img></a> : ""}
                                    {instagramUrl ? <a href={instagramUrl} target="_blank" rel="noopener noreferrer"><img src="images/Instagram.svg" width="30"></img></a> : ""}
                                    {githubUrl ? <a href={githubUrl} target="_blank" rel="noopener noreferrer"><img src="images/Github.svg" width="30"></img></a> : ""}
                                    {linkedinUrl ? <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"><img src="Linkedin.svg" width="30"></img></a> : ""}
                                    {redditUrl ? <a href={redditUrl} target="_blank" rel="noopener noreferrer"><img src="images/Reddit.svg" width="30"></img></a> : ""}
                                    {snapchatUrl ? <a href={snapchatUrl} target="_blank" rel="noopener noreferrer"><img src="images/Snapchat.svg" width="30"></img></a> : ""}
                                    {tiktokUrl ? <a href={tiktokUrl} target="_blank" rel="noopener noreferrer"><img src="images/Tiktok.svg" width="30"></img></a> : ""}
                                    {pinterestUrl ? <a href={pinterestUrl} target="_blank" rel="noopener noreferrer"><img src="images/Pinterest.svg" width="30"></img></a> : ""}
                                    {twitterUrl ? <a href={twitterUrl} target="_blank" rel="noopener noreferrer"><img src="images/Twitter.svg" width="30"></img></a> : ""}
                                    {youtubeUrl ? <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"><img src="images/Youtube.svg" width="30"></img></a> : ""}
                                </div> : ""}

                            <div onClick={() => { toastSuccess("Address copied!"); navigator.clipboard.writeText(displayedAddress) }} className=" flex flex-row justify-between mt-6 mb-1 items-center">
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
                            <CustomBrandedButton onClick={transferAmount} className="mb-6">Pay</CustomBrandedButton>
                        </div> : ""}
                        {active == 2 ?
                            <div className="flex flex-col space-y-3 px-6 pt-8 pb-8">
                                {links.map(link => {
                                    return (
                                        link.title !== "" || link.url !== "" ? <CustomButton onClick={() => { window.open(link.url, "_blank") }} className="w-80">{link.title}</CustomButton> : ""
                                    )
                                })}


                            </div> : ""}
                        {active == 3 ?
                            <div className="mt-4 flex duration-300 flex-wrap">
                                {ethNFTs.map(
                                    (nft, index) => {

                                        return (
                                            <div className="m-4 mb-8 mx-6 shadow-md rounded-3xl overflow-hidden">
                                                <video onLoad={(e) => { e.target.style.display = "block" }} style={{ "display": "none" }} width="300" loop muted onError={(e) => { e.target.style.display = "none" }}>
                                                    <source src={nft.url} type='video/webm' />
                                                </video>
                                                <img onLoad={(e) => { e.target.style.display = "block" }} style={{ "display": "none" }} key={index} onError={(event) => { event.target.style.display = 'none' }} src={nft.url} width="300"></img>
                                                <div className="flex flex-row justify-between items-center my-6">
                                                    <CustomLabel style={{ fontSize: "1.3rem" }} className="px-0">{nft.name}</CustomLabel>
                                                    <a className="mr-2" target="_blank" rel="noreferrer" href={`https://opensea.io/assets/${nft.contractAddress}/${nft.tokenId}`}>
                                                        <svg className='cursor-pointer h-6 w-6' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>)
                                    })}
                            </div> : ""}

                    </div> : <CustomLabel className="text-lg">No account with this username exists. <Link className="" href="/">Buy</Link> this username</CustomLabel>}
                <CustomBrandedButton onClick={() => { router.push("/") }} className="my-10 opacity-60 rounded-2xl">Get your own!</CustomBrandedButton>
                <div id="spacer" className="grow"></div>
            </div>
        </Page >

    )
}