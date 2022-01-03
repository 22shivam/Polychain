import { useState, useEffect, useContext } from 'react';
import { UserContext } from './_app';
import Link from 'next/link';
import createPostRequest from '../lib/createPostRequest';
import { ethers } from 'ethers';
import { validate } from "bitcoin-address-validation"
import * as web3 from '@solana/web3.js';
import imageCompression from 'browser-image-compression';
import toastError from "../lib/toastError";
import toastSuccess from "../lib/toastSuccess";
import CustomButton from "./components/customButton";
import DropDownComponent from "./components/DropDown";
import { ToastContainer, toast } from 'react-toastify';
import CustomInput from './components/customInput';
import CustomLabel from './components/customLabel';

const options = {
    maxSizeMB: 1,          // (default: Number.POSITIVE_INFINITY)
    maxWidthOrHeight: 200,   // compressedFile will scale down by ratio to a point that width or height is smaller than maxWidthOrHeight (default: undefined)
    // but, automatically reduce the size to smaller than the maximum Canvas size supported by each browser.
    // Please check the Caveat part for details.
    // onProgress: Function,       // optional, a function takes one progress argument (percentage from 0 to 100) 
    // useWebWorker: boolean,      // optional, use multi-thread web worker, fallback to run in main-thread (default: true)

    // // following options are for advanced users
    // maxIteration: number,       // optional, max number of iteration to compress the image (default: 10)
    // exifOrientation: number,    // optional, see https://stackoverflow.com/a/32490603/10395024
    // fileType: string,           // optional, fileType override
    // initialQuality: number      // optional, initial quality value between 0 and 1 (default: 1)
}


export default function UserDashboard() {
    console.log("rerendering")
    const { userAccount, setUserAccount } = useContext(UserContext); // records whether logged in
    const [hasUsername, setHasUsername] = useState(false) // records whether logged in account has username

    const [showConfirmationModal] = useState(false)
    const [bio, setBio] = useState("");
    const [DESOAddress, setDESOAddress] = useState("");
    const [BTCAddress, setBTCAddress] = useState("");
    const [ETHAddress, setETHAddress] = useState("");
    const [SOLAddress, setSOLAddress] = useState("");
    const [profilePic, setProfilePic] = useState("");

    // handling logouts
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleLogout);
        }
        if (window.solana) {
            window.solana.on("disconnect", handleLogout)
        }
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleLogout);
            }
            if (window.solana) {
                window.solana.removeListener("disconnect", handleLogout);
            }
        }
    }, [])

    // checks whether user logged in when page loaded using jwt and context state. 
    useEffect(() => {
        // ask them to login either through solana or eth
        (async () => {
            const response = await fetch("http://localhost:3001/isLoggedIn", {
                credentials: 'include'
            })
            const processedResponse = await response.json()
            console.log("login response", processedResponse)
            if (!processedResponse.isLoggedIn) {
                setUserAccount({})
                return console.log("please login first")
            } else {
                console.log(processedResponse)
                const response = await createPostRequest("http://localhost:3001/userDetails", {
                    address: processedResponse.address,
                    blockchain: processedResponse.blockchain
                })
                if (!response.success) {
                    console.log("no account found")
                    setHasUsername(false)
                    setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                    return
                }
                console.log("response:", response)
                console.log(response.user.ETHAddress)
                setETHAddress(response.user.ETHAddress || "")
                setSOLAddress(response.user.SOLAddress || "")
                setDESOAddress(response.user.DESOAddress || "")
                setBTCAddress(response.user.BTCAddress || "")
                setBio(response.user.bio || "")
                setProfilePic(response.user.profilePic)
                setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                setHasUsername(true)
            }
        })()
    }, []) // this dependency is so that if from backend i ever send an updated cookie to logout on any random request, this reruns

    const updateInfo = async (e) => {
        console.log(userAccount.blockchain, userAccount.address, ETHAddress)

        if (userAccount.blockchain === "eth" && userAccount.address !== ETHAddress || userAccount.blockchain === "sol" && userAccount.address !== SOLAddress) {
            const response = confirm("You are changing the address with which you are logged in. Hence, you will be logged out.")
            if (!response) {
                return
            }
        } // else just submit to backend

        // validate input
        if (!ethers.utils.isAddress(ETHAddress) && ETHAddress) {
            return alert("Invalid Ethereum Address")
        }
        if (!validate(BTCAddress) && BTCAddress) {
            return alert("Invalid Bitcoin Address")
        }
        // TODO: Validate solana and deso address. Check if input bio is not malicious. LOW PRIORITY

        // submit to server
        let response = await createPostRequest("http://localhost:3001/userdetails/update", {
            ETHAddress,
            SOLAddress,
            DESOAddress,
            BTCAddress,
            bio,
            profilePic
        })
        if (!response.success) {
            console.log("no updates made")
            console.log("message:", response.message)
        } else {
            console.log("updated")
            console.log(response)
        }

        if (response.loggedOut) {
            setUserAccount({})
            setHasUsername(false)
            return
        }

        // do necesary cookie cleanup and redirect


    }

    const uploadImage = async (e) => {
        const file = e.target.files[0]
        if (!file instanceof Blob && !file instanceof File) { return }
        console.log("orignal file instance of blob", file instanceof Blob)
        const compressedImage = await imageCompression(file, options)
        // base 64 encode image
        const reader = new FileReader()
        reader.readAsDataURL(compressedImage)
        reader.onload = async () => {
            console.log(reader.result)
            setProfilePic(reader.result)
        }
    }

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

    // if (!hasUsername) {
    //     return <div>
    //         <h1>User Dashboard</h1>
    //         <p>You dont have a username yet. Buy one <Link href="/">here</Link></p>
    //     </div>
    // }

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
            <main id="dashboard" className='flex flex-col items-center mt-4'>
                Welcome to your dashboard! More coming soon....
                <br />
                <div class="flex flex-wrap overflow-hidden sm:-mx-6 md:-mx-3">

                    <div class="w-1/2 overflow-hidden sm:my-6 sm:px-6 md:my-3 md:px-3">
                        hello
                    </div>

                    <div class="w-1/2 overflow-hidden sm:my-6 sm:px-6 md:my-3 md:px-3">
                        how are you
                    </div>

                    <div class="w-1/2 overflow-hidden sm:my-6 sm:px-6 md:my-3 md:px-3">
                        hello
                    </div>

                    <div class="w-1/2 overflow-hidden sm:my-6 sm:px-6 md:my-3 md:px-3">
                        hello
                    </div>

                    <div class="w-1/2 overflow-hidden sm:my-6 sm:px-6 md:my-3 md:px-3">
                        hello
                    </div>

                </div>
                <div className='flex flex-row justify-items-start w-100'>
                    <CustomLabel>Bio:</CustomLabel>
                    <CustomInput className="my-1" type="text" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="enter bio" />
                </div>
                <div className='flex flex-row'>
                    <CustomLabel>DESO Address:</CustomLabel>
                    <CustomInput className="my-1" type="text" value={DESOAddress} onChange={(e) => setDESOAddress(e.target.value)} placeholder="enter deso address" />
                </div>
                <div className='flex flex-row'>
                    <CustomLabel>Bitcoin Address:</CustomLabel>
                    <CustomInput className="my-1" type="text" value={BTCAddress} onChange={(e) => setBTCAddress(e.target.value)} placeholder="enter btc address" />
                </div>
                <div className='flex flex-row'>
                    <CustomLabel>Ethereum Address:</CustomLabel>
                    <CustomInput className="my-1" type="text" value={ETHAddress} onChange={(e) => setETHAddress(e.target.value)} placeholder="enter eth address" />
                </div>
                <div className='flex flex-row'>
                    <CustomLabel>Solana Address:</CustomLabel>
                    <CustomInput className="my-1" type="text" value={SOLAddress} onChange={(e) => setSOLAddress(e.target.value)} placeholder="enter sol address" />
                </div>
                <div className='flex flex-row'>
                    <CustomLabel>Upload Profile Picture:</CustomLabel>
                    <CustomInput className="my-1" type="file" onChange={uploadImage}
                        id="profilePic" name="profilePic" multiple={false}
                        accept="image/png, image/jpeg" />
                </div>
                <img src={profilePic} alt="profile pic" />
                <CustomButton onClick={updateInfo}>Save</CustomButton>
                <br />
            </main>
        </div>
    )
}