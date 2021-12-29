import { useState, useEffect, useContext } from 'react';


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


    // this is where editing wallet information and all that stuff would go
    return (
        <div>
            Welcome to your dashboard! More coming soon....
            <input type="text"
        </div>
    )
}