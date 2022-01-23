import { useState, useEffect, useContext } from 'react';
import { UserContext } from './_app';
import createPostRequest from '../lib/createPostRequest';
import { ethers } from 'ethers';
import { validate } from "bitcoin-address-validation"
import imageCompression from 'browser-image-compression';
import toastError from "../lib/toastError";
import toastSuccess from "../lib/toastSuccess";
import { ToastContainer, toast } from 'react-toastify';
import CustomInput from './components/customInput';
import CustomLabel from './components/customLabel';
import * as web3 from '@solana/web3.js'
import CustomBrandedButton from './components/customBrandedButton';
import { useRouter } from 'next/router'
import Link from 'next/link';
import Header from './components/Header';

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
    const [twitterUsername, setTwitterUsername] = useState("");
    const [githubUsername, setGithubUsername] = useState("");
    const [facebookUsername, setFacebookUsername] = useState("");
    const [instagramUsername, setInstagramUsername] = useState("");
    const [tiktokUsername, setTiktokUsername] = useState("");
    const [youtubeUsername, setYoutubeUsername] = useState("");
    const [linkedinUsername, setLinkedinUsername] = useState("");
    const [pinterestUsername, setPinterestUsername] = useState("");
    const [redditUsername, setRedditUsername] = useState("");
    const [snapchatUsername, setSnapchatUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(true)

    // handling logouts
    useEffect(() => {
        try {
            setLoading(true)
            if (window.ethereum) {
                window.ethereum.on('accountsChanged', handleLogout);
            }
            if (window.solana) {
                window.solana.on("disconnect", handleLogout)
            }
            return () => {
                try {
                    setLoading(true)
                    if (window.ethereum) {
                        window.ethereum.removeListener('accountsChanged', handleLogout);
                    }
                    if (window.solana) {
                        window.solana.removeListener("disconnect", handleLogout);
                    }
                } catch (err) {
                    setLoading(false);
                    console.log(err.message)
                }
            }
        } catch (e) {
            setLoading(false)
            console.log(e.message)
        }
    }, [])


    // fetches user information when useraccount changed
    useEffect(() => {
        // ask them to login either through solana or eth
        (async () => {
            try {
                setLoading(true)
                // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/isLoggedIn`, {
                //     credentials: 'include'
                // })
                // const processedResponse = await response.json()
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
                    setFullName(response.user.fullName || "")
                    setTwitterUsername(response.user.twitterUsername || "")
                    setGithubUsername(response.user.githubUsername || "")
                    setFacebookUsername(response.user.facebookUsername || "")
                    setInstagramUsername(response.user.instagramUsername || "")
                    setTiktokUsername(response.user.tiktokUsername || "")
                    setYoutubeUsername(response.user.youtubeUsername || "")
                    setLinkedinUsername(response.user.linkedinUsername || "")
                    setPinterestUsername(response.user.pinterestUsername || "")
                    setRedditUsername(response.user.redditUsername || "")
                    setSnapchatUsername(response.user.snapchatUsername || "")
                    // setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                    setHasUsername(true)
                    setLoading(false)
                    // }
                }
                // this causes the temproary "please login"
                setLoading(false)
            } catch (e) {
                setLoading(false)
                toastError(e.message)
            }
        })()
    }, [userAccount]) // this dependency is so that if from backend i ever send an updated cookie to logout on any random request, this reruns

    const updateInfo = async (e) => {
        try {
            if (userAccount.blockchain === "eth" && userAccount.address.toUpperCase() !== ETHAddress.toUpperCase() || userAccount.blockchain === "sol" && userAccount.address.toUpperCase() !== SOLAddress.toUpperCase()) {
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
            // TODO: add validation for deso address
            //if (DESOAddress) {
            //  return toastError("Please enter a valid Deso address")
            //}

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
                profilePic,
                twitterUsername,
                githubUsername,
                facebookUsername,
                instagramUsername,
                tiktokUsername,
                youtubeUsername,
                linkedinUsername,
                pinterestUsername,
                redditUsername,
                snapchatUsername,
                fullName
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
            toastError("Something went wrong. Please try again.")
            toastError(err.message);
        }

    }

    const uploadImage = async (e) => {
        try {
            const file = e.target.files[0]
            if (!file instanceof Blob && !file instanceof File) {
                return toastError("Invalid file added")
            }
            const compressedImage = await imageCompression(file, options)
            const reader = new FileReader()
            reader.readAsDataURL(compressedImage)
            reader.onload = async () => {
                toastSuccess("Image uploaded successfully")
                setProfilePic(reader.result)
            }
        } catch (e) {
            toastError("Error uploading image")
            toastError(e.message)
        }
    }

    const handleLogout = async () => {
        try {
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
        } catch (e) {
            toastError("Error logging out. " + e.message)
        }
    }

    const redirectToProfile = () => {
        router.push(`/${username}`);
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
                style={{ maxWidth: "70%", left: "50%", transform: "translate(-50%, 0%)" }}
            />
            <Header brandedButtonLabel="View Profile" brandedButtonCallback={redirectToProfile} />
            {userAccount.address ? hasUsername ?
                <div className="flex flex-row items-stretch flex-start">
                    <nav className="shadow-md px-5">
                        <ul className="flex flex-col">
                            <li className="flex flex-row items-center px-4 py-2 font-bold hover:bg-gray-50 ">
                                hello
                            </li>
                            <li className="flex flex-row items-center px-4 py-2">
                                hello
                            </li>
                            <li className="flex flex-row items-center px-4 py-2">
                                hello
                            </li>
                        </ul>
                    </nav>
                    <main id="dashboard" className='flex flex-col items-center mt-10 mb-20 w-screen justify-center'>
                        <CustomLabel className="text-xl smtext-2xl mb-3">Update Profile Information</CustomLabel>
                        <div className='flex flex-col w-screen items-center' id="form">

                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Full Name:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={fullName} onChange={(e) => setFullName((e.target.value))} placeholder="enter full name" />
                            </div>

                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Bio:</CustomLabel>
                                <CustomInput maxLength="160" className="my-1 w-72 sm:w-96" type="text" value={bio} onChange={(e) => setBio((e.target.value).slice(0, 160))} placeholder="enter bio" />
                            </div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">DESO Address:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={DESOAddress} onChange={(e) => setDESOAddress((e.target.value).replace(/[^a-zA-Z0-9]/g, ""))}
                                    placeholder="enter deso address" /></div>
                            {DESOAddress ? "" :
                                <CustomLabel className="text-gray-500 text-xs font-normal sm:text-sm w-72 sm:w-96">don&apos;t have an account yet? <a href="https://diamondapp.com?r=6xzkzfZt" className='underline' target="_blank" rel="noreferrer">sign up</a> now and get up to $5!</CustomLabel>}
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Bitcoin Address:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={BTCAddress} onChange={(e) => setBTCAddress((e.target.value).replace(/[^a-zA-Z0-9]/g, ""))}
                                    placeholder="enter btc address" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Ethereum Address:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={ETHAddress} onChange={(e) => setETHAddress((e.target.value).replace(/[^a-zA-Z0-9]/g, ""))}
                                    placeholder="enter eth address" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Solana Address:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={SOLAddress} onChange={(e) => setSOLAddress((e.target.value).replace(/[^a-zA-Z0-9]/g, ""))}
                                    placeholder="enter sol address" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                {/* <CustomLabel>Upload Profiml-2le Picture:</CustomLabel>
                            <CustomInput className="my-1" type="file" onChange={uploadImage}
                                id="profilePic" name="profilePic" multiple={false}
                                accept="image/png, image/jpeg" /> */}

                                <div className='flex flex-col items-start'>
                                    <CustomLabel className="ml-2">Profile Picture:</CustomLabel>
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
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Twitter Username:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={twitterUsername} onChange={(e) => setTwitterUsername((e.target.value))}
                                    placeholder="enter username" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Facebook Username:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={facebookUsername} onChange={(e) => setFacebookUsername((e.target.value))}
                                    placeholder="enter username" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Instagram Username:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={instagramUsername} onChange={(e) => setInstagramUsername((e.target.value))}
                                    placeholder="enter username" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Pinterest Username:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={pinterestUsername} onChange={(e) => setPinterestUsername((e.target.value))}
                                    placeholder="enter username" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Reddit Username:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={redditUsername} onChange={(e) => setRedditUsername((e.target.value))}
                                    placeholder="enter username" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Youtube Username:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={youtubeUsername} onChange={(e) => setYoutubeUsername((e.target.value))}
                                    placeholder="enter username" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Linkedin Username:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={linkedinUsername} onChange={(e) => setLinkedinUsername((e.target.value))}
                                    placeholder="enter username" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Tiktok Username:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={tiktokUsername} onChange={(e) => setTiktokUsername((e.target.value))}
                                    placeholder="enter username" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Github Username:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={githubUsername} onChange={(e) => setGithubUsername((e.target.value))}
                                    placeholder="enter username" /></div>
                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Snapchat Username:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={snapchatUsername} onChange={(e) => setSnapchatUsername((e.target.value))}
                                    placeholder="enter username" /></div>
                            <div className='flex flex-row justify-around mt-5'>
                                <CustomBrandedButton className="px-6" onClick={updateInfo}>Save</CustomBrandedButton>
                            </div>

                        </div>
                    </main>
                </div>
                : <CustomLabel className="font-medium flex flex-col items-center mt-4"><span>There is no username associated with this wallet address. <Link className='underline inline' href={`/`}>Buy</Link> one now!</span></CustomLabel> : <CustomLabel className="font-medium flex flex-col items-center mt-4">Please login to access this page.</CustomLabel>}

        </div>
    )
}