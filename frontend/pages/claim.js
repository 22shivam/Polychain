import React, { useContext, useEffect, useState } from 'react';
import CustomButton from './components/customButton';
import CustomLabel from './components/customLabel';
import Page from './components/Page';
import CustomBrandedButton from './components/customBrandedButton';

import toastError from '../lib/toastError';
import { UserContext } from './_app';
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import Script from 'next/script'

export default function Claim() {
    const { userAccount, setUserAccount } = useContext(UserContext);
    const { width, height } = useWindowSize()
    const [addressList, setAddressList] = useState([]);
    const [promoCode, setPromoCode] = useState('');
    const [eligible, setEligible] = useState(true);
    const claim = async () => {
        try {
            if (!userAccount || !userAccount.address || userAccount.blockchain !== "eth") {
                return toastError("You must be logged in with an Ethereum wallet to claim your rewards.");
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/polychainDrop`, {
                method: 'GET', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'include', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url

            })
            const data = await response.json();

            if (!data.success) {
                toastError(data.message);
                setEligible(false);
                return;
            }

            setPromoCode(data.user.promo);

        } catch (e) {
            console.log(e)
            toastError("Something went wrong. Please try again later.");
        }
    }

    return (

        <Page>

            <Script src="/fairyDustCursor.js"></Script>

            <div className='flex flex-col justify-center items-center'>
                {promoCode == "" ? eligible ?
                    <div style={{ maxWidth: "700px" }} className='mt-20 flex flex-col shadow-lg py-4 rounded-3xl justify-center flex-1 items-center mx-4 space-y-4' id="card">

                        <CustomLabel className="smtext-2xl mt-4">What is Polychain?</CustomLabel>
                        <CustomLabel className="font-medium w-4/6 my-2 text-gray-700">1. Send and receive popular cryptocurrencies (eth, btc, sol, matic) using a simple, shareable link. See <a className='text-brand-primary-medium' href="https://polychain.tech/shivam" target="_blank" rel="noreferrer">polychain.tech/shivam</a> for example</CustomLabel>
                        <CustomLabel className="font-medium w-4/6 my-2 text-gray-700">2. Showcase your NFTs on your Polychain page</CustomLabel>
                        <CustomLabel className="font-medium w-4/6 my-2 text-gray-700">3. Put all your links in one place</CustomLabel>
                        <CustomLabel className="font-medium w-4/6 text-gray-700 my-2">4. Embed Polychain into your websites to accept crypto payments and donations</CustomLabel>
                        <CustomLabel>Join over 200 happy users!</CustomLabel>
                        <div className='mt-4'></div>
                        <CustomBrandedButton className="text-lg" onClick={claim}>Claim</CustomBrandedButton>
                        <div className='mb-4'></div>
                    </div> : <div className='flex flex-col items-center mx-4 text-center'>
                        <img src="/sad.gif" className='rounded-md mt-6' width="500"></img>
                        <CustomLabel className="mt-4">Join our discord: <a className='font-normal' href="http://discord.gg/pdbJVcARfR" rel="noreferrer" target="_blank">discord.gg/pdbJVcARfR</a></CustomLabel>
                        <CustomLabel className="mt-4">Follow us on Twitter: <a className='font-normal' href="http://twitter.com/polychainhq" rel="noreferrer" target="_blank">twitter.com/polychainhq</a></CustomLabel>
                        <CustomLabel className="font-semibold text-center mt-5 text-brand-primary-dark" style={{ maxWidth: "380px", fontSize: "1.rem" }}>Maybe DM us on one of these places, and you, too, might get a surprise?</CustomLabel>
                        <CustomLabel></CustomLabel>

                    </div>
                    :
                    <div className='flex flex-col items-center mx-4'>
                        <Confetti
                            width={width}
                            height={height}
                        />
                        <img src="/celebration.gif" className='rounded-md mt-6' width="400"></img>
                        <div className='flex flex-row my-4'>
                            <CustomLabel style={{ padding: "0" }} className="smtext-2xl mt-4 px-0">Your Unique Promo Code: </CustomLabel>
                            <CustomLabel style={{ paddingLeft: "5px" }} className="smtext-2xl mt-4 font-normal px-0">{promoCode}</CustomLabel>
                        </div>
                        <div className='flex flex-row'>
                            <CustomButton onClick={() => { navigator.clipboard.writeText(promoCode) }}>Copy</CustomButton>
                            <CustomBrandedButton onClick={() => { window.open("https://polychain.tech/", "_blank") }}>Use it now</CustomBrandedButton>
                        </div>
                        <div className='flex flex-col items-start text-justify mt-8' style={{ maxWidth: "400px" }}>
                            <CustomLabel><span className="text-brand-primary-dark text-center">Steps to Redeem:</span> <br></br> Go to <a href="https://polychain.tech/" rel='noreferrer' target="_blank">polychain.tech</a> and login. Enter your promo code and the username you want. Press use promo code and voila!</CustomLabel>

                        </div>
                    </div>}
            </div>
        </Page>
    )
}