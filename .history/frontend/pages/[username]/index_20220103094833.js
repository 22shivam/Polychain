import { useState, useEffect, useContext } from "react";
import TOKEN_ABI from "../../lib/TOKEN_ABI";
import generateQR from "../../lib/generateQR";
import transferERC20 from "../../lib/transferERC20";
import transferSOL from "../../lib/transferSol";
import transferEth from "../../lib/transferEth";
import { useRouter } from 'next/router'
import { UserContext } from "../_app";
import toastError from "../../lib/toastError";
import toastSuccess from "../../lib/toastSuccess";
import { ethers } from "ethers";



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
    const { userAccount, setUserAccount } = useContext(UserContext);

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



    const handleLogout = async () => {
        console.log(userAccount.blockchain)
        if (userAccount.blockchain == "sol") {
            window.solana.disconnect()
        }
        const response = await fetch("http://localhost:3001/logout", {
            credentials: 'include'
        })

        const processedResponse = await response.json()
        console.log(processedResponse)
        toast.info('Logout Successful!', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
        });
        setUserAccount({})
    }


    const ethLogin = async (e) => {
        try {
            if (!window.ethereum) {
                window.open(`https://metamask.io/`, "_blank");
                return toastError('No Ethereum Crypto wallet found. Please install one like Metamask.')
            }
            // await window.ethereum.send("eth_requestAccounts");
            // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const accounts = await window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{
                    eth_accounts: {}
                }]
            }).then(() => ethereum.request({
                method: 'eth_requestAccounts'
            }))
            // const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const message = `Logging in.... \n \n Random ID: ${Math.random().toString(36).slice(2)}`
            const signature = await signer.signMessage(message)
            const requestObject = {
                signature,
                message,
                address: accounts[0]
            }
            const loginResponse = await createPostRequest("http://localhost:3001/login/eth", requestObject)

            if (!loginResponse.success) {
                toastError('Login Failed')
            }

            if (loginResponse.success) {
                toastSuccess('Login Successful')
                setUserAccount({ address: accounts[0], blockchain: "eth" })
            }

            console.log(loginResponse)
        } catch (err) { toastError(err.message) }

    }

    const solLogin = async (e) => {
        try {
            const provider = await (async () => {
                if ("solana" in window) {
                    // await window.solana.request({ method: "disconnect" });
                    await window.solana.connect();
                    const provider = window.solana;
                    console.log("Is Phantom installed?  ", provider.isPhantom);
                    return provider
                } else {
                    window.open("https://www.phantom.app/", "_blank");
                }
            })()
            const message = `Logging in.... \n \n Random ID: ${Math.random().toString(36).slice(2)}`
            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await window.solana.signMessage(encodedMessage, "utf8")

            const requestObject = {
                signedMessage: signedMessage,
                message,
                address: signedMessage.publicKey.toBytes(),
                publicKey: signedMessage.publicKey.toBase58()

            }
            const loginResponse = await createPostRequest("http://localhost:3001/login/sol", requestObject)

            if (!loginResponse.success) {
                toastError('Login Failed')
            }

            if (loginResponse.success) {
                toastSuccess('Login Successful')
                setUserAccount({ address: signedMessage.publicKey.toString(), blockchain: "sol" })
            }

            console.log(loginResponse)
        } catch (err) { toastError(err.message) }
    }


    return (
        <div className="flex flex-col">
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
            <div className="flex flex-row shadow-md py-1 px-2" id="nav_bar">
                <div className="grow-0" id="left_nav_bar"> </div>
                <div className="grow" id="spacer">  </div>
                <div className="grow-0 my-2 mr-4 flex" id="right_nav_bar">
                    {userAccount.address ?
                        <div className="flex flex-row">
                            {/* <CustomButton onClick={goToDashboard}>Dashboard</CustomButton> */}
                            {/* <h1><Link href="/dashboard">Dashboard</Link></h1> */}
                            <CustomButton onClick={handleLogout}>Logout</CustomButton>
                        </div>
                        : (
                            <div>
                                <DropDownComponent primaryLabel="Login" label1="Ethereum" label2="Solana" label1onClick={ethLogin} label2onClick={solLogin} />
                            </div>
                        )}


                </div>
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