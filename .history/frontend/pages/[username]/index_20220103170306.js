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
            let response = await fetch(`http://localhost:3001/api/${username}`)
            response = await response.json()
            if (response.success) {
                let currencyArray = []

                if (response.user.ETHAddress != "") {
                    setETHAddress(response.user.ETHAddress)
                    currencyArray.push({
                        id: 2,
                        name: 'ETH',
                        avatar: '/ethereumLogo.png',
                    })

                }
                if (response.user.SOLAddress != "") {
                    setSOLAddress(response.user.SOLAddress)
                    currencyArray.push(
                        {
                            id: 3,
                            name: 'SOL',
                            avatar: '/solanaLogo.png',
                        })
                }

                if (response.user.DESOAddress != "") {
                    setDESOAddress(response.user.DESOAddress)
                    currencyArray.push(
                        {
                            id: 4,
                            name: 'DESO',
                            avatar: '/DeSoLogo.png',
                        })
                }
                if (response.user.BTCAddress != "") {
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
            }

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

        <div className="flex flex-col items-center justify-center h-screen">
            <CustomLabel onClick={() => { window.open("http://localhost:3000/", "_blank") }} className="my-10 cursor-pointer">LocalHost</CustomLabel>
            <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm p-6 bg-white">
                <div id="profile_header" className="flex flex-row mt-4">
                    <img width="60" className="rounded-full" src={profilePic}></img>
                    <div className="flex flex-col">
                        <CustomLabel>{username}</CustomLabel>
                        <CustomLabel className="font-medium">{bio}</CustomLabel>
                    </div>
                </div>
                <div class="flex justify-center my-8">
                    {/* <span class="border border-gray-300 shadow-sm border-r-0 rounded-l-md px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-semibold">localhost:3000/</span> */}
                    <div className="flex flex-col">
                        <CustomInput inputmode="decimal" placeholder="Amount" value={payValue} onChange={(e) => { setPayValue(e.target.value) }} name="field_name" className="ml-0 input-placeholder py-3" type="text" />
                        <CustomLabel className="text-gray-500 text-normal mx-0">{USDPerCurrency * payValue}</CustomLabel>
                    </div>

                    <div className="flex flex-col">
                        <CurrencySelector currencies={currencies.length == 0 ? defaultCurrencies : currencies} selected={selectedCurrency} setSelected={setSelectedCurrency}></CurrencySelector>
                        <CustomLabel className="text-gray-500 text-normal"> 1 {selectedCurrency.name} = ~{USDPerCurrency}</CustomLabel>
                    </div>

                </div>

                {selectedCurrency.name == "BTC" ? <img src={qrCode}></img> : ""}
                <CustomButton onClick={transferAmount}>Pay</CustomButton>

            </div>
            <CustomButton onClick={() => { window.open("http://localhost:3000/", "_blank") }} className="my-10">Create your own!</CustomButton>
            <div id="spacer" className="grow"></div>
            <div></div>
        </div>

    )
}