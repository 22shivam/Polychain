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
                    setHasUsername({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                    return
                }
                console.log("response:", response)
                console.log(response.user.ETHAddress)
                setETHAddress(response.user.ETHAddress)
                setSOLAddress(response.user.SOLAddress)
                setDESOAddress(response.user.DESOAddress)
                setBTCAddress(response.user.BTCAddress)
                setBio(response.user.bio)
                setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                setHasUsername(true)
            }
        })()
    }, [])

    const updateInfo = async (e) => {

        // validate input
        if (!ethers.utils.isAddress(ETHAddress.toLowerCase()) && ETHAddress) {
            return alert("Invalid Ethereum Address")
        }
        if (!validate(BTCAddress) && BTCAddress) {
            return alert("Invalid Bitcoin Address")
        }
        // TODO: Validate solana and deso address. Check if input bio is not malicious.

        // submit to server


    }

    // this is where editing wallet information and all that stuff would go

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
            <input type="file"
                id="profilePic" name="profilePic"
                accept="image/png, image/jpeg"></input>
            <br />
            <button onClick={updateInfo}>Save</button>
            <br />
        </div>
    )
}