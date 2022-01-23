import React from "react";
import Image from "next/image";
import CustomLabel from "./customLabel";
import CustomInput from "./customInput";
import CustomBrandedButton from "./customBrandedButton";
import toastSuccess from "../../lib/toastSuccess";
import { useEffect, useState } from "react";



export default function Gateway({ profilePic, fullName, username, bio, anySocialUrl, facebookUrl, instagramUrl, githubUrl, linkedinUrl, redditUrl, snapchatUrl, tiktokUrl, pinterestUrl, twitterUrl, youtubeUrl }) {

    useEffect(() => {
        (async () => {
            try {
                const qrCode = await generateQR(`bitcoin:${BTCAddress}`)
                setQrCode(qrCode)
            } catch (e) {
                toastError("Something went wrong. Please try again")
            }
        })()
    }, [BTCAddress])

    useEffect(() => {
        // get currency deets from coinbase

        (async () => {
            try {
                if (selectedCurrency.name === "ETH") {
                    let coinbaseResponse = await fetch(COINBASE_URL_ETH)
                    coinbaseResponse = await coinbaseResponse.json()
                    const USDPerETH = coinbaseResponse.data.rates.USD
                    setUSDPerCurrency(USDPerETH)
                    setDisplayedAddress(ETHAddress)
                } else if (selectedCurrency.name === "SOL") {
                    let coinbaseResponse = await fetch(COINBASE_URL_SOL)
                    coinbaseResponse = await coinbaseResponse.json()
                    const USDPerETH = coinbaseResponse.data.rates.USD
                    setUSDPerCurrency(USDPerETH)
                    setDisplayedAddress(SOLAddress)
                } else if (selectedCurrency.name === "BTC") {
                    let coinbaseResponse = await fetch(COINBASE_URL_BTC)
                    coinbaseResponse = await coinbaseResponse.json()
                    const USDPerETH = coinbaseResponse.data.rates.USD
                    setUSDPerCurrency(USDPerETH)
                    setDisplayedAddress(BTCAddress)
                } else if (selectedCurrency.name === "DESO") {
                    let coinbaseResponse = await fetch(COINBASE_URL_DESO)
                    coinbaseResponse = await coinbaseResponse.json()
                    const USDPerETH = coinbaseResponse.data.rates.USD
                    setUSDPerCurrency(USDPerETH)
                    setDisplayedAddress(DESOAddress)
                }
            } catch (e) {
                toastInfo("Something went wrong fetching price information. However, you can still make transactions!")
            }
        })();

    }, [selectedCurrency])

    return (
        <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm p-3 pt-6 sm:p-6 bg-white">
            <div id="profile_header mt-6" className="flex flex-row items-start">
                {profilePic ?
                    <Image width="60" className="rounded-full object-cover" height="60" src={profilePic}></Image> : ""}
                <div className="flex flex-col ml-2">
                    {fullName ? <CustomLabel className="px-0">{fullName}</CustomLabel> : <CustomLabel className="px-0">{username}</CustomLabel>}
                    <CustomLabel style={{ fontWeight: "500", maxWidth: "300px" }} className="px-0">{bio}</CustomLabel>
                </div>
            </div>

            {anySocialUrl ? <div className="flex flex-row justify-center mt-4 items-center">
                {facebookUrl ? <a href={facebookUrl} target="_blank" rel="noopener noreferrer"><img src="images/Facebook.svg" width="30"></img></a> : ""}
                {instagramUrl ? <a href={instagramUrl} target="_blank" rel="noopener noreferrer"><img src="images/Instagram.svg" width="30"></img></a> : ""}
                {githubUrl ? <a href={githubUrl} target="_blank" rel="noopener noreferrer"><img src="images/Github.svg" width="30"></img></a> : ""}
                {linkedinUrl ? <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"><img src="Linkedin.svg" width="30"></img></a> : ""}
                {redditUrl ? <a href={redditUrl} target="_blank" rel="noopener noreferrer"><img src="images/Reddit.svg" width="30"></img></a> : ""}
                {snapchatUrl ? <a href={snapchatUrl} target="_blank" rel="noopener noreferrer"><img src="images/Snapchat.svg" width="30"></img></a> : ""}
                {tiktokUrl ? <a href={tiktokUrl} target="_blank" rel="noopener noreferrer"><img src="images/Tiktok.svg" width="30"></img></a> : ""}
                {pinterestUrl ? <a href={pinterestUrl} target="_blank" rel="noopener noreferrer"><img src="images/Pinterest.svg" width="30"></img></a> : ""}
                {twitterUrl ? <a href={twitterUrl} target="_blank" rel="noopener noreferrer"><img src="images/Twitter.svg" width="30"></img></a> : ""}
                {youtubeUrl ? <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"><img src="images/Youtube.svg" width="30"></img></a> : ""}
            </div> : ""}

            <div onClick={() => { toastSuccess("Address copied!"); navigator.clipboard.writeText(displayedAddress) }} className=" flex flex-row justify-between mt-6 mb-1 items-center">
                <CustomLabel style={{ fontSize: "0.875rem" }} className="address-overflow p-0 font-semibold cursor-pointer text-sm text-gray-400">{displayedAddress}</CustomLabel>
                <img style={{ height: "16px", width: "16px", cursor: "pointer" }} className="mr-2 sm:mr-4" src="/images/clipboard.png"></img>
            </div>
            <div className="flex flex-row justify-center mb-6">
                {/* <span className="border border-gray-300 shadow-sm border-r-0 rounded-l-md px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-semibold">localhost:3000/</span> */}
                <div className="flex flex-col">
                    <CustomInput inputMode="decimal" placeholder="Amount" value={payValue} onChange={(e) => { setPayValue(e.target.value) }} name="field_name" className="px-1 sm:px-2 ml-0 mr-1.5 sm:mr-4 input-placeholder py-3" type="text" />
                    <CustomLabel className="text-gray-500 sm:text-normal mx-0 px-0">USD {parseFloat((USDPerCurrency * payValue)).toFixed(3)}</CustomLabel>
                </div>

                <div className="flex flex-col">
                    <CurrencySelector currencies={currencies.length == 0 ? defaultCurrencies : currencies} selected={selectedCurrency} setSelected={setSelectedCurrency}></CurrencySelector>
                    <CustomLabel className="text-gray-500 text-normal px-0"> 1 {selectedCurrency.name} = USD {parseFloat(USDPerCurrency).toFixed(3)}</CustomLabel>
                </div>

            </div>

            {selectedCurrency.name == "BTC" ? <img className="-mt-6" src={qrCode}></img> : ""}
            <CustomBrandedButton onClick={transferAmount} className="mb-6 ">Pay</CustomBrandedButton>

        </div>
    )
}