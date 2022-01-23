import React from "react";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { UserContext } from "../_app";
import { toast } from "react-toastify";
import toastError from "../../lib/toastError";
import toastSuccess from "../../lib/toastSuccess";
import DropDownComponent from "./DropDown";
import { ethers } from "ethers";
import createPostRequest from "../../lib/createPostRequest";


export default function Header() {
    const router = useRouter();

    const { userAccount, setUserAccount } = useContext(UserContext);

    const redirectToProfile = () => {
        router.push(`/${username}`);
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


    return (
        <div className="flex flex-row shadow-md py-1 px-2 w-screen" id="nav_bar">
            <div onClick={() => { router.push("/") }} className="grow-0 flex items-center justify-center cursor-pointer" id="left_nav_bar">
                <img className="" src="/croppedPolychainLogo.png" alt="Polychain Logo" width="150" />
            </div>
            <div className="grow" id="spacer">  </div>
            <div className="grow-0 my-2 sm:mr-4 flex" id="right_nav_bar">
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
    )
}