import React from "react";
import { useRouter } from "next/router";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../_app";
import { toast, ToastContainer } from "react-toastify";
import toastError from "../../lib/toastError";
import toastSuccess from "../../lib/toastSuccess";
import DropDownComponent from "./DropDown";
import { ethers, Wallet } from "ethers";
import createPostRequest from "../../lib/createPostRequest";
import CustomBrandedButton from "./customBrandedButton";
import CustomButton from "./customButton";
import toastInfo from "../../lib/toastInfo";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { WalletConnectorContext } from "../_app";
import { convertUtf8ToHex } from "@walletconnect/utils";


export default function Header({ brandedButtonLabel, brandedButtonCallback }) {
    const router = useRouter();

    const { userAccount, setUserAccount } = useContext(UserContext);
    const { WalletConnectConnector, setWalletConnectConnector } = useContext(WalletConnectorContext);


    useEffect(() => {
        try {

            if (window.ethereum) {
                window.ethereum.on('accountsChanged', handleLogout);
            }
            if (window.solana) {
                window.solana.on("disconnect", handleLogout)
            }
            return () => {
                try {
                    if (window.ethereum) {
                        window.ethereum.removeListener('accountsChanged', handleLogout);
                    }
                    if (window.solana) {
                        window.solana.removeListener("disconnect", handleLogout);
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }, [])

    const ethLogin = async (e) => {
        try {
            if (!window.ethereum) {
                window.open(`https://metamask.io/`, "_blank");
                return toastError('No Ethereum Crypto wallet found. Please install one like Metamask.')
            }
            // await window.ethereum.send("eth_requestAccounts");
            // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const accounts = await window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{
                    eth_accounts: {}
                }]
            }).then(() => ethereum.request({
                method: 'eth_requestAccounts'
            }))
            // const accounts = await ethereum.request({ method: "eth_requestAccounts" })
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
                setUserAccount({ address: accounts[0], blockchain: "eth", wallet: "metamask" })
            }
        } catch (err) {
            if (err.code == -32002) {
                return toastInfo('Login request already sent to your ethereum wallet. Kindly connect using your wallet.')
            }
            toastError("Something went wrong while logging in. Please try again.", err.message)
        }

    }

    const getWalletConnectToken = async (WalletConnectConnector) => {
        try {
            if (!WalletConnectConnector._accounts[0]) {
                walletConnectLogin()
                return
            }
            const message = `Logging in.... \n \n Random ID: ${Math.random().toString(36).slice(2)}`
            const msgParams = [
                convertUtf8ToHex(message), // Required
                WalletConnectConnector._accounts[0], // Required
            ];

            // Sign personal message
            toastInfo("Kindly accept the signature request.")
            WalletConnectConnector
                .signPersonalMessage(msgParams)
                .then(async (signature) => {
                    // Returns signature.
                    const requestObject = {
                        signature,
                        message,
                        address: WalletConnectConnector._accounts[0]
                    }
                    const loginResponse = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login/eth`, requestObject)

                    if (!loginResponse.success) {
                        toastError('Login Failed')
                    }

                    if (loginResponse.success) {
                        toastSuccess('Login Successful')
                        setUserAccount({ address: WalletConnectConnector._accounts[0], blockchain: "eth", wallet: "walletconnect" })
                        setWalletConnectConnector(WalletConnectConnector);
                    }
                })
                .catch((e) => {
                    // Error returned when rejected
                    toastError("Kindly, accept the signature request")
                });
        } catch (e) {
            toastError("Login Failed. Please try again")
        }

    }

    const walletConnectLogin = async (e) => {
        // login
        try {
            const WalletConnectConnector = new WalletConnect({
                bridge: "https://bridge.walletconnect.org", // Required
                qrcodeModal: QRCodeModal,
            });
            setWalletConnectConnector(WalletConnectConnector);
            if (!WalletConnectConnector.connected) {
                // create new session
                const resp = await WalletConnectConnector.createSession();
                // subscribe to events
                WalletConnectConnector.on("connect", (error, payload) => {
                    if (error) {
                        throw error;
                    }
                    const { accounts, chainId } = payload.params[0];
                    getWalletConnectToken(WalletConnectConnector)
                });

                WalletConnectConnector.on("session_update", (error, payload) => {
                    if (error) {
                        throw error;
                    }

                    // Get updated accounts and chainId
                    const { accounts, chainId } = payload.params[0];
                    console.log(chainId)
                    getWalletConnectToken(WalletConnectConnector)
                });

                WalletConnectConnector.on("disconnect", (error, payload) => {
                    if (error) {
                        throw error;
                    }

                    handleLogout()
                });

            } else {
                WalletConnectConnector.killSession();
                setWalletConnectConnector(null);
                toastInfo("Please try logging in again.")
            }
        } catch (e) {
            console.log(e)
            toastError("Something went wrong while logging in. Please reload the page and try again.", e.message)
        }


        // get token from backend
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
                setUserAccount({ address: loginResponse.address, blockchain: "sol", wallet: "phantom" })
            }

        } catch (err) { toastError("Login Failed") }
    }

    const handleLogout = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`, {
                credentials: 'include'
            })

            if (WalletConnectConnector && WalletConnectConnector.connected) {
                WalletConnectConnector.killSession()
                setWalletConnectConnector(null)
                setUserAccount({})
            } else {
                const processedResponse = await response.json()
                toastInfo("Logged out successfully")
                setUserAccount({})

            }
        } catch (e) {
            // toastError("Error logging out. " + e.message)
        }
    }


    return (
        <div className="flex flex-row shadow-md py-1 px-2 w-screen" id="nav_bar">
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
            <div onClick={() => { router.push("/") }} className="grow-0 flex items-center justify-center cursor-pointer" id="left_nav_bar">
                <img className="" src="/croppedPolychainLogo.png" alt="Spindl Logo" width="150" />
            </div>
            <div className="grow" id="spacer">  </div>
            <div className="grow-0 my-2 sm:mr-4 flex" id="right_nav_bar">
                {userAccount.address ?
                    <div className="flex flex-row">
                        {/* <CustomButton onClick={goToDashboard}>Dashboard</CustomButton> */}
                        {/* <h1><Link href="/dashboard">Dashboard</Link></h1> */}
                        <CustomBrandedButton onClick={brandedButtonCallback} className="">{brandedButtonLabel}</CustomBrandedButton>
                        <CustomButton onClick={handleLogout}>Logout</CustomButton>
                    </div>
                    : (
                        <div>
                            <DropDownComponent label3="Wallet Connect" label3onClick={walletConnectLogin} primaryLabel="Login" label1="Ethereum" label2="Solana" label1onClick={ethLogin} label2onClick={solLogin} />
                        </div>
                    )}


            </div>
        </div>
    )
}