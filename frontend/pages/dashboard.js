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
import Loading from './components/Loading';
import Identicon from 'react-identicons';
import generateQR from '../lib/generateQR';
import CustomButton from './components/customButton';
import { parseUnits } from 'ethers/lib/utils';
import toastInfo from '../lib/toastInfo';


const navigationItems = [
    {
        id: 1,
        name: "Profile",
    },
    {
        id: 2,
        name: "Analytics",
    },
    {
        id: 3,
        name: "Tools",
    },
    {
        id: 5,
        name: "Personal Token"
    },
    {
        id: 4,
        name: "Share",
    }
]

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
    const [qrCode, setQrCode] = useState("")
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
    const [selectedNav, setSelectedNav] = useState(1);
    const [totalVisits, setTotalVisits] = useState(0);
    const [transactionList, setTransactionList] = useState([]);
    const [tweetUrl, setTweetUrl] = useState("");
    const [addressCsv, setAddressCsv] = useState("");
    const [link1, setLink1] = useState({ title: "", url: "" });
    const [link2, setLink2] = useState({ title: "", url: "" });
    const [link3, setLink3] = useState({ title: "", url: "" });
    const [link4, setLink4] = useState({ title: "", url: "" });
    const [link5, setLink5] = useState({ title: "", url: "" });
    const [link6, setLink6] = useState({ title: "", url: "" });
    const [tokenName, setTokenName] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [tokenSupply, setTokenSupply] = useState(0);
    const [personalTokenAddress, setPersonalTokenAddress] = useState("");
    const [hasPersonalToken, setHasPersonalToken] = useState(false);


    // handling logouts


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
                    setTotalVisits(response.user.totalVisits || 0)
                    setLink1(response.user.links[0] || { title: "", url: "" })
                    setLink2(response.user.links[1] || { title: "", url: "" })
                    setLink3(response.user.links[2] || { title: "", url: "" })
                    setLink4(response.user.links[3] || { title: "", url: "" })
                    setLink5(response.user.links[4] || { title: "", url: "" })
                    setLink6(response.user.links[5] || { title: "", url: "" })
                    if (response.user.personalToken && response.user.personalToken.tokenAddress) {
                        setHasPersonalToken(true)
                        setPersonalTokenAddress(response.user.personalToken.tokenAddress)
                        setTokenName(response.user.personalToken.tokenName)
                        setTokenSymbol(response.user.personalToken.tokenSymbol)
                        setTokenSupply(response.user.personalToken.tokenSupply)
                    }
                    // setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                    setHasUsername(true)
                    setLoading(false)
                    const qrCode = await generateQR(`https://polychain.com${response.user.username}/`)
                    setQrCode(qrCode)
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

            if (link1.title > 100 || link2.title > 100 || link3.title > 100 || link4.title > 100 || link5.title > 100 || link6.title > 100) {
                return toastError("Link Titles must be less than 100 characters")
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
                fullName,
                links: [link1, link2, link3, link4, link5, link6]
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

    const mintToken = async (e) => {
        try {
            if (userAccount.blockchain !== "eth") {
                return toastError("You have to be logged in with an Ethereum wallet to mint tokens")
            }
            if (userAccount.wallet == "walletconnect") {
                return toastError("Currently, we do not support minting tokens with WalletConnect")
            }
            if (tokenSupply <= 0) {
                return toastError("Please enter a valid token supply")
            }
            if (tokenName == "") {
                return toastError("Please enter a valid token name")
            }
            if (tokenSymbol == "") {
                return tokenError("Please enter a valid token symbol")
            }

            const bcr = await fetch('/contracts_erc20_sol_Token.bin');
            const bc = await bcr.text();
            const abir = await fetch('/contracts_erc20_sol_Token.abi');
            const abi = await abir.text();

            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const token = new ethers.ContractFactory(abi, bc, signer);
            console.log(tokenName)
            console.log(ETHAddress)
            console.log(tokenSymbol)
            console.log(tokenSupply)
            const contract = await token.deploy(tokenName, tokenSymbol, ETHAddress, tokenSupply);
            toastInfo("Deploying token contract...")

            await contract.deployTransaction.wait();
            toastSuccess("Token contract deployed successfully")

            console.log(contract.address);
            setPersonalTokenAddress(contract.address);
            console.log(tokenName, tokenSupply, tokenSymbol, contract.address)
            let response = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/userDetails/minttoken`, {
                contractAddress: contract.address,
                tokenName,
                tokenSymbol,
                tokenSupply
            })
            if (!response.success) {
                if (response.isNotLoggedIn) {
                    setUserAccount({})
                    toastError("Session Expired. You will need to login again to update your account")
                    return
                }
                toastError(response.message)
            } else {
                toastSuccess("Token minted successfully")
                setHasPersonalToken(true)

            }
        } catch (e) {
            console.log(e)
            toastError("Somethnig went wrong. Please try again.")
        }

        // store personal token address in db

    }

    const extractAddresses = async (e) => {
        try {
            const resp = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tweet`, {
                tweetURL: tweetUrl
            })
            if (!resp.success) {
                return toastError("Invalid Tweet URL")
            }


            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += resp.data.ens.join(",\n")
            csvContent += "\n"
            csvContent += resp.data.address.join(",\n")
            let encodedUri = encodeURI(csvContent);
            setAddressCsv(encodedUri)

        } catch (e) {
            toastError(e.message)
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


    const redirectToProfile = () => {
        router.push(`/${username}`);
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className="flex flex-col w-screen h-screen">
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
            <Header brandedButtonLabel="Profile" brandedButtonCallback={redirectToProfile} />
            {userAccount.address ? hasUsername ?
                <div className="flex flex-row items-stretch flex-grow">
                    {/* sidebar  */}
                    <nav className='shadow-md'>
                        <ul className="flex flex-col mt-2 px-2 space-y-1">
                            {navigationItems.map((item) => {
                                let className = "transition duration-200 px-2 rounded-md py-2 w-48 font-semibold hover:bg-gray-50 text-gray-600" + (item.id == selectedNav ? " bg-gray-100" : "")
                                return (
                                    <li key={item.id} onClick={() => { setSelectedNav(item.id) }} className={className}>
                                        {item.name}
                                    </li>
                                )
                            })}

                        </ul>
                    </nav>
                    {/* content */}
                    {selectedNav == 1 ? <main id="dashboard" className='flex flex-col mb-20 pt-10 px-6 flex-1'>

                        <CustomLabel className="text-xl  smtext-2xl mb-3">Profile Information</CustomLabel>
                        <div className='ml-2 flex items-center align-items-center align-baseline'>
                            <CustomLabel className="text-xl">Your Username: </CustomLabel>
                            <a className="cursor-pointer" href={`/${username}`} target="_blank" rel="noreferrer">
                                <CustomLabel className="-ml-2 underline cursor-pointer text-xl mx-0 px-0 font-normal hover:text-brand-primary-medium hover:underline">{username}</CustomLabel>
                            </a>
                            <a className="cursor-pointer" href={`/${username}`} target="_blank" rel="noreferrer">
                                <div className='cursor-pointer'>
                                    <svg className='cursor-pointer h-6 w-6' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                            </a>
                        </div>
                        <div className='flex flex-col' id="form">

                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Full Name:</CustomLabel>
                                <CustomInput className="my-1 w-72 sm:w-96" type="text" value={fullName} onChange={(e) => setFullName((e.target.value))} placeholder="enter full name" />
                            </div>

                            <div className='flex flex-col mt-4 items-start'>
                                <CustomLabel className="ml-2">Bio:</CustomLabel>
                                <CustomInput maxLength="160" className="my-1 w-72 sm:w-96" type="text" value={bio} onChange={(e) => setBio((e.target.value).slice(0, 160))} placeholder="enter bio" />
                            </div>
                            <div className='flex flex-col mt-4 items-start'>
                                {/* <CustomLabel>Upload Profiml-2le Picture:</CustomLabel>
                            <CustomInput className="my-1" type="file" onChange={uploadImage}
                                id="profilePic" name="profilePic" multiple={false}
                                accept="image/png, image/jpeg" /> */}

                                <div className='flex flex-col items-start mb-4'>
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
                                    <CustomLabel className="ml-2 mt-5 pb-3 font-semibold sm:text-lg text-gray-900">
                                        Profile Picture Preview
                                    </CustomLabel>
                                    {profilePic ? <img src={profilePic} className="mx-6 my-4"></img> : <Identicon className="mx-6 my-4 rounded-full object-cover mr-1" string={ETHAddress ? ETHAddress : SOLAddress} size={50} />}
                                </div>
                            </div>
                            <div className='mx-4 mt-2'>
                                <CustomBrandedButton className="px-6" onClick={updateInfo}>Save</CustomBrandedButton>
                            </div>
                            <CustomLabel className="text-xl smtext-2xl mt-20 mb-5">Wallet Addresses</CustomLabel>
                            <div className='flex flex-col md:flex-row flex-wrap'>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">DESO Address:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={DESOAddress} onChange={(e) => setDESOAddress((e.target.value).replace(/[^a-zA-Z0-9]/g, ""))}
                                        placeholder="enter deso address" />
                                    {DESOAddress ? "" :
                                        <CustomLabel className="text-gray-500 text-xs font-normal sm:text-sm w-72 sm:w-96">don&apos;t have an account yet? <a href="https://diamondapp.com?r=6xzkzfZt" className='underline' target="_blank" rel="noreferrer">sign up</a> now and get up to $5!</CustomLabel>}</div>
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
                            </div>
                            <div className='mx-4 mt-5'>
                                <CustomBrandedButton className="px-6" onClick={updateInfo}>Save</CustomBrandedButton>
                            </div>
                            <CustomLabel className="text-xl smtext-2xl mt-20 mb-5">Links</CustomLabel>
                            <div className='flex flex-col md:flex-row flex-wrap'>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 1 Title:</CustomLabel>
                                    <CustomInput maxLength="100" className="my-1 w-72 sm:w-96" type="text" value={link1.title} onChange={(e) => setLink1({ title: e.target.value.slice(0, 100), url: link1.url })}
                                        placeholder="enter title for your link" />
                                </div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 1 URL:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={link1.url} onChange={(e) => setLink1({ title: link1.title, url: e.target.value })}
                                        placeholder="enter url" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 2 Title:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={link2.title} onChange={(e) => setLink2({ title: e.target.value.slice(0, 100), url: link2.url })}
                                        placeholder="enter title for your link" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 2 URL:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={link2.url} onChange={(e) => setLink2({ title: link2.title, url: e.target.value })}
                                        placeholder="enter url" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 3 Title:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={link3.title} onChange={(e) => setLink3({ title: e.target.value.slice(0, 100), url: link3.url })}
                                        placeholder="enter title for your link" />
                                </div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 3 URL:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={link3.url} onChange={(e) => setLink3({ title: link3.title, url: e.target.value })}
                                        placeholder="enter url" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 4 Title:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={link4.title} onChange={(e) => setLink4({ title: e.target.value.slice(0, 100), url: link4.url })}
                                        placeholder="enter title for your link" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 4 URL:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={link4.url} onChange={(e) => setLink4({ title: link4.title, url: e.target.value })}
                                        placeholder="enter url" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 5 Title:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={link5.title} onChange={(e) => setLink5({ title: e.target.value.slice(0, 100), url: link5.url })}
                                        placeholder="enter title for your link" />
                                </div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 5 URL:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={link5.url} onChange={(e) => setLink5({ title: link5.title, url: e.target.value })}
                                        placeholder="enter url" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 6 Title:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={link6.title} onChange={(e) => setLink6({ title: e.target.value.slice(0, 100), url: link6.url })}
                                        placeholder="enter title for your link" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Link 6 URL:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={link6.url} onChange={(e) => setLink6({ title: link6.title, url: e.target.value })}
                                        placeholder="enter url" /></div>
                            </div>

                            <div className='mx-4 mt-5'>
                                <CustomBrandedButton className="px-6" onClick={updateInfo}>Save</CustomBrandedButton>
                            </div>
                            <CustomLabel className="text-xl smtext-2xl mt-20 mb-5">Social Links</CustomLabel>
                            <div className='flex flex-row md:flex-row flex-wrap'>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Twitter Username:</CustomLabel>
                                    <CustomInput className="my-1 w-68" type="text" value={twitterUsername} onChange={(e) => setTwitterUsername((e.target.value))}
                                        placeholder="enter username" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Facebook Username:</CustomLabel>
                                    <CustomInput className="my-1 w-68" type="text" value={facebookUsername} onChange={(e) => setFacebookUsername((e.target.value))}
                                        placeholder="enter username" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Instagram Username:</CustomLabel>
                                    <CustomInput className="my-1 w-68" type="text" value={instagramUsername} onChange={(e) => setInstagramUsername((e.target.value))}
                                        placeholder="enter username" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Pinterest Username:</CustomLabel>
                                    <CustomInput className="my-1 w-68" type="text" value={pinterestUsername} onChange={(e) => setPinterestUsername((e.target.value))}
                                        placeholder="enter username" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Reddit Username:</CustomLabel>
                                    <CustomInput className="my-1 w-68" type="text" value={redditUsername} onChange={(e) => setRedditUsername((e.target.value))}
                                        placeholder="enter username" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Youtube Username:</CustomLabel>
                                    <CustomInput className="my-1 w-68" type="text" value={youtubeUsername} onChange={(e) => setYoutubeUsername((e.target.value))}
                                        placeholder="enter username" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Linkedin Username:</CustomLabel>
                                    <CustomInput className="my-1 w-68" type="text" value={linkedinUsername} onChange={(e) => setLinkedinUsername((e.target.value))}
                                        placeholder="enter username" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Tiktok Username:</CustomLabel>
                                    <CustomInput className="my-1 w-68" type="text" value={tiktokUsername} onChange={(e) => setTiktokUsername((e.target.value))}
                                        placeholder="enter username" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Github Username:</CustomLabel>
                                    <CustomInput className="my-1 w-68" type="text" value={githubUsername} onChange={(e) => setGithubUsername((e.target.value))}
                                        placeholder="enter username" /></div>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Snapchat Username:</CustomLabel>
                                    <CustomInput className="my-1 w-68" type="text" value={snapchatUsername} onChange={(e) => setSnapchatUsername((e.target.value))}
                                        placeholder="enter username" /></div>
                            </div>


                            <div className='mx-4 mt-5'>
                                <CustomBrandedButton className="px-6" onClick={updateInfo}>Save</CustomBrandedButton>
                            </div>

                        </div>
                    </main> : ""}
                    {
                        selectedNav == "2" ?
                            <div>
                                <div className="px-4 py-5 m-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Visits</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalVisits}</dd>
                                </div>
                            </div>
                            : ""
                    }
                    {
                        selectedNav == "3" ?
                            <div className='flex flex-col mb-20 pt-10 px-6 flex-1'>
                                <CustomLabel className="text-xl smtext-2xl mb-1">Twitter Airdrop</CustomLabel>
                                <CustomLabel className="block">Use this tool to extract ethereum addresses (including ens addresses) from replies to Tweets on Twitter</CustomLabel>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="mt-4">Enter Tweet URL:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={tweetUrl} onChange={(e) => setTweetUrl((e.target.value))} placeholder="enter tweet URL" />
                                </div>
                                <div className='flex mt-6 space-x-2 items-center'>
                                    <CustomBrandedButton className="px-6 self-start ml-4" onClick={extractAddresses}>Extract</CustomBrandedButton>
                                    {
                                        addressCsv ? <a download href={addressCsv}>Download</a>
                                            : ""
                                    }
                                </div>
                            </div>
                            : ""
                    }
                    {
                        selectedNav == "4" ?
                            <div className='flex flex-col mb-20 pt-10 px-6 flex-1'>
                                <CustomLabel className="text-xl smtext-2xl mb-1 flex items-center">QR Code for your Page <a download="polychainQR" className='ml-4 h-6 w-6' href={qrCode}><svg style={{ display: "inline" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path className="text-gray-400" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg></a></CustomLabel>
                                <img className="w-60 ml-4" src={qrCode}></img>
                                <CustomLabel className="text-xl smtext-2xl mb-4 flex items-center mt-10">Share your Page</CustomLabel>
                                <div className='flex'>
                                    <CustomButton className="ml-8" onClick={() => { navigator.clipboard.writeText(`https://polychain.tech/${username}`); toastSuccess("URL Copied!") }}>Copy Page URL</CustomButton>
                                    <CustomBrandedButton className="flex items-center justify-center" onClick={() => { window.open(`https://twitter.com/intent/tweet?&text=check out my polychain page (polychain.tech/${username}) and send crypto (btc, eth, sol, etc.) to me today! @polychainhq`, "_blank") }}>Tweet your Page <img className='ml-2' src="/modifiedTwitter.svg" width='20'></img></CustomBrandedButton>

                                </div>

                            </div>

                            : ""
                    }
                    {
                        selectedNav == "5" ? ETHAddress ? !hasPersonalToken ?
                            <div className='p-10'>
                                <CustomLabel className="text-xl  smtext-2xl mb-3">Mint your Personal Token</CustomLabel>
                                <CustomLabel className="block font-medium w-4/6 my-2 text-gray-700">You will be charged a small gas fee as in order to mint your personal token, we have to deploy a smart contract for you! The complete token supply will be deposited to your account after which you can share it with others.</CustomLabel>
                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Token Name:</CustomLabel>
                                    <CustomInput className="my-1 w-72 sm:w-96" type="text" value={tokenName} onChange={(e) => { setTokenName((e.target.value)); console.log(e.target.value); }} placeholder="enter token name" />
                                </div>

                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Symbol:</CustomLabel>
                                    <CustomInput maxLength="160" className="my-1 w-72 sm:w-96" type="text" value={tokenSymbol} onChange={(e) => { setTokenSymbol((e.target.value)); console.log(e.target.value) }} placeholder="enter token symbol" />
                                </div>

                                <div className='flex flex-col mt-4 items-start'>
                                    <CustomLabel className="ml-2">Supply:</CustomLabel>
                                    <CustomInput maxLength="160" className="my-1 w-72 sm:w-96" type="number" value={tokenSupply} onChange={(e) => setTokenSupply(e.target.value)} placeholder="enter token supply" />
                                </div>
                                <div className='mx-4 mt-5'>
                                    <CustomBrandedButton className="px-6" onClick={mintToken}>Mint Token</CustomBrandedButton>
                                </div>

                            </div> :
                            <div className='p-10'>
                                <CustomLabel className="text-xl  smtext-2xl mb-8">Your Personal Token Details</CustomLabel>
                                <div className="border-t border-gray-200 mt-4">
                                    <dl>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Token Name</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tokenName}</dd>
                                        </div>
                                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Token Symbol</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tokenSymbol}</dd>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Token Supply</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tokenSupply}</dd>
                                        </div>
                                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Token Contract Address</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex space-x-4 justify-between items-center">{personalTokenAddress}
                                                <div className='cursor-pointer mx-3'>
                                                    <a href={`https://polygonscan.com/address/${personalTokenAddress}`} target="_blank" rel="noreferrer">
                                                        <svg className='cursor-pointer h-5 w-5' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                </div></dd>

                                        </div>

                                    </dl>
                                </div>

                            </div>
                            : <CustomLabel>We currently only support the creation of Personal Tokens on Ethereum and Polygon. Support for other chains coming soon.</CustomLabel> : ""
                    }
                </div>
                : <CustomLabel className="font-medium flex flex-col items-center mt-4"><span>There is no username associated with this wallet address. <Link className='underline inline' href={`/`}>Buy</Link> one now!</span></CustomLabel> : <CustomLabel className="font-medium flex flex-col items-center mt-4">Please login to access this page.</CustomLabel>
            }

        </div >
    )
}