import { useState, useEffect, useContext } from 'react';
import { UserContext } from './_app';
import createPostRequest from '../lib/createPostRequest';
import { ethers } from 'ethers';
import { validate } from "bitcoin-address-validation"
import imageCompression from 'browser-image-compression';
import toastError from "../lib/toastError";
import toastSuccess from "../lib/toastSuccess";
import CustomButton from "./components/customButton";
import DropDownComponent from "./components/DropDown";
import { ToastContainer, toast } from 'react-toastify';
import CustomInput from './components/customInput';
import CustomLabel from './components/customLabel';
import * as web3 from '@solana/web3.js'

function validSolAddress(s) {
    try {
        return new web3.PublicKey(s);
    } catch (e) {
        return null;
    }
}

const options = {
    maxSizeMB: 1,          // (default: Number.POSITIVE_INFINITY)
    maxWidthOrHeight: 100,   // compressedFile will scale down by ratio to a point that width or height is smaller than maxWidthOrHeight (default: undefined)
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

    const [username, setUsername] = useState("")
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
        (async () => {
            const response = await fetch("http://localhost:3001/isLoggedIn", {
                credentials: 'include'
            })
            const processedResponse = await response.json()
            console.log("useisloggedin", processedResponse.isLoggedIn)
            if (!processedResponse.isLoggedIn) {
                setUserAccount({})
                return toastError("Please login to access your account")
            } else {
                setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                // const response = await createPostRequest("http://localhost:3001/userDetails", {
                //     address: processedResponse.address,
                //     blockchain: processedResponse.blockchain
                // })
                // if (!response.success) {
                //     toastError("No account is associated with this wallet address.")
                //     setHasUsername(false)
                //     setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                //     return
                // }
                // setUsername(response.user.username)
                // setETHAddress(response.user.ETHAddress || "")
                // setSOLAddress(response.user.SOLAddress || "")
                // setDESOAddress(response.user.DESOAddress || "")
                // setBTCAddress(response.user.BTCAddress || "")
                // setBio(response.user.bio || "")
                // setProfilePic(response.user.profilePic)
                // setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                // setHasUsername(true)
            }
        })()
    }, [])

    // fetches user information when useraccount changed
    useEffect(() => {
        // ask them to login either through solana or eth
        (async () => {
            // const response = await fetch("http://localhost:3001/isLoggedIn", {
            //     credentials: 'include'
            // })
            // const processedResponse = await response.json()
            // console.log("heisloggedin", processedResponse.isLoggedIn)
            // if (!processedResponse.isLoggedIn) {
            //     // setUserAccount({})
            //     return toastError("Please login to access your account")
            // } else {
            if (userAccount.address) {
                const response = await createPostRequest("http://localhost:3001/userDetails", {
                    address: userAccount.address,
                    blockchain: userAccount.blockchain
                })
                if (!response.success) {
                    toastError("No account is associated with this wallet address.")
                    setHasUsername(false)
                    // setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                    return
                }
                setUsername(response.user.username)
                setETHAddress(response.user.ETHAddress || "")
                setSOLAddress(response.user.SOLAddress || "")
                setDESOAddress(response.user.DESOAddress || "")
                setBTCAddress(response.user.BTCAddress || "")
                setBio(response.user.bio || "")
                setProfilePic(response.user.profilePic)
                // setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                setHasUsername(true)
                // }
            }
        })()
    }, [userAccount]) // this dependency is so that if from backend i ever send an updated cookie to logout on any random request, this reruns

    const updateInfo = async (e) => {

        if (userAccount.blockchain === "eth" && userAccount.address !== ETHAddress || userAccount.blockchain === "sol" && userAccount.address !== SOLAddress) {
            console.log(userAccount.blockchain)
            console.log(userAccount.address)
            console.log(ETHAddress, SOLAddress)
            const response = confirm("You are changing the address with which you are logged in. Hence, you will be logged out.")
            if (!response) {
                return
            }
        } // else just submit to backend

        // validate input
        if (!ethers.utils.isAddress(ETHAddress) && ETHAddress) {
            return toastError("Please enter a valid Ethereum address")
        }
        if (!validate(BTCAddress) && BTCAddress) {
            return toastError("Please enter a valid Bitcoin address")
        }

        if (!validSolAddress(SOLAddress) && SOLAddress) {
            return toastError("Please enter a valid Solana address")
        }

        if (!validate(DESOAddress) && DESOAddress) {
            return toastError("Please enter a valid Deso address")
        }

        // TODO: Check if input bio is not malicious. LOW PRIORITY

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
            toastError(response.message)
        } else {
            toastSuccess("Updated successfully")
        }

        if (response.loggedOut) {
            toastError("You have been logged out due to the changes you made.")
            setUserAccount({})
            setHasUsername(false)
            return
        }

        // do necesary cookie cleanup and redirect


    }

    const uploadImage = async (e) => {
        const file = e.target.files[0]
        if (!file instanceof Blob && !file instanceof File) {
            return toastError("Invalid file added")
        }
        const compressedImage = await imageCompression(file, options)
        const reader = new FileReader()
        reader.readAsDataURL(compressedImage)
        reader.onload = async () => {
            toastSuccess("Image uploaded successfully")
            console.log(reader.result)
            setProfilePic(reader.result)
        }
    }

    const handleLogout = async () => {
        if (userAccount.blockchain == "sol") {
            window.solana.disconnect()
        }
        const response = await fetch("http://localhost:3001/logout", {
            credentials: 'include'
        })

        const processedResponse = await response.json()
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
            const accounts = await window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{
                    eth_accounts: {}
                }]
            }).then(() => ethereum.request({
                method: 'eth_requestAccounts'
            }))
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
                setUserAccount({ address: loginResponse.address, blockchain: "eth" })
            }

        } catch (err) { toastError(err.message) }

    }

    const solLogin = async (e) => {
        try {
            const provider = await (async () => {
                if ("solana" in window) {
                    await window.solana.connect();
                    const provider = window.solana;
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
                setUserAccount({ address: loginResponse.address, blockchain: "sol" })
            }

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
                <div onClick={() => { window.open("http://localhost:3000/") }} className="grow-0 flex items-center justify-center cursor-pointer" id="left_nav_bar">
                    <img classname="" src="/croppedPolychainLogo.png" alt="Polychain Logo" width="150" />
                </div>
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
            {userAccount.address ? hasUsername ?
                <main id="dashboard" className='flex flex-col items-center mt-4'>
                    <CustomLabel className="mb-6 font-medium">View your profile live at <a className='underline ' href={`http://localhost:3000/${username}`} target='_blank'>{`localhost:3000/${username}`}</a></CustomLabel>
                    <CustomLabel className="text-2xl mb-3">Update Profile Information</CustomLabel>
                    <div className='flex flex-col' id="form">

                        <div className='flex flex-col mt-3'>
                            <CustomLabel className="text-gray-700">Bio:</CustomLabel>
                            <CustomInput className="my-1" type="text" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="enter bio" />
                        </div>
                        <div className='flex flex-col mt-3'>
                            <CustomLabel className="text-gray-700">DESO Address:</CustomLabel>
                            <CustomInput className="my-1" type="text" value={DESOAddress} onChange={(e) => setDESOAddress(e.target.value)}
                                placeholder="enter deso address" /></div>
                        <CustomLabel className="text-gray-500 font-normal text-sm">don't have an account yet? <a href="https://diamondapp.com?r=6xzkzfZt" className='underline' target="_blank">sign up</a> now and get up to $5!</CustomLabel>
                        <div className='flex flex-col mt-3'>
                            <CustomLabel className="text-gray-700">Bitcoin Address:</CustomLabel>
                            <CustomInput className="my-1" type="text" value={BTCAddress} onChange={(e) => setBTCAddress(e.target.value)}
                                placeholder="enter btc address" /></div>
                        <div className='flex flex-col mt-3'>
                            <CustomLabel className="text-gray-700">Ethereum Address:</CustomLabel>
                            <CustomInput className="my-1" type="text" value={ETHAddress} onChange={(e) => setETHAddress(e.target.value)}
                                placeholder="enter eth address" /></div>
                        <div className='flex flex-col mt-3'>
                            <CustomLabel className="text-gray-700">Solana Address:</CustomLabel>
                            <CustomInput className="my-1" type="text" value={SOLAddress} onChange={(e) => setSOLAddress(e.target.value)}
                                placeholder="enter sol address" /></div>
                        <div className='flex flex-col mt-3 mb-5'>
                            {/* <CustomLabel>Upload Profile Picture:</CustomLabel>
                            <CustomInput className="my-1" type="file" onChange={uploadImage}
                                id="profilePic" name="profilePic" multiple={false}
                                accept="image/png, image/jpeg" /> */}

                            <div className=''>
                                <CustomLabel className="">Profile Picture:</CustomLabel>
                                <div className="mx-4 mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-brand-primary-medium hover:text-brand-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>Upload a file</span>
                                                <CustomInput className="my-1 sr-only" type="file" onChange={uploadImage}
                                                    id="file-upload" name="file-upload" multiple={false}
                                                    accept="image/png, image/jpeg" />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-row justify-around'>
                            <CustomButton className="px-6 text-white bg-brand-primary-medium hover:bg-brand-primary-dark" onClick={updateInfo}>Save</CustomButton>
                        </div>

                    </div>
                </main> : <CustomLabel className="font-medium flex flex-col items-center mt-4"><span>There is no username associated with this wallet address. Buy one <a className='underline inline' href={`http://localhost:3000/`} target='_blank'>now!</a></span></CustomLabel> : <CustomLabel className="font-medium flex flex-col items-center mt-4">Please login to access this page.</CustomLabel>}
        </div>
    )
}