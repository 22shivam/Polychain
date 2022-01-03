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
    console.log(selectedCurrency)
    const { username } = router.query
    console.log("username", username)
    const [qrCode, setQrCode] = useState("")
    const [payValue, setPayValue] = useState("")
    const [ETHpayValue, setETHPayValue] = useState(0);
    const [SOLpayValue, setSOLPayValue] = useState(0);
    const [ERC20payValue, setERC20PayValue] = useState(0);
    const [ETHAddress, setETHAddress] = useState("");
    const [SOLAddress, setSOLAddress] = useState("");
    const [DESOAddress, setDESOAddress] = useState("");
    const [BTCAddress, setBTCAddress] = useState("");
    const [bio, setBio] = useState("")
    const [profilePic, setProfilePic] = useState("")
    const [currencies, setCurrencies] = useState([])
    console.log("currencies:", currencies)

    useEffect(() => {
        (async () => {
            const qrCode = await generateQR(`bitcoin:${BTCAddress}`)
            setQrCode(qrCode)
        })()
    }, [BTCAddress])

    // ensures only available options are shown
    useEffect(() => {
        // console.log("fetching username details")
        (async () => {
            let response = await fetch(`http://localhost:3001/api/${username}`)
            response = await response.json()
            console.log(response)
            if (response.success) {
                let currencyArray = []

                if (response.user.ETHAddress != "") {
                    console.log("eth address:" + ETHAddress)
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
                            name: 'DeSo',
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
            console.log("transfer eth")
            await transferEth({ ether: payValue, addr: ETHAddress })
        } else if (selectedCurrency.name == "SOL") {
            console.log("transfer sol")
            await transferSOL(payValue, SOLAddress)
        } else if (selectedCurrency.name == "DeSo") {
            console.log("transfer deso")
            await handleSubmitDESO(DESOAddress)
        } else if (selectedCurrency.name == "BTC") {
            // nothing
            window.open(`bitcoin:${BTCAddress}?amount=${payValue}`, "_blank");
            toastInfo("You need to have a bitcoin wallet installed in order to transfer bitcoin. Alternatively, you can scan the QR code to send BTC")
        }

    }


    return (

        <div className="flex flex-col items-center justify-items-center">

            <div id="card" className="flex flex-col rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white">
                <div id="profile_header" className="flex flex-row">
                    <img width="60" className="rounded-full" src={profilePic}></img>
                    <div className="flex flex-col">
                        <CustomLabel>{username}</CustomLabel>
                        <CustomLabel className="font-medium">{bio}</CustomLabel>
                    </div>
                </div>
                <div class="flex justify-center my-2">
                    {/* <span class="border border-gray-300 shadow-sm border-r-0 rounded-l-md px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-semibold">localhost:3000/</span> */}
                    <CustomInput placeholder="Amount" value={payValue} onChange={(e) => { setPayValue(e.target.value) }} name="field_name" className="ml-0 input-placeholder py-3" type="text" />
                    <CurrencySelector currencies={currencies.length == 0 ? defaultCurrencies : currencies} selected={selectedCurrency} setSelected={setSelectedCurrency}></CurrencySelector>
                </div>
                {selectedCurrency.name == "BTC" ? <img src={qrCode}></img> : ""}
                <CustomButton onClick={transferAmount}>Pay</CustomButton>

            </div>

            <div>

                {/* <h1> Send ETH payment </h1>
                <span>Send Shivam</span>
                <input value={ETHpayValue} onChange={(e) => { setETHPayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ETH" />
                <button onClick={async (e) => { await transferEth({ ether: ETHpayValue, addr: ETHAddress }) }} className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>

                <h1> Send Sol payment </h1>
                <span>Send Shivam</span>
                <input value={SOLpayValue} onChange={(e) => { setSOLPayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in SOL" />
                <button onClick={async (e) => { await transferSOL(SOLpayValue, SOLAddress) }} className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>

                <h1> Send ERC20 payment </h1>
                <span>Send Shivam</span>
                <input value={ERC20payValue} onChange={(e) => { setERC20PayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ERC20" />
                <button onClick={(e) => { transferERC20(e, TOKEN_ADDRESS, TOKEN_ABI, ETHAddress, ERC20payValue) }} className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>

                <span>Send Shivam</span>
                <button onClick={() => { handleSubmitDESO(DESOAddress) }} className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Send Deso </button> */}



            </div>

        </div>

    )
}