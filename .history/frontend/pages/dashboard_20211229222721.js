import { useState, useEffect, useContext } from 'react';
import { UserContext } from './_app';
import Link from 'next/link';
import createPostRequest from '../lib/createPostRequest';
import { ethers } from 'ethers';
import { validate } from "bitcoin-address-validation"
import * as web3 from '@solana/web3.js';



export default function UserDashboard() {
    console.log("rerendering")
    const { userAccount, setUserAccount } = useContext(UserContext);
    const [hasAccount, setHasAccount] = useState(false)

    const [bio, setBio] = useState("");
    const [desoAddress, setDesoAddress] = useState("");
    const [btcAddress, setBtcAddress] = useState("");
    const [ethAddress, setEthAddress] = useState("");
    const [solAddress, setSolAddress] = useState("");

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
        if (!userAccount.address) {
            // ask them to login either through solana or eth
            (async () => {
                const response = await fetch("http://localhost:3001/isLoggedIn", {
                    credentials: 'include'
                })
                const processedResponse = await response.json()
                console.log("login response", processedResponse)
                if (!processedResponse.isLoggedIn) {
                    return console.log("please login first")
                } else {
                    const response = await createPostRequest("http://localhost:3001/userDetails", {
                        address: processedResponse.address,
                        blockchain: processedResponse.blockchain
                    })
                    if (!response.success) {
                        console.log("no account found")
                        setHasAccount(false)
                        setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                        return
                    }
                    console.log("response:", response)
                    console.log(response.user.ETHAddress)
                    setEthAddress(response.user.ETHAddress)
                    setSolAddress(response.user.SOLAddress)
                    setDesoAddress(response.user.DESOAddress)
                    setBtcAddress(response.user.BTCAddress)
                    setBio(response.user.bio)
                    setUserAccount({ address: processedResponse.address, blockchain: processedResponse.blockchain })
                    setHasAccount(true)
                }
            })()
        }
    }, [])

    const updateInfo = async (e) => {
        // TODO: IMPLEMENT THIS

        // validate input
        if (!ethers.utils.isAddress(ethAddress.toLowerCase())) {
            return alert("Invalid Ethereum Address")
        }
        if (!validate(btcAddress)) {
            return alert("Invalid Bitcoin Address")
        }
        console.log(web3.PublicKey.toBytes(solAddress))
        // web3.PublicKey.isOnCurve()



        // submit to server
    }

    // this is where editing wallet information and all that stuff would go

    if (!userAccount.address) {
        return <Link href="/">Login first</Link>
    }

    if (!hasAccount) {
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
            <input type="text" value={desoAddress} onChange={(e) => setDesoAddress(e.target.value)} placeholder="enter deso address" />
            <br />
            <input type="text" value={btcAddress} onChange={(e) => setBtcAddress(e.target.value)} placeholder="enter btc address" />
            <br />
            <input type="text" value={ethAddress} onChange={(e) => setEthAddress(e.target.value)} placeholder="enter eth address" />
            <br />
            <input type="text" value={solAddress} onChange={(e) => setSolAddress(e.target.value)} placeholder="enter sol address" />
            <br />
            <button onClick={updateInfo}>Save</button>
            <br />
        </div>
    )
}