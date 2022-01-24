import { useState, useEffect, useContext } from 'react';
import { UserContext } from './_app';
import Link from 'next/link';
import createPostRequest from '../lib/createPostRequest';
import { ethers } from 'ethers';
import { validate } from "bitcoin-address-validation"
import * as web3 from '@solana/web3.js';
import Base58 from 'base-58'


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

    const handleLogout = async () => {
        setUserAccount({})
        const response = await fetch("http://localhost:3001/logout", {
            credentials: 'include'
        })
        const processedResponse = await response.json()
        console.log(processedResponse)
    }

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
                setETHAddress(response.user.ETHAddress)
                setSOLAddress(response.user.SOLAddress)
                setDESOAddress(response.user.DESOAddress)
                setBTCAddress(response.user.BTCAddress)
                setBio(response.user.bio)
                setProfilePic(response.user.profilePic)
                setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                setHasUsername(true)
            }
        })()
    }, [document.cookie.token]) // this dependency is so that if from backend i ever send an updated cookie to logout on any random request, this reruns

    const updateInfo = async (e) => {

        if (userAccount.blockchain === "etherem" && userAccount.address !== ETHAddress || userAccount.blockchain === "solana" && userAccount.address !== SOLAddress) {
            const response = confirm("You are changing the address with which you are logged in. Hence, you will be logged out.")
            if (!response) {
                return
            }
        } // else just submit to backend

        // validate input
        if (!ethers.utils.isAddress(ETHAddress.toLowerCase()) && ETHAddress) {
            return alert("Invalid Ethereum Address")
        }
        if (!validate(BTCAddress) && BTCAddress) {
            return alert("Invalid Bitcoin Address")
        }
        // TODO: Validate solana and deso address. Check if input bio is not malicious. LOW PRIORITY

        // submit to server
        const response = await createPostRequest("http://localhost:3001/userdetails/update", {
            ETHAddress,
            SOLAddress,
            DESOAddress,
            BTCAddress,
            bio,
            profilePic
        })


    }

    const uploadImage = async (e) => {
        const file = e.target.files[0]
        console.log(file)
        // base 64 encode image
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
            console.log(reader.result)
            setProfilePic(reader.result)
        }
    }




    if (!userAccount.address) {
        return <Link href="/">Login first</Link>
    }

    if (!hasUsername) {
        return <div>
            <h1>User Dashboard</h1>
            <p>You dont have a username yet. Buy one <Link href="/">here</Link></p>
        </div>
    }

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
            Welcome to your dashboard! More coming soon....
            <br />
            <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="enter bio" />
            <br />
            <input type="text" value={DESOAddress} onChange={(e) => setDESOAddress(e.target.value)} placeholder="enter deso address" />
            <br />
            <input type="text" value={BTCAddress} onChange={(e) => setBTCAddress(e.target.value)} placeholder="enter btc address" />
            <br />
            <input type="text" value={ETHAddress} onChange={(e) => setETHAddress(e.target.value)} placeholder="enter eth address" />
            <br />
            <input type="text" value={SOLAddress} onChange={(e) => setSOLAddress(e.target.value)} placeholder="enter sol address" />
            <br />
            <input type="file" onChange={uploadImage}
                id="profilePic" name="profilePic" multiple="true"
                accept="image/png, image/jpeg"></input>
            <br />
            <button onClick={updateInfo}>Save</button>
            <br />
        </div>
    )
}