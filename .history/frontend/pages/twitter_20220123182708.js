import React from "react";

export default function Twitter() {

    return (
        <Page>
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
        </Page>
    )
}