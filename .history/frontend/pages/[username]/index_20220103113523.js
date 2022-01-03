import { useState, useEffect, useContext } from "react";
import TOKEN_ABI from "../../lib/TOKEN_ABI";
import generateQR from "../../lib/generateQR";
import transferERC20 from "../../lib/transferERC20";
import transferSOL from "../../lib/transferSol";
import transferEth from "../../lib/transferEth";
import { useRouter } from 'next/router'



const TOKEN_ADDRESS = "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa";
const RECIEPIENT_SOL_ADDRESS = "AA6bqLgTzYPpFFH2R9XLdudibWcemLkKDRtZmPQEsEiS"
const RECIEPIENT_ETH_ADDRESS = "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"

const handleSubmitDESO = async (addr) => {
    window.open(`https://diamondapp.com/send-deso?public_key=${addr}`, "_blank");
}

export default function UserPayment() {

    console.log("rerendering")
    const router = useRouter()
    const { username } = router.query
    console.log("username", username)
    const [qrCode, setQrCode] = useState("")
    const [ETHpayValue, setETHPayValue] = useState(0);
    const [SOLpayValue, setSOLPayValue] = useState(0);
    const [ERC20payValue, setERC20PayValue] = useState(0);
    const [ETHAddress, setETHAddress] = useState("");
    const [SOLAddress, setSOLAddress] = useState("");
    const [DESOAddress, setDESOAddress] = useState("");
    const [BTCAddress, setBTCAddress] = useState("");
    const [bio, setBio] = useState("")
    const [profilePic, setProfilePic] = useState("")

    useEffect(() => {
        (async () => {
            const qrCode = await generateQR(`bitcoin:${BTCAddress}`)
            setQrCode(qrCode)
        })()
    }, [BTCAddress])

    useEffect(() => {
        // console.log("fetching username details")
        (async () => {
            let response = await fetch(`http://localhost:3001/api/${username}`)
            response = await response.json()
            console.log(response)
            if (response.success) {
                setETHAddress(response.user.ETHAddress)
                setSOLAddress(response.user.SOLAddress)
                setDESOAddress(response.user.DESOAddress)
                setBTCAddress(response.user.BTCAddress)
                setBio(response.user.bio)
                setProfilePic(response.user.profilePic)
            }

        })()
    }, [username])


    return (

        <div className="flex flex-col items-center align-middle">
            <div id="card" className="rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white">

            </div>
            <h1>Make payments to Shivam, now!</h1>
            <div>{bio}</div>
            <img src={profilePic}></img>

            <div>

                <h1> Send ETH payment </h1>
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
                <button onClick={() => { handleSubmitDESO(DESOAddress) }} className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Send Deso </button>

                <span>Pay Using Bitcoin</span>
                <img src={qrCode}></img>
                <a href={`bitcoin:${BTCAddress}`}>Send</a>

            </div>

        </div>

    )
}