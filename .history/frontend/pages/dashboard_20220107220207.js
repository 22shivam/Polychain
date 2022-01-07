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
import CustomBrandedButton from './components/customBrandedButton';
import { useRouter } from 'next/router'
import Link from 'next/link';

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
    const router = useRouter()
    const { userAccount, setUserAccount } = useContext(UserContext); // records whether logged in
    const [hasUsername, setHasUsername] = useState(false) // records whether logged in account has username

    const [username, setUsername] = useState("")
    const [bio, setBio] = useState("");
    const [DESOAddress, setDESOAddress] = useState("");
    const [BTCAddress, setBTCAddress] = useState("");
    const [ETHAddress, setETHAddress] = useState("");
    const [SOLAddress, setSOLAddress] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [loading, setLoading] = useState(true)

    // handling logouts
    useEffect(() => {
        setLoading(true)
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleLogout);
        }
        if (window.solana) {
            window.solana.on("disconnect", handleLogout)
        }
        return () => {
            setLoading(true)
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleLogout);
            }
            if (window.solana) {
                window.solana.removeListener("disconnect", handleLogout);
            }
        }
    }, [])

    // checks whether user logged in when page loaded using jwt and context state. 
    // useEffect(() => {
    //     (async () => {
    //         setLoading(true)
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/isLoggedIn`, {
    //             credentials: 'include'
    //         })
    //         const processedResponse = await response.json()
    //         if (!processedResponse.isLoggedIn) {
    //             setUserAccount({})
    //             setHasUsername(false)
    //             console.log("not logged in")
    //             // setLoading(false)
    //             return toastError("Please login to access your account")
    //         } else {
    //             // setLoading(false)
    //             setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
    //             console.log("user logged in")
    //             // const response = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/userDetails`, {
    //             //     address: processedResponse.address,
    //             //     blockchain: processedResponse.blockchain
    //             // })
    //             // if (!response.success) {
    //             //     toastError("No account is associated with this wallet address.")
    //             //     setHasUsername(false)
    //             //     setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
    //             //     return
    //             // }
    //             // setUsername(response.user.username)
    //             // setETHAddress(response.user.ETHAddress || "")
    //             // setSOLAddress(response.user.SOLAddress || "")
    //             // setDESOAddress(response.user.DESOAddress || "")
    //             // setBTCAddress(response.user.BTCAddress || "")
    //             // setBio(response.user.bio || "")
    //             // setProfilePic(response.user.profilePic)
    //             // setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
    //             // setHasUsername(true)
    //         }
    //     })()
    // }, [])

    // fetches user information when useraccount changed
    useEffect(() => {
        // ask them to login either through solana or eth
        (async () => {
            setLoading(true)
            // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/isLoggedIn`, {
            //     credentials: 'include'
            // })
            // const processedResponse = await response.json()
            // console.log("heisloggedin", processedResponse.isLoggedIn)
            // if (!processedResponse.isLoggedIn) {
            //     // setUserAccount({})
            //     return toastError("Please login to access your account")
            // } else {
            if (userAccount.address) {
                const response = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/userDetails`, {
                    address: userAccount.address,
                    blockchain: userAccount.blockchain
                })
                if (!response.success) {
                    if (!response.isLoggedIn) {
                        setUserAccount({})
                        setHasUsername(false)
                        setLoading(false)
                        toastError("Please login to access this page")
                        return
                    }
                    toastError("No account is associated with this wallet address.")
                    setHasUsername(false)
                    setLoading(false)
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
                setLoading(false)
                // }
            }
            // this causes the temproary "please login"
            setLoading(false)
        })()
    }, [userAccount]) // this dependency is so that if from backend i ever send an updated cookie to logout on any random request, this reruns

    const updateInfo = async (e) => { // TODO:add try catch
        try {
            if (userAccount.blockchain === "eth" && userAccount.address.toUpperCase() !== ETHAddress.toUpperCase() || userAccount.blockchain === "sol" && userAccount.address.toUpperCase() !== SOLAddress.toUpperCase()) {
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

            if (bio.length > 160) {
                return toastError("Bio must be less than 160 characters")
            }

            // TODO: Check if input bio is not malicious. LOW PRIORITY

            // submit to server
            let response = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/userdetails/update`, {
                ETHAddress,
                SOLAddress,
                DESOAddress,
                BTCAddress,
                bio,
                profilePic
            })
            if (!response.success) {
                if (response.isNotLoggedIn) {
                    setUserAccount({})
                    toastError("Session Expired. You will need to login again to update your account")
                    return
                }
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
        } catch (err) {

            toastError("Something went wrong.Please try again.")
        }

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`, {
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
            const loginResponse = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login/eth`, requestObject)

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
            const loginResponse = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login/sol`, requestObject)

            if (!loginResponse.success) {
                toastError('Login Failed')
            }

            if (loginResponse.success) {
                toastSuccess('Login Successful')
                setUserAccount({ address: loginResponse.address, blockchain: "sol" })
            }

        } catch (err) { toastError(err.message) }
    }

    const redirectToProfile = () => {
        router.push(`http://localhost:3000/${username}`);
    }

    if (loading) {
        return <div type="button" className="flex justify-center items-center h-screen px-4 py-2 font-semibold leading-6 text-lg transition ease-in-out duration-150 cursor-not-allowed" disabled="">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
        </div>
    }

    return (
        <div className="flex flex-col w-screen">
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
            <div className="flex flex-row shadow-md py-1 px-2 w-screen" id="nav_bar">
                <div onClick={() => { router.push("http://localhost:3000/") }} className="grow-0 flex items-center justify-center cursor-pointer" id="left_nav_bar">
                    <img className="" src="/croppedPolychainLogo.png" alt="Polychain Logo" width="150" />
                </div>
                <div className="grow" id="spacer">  </div>
                <div className="grow-0 my-2 mr-4 flex" id="right_nav_bar">
                    {userAccount.address ?
                        <div className="flex flex-row">
                            {/* <CustomButton onClick={goToDashboard}>Dashboard</CustomButton> */}
                            {/* <h1><Link href="/dashboard">Dashboard</Link></h1> */}
                            <CustomBrandedButton onClick={redirectToProfile} className="">View Profile</CustomBrandedButton>
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
                <main id="dashboard" className='flex flex-col items-center mt-10 w-screen justify-center'>

                    <CustomLabel className="smtext-2xl mb-3">Update Profile Information</CustomLabel>
                    <div className='flex flex-col w-screen items-center' id="form">

                        <div className='flex flex-col mt-4'>
                            <CustomLabel className="">Bio:</CustomLabel>
                            <CustomInput maxLength="160" className="my-1 w-96" type="text" value={bio} onChange={(e) => setBio((e.target.value).slice(0, 160))} placeholder="enter bio" />
                        </div>
                        <div className='flex flex-col mt-4'>
                            <CustomLabel className="">DESO Address:</CustomLabel>
                            <CustomInput className="my-1 w-96" type="text" value={DESOAddress} onChange={(e) => setDESOAddress((e.target.value).replace(/[^a-zA-Z0-9]/g, ""))}
                                placeholder="enter deso address" /></div>
                        {DESOAddress ? "" :
                            <CustomLabel className="text-gray-500 font-normal text-sm">don&apos;t have an account yet? <a href="https://diamondapp.com?r=6xzkzfZt" className='underline' target="_blank" rel="noreferrer">sign up</a> now and get up to $5!</CustomLabel>}
                        <div className='flex flex-col mt-4'>
                            <CustomLabel className="">Bitcoin Address:</CustomLabel>
                            <CustomInput className="my-1 w-96" type="text" value={BTCAddress} onChange={(e) => setBTCAddress((e.target.value).replace(/[^a-zA-Z0-9]/g, ""))}
                                placeholder="enter btc address" /></div>
                        <div className='flex flex-col mt-4'>
                            <CustomLabel className="">Ethereum Address:</CustomLabel>
                            <CustomInput className="my-1 w-96" type="text" value={ETHAddress} onChange={(e) => setETHAddress((e.target.value).replace(/[^a-zA-Z0-9]/g, ""))}
                                placeholder="enter eth address" /></div>
                        <div className='flex flex-col mt-4'>
                            <CustomLabel className="">Solana Address:</CustomLabel>
                            <CustomInput className="my-1 w-96" type="text" value={SOLAddress} onChange={(e) => setSOLAddress((e.target.value).replace(/[^a-zA-Z0-9]/g, ""))}
                                placeholder="enter sol address" /></div>
                        <div className='flex flex-col mt-4 mb-5'>
                            {/* <CustomLabel>Upload Profile Picture:</CustomLabel>
                            <CustomInput className="my-1" type="file" onChange={uploadImage}
                                id="profilePic" name="profilePic" multiple={false}
                                accept="image/png, image/jpeg" /> */}

                            <div className=''>
                                <CustomLabel className="">Profile Picture:</CustomLabel>
                                <div className="mx-4 w-72 sm:w-96 mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
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
                                                <CustomInput className="my-1 sr-only w-96" type="file" onChange={uploadImage}
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
                            <CustomBrandedButton className="px-6" onClick={updateInfo}>Save</CustomBrandedButton>
                        </div>

                    </div>
                </main> : <CustomLabel className="font-medium flex flex-col items-center mt-4"><span>There is no username associated with this wallet address. <Link className='underline inline' href={`http://localhost:3000/`}>Buy</Link> one now!</span></CustomLabel> : <CustomLabel className="font-medium flex flex-col items-center mt-4">Please login to access this page.</CustomLabel>}
        </div>
    )
}