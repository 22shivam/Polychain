import { useState, useEffect, useContext } from 'react';
import { UserContext } from './_app';
import Link from 'next/link';


export default function UserDashboard() {
    const { userAccount, setUserAccount } = useContext(UserContext);

    const [bio, setBio] = useState("");
    const [desoAddress, setDesoAddress] = useState("");
    const [btcAddress, setBtcAddress] = useState("");
    const [ethAddress, setEthAddress] = useState("");
    const [solAddress, setSolAddress] = useState("");

    // handling logouts
    useEffect(() => {
        const handleLogout = () => {
            setUserAccount({})
        }
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

    useEffect(() => {
        if (!userAccount.address) {
            // ask them to login either through solana or eth
            return console.log("please login first")
        }


    }, [])

    const handleSubmit = async (e) => {
        // TODO: IMPLEMENT THIS

        // validate input

        // submit to server
    }

    // this is where editing wallet information and all that stuff would go

    if (!userAccount.address) {
        return <Link href="/">Login first</Link>
    }

    return (
        <div>
            Welcome to your dashboard! More coming soon....
            <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="enter bio" />
            <input type="text" value={desoAddress} onChange={(e) => setDesoAddress(e.target.value)} placeholder="enter deso address" />
            <input type="text" value={btcAddress} onChange={(e) => setBtcAddress(e.target.value)} placeholder="enter btc address" />
            <input type="text" value={ethAddress} onChange={(e) => setEthAddress(e.target.value)} placeholder="enter eth address" />
            <input type="text" value={solAddress} onChange={(e) => setSolAddress(e.target.value)} placeholder="enter sol address" />
            <button onClick={updateInfo}>Save</button>
        </div>
    )
}