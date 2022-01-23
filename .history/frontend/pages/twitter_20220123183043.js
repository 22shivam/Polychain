import React from "react";
import toastError from "../lib/toastError";
import createPostRequest from "../lib/createPostRequest";
import { useState } from "react";
import Page from "./components/Page";
import CustomLabel from "./components/customLabel";
import CustomInput from "./components/customInput";
import CustomBrandedButton from "./components/customBrandedButton";

export default function Twitter() {
    const [addressCsv, setAddressCsv] = useState("");
    const [tweetUrl, setTweetUrl] = useState("");

    const extractAddresses = async (e) => {
        try {
            const resp = await createPostRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tweet`, {
                tweetURL: tweetUrl
            })
            if (!resp.success) {
                return toastError("Invalid Tweet URL")
            }

            console.log(resp.data.ens)

            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += resp.data.ens.join(",\n")
            csvContent += "\n"
            csvContent += resp.data.address.join(",\n")
            let encodedUri = encodeURI(csvContent);
            setAddressCsv(encodedUri)

        } catch (e) {
            toastError(e.message)
        }
    }

    return (
        <Page>
            <div className='flex flex-col mb-20 pt-10 px-6 items-center'>
                <CustomLabel className="text-xl smtext-2xl mb-1">Twitter Airdrop</CustomLabel>
                <CustomLabel className="block" style={{ maxWidth: "50ch" }}>Use this tool to extract ethereum addresses (including ens addresses) from replies to Tweets on Twitter</CustomLabel>
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